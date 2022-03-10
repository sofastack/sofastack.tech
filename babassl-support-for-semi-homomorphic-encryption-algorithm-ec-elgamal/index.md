---
title: "BabaSSL：支持半同态加密算法 EC-ElGamal"
author: "王祖熙"
authorlink: "https://github.com/sofastack"
description: "BabaSSL：支持半同态加密算法 EC-ElGamal进"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-03-09T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*ob-pQINDNtcAAAAAAAAAAAAAARQnAQ"
---

文｜王祖熙（花名：金九 )

蚂蚁集团开发工程师

负责蚂蚁 Kubernetes 集群容器交付专注于集群交付能力、交付性能及交付 Trace 等相关领域

—— 数据不出域、可用不可见

## 01背 景

随着大数据与人工智能的快速发展，个人隐私数据泄露和滥用时有发生，隐私安全问题也越来越被重视。

国家于 **2020 年施行密码法**、**2021 年施行个人信息保护法**，对个人隐私数据和数据安全加密有更高的要求。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bbf439129ac3405abe65c55766625f94~tplv-k3u1fbpfcp-zoom-1.image)

因此，隐私计算也不断地被提及和关注，源于其有优秀的数据保护作用，使得**『数据不出域、可用不可见』**，限定了数据的使用场景，防止了数据的泄露，而引起了业界的热捧。

隐私计算是指**在保护数据本身不对外泄露的前提下，实现数据共享和计算的技术集合，共享数据价值**，而非源数据本身，实现数据可用不可见。

- 隐私计算对于**个人用户**来说，有助于保障个人信息安全；

- 对于**企业**来说，隐私计算是数据协作过程中履行数据保护义务的关键路径；

- 对于**政府**来说，隐私计算实现数据价值最大化的重要支撑。

隐私计算目前在金融、医疗、电信、政务等领域均在开展应用试验，比如：

***银行和金融机构***

在**不泄露各方原始数据**的前提下，进行分布式模型训练，可以有效**降低信贷、欺诈**等风险；

***医疗机构***

无需共享原始数据便可进行联合建模和数据分析，数据使用方在**不侵犯用户隐私**的情况下，可以使用建模运算结果数据，有效推动医疗行业**数据高效利用**。

隐私计算的相关技术有多方安全计算 *（MPC）* 、可信执行环境 *（TEE）* 、联邦学习 *（FL）* 、同态加密 *（HE）* 、差分隐私 *（DP）* 、零知识证明 *（ZKP）* 、区块链 *（BC）* 等等。

这些技术各有优缺点，隐私计算的产品或者平台也是由这些技术来搭建。

其中与密码学明显相关的是**同态加密**，目前同态加密算法的开源项目各有千秋，用户使用比较复杂。BabaSSL 作为基础密码库，应该提供一套简单易用和高效的同态加密算法实现和接口，让上层应用更方便简单地使用同态加密算法。

此外，随着隐私计算技术的兴起，蚂蚁集团推出了开箱即用、软硬件结合的**隐私计算基础设施**，一站式解决方案，即可信原生一体机。

BabaSSL 作为蚂蚁可信原生一体机中的核心基础软件密码库，将同态加密等隐私计算所需的相关密码学能力整合其中，为可信原生一体机的用户带来更加便捷高效的使用体验。

## 02 同态加密

同态加密 *（Homomorphic Encryption, HE）* 是指**满足密文同态运算性质的加密算法**，按性质分为加法同态和乘法同态：

***加法同态***

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ddc2fd33e83e41069238a65ee46d5e7b~tplv-k3u1fbpfcp-zoom-1.image)

***乘法同态***

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/31449d7c592c4c52a7d3e2367ce2db3c~tplv-k3u1fbpfcp-zoom-1.image)

同态加密后得到密文数据，对密文数据进行同态加法或者乘法得到密文结果，将密文结果同态解密后可以得到原始数据直接加法或者乘法的计算结果。

如下图：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aac283ad45ed41008caccc7907236f47~tplv-k3u1fbpfcp-zoom-1.image)

根据满足加法和乘法的运算次数又分为：全同态加密和半同态加密。

***全同态加密***

*（ Fully Homomorphic Encryption, FHE ）*

1.支持任意次的加法和乘法运算

2.难实现、性能差 *（密钥过大，运行效率低，密文过大）*

3.主流算法：Gentry、BFV、BGV、CKKS

4.需要实现的接口

***半同态加密***

*（Partially Homomorphic Encryption, PHE）*

1.只支持加法或乘法中的一种运算，或者可同时支持有限次数的加法和乘法运算

2.原理简单、易实现、性能好

3.主流算法：RSA、ElGamal、Paillier

4.需要实现的接口：

*（1）**KeyGen()：** 密钥生成算法，用于产生加密数据的公钥 PK（* *Public* *Key）和私钥 SK（Secret Key），以及一些公共参数 PP（Public Parameter）。*

*（2）**Encrypt()：** 加密算法，使用 PK 对用户数据 Data 进行加密，得到密文 CT（Ciphertext）。*

*（3）**Decrypt()：** 解密算法，使用 SK 对密文 CT 解密得到数据原文 PT（Plaintext）。*

*（4）**Add()：** 密文同态加法，输入两个 CT 进行同态加运算。*

*（5）**Sub()：** 密文同态减法，输入两个 CT 进行同态减法算。*

*（6）**ScalaMul() 或者 Mul()** ：密文同态标量乘法，输入一个 CT 和一个标量 PT，计算 CT 的标量乘结果。*

**EC-ElGamal 原理**

ElGamal 加密算法是基于 Diffie-Hellman 密钥交换的非对称加密算法，EC-ElGamal 是 ECC 的一种，是把 ElGamal 移植到椭圆曲线上来的实现，主要计算有：椭圆曲线点加、点减、点乘、模逆和离散对数。

以下是 EC-ElGamal 的算法原理：

***公共参数***

1.**G**：椭圆曲线基点\

2.**SK**：私钥，SK=d

*（d 是 0 到椭圆曲线的阶 q 之间的随机数）*

3.**PK**：公钥，PK=dG

***加密***

1.**明文 m，随机数 r**

2.**计算密文 C**：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ef20d0fd94ec4b16aa98dc20236fd0cf~tplv-k3u1fbpfcp-zoom-1.image)

（3）明文 m 的取值范围为模 order(G) 的模空间，但实际使用时 m 需限制为较小的数 *（例如 32 比特长度）* ，否则椭圆曲线离散对数问题 *（ECDLP）* 无法求解。

***解密***\

1.**计算 rPK**：\

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/42fefe0e50b04fa281c3ef2709d60a86~tplv-k3u1fbpfcp-zoom-1.image)

2.**计算 mG**：\

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b5ecd4f02482409eb157c9702876573d~tplv-k3u1fbpfcp-zoom-1.image)

3.计算 mG 的 ECDLP，获得明文 m。\

***密文加法、密文减法***

1.**两个密文**：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d4ff69c395be43dca5fb929170910afd~tplv-k3u1fbpfcp-zoom-1.image)

2 **.密文加**：

对 2 个密文的 2 个 ECC 点分别做点加，共 2 个点加，公式如下：\

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ed23ccf8be9a413c8155cd62977ef3e2~tplv-k3u1fbpfcp-zoom-1.image)

3.**密文减**：

对 2 个密文的 2 个 ECC 点分别做点减，共 2 个点减，公式如下：\

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b7b79b4ef2cf4389aaba4a9adf52c51a~tplv-k3u1fbpfcp-zoom-1.image)

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8512aa97ad82436dbd75d1f40b8a764f~tplv-k3u1fbpfcp-zoom-1.image)

***密文标量乘法***

1.**密文**

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d7c61c99b9014602ac16fb2614d8c121~tplv-k3u1fbpfcp-zoom-1.image)

2.对密文的 2 个 ECC 点分别用 𝑚_2 做点乘，共 2 个点乘，公式如下：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f6e9edceb68946949c2d298d072ad01e~tplv-k3u1fbpfcp-zoom-1.image)

3.如上公式与明文m2m1的同态加密结果一致：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a152da644914cb192e5ea62239f9da7~tplv-k3u1fbpfcp-zoom-1.image)

这里 r=m2r1

## 03 算法实现

**接口定义**

***对象相关接口***

**1.上下文对象**：

EC_ELGAMAL_CTX，该对象用来保存公私钥以及一些其他内部用到的信息，是 EC-ElGamal 算法其他接口的第一个参数。

接口如下：

```C
//创建 EC_ELGAMAL_CTX 对象，key 为 ECC 公钥或者私钥的 EC_KEY 对象
```

**2.解密表对象**：

EC_ELGAMAL_DECRYPT_TABLE，该对象用来保存解密表的内部信息。椭圆曲线离散对数问题（ECDLP）只有爆力破解的方法可求解，而爆力破解的速度比较慢，通常的做法是使用小步大步算法（Baby-Step，Giant-Step，BSGS）。总体思想是提前将所有可能的明文结果提前运算后，保存到 hash 表中，下次只需要进行少量的运算和 hash 表查找就可以得到结果，大大提高 ECDLP 的解密效率，但解密表的初始化可能比较慢，而且解密表的实现事关解密速度，后面考虑可以开放接口的实现给上层应用，所以这里先定义了一个解密表的对象和默认实现。

接口如下：

```C
//创建 EC_ELGAMAL_DECRYPT_TABLE 对象
//decrypt_negative 为 1 时表示该解密表可以解密负数，初始化解密表时将可能的负数运算后插入到 hash 中。
EC_ELGAMAL_DECRYPT_TABLE *EC_ELGAMAL_DECRYPT_TABLE_new(EC_ELGAMAL_CTX *ctx,
                                                       int32_t decrypt_negative);

//释放 EC_ELGAMAL_DECRYPT_TABLE 对象
void EC_ELGAMAL_DECRYPT_TABLE_free(EC_ELGAMAL_DECRYPT_TABLE *table);

//设置 EC_ELGAMAL_DECRYPT_TABLE 对象到上下文对象中
//解密时如果存在解密表则使用解密表进行求解，否则直接爆力破解，速度会很慢
void EC_ELGAMAL_CTX_set_decrypt_table(EC_ELGAMAL_CTX *ctx,
                                      EC_ELGAMAL_DECRYPT_TABLE *table);
```

**3.密文对象**：

EC_ELGAMAL_CIPHERTEXT，由上面原理可知，加密之后得到的结果是两个点，该对象是用来保存加密后的密文信息（两个点），加密/解密和。

接口如下：

```C
//创建 EC_ELGAMAL_CIPHERTEXT 对象
EC_ELGAMAL_CIPHERTEXT *EC_ELGAMAL_CIPHERTEXT_new(EC_ELGAMAL_CTX *ctx);

//释放 EC_ELGAMAL_CIPHERTEXT 对象
void EC_ELGAMAL_CIPHERTEXT_free(EC_ELGAMAL_CIPHERTEXT *ciphertext);
```

**4.加密/解密接口**

```C
//加密，将明文 plaintext 进行加密，结果保存到 EC_ELGAMAL_CIPHERTEXT 对象指针 r 中
int EC_ELGAMAL_encrypt(EC_ELGAMAL_CTX *ctx, EC_ELGAMAL_CIPHERTEXT *r, int32_t plaintext);

//解密，将密文 ciphertext 进行解密，结果保存到 int32_t 指针 r 中
int EC_ELGAMAL_decrypt(EC_ELGAMAL_CTX *ctx, int32_t *r, EC_ELGAMAL_CIPHERTEXT *ciphertext);
```

**5.密文加/减/标量乘运算接口**

```C
//密文加，r = c1 + c2
int EC_ELGAMAL_add(EC_ELGAMAL_CTX *ctx, EC_ELGAMAL_CIPHERTEXT *r,
                   EC_ELGAMAL_CIPHERTEXT *c1, EC_ELGAMAL_CIPHERTEXT *c2);

//密文减，r = c1 - c2
int EC_ELGAMAL_sub(EC_ELGAMAL_CTX *ctx, EC_ELGAMAL_CIPHERTEXT *r,
                   EC_ELGAMAL_CIPHERTEXT *c1, EC_ELGAMAL_CIPHERTEXT *c2);

//标量密文乘，r = m * c
int EC_ELGAMAL_mul(EC_ELGAMAL_CTX *ctx, EC_ELGAMAL_CIPHERTEXT *r,
                   EC_ELGAMAL_CIPHERTEXT *c, int32_t m);
```

**6.编码/解码接口**

同态加密涉及到多方参与，可能会需要网络传输，这就将密文对象 EC_ELGAMAL_CIPHERTEXT 编码后才能传递给对方，对方也需要解码得到 EC_ELGAMAL_CIPHERTEXT 对象后才能调用其他接口进行运算。

接口如下：

```C
//编码，将密文 ciphertext 编码后保存到 out 指针中，out 指针的内存需要提前分配好；
//如果 out 为 NULL，则返回编码所需的内存大小；
//compressed 为是否采用压缩方式编码，1 为压缩编码（编码结果长度较小），0 为正常编码（编码结果长度较大）
size_t EC_ELGAMAL_CIPHERTEXT_encode(EC_ELGAMAL_CTX *ctx, unsigned char *out,
                                    size_t size, EC_ELGAMAL_CIPHERTEXT *ciphertext,
                                    int compressed);

//解码，将长度为 size 的内存数据 in 解码后保存到密文对象 r 中
int EC_ELGAMAL_CIPHERTEXT_decode(EC_ELGAMAL_CTX *ctx, EC_ELGAMAL_CIPHERTEXT *r,
                                 unsigned char *in, size_t size);
```

**核心实现**

BabaSSL 是 OpenSSL 的衍生版，内部支持了很多椭圆曲线算法的实现。

比如，已支持国际 *（prime256v1、secp384r1 等）* 和国密 *（SM2）* 的大部分椭圆曲线，天生实现了椭圆曲线点运算、公私钥生成等基础算法，所以在 BabaSSL 实现 EC-ElGamal 算法的核心实现主要是 EC-ElGamal 原理的实现和 ECDLP 求解算法的实现。

由于代码过长，查看代码辛苦移步 GitHub：

[https://github.com/BabaSSL/BabaSSL/blob/master/crypto/ec/ec_elgamal.c](https://github.com/BabaSSL/BabaSSL/blob/master/crypto/ec/ec_elgamal.c)

具体的使用方法和案例，[可以点击查看](https://babassl.readthedocs.io/zh/latest/Tutorial/PHE/el-elgamal-sample/)。

![](https://oscimg.oschina.net/oscnet/up-6c8a17c7a3eb7bab0ba37b3ad4c5b14818e.gif)

### 本周推荐阅读  

[BabaSSL 发布 8.3.0｜实现相应隐私计算的需求](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502271&idx=1&sn=861bcea32cc766721bb6fd95361ef6eb&chksm=faa32665cdd4af73dcc42c51f79e6c61035cddf95ecad822ea6e85cb188c60cb85c9b8027484&scene=21)

[TLS 握手带宽直降 80%，BabaSSL 是怎么做到的](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247498688&idx=1&sn=7379528f786e0e35db67d1ce7576b5c4&chksm=faa3141acdd49d0ce56d580cc1ea32347c04ecfa1503198c1ec8ce5614ead2bd8169a737250c&scene=21)

[RFC8998+BabaSSL---让国密驶向更远的星辰大海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490428&idx=1&sn=8ca31baa5c99e0790cdee8a075a7c046&chksm=faa0f4a6cdd77db07f3fb1149b7f6505fe6b8eca5b2e2a724960aee76d9667e3e970c44eef5a&scene=21)

[揭秘 AnolisOS 国密生态，想要看懂这一篇就够了](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488577&idx=1&sn=172642c14cc511e27aa882ca7586a4c4&chksm=faa0fb9bcdd7728db0fdceec44b44bb93f36664cbb33e3c50e61fcc05dbc2647ff65dfcda3ee&scene=21)

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*tvfDQLxTbsgAAAAAAAAAAAAAARQnAQ) 
