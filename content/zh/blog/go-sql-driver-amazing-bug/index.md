---
title: "一个 go-sql-driver 的离奇 bug"
authorlink: "https://github.com/sofastack"
description: "一个 go-sql-driver 的离奇 bug"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-01-17T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*oRtfRJ9ZGDgAAAAAAAAAAAAADrGAAQ/original"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/409616d4418f44baac6f70b88d9b5638~tplv-k3u1fbpfcp-zoom-1.image)  

文｜郝洪范

京东技术专家  

Seata-go 项目共同发起人

*微服务底层技术的探索与研究。*

本文 **3482** 字 阅读 **7** 分钟

>对于 Go CURD Boy 来说，相信 `github.com/go-sql-driver/mysql` 这个库都不会陌生。基本上 Go 的 CURD 都离不开这个特别重要的库。我们在开发 Seata-go 时也使用了这个库。不过最近在使用 go-sql-driver/mysql 查询 MySQL 的时候，就出现一个很有意思的 bug, 觉得有必要分享出来，以防止后来者再次踩坑。

## PART. 1 问题详述

为了说明问题，这里不详述 Seata-go 的相关代码，用一个单独的 demo 把问题详细描述清楚。  

### 1.1 环境准备

在一个 MySQL 实例上准备如下环境：

```Go
CREATE TABLE `Test1` (
`id` int(11) unsigned NOT NULL AUTO_INCREMENT,
`create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE
CURRENT_TIMESTAMP,  
-PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

从这个 SQL 语句中可以看出来， create_time 是 timestamp 类型，这里要特别留意 timestamp 这个类型。

现在插入一条数据，然后查看刚插入的数据的值。

```Go
insert into Test1 values (1, '2022-01-01 00:00:00')
```

查看下 MySQL 当前的时区。请记好相关值，草蛇灰线，伏笔于此。

```Go
 show VARIABLES like '%time_zone%';
```

查询结果：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0d739775fdf842e2af74ac789b0a55cf~tplv-k3u1fbpfcp-zoom-1.image)

接下来使用 MySQL unix_timestamp 查看 create_time 的时间戳：

```Go
SELECT unix_timestamp(create_time) from Test1 where id = 1;
```

查询结果：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/839249680d864fb8a820c9f82f9b9593~tplv-k3u1fbpfcp-zoom-1.image)

### 1.2 测试程序

有如下 demo 程序，示例使用 go-sql-driver 读取 create_time 的值：

```Go
package main

import ( 
"database/sql" 
"fmt" 
"time"

    _ "github.com/go-sql-driver/mysql"
    )
    
func main() {
var user = "user" 
var pwd = "password" 
var dbName = "dbname"

  dsn := fmt.Sprintf("%s:%s@tcp(localhost:3306)/%stimeout=100s&parseTime=true&interpolateParams=true", user, pwd, dbName)  
  db, err := sql.Open("mysql", dsn)
  if err != nil { 
  panic(err) 
  } 
  
  defer db.Close()
  rows, err := db.Query("select create_time 
  from Test1 limit 1") 
  if err != nil {  
  panic(err)  
  }  
  
  for rows.Next() {  
  t := time.Time{}   
  rows.Scan(&t)  
  fmt.Println(t)   
  fmt.Println(t.Unix())  }}
```

我们运行个程序会输出下面的结果:

```Go
2022-01-01 00:00:00 +0000 UTC1640995200
```

### 1.3 问题详述

发现问题所在了吗？有图如下，把结果放在一块，可以详细说明问题。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d56dc98937924c0f9f5bc584d4aa1bcc~tplv-k3u1fbpfcp-zoom-1.image)

图中红色箭头指向的两个结果，用 go-sql-driver 读取的结果和在 MySQL 中用 unix_timestamp 获取的结果明显是不一样的。

## PART. 2 问题探案

1.3 小节中最后示图可以看出，数据库中 create_time  的值 `2022-01-01 00:00:00` 是东八区的时间，也就是北京时间，这个时间对应的时间戳就是 `1640966400` 。但是 go-sql-driver 示例程序读出来的却是 `1640995200` ， 这是什么值？这是 0 时区的 `2022-01-01 00:00:00`。

对问题的直白描述就是：MySQL 的 create_time 是 `2022-01-01 00:00:00 +008` ，而读取到的是 `2022-01-01 00:00:00 +000` ，他俩压根就不是一个值。

基本能看出来 bug 是如何发生的了。那就需要剖析下 go-sql-driver 源码，追查问题的根源。

### 2.1 go-sq-driver 源码分析

这里就不粘贴 `"github.com/go-sql-driver/mysql"` 的详细源码了，只贴关键的路径。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e937f0d9c3cb4ad89869caf0b785c22a~tplv-k3u1fbpfcp-watermark.image?)

Debug 的时候详细关注调用路径中红色的两个方块的内存中的值。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/00e1529740d945649ee3025b6c6c7e13~tplv-k3u1fbpfcp-zoom-1.image)

```Go
// https://github.com/go-sql-driver/mysql/blob/master/packets.go#L788-
L798
func (rows *textRows) readRow(dest []driver.Value) error {

  // ... 
  
  // Parse time field  
  switch rows.rs.columns[i].fieldType
  { 
  case fieldTypeTimestamp, 
  fieldTypeDateTime,  
  fieldTypeDate,  
  fieldTypeNewDate:   
  if dest[i], err = parseDateTime(dest[i].([]byte), mc.cfg.Loc);
  err != nil {      return err    }  }}
```

```Go
func parseDateTime(b []byte, loc *time.Location) (time.Time, error) {  const base = "0000-00-00 00:00:00.000000"  switch len(b) {  case 10, 19, 21, 22, 23, 24, 25, 26: // up to "YYYY-MM-DD HH:MM:SS.MMMMMM"
    year, err := parseByteYear(b)
    month := time.Month(m)
    day, err := parseByte2Digits(b[8], b[9])
    hour, err := parseByte2Digits(b[11], b[12])
    min, err := parseByte2Digits(b[14], b[15])
    sec, err := parseByte2Digits(b[17], b[18])
    // https://github.com/go-sql-driver/mysql/blob/master/utils.go#L166-L168    if len(b) == 19 {      return time.Date(year, month, day, hour, min, sec, 0, loc), nil    }  }}
```

从这里基本上就能明白，go-sql-driver 把数据库读出来的 create_time timestamp 值当做一个字符串，然后按照 MySQL timestamp 的标准格式 "0000-00-00 00:00:00.000000" 去解析，分别得到 `year, month, day, hour, min, sec`。最后依赖传入 time.Location 值，调用 Go 系统库 time.Date() 再去生成对应的值。

这里表面看起来没有问题，其实这里严重依赖了传入的 time.Location。这个 time.Location 是如何得到的呢？进一步阅读源码，可以明显的看出来，是通过解析传入的 DSN 的 Loc 获取。

其中关键代码是：*[https://github.com/go-sql-driver/mysql/blob/master/dsn.go#L467-L474](https://github.com/go-sql-driver/mysql/blob/master/dsn.go#L467-L474)* 。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b9d500656c7c4fbdb8679d7ea2ad1a5b~tplv-k3u1fbpfcp-zoom-1.image)

如果传入的 DSN 串不带 Loc 时，Loc 就是默认的 UTC 时区。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/956f149d288a43dcbed58198ab46efd2~tplv-k3u1fbpfcp-zoom-1.image)

### 2.2 抽丝剥茧

回头看开头的程序，初始化 go-sql-driver 的 DSN 是 `user:password@tcp(localhost:3306)/dbname?timeout=100s&parseTime=true&interpolateParams=true`，该 DSN 里面并不包含 Loc 信息，go-sql-driver 用使用了默认的 UTC 时区。然后解析从 MySQL 中获取的 timestamp 字段了，也就用默认的 UTC 时区去生成 Date，结果也就错了。

因此，问题的主要原因是：go-sql-driver 并没有按照数据库的时区去解析 timestamp 字段，而且依赖了开发者生成的 DSN 传入的 Loc。当开发者传入的 Loc 和数据库的 time_Zone 不匹配的时候，所有的 timestamp 字段都会解析错误。

有些人可能有疑问，如果 go-sql-driver 为什么不直接使用 MySQL 的时区去解析 timestamp 呢？
  
我们已经提了一个 issue，商讨更好的解决方案：*https://github.com/go-sql-driver/mysql/issues/1379*。

### PART. 3 最后结论

在 MySQL 中读写 timestamp 类型数据时，有如下注意事项：

1.  默认约定：写入 MySQL 时间时，把当前时区的时间转换为 UTC + 00:00（世界标准时区）的值，读取后在前端展示时再次进行转换；

1.  如果不愿意使用默认约定，在现阶段使用 go-sql-driver 的时候，一定要特别注意，需要在 DSN 字符串加上 "loc=true&time_zone=*" , 和数据的时区保持一致，不然的话就会导致 timestamp 字段解析错误。

**| 参考文档 |**  

《The date, datetime, and timestamp Types》 

*[https://dev.mysql.com/doc/refman/8.0/en/datetime.html](https://dev.mysql.com/doc/refman/8.0/en/datetime.html)*  

《MySQL 的 timestamp 会存在时区问题？》

*[https://juejin.cn/post/7007044908250824741](https://juejin.cn/post/7007044908250824741)*  

《Feature request: Fetch connection time_zone automatically》

*[https://github.com/go-sql-driver/mysql/issues/1379](https://github.com/go-sql-driver/mysql/issues/1379)*

**社区讨论群**

细节处见真章，

Seata-go 社区认认真真做开源，

做对用户负责任的高质量的项目。

**了解更多...**

**Seata Star 一下✨：**  

**[https://github.com/seata/seata-go](https://github.com/seata/seata-go)**

**本周推荐阅读**

[Seata AT 模式代码级详解](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516247&idx=1&sn=f57bb355cef6b823a32cd8b30c0b53ee&chksm=faa36f8dcdd4e69b91a9231330f82af5558de9349425b97e2e88e6fb3f8b33845d93af156fb1&scene=21)

[蚂蚁集团境外站点 Seata 实践与探索](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512945&idx=1&sn=006cc63f41c96a73b60ea7a11477310d&chksm=faa35cabcdd4d5bd910d44550bda12642de3baa61eea1a7c966387d53ca62afa63cc9f76ad66&scene=21)

[Seata 多语言体系建设](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512283&idx=2&sn=179ef79e922a7c7475d5db288c9af96d&chksm=faa35f01cdd4d617ec9a818bdbe65b3581fa91e2f4b6162551bbacb93c11c0aef211bae8195e&scene=21)

[Seata-php 半年规划](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247515039&idx=1&sn=e6068fc1b925e71eb8550c8c41296c6d&chksm=faa35445cdd4dd53b450c96f6077b161026a62e451c7c4b8288364b137b3786bbe3d5ea0340a&scene=21)
