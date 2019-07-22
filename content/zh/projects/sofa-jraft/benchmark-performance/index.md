---
title: "Benchmark 数据"
---

[测试代码](https://github.com/alipay/sofa-jraft/tree/master/jraft-example/src/main/java/com/alipay/sofa/jraft/benchmark)

# 测试环境&条件

* 3 台 16C 20G 内存的 docker 容器作为 server node (3 副本)
* 2 ~ 8 台 8C docker 容器 作为 client
* 24 个 raft 复制组，平均每台 server node 上各自有 8 个 leader 负责读写请求，不开启 follower 读
* 压测目标为 JRaft 中的 RheaKV 模块，只压测 put、get 两个接口，其中 get 是保证线性一致读的，key 和 value 大小均为 16 字节
* 读比例 10%，写比例 90%

目前的测试场景比较简单，以后会增加更多测试场景

# 测试场景1

## 场景1: 测试条件

| Client 数量 | Client-Batching | Storage-Type | 读写比例 | Replicator-Pipeline | key 大小 | value 大小 |
| ---------- | --------------- | ------------ | -------- | ---------- | -------- | ---------- |
|     8      | **开启**            | MemoryDB     | 1:9      | **开启**  | 16 字节 | 16字节 |

## 场景1: 结果汇总：

* 8 个 client 一共达到 40w+ ops，p95 RT 在 8ms 以内
* 3 个 server 节点负载没达到极限 load 15 左右，cpu 40% 左右

### 场景1: 3 个 server 机器负载：

#### 场景1: server1

```text
top - 20:11:14 up 10 days, 23:09,  1 user,  load average: 12.29, 6.92, 4.00
Tasks:  36 total,   1 running,  35 sleeping,   0 stopped,   0 zombie
%Cpu0  : 24.3 us, 17.7 sy,  0.0 ni, 50.0 id,  2.0 wa,  0.0 hi,  0.0 si,  6.0 st
%Cpu1  : 21.9 us, 18.5 sy,  0.0 ni, 49.5 id,  2.0 wa,  0.0 hi,  0.0 si,  8.1 st
%Cpu2  : 20.6 us, 18.6 sy,  0.0 ni, 53.2 id,  2.0 wa,  0.0 hi,  0.0 si,  5.6 st
%Cpu3  : 23.3 us, 20.0 sy,  0.0 ni, 50.3 id,  1.3 wa,  0.0 hi,  0.0 si,  5.0 st
%Cpu4  : 24.1 us, 19.1 sy,  0.0 ni, 49.8 id,  2.3 wa,  0.0 hi,  0.0 si,  4.7 st
%Cpu5  : 21.3 us, 18.9 sy,  0.0 ni, 53.2 id,  2.0 wa,  0.0 hi,  0.0 si,  4.7 st
%Cpu6  : 24.7 us, 18.4 sy,  0.0 ni, 50.2 id,  2.0 wa,  0.0 hi,  0.0 si,  4.7 st
%Cpu7  : 24.8 us, 17.8 sy,  0.0 ni, 50.0 id,  1.7 wa,  0.0 hi,  0.0 si,  5.7 st
%Cpu8  : 26.0 us, 18.3 sy,  0.0 ni, 51.3 id,  2.3 wa,  0.0 hi,  0.0 si,  2.0 st
%Cpu9  : 26.6 us, 16.9 sy,  0.0 ni, 52.2 id,  2.0 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu10 : 31.7 us, 17.7 sy,  0.0 ni, 46.3 id,  2.3 wa,  0.0 hi,  0.0 si,  2.0 st
%Cpu11 : 23.2 us, 18.9 sy,  0.0 ni, 53.3 id,  2.3 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu12 : 25.6 us, 18.3 sy,  0.0 ni, 51.5 id,  2.3 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu13 : 22.6 us, 18.3 sy,  0.0 ni, 54.5 id,  2.3 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu14 : 24.7 us, 17.3 sy,  0.0 ni, 54.0 id,  1.7 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu15 : 61.8 us,  8.3 sy,  0.0 ni, 28.2 id,  0.3 wa,  0.0 hi,  0.0 si,  1.3 st
KiB Mem : 62914560 total,  6854596 free, 39128016 used, 16931948 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used.  6854596 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 15682 root      20   0 12.853g 8.859g  24064 S 708.7 14.8  26:49.38 java
```

#### 场景1: server2

```text
top - 20:11:47 up 10 days, 23:03,  1 user,  load average: 17.68, 8.50, 4.56
Tasks:  33 total,   1 running,  31 sleeping,   0 stopped,   1 zombie
%Cpu0  : 22.7 us, 17.3 sy,  0.0 ni, 35.0 id,  8.3 wa,  0.0 hi,  0.0 si, 16.7 st
%Cpu1  : 20.1 us, 19.4 sy,  0.0 ni, 43.8 id,  9.4 wa,  0.0 hi,  0.0 si,  7.4 st
%Cpu2  : 23.3 us, 20.0 sy,  0.0 ni, 39.7 id, 10.3 wa,  0.0 hi,  0.0 si,  6.7 st
%Cpu3  : 24.1 us, 20.1 sy,  0.0 ni, 40.8 id,  9.4 wa,  0.0 hi,  0.0 si,  5.7 st
%Cpu4  : 21.4 us, 17.7 sy,  0.0 ni, 37.1 id,  9.0 wa,  0.0 hi,  0.0 si, 14.7 st
%Cpu5  : 22.6 us, 19.6 sy,  0.0 ni, 40.5 id, 10.6 wa,  0.0 hi,  0.0 si,  6.6 st
%Cpu6  : 23.6 us, 19.9 sy,  0.0 ni, 40.2 id, 10.3 wa,  0.0 hi,  0.0 si,  6.0 st
%Cpu7  : 20.5 us, 19.9 sy,  0.0 ni, 44.4 id,  9.9 wa,  0.0 hi,  0.0 si,  5.3 st
%Cpu8  : 40.7 us, 13.3 sy,  0.0 ni, 34.3 id,  9.0 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu9  : 39.9 us, 14.0 sy,  0.0 ni, 35.2 id,  8.6 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu10 : 39.7 us, 14.2 sy,  0.0 ni, 34.8 id,  8.6 wa,  0.0 hi,  0.0 si,  2.6 st
%Cpu11 : 34.8 us, 16.7 sy,  0.0 ni, 37.5 id,  8.7 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu12 : 22.3 us, 18.9 sy,  0.0 ni, 44.2 id, 11.0 wa,  0.0 hi,  0.0 si,  3.7 st
%Cpu13 : 38.5 us, 14.6 sy,  0.0 ni, 36.2 id,  8.3 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu14 : 26.0 us, 18.3 sy,  0.0 ni, 43.0 id, 10.0 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu15 : 26.9 us, 18.9 sy,  0.0 ni, 40.9 id, 10.3 wa,  0.0 hi,  0.0 si,  3.0 st
KiB Mem : 62914560 total,  6522696 free, 36904808 used, 19487056 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used.  6522696 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
118164 root      20   0 12.987g 6.889g  24140 S 729.9 11.5  30:59.19 java
```

#### 场景1: server3

```text
top - 20:12:14 up 6 days,  4:11,  1 user,  load average: 13.60, 7.80, 4.29
Tasks:  31 total,   1 running,  30 sleeping,   0 stopped,   0 zombie
%Cpu0  : 18.8 us, 16.8 sy,  0.0 ni, 53.0 id,  1.3 wa,  0.0 hi,  0.0 si, 10.1 st
%Cpu1  : 90.0 us,  3.3 sy,  0.0 ni,  2.0 id,  0.0 wa,  0.0 hi,  0.0 si,  4.7 st
%Cpu2  : 18.1 us, 18.7 sy,  0.0 ni, 54.2 id,  1.7 wa,  0.0 hi,  0.0 si,  7.4 st
%Cpu3  : 19.0 us, 17.0 sy,  0.0 ni, 55.3 id,  1.3 wa,  0.0 hi,  0.0 si,  7.3 st
%Cpu4  : 20.7 us, 16.7 sy,  0.0 ni, 55.0 id,  1.7 wa,  0.0 hi,  0.0 si,  6.0 st
%Cpu5  : 17.2 us, 16.2 sy,  0.0 ni, 57.3 id,  1.6 wa,  0.0 hi,  0.0 si,  7.6 st
%Cpu6  : 15.7 us, 17.1 sy,  0.0 ni, 56.5 id,  1.7 wa,  0.0 hi,  0.0 si,  9.0 st
%Cpu7  : 17.8 us, 17.1 sy,  0.0 ni, 54.4 id,  1.3 wa,  0.0 hi,  0.0 si,  9.4 st
%Cpu8  : 21.9 us, 15.3 sy,  0.0 ni, 56.1 id,  1.3 wa,  0.0 hi,  0.0 si,  5.3 st
%Cpu9  : 21.7 us, 15.3 sy,  0.0 ni, 59.0 id,  1.7 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu10 : 22.0 us, 17.0 sy,  0.0 ni, 56.7 id,  1.7 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu11 : 21.6 us, 16.6 sy,  0.0 ni, 57.1 id,  1.7 wa,  0.0 hi,  0.0 si,  3.0 st
%Cpu12 : 22.2 us, 16.2 sy,  0.0 ni, 56.6 id,  2.0 wa,  0.0 hi,  0.0 si,  3.0 st
%Cpu13 : 20.3 us, 17.3 sy,  0.0 ni, 58.5 id,  1.3 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu14 : 22.7 us, 17.7 sy,  0.0 ni, 55.3 id,  1.7 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu15 : 22.3 us, 16.9 sy,  0.0 ni, 56.8 id,  1.3 wa,  0.0 hi,  0.0 si,  2.7 st
KiB Mem : 62914560 total, 34784900 free, 12135352 used, 15994308 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used. 34784900 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 14040 root      20   0 12.893g 7.562g  24064 S 651.5 12.6  34:19.05 java
```

### 场景1: 8 个 client 的 ops 数据：

#### client1：6.6w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 19926351
         mean rate = 66044.67 calls/second
     1-minute rate = 51776.67 calls/second
     5-minute rate = 50421.44 calls/second
    15-minute rate = 39736.69 calls/second
               min = 0.24 milliseconds
               max = 553.79 milliseconds
              mean = 6.30 milliseconds
            stddev = 19.93 milliseconds
            median = 5.70 milliseconds
              75% <= 6.24 milliseconds
              95% <= 7.34 milliseconds
              98% <= 7.89 milliseconds
              99% <= 8.41 milliseconds
            99.9% <= 550.21 milliseconds
get_benchmark_timer
             count = 1992665
         mean rate = 6604.50 calls/second
     1-minute rate = 5177.87 calls/second
     5-minute rate = 5043.64 calls/second
    15-minute rate = 3976.49 calls/second
               min = 0.22 milliseconds
               max = 2.37 milliseconds
              mean = 0.39 milliseconds
            stddev = 0.10 milliseconds
            median = 0.37 milliseconds
              75% <= 0.44 milliseconds
              95% <= 0.58 milliseconds
              98% <= 0.65 milliseconds
              99% <= 0.70 milliseconds
            99.9% <= 0.84 milliseconds
put_benchmark_timer
             count = 17933686
         mean rate = 59438.79 calls/second
     1-minute rate = 46598.96 calls/second
     5-minute rate = 45377.76 calls/second
    15-minute rate = 35760.06 calls/second
               min = 3.61 milliseconds
               max = 522.33 milliseconds
              mean = 9.34 milliseconds
            stddev = 38.55 milliseconds
            median = 5.87 milliseconds
              75% <= 6.33 milliseconds
              95% <= 7.64 milliseconds
              98% <= 8.76 milliseconds
              99% <= 15.94 milliseconds
            99.9% <= 495.93 milliseconds
```

#### client2：5.6w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 20482649
         mean rate = 56629.36 calls/second
               min = 0.23 milliseconds
               max = 560.56 milliseconds
              mean = 10.17 milliseconds
            stddev = 42.23 milliseconds
            median = 6.11 milliseconds
              75% <= 6.74 milliseconds
              95% <= 9.30 milliseconds
              98% <= 14.34 milliseconds
              99% <= 134.99 milliseconds
            99.9% <= 560.56 milliseconds
get_benchmark_timer
             count = 1920555
         mean rate = 5790.12 calls/second
     1-minute rate = 4400.25 calls/second
     5-minute rate = 4886.09 calls/second
    15-minute rate = 4431.03 calls/second
               min = 0.20 milliseconds
               max = 483.05 milliseconds
              mean = 0.90 milliseconds
            stddev = 15.05 milliseconds
            median = 0.39 milliseconds
              75% <= 0.47 milliseconds
              95% <= 0.70 milliseconds
              98% <= 0.81 milliseconds
              99% <= 0.90 milliseconds
            99.9% <= 469.68 milliseconds
put_benchmark_timer
             count = 17284705
         mean rate = 52109.92 calls/second
     1-minute rate = 39601.12 calls/second
     5-minute rate = 43955.99 calls/second
    15-minute rate = 39840.74 calls/second
               min = 4.00 milliseconds
               max = 566.42 milliseconds
              mean = 9.85 milliseconds
            stddev = 39.49 milliseconds
            median = 6.20 milliseconds
              75% <= 6.75 milliseconds
              95% <= 8.96 milliseconds
              98% <= 11.83 milliseconds
              99% <= 18.95 milliseconds
            99.9% <= 566.42 milliseconds
```

#### client3：5.7w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 17381123
         mean rate = 57759.74 calls/second
     1-minute rate = 46705.16 calls/second
     5-minute rate = 54031.23 calls/second
    15-minute rate = 54070.53 calls/second
               min = 0.18 milliseconds
               max = 503.15 milliseconds
              mean = 9.05 milliseconds
            stddev = 38.99 milliseconds
            median = 5.77 milliseconds
              75% <= 6.42 milliseconds
              95% <= 7.84 milliseconds
              98% <= 10.03 milliseconds
              99% <= 46.69 milliseconds
            99.9% <= 503.15 milliseconds
get_benchmark_timer
             count = 1738130
         mean rate = 5776.01 calls/second
     1-minute rate = 4670.78 calls/second
     5-minute rate = 5404.37 calls/second
    15-minute rate = 5409.38 calls/second
               min = 0.17 milliseconds
               max = 499.86 milliseconds
              mean = 1.28 milliseconds
            stddev = 21.15 milliseconds
            median = 0.35 milliseconds
              75% <= 0.43 milliseconds
              95% <= 0.61 milliseconds
              98% <= 0.76 milliseconds
              99% <= 0.86 milliseconds
            99.9% <= 499.86 milliseconds
put_benchmark_timer
             count = 15642993
         mean rate = 51983.20 calls/second
     1-minute rate = 42034.80 calls/second
     5-minute rate = 48626.90 calls/second
    15-minute rate = 48661.16 calls/second
               min = 3.55 milliseconds
               max = 574.44 milliseconds
              mean = 9.21 milliseconds
            stddev = 36.41 milliseconds
            median = 5.87 milliseconds
              75% <= 6.43 milliseconds
              95% <= 7.89 milliseconds
              98% <= 13.10 milliseconds
              99% <= 16.65 milliseconds
            99.9% <= 522.46 milliseconds
```

#### client4：5.3w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 12779528
         mean rate = 53033.34 calls/second
     1-minute rate = 45941.89 calls/second
     5-minute rate = 44791.65 calls/second
    15-minute rate = 40517.18 calls/second
               min = 0.18 milliseconds
               max = 525.26 milliseconds
              mean = 8.36 milliseconds
            stddev = 34.28 milliseconds
            median = 5.73 milliseconds
              75% <= 6.35 milliseconds
              95% <= 7.97 milliseconds
              98% <= 11.73 milliseconds
              99% <= 36.88 milliseconds
            99.9% <= 522.17 milliseconds
get_benchmark_timer
             count = 1277965
         mean rate = 5303.33 calls/second
     1-minute rate = 4594.36 calls/second
     5-minute rate = 4480.36 calls/second
    15-minute rate = 4053.67 calls/second
               min = 0.18 milliseconds
               max = 514.77 milliseconds
              mean = 0.54 milliseconds
            stddev = 8.97 milliseconds
            median = 0.36 milliseconds
              75% <= 0.43 milliseconds
              95% <= 0.60 milliseconds
              98% <= 0.73 milliseconds
              99% <= 0.83 milliseconds
            99.9% <= 3.02 milliseconds
put_benchmark_timer
             count = 11501763
         mean rate = 47729.82 calls/second
     1-minute rate = 41347.87 calls/second
     5-minute rate = 40311.33 calls/second
    15-minute rate = 36463.51 calls/second
               min = 4.02 milliseconds
               max = 581.53 milliseconds
              mean = 9.83 milliseconds
            stddev = 37.75 milliseconds
            median = 5.88 milliseconds
              75% <= 6.49 milliseconds
              95% <= 8.57 milliseconds
              98% <= 14.53 milliseconds
              99% <= 141.18 milliseconds
            99.9% <= 581.53 milliseconds
```

#### client5：4.8w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 8787260
         mean rate = 48528.52 calls/second
     1-minute rate = 45517.95 calls/second
     5-minute rate = 44081.76 calls/second
    15-minute rate = 42392.68 calls/second
               min = 0.16 milliseconds
               max = 508.39 milliseconds
              mean = 6.80 milliseconds
            stddev = 24.29 milliseconds
            median = 5.65 milliseconds
              75% <= 6.14 milliseconds
              95% <= 7.44 milliseconds
              98% <= 9.67 milliseconds
              99% <= 11.37 milliseconds
            99.9% <= 508.39 milliseconds
get_benchmark_timer
             count = 878755
         mean rate = 4852.96 calls/second
     1-minute rate = 4552.01 calls/second
     5-minute rate = 4410.87 calls/second
    15-minute rate = 4243.26 calls/second
               min = 0.14 milliseconds
               max = 122.35 milliseconds
              mean = 0.62 milliseconds
            stddev = 5.50 milliseconds
            median = 0.34 milliseconds
              75% <= 0.44 milliseconds
              95% <= 0.59 milliseconds
              98% <= 0.72 milliseconds
              99% <= 0.85 milliseconds
            99.9% <= 122.35 milliseconds
put_benchmark_timer
             count = 7908790
         mean rate = 43676.00 calls/second
     1-minute rate = 40965.79 calls/second
     5-minute rate = 39667.82 calls/second
    15-minute rate = 38144.83 calls/second
               min = 4.04 milliseconds
               max = 593.34 milliseconds
              mean = 9.75 milliseconds
            stddev = 41.98 milliseconds
            median = 5.75 milliseconds
              75% <= 6.25 milliseconds
              95% <= 7.62 milliseconds
              98% <= 9.24 milliseconds
              99% <= 17.10 milliseconds
            99.9% <= 519.11 milliseconds
```

#### client6：4.5w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 6867485
         mean rate = 45507.64 calls/second
     1-minute rate = 45064.38 calls/second
     5-minute rate = 38615.42 calls/second
    15-minute rate = 35853.66 calls/second
               min = 0.15 milliseconds
               max = 575.29 milliseconds
              mean = 8.81 milliseconds
            stddev = 39.29 milliseconds
            median = 5.53 milliseconds
              75% <= 6.05 milliseconds
              95% <= 7.28 milliseconds
              98% <= 9.24 milliseconds
              99% <= 116.75 milliseconds
            99.9% <= 496.56 milliseconds
get_benchmark_timer
             count = 686765
         mean rate = 4550.82 calls/second
     1-minute rate = 4506.83 calls/second
     5-minute rate = 3863.49 calls/second
    15-minute rate = 3588.02 calls/second
               min = 0.14 milliseconds
               max = 1.42 milliseconds
              mean = 0.36 milliseconds
            stddev = 0.12 milliseconds
            median = 0.34 milliseconds
              75% <= 0.41 milliseconds
              95% <= 0.59 milliseconds
              98% <= 0.70 milliseconds
              99% <= 0.75 milliseconds
            99.9% <= 1.27 milliseconds
put_benchmark_timer
             count = 6180720
         mean rate = 40955.74 calls/second
     1-minute rate = 40557.85 calls/second
     5-minute rate = 34751.96 calls/second
    15-minute rate = 32265.65 calls/second
               min = 4.26 milliseconds
               max = 552.87 milliseconds
              mean = 8.20 milliseconds
            stddev = 31.77 milliseconds
            median = 5.61 milliseconds
              75% <= 6.18 milliseconds
              95% <= 7.27 milliseconds
              98% <= 9.02 milliseconds
              99% <= 22.27 milliseconds
            99.9% <= 552.87 milliseconds
```

#### client7：4.4w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 7999875
         mean rate = 44215.63 calls/second
               min = 0.17 milliseconds
               max = 499.51 milliseconds
              mean = 9.70 milliseconds
            stddev = 44.64 milliseconds
            median = 5.61 milliseconds
              75% <= 6.11 milliseconds
              95% <= 7.38 milliseconds
              98% <= 10.21 milliseconds
              99% <= 116.78 milliseconds
            99.9% <= 499.51 milliseconds
get_benchmark_timer
             count = 676095
         mean rate = 4479.54 calls/second
     1-minute rate = 4521.71 calls/second
     5-minute rate = 3948.66 calls/second
    15-minute rate = 3724.38 calls/second
               min = 0.15 milliseconds
               max = 499.29 milliseconds
              mean = 1.16 milliseconds
            stddev = 19.78 milliseconds
            median = 0.34 milliseconds
              75% <= 0.42 milliseconds
              95% <= 0.60 milliseconds
              98% <= 0.71 milliseconds
              99% <= 0.85 milliseconds
            99.9% <= 499.29 milliseconds
put_benchmark_timer
             count = 6084841
         mean rate = 40315.02 calls/second
     1-minute rate = 40691.08 calls/second
     5-minute rate = 35518.40 calls/second
    15-minute rate = 33492.93 calls/second
               min = 4.22 milliseconds
               max = 518.07 milliseconds
              mean = 10.22 milliseconds
            stddev = 44.75 milliseconds
            median = 5.70 milliseconds
              75% <= 6.20 milliseconds
              95% <= 7.37 milliseconds
              98% <= 10.08 milliseconds
              99% <= 120.90 milliseconds
            99.9% <= 518.07 milliseconds
```

#### client8：4.2w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 7747941
         mean rate = 42811.02 calls/second
     1-minute rate = 42423.09 calls/second
     5-minute rate = 35193.32 calls/second
    15-minute rate = 31374.94 calls/second
               min = 0.17 milliseconds
               max = 589.28 milliseconds
              mean = 10.22 milliseconds
            stddev = 44.35 milliseconds
            median = 5.86 milliseconds
              75% <= 6.64 milliseconds
              95% <= 9.41 milliseconds
              98% <= 13.28 milliseconds
              99% <= 164.26 milliseconds
            99.9% <= 589.28 milliseconds
get_benchmark_timer
             count = 774815
         mean rate = 4281.18 calls/second
     1-minute rate = 4242.54 calls/second
     5-minute rate = 3521.90 calls/second
    15-minute rate = 3141.29 calls/second
               min = 0.18 milliseconds
               max = 1.48 milliseconds
              mean = 0.34 milliseconds
            stddev = 0.12 milliseconds
            median = 0.32 milliseconds
              75% <= 0.39 milliseconds
              95% <= 0.55 milliseconds
              98% <= 0.65 milliseconds
              99% <= 0.80 milliseconds
            99.9% <= 1.48 milliseconds
put_benchmark_timer
             count = 6973126
         mean rate = 38529.00 calls/second
     1-minute rate = 38180.75 calls/second
     5-minute rate = 31671.44 calls/second
    15-minute rate = 28233.65 calls/second
               min = 4.42 milliseconds
               max = 511.03 milliseconds
              mean = 7.98 milliseconds
            stddev = 25.88 milliseconds
            median = 6.01 milliseconds
              75% <= 6.73 milliseconds
              95% <= 9.71 milliseconds
              98% <= 11.06 milliseconds
              99% <= 15.29 milliseconds
            99.9% <= 511.03 milliseconds
```

# 测试场景2

## 场景2: 测试条件

| Client 数量 | Client-Batching | Storage-Type | 读写比例 | Replicator-Pipeline | key 大小 | value 大小 |
| ---------- | --------------- | ------------ | -------- | ---------- | -------- | ---------- |
|     8      | **开启**          | RocksDB     | 1:9      | **开启**  | 16 字节 | 16字节 |

## 场景2: 结果汇总

* 8 个 client 一共达到 25w+ ops, p95 RT 在 20ms 以内
* 3 个 server 节点负载没达到极限 load 10 左右，cpu 30% 左右，还可以增加 client，client 发送能力受限

### 场景2: 3 个 server 机器负载

#### 场景2: server1

```text
top - 21:01:33 up 10 days, 23:59,  1 user,  load average: 10.52, 9.01, 5.85
Tasks:  28 total,   1 running,  27 sleeping,   0 stopped,   0 zombie
%Cpu0  : 16.9 us, 13.9 sy,  0.0 ni, 63.2 id,  1.3 wa,  0.0 hi,  0.0 si,  4.6 st
%Cpu1  : 16.6 us, 13.0 sy,  0.0 ni, 62.5 id,  1.3 wa,  0.0 hi,  0.0 si,  6.6 st
%Cpu2  : 15.8 us, 13.5 sy,  0.0 ni, 64.6 id,  0.7 wa,  0.0 hi,  0.0 si,  5.4 st
%Cpu3  : 16.7 us, 13.7 sy,  0.0 ni, 63.7 id,  1.7 wa,  0.0 hi,  0.0 si,  4.3 st
%Cpu4  : 16.7 us, 14.0 sy,  0.0 ni, 63.7 id,  1.3 wa,  0.0 hi,  0.0 si,  4.3 st
%Cpu5  : 16.0 us, 13.0 sy,  0.0 ni, 66.0 id,  1.3 wa,  0.0 hi,  0.0 si,  3.7 st
%Cpu6  : 16.3 us, 13.3 sy,  0.0 ni, 64.7 id,  1.7 wa,  0.0 hi,  0.0 si,  4.0 st
%Cpu7  : 16.3 us, 14.7 sy,  0.0 ni, 62.7 id,  1.7 wa,  0.0 hi,  0.0 si,  4.7 st
%Cpu8  : 17.3 us, 13.6 sy,  0.0 ni, 65.1 id,  1.7 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu9  : 18.3 us, 13.3 sy,  0.0 ni, 66.0 id,  1.0 wa,  0.0 hi,  0.0 si,  1.3 st
%Cpu10 : 16.9 us, 13.6 sy,  0.0 ni, 65.9 id,  1.7 wa,  0.0 hi,  0.0 si,  2.0 st
%Cpu11 : 18.1 us, 14.0 sy,  0.0 ni, 64.9 id,  1.3 wa,  0.0 hi,  0.0 si,  1.7 st
%Cpu12 : 17.9 us, 14.3 sy,  0.0 ni, 64.5 id,  1.3 wa,  0.0 hi,  0.0 si,  2.0 st
%Cpu13 : 56.7 us,  7.3 sy,  0.0 ni, 34.3 id,  0.7 wa,  0.0 hi,  0.0 si,  1.0 st
%Cpu14 : 17.7 us, 13.3 sy,  0.0 ni, 64.0 id,  1.3 wa,  0.0 hi,  0.0 si,  3.7 st
%Cpu15 : 19.2 us, 12.3 sy,  0.0 ni, 65.2 id,  1.3 wa,  0.0 hi,  0.0 si,  2.0 st
KiB Mem : 62914560 total,  3414404 free, 39254896 used, 20245260 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used.  3414404 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 33887 root      20   0 13.831g 9.054g  24048 S 513.6 15.1  77:08.73 java
```

#### 场景2: server2

```text
top - 21:02:18 up 10 days, 23:53,  1 user,  load average: 9.57, 9.66, 6.38
Tasks:  34 total,   1 running,  33 sleeping,   0 stopped,   0 zombie
%Cpu0  : 12.0 us,  8.7 sy,  0.0 ni, 58.7 id,  7.3 wa,  0.0 hi,  0.0 si, 13.3 st
%Cpu1  : 12.1 us, 10.8 sy,  0.0 ni, 65.3 id,  7.4 wa,  0.0 hi,  0.0 si,  4.4 st
%Cpu2  : 11.7 us, 10.3 sy,  0.0 ni, 66.0 id,  8.0 wa,  0.0 hi,  0.0 si,  4.0 st
%Cpu3  : 15.0 us, 10.7 sy,  0.0 ni, 62.3 id,  8.0 wa,  0.0 hi,  0.0 si,  4.0 st
%Cpu4  : 10.0 us,  8.7 sy,  0.0 ni, 60.3 id,  8.0 wa,  0.0 hi,  0.0 si, 13.0 st
%Cpu5  : 12.4 us, 10.7 sy,  0.0 ni, 65.9 id,  7.4 wa,  0.0 hi,  0.0 si,  3.7 st
%Cpu6  : 12.4 us, 10.4 sy,  0.0 ni, 64.2 id,  8.4 wa,  0.0 hi,  0.0 si,  4.7 st
%Cpu7  : 12.4 us, 11.4 sy,  0.0 ni, 63.5 id,  8.0 wa,  0.0 hi,  0.0 si,  4.7 st
%Cpu8  : 13.0 us, 10.0 sy,  0.0 ni, 66.0 id,  8.3 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu9  : 18.9 us, 16.9 sy,  0.0 ni, 53.0 id,  8.6 wa,  0.0 hi,  0.0 si,  2.6 st
%Cpu10 : 13.0 us, 11.0 sy,  0.0 ni, 65.8 id,  7.6 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu11 : 12.7 us,  9.3 sy,  0.0 ni, 66.7 id,  8.7 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu12 : 14.3 us, 11.6 sy,  0.0 ni, 62.5 id,  9.0 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu13 : 35.7 us,  6.0 sy,  0.0 ni, 50.7 id,  6.0 wa,  0.0 hi,  0.0 si,  1.7 st
%Cpu14 : 12.9 us,  8.6 sy,  0.0 ni, 65.9 id,  9.6 wa,  0.0 hi,  0.0 si,  3.0 st
%Cpu15 : 16.9 us, 15.3 sy,  0.0 ni, 56.5 id,  9.0 wa,  0.0 hi,  0.0 si,  2.3 st
KiB Mem : 62914560 total,  3618372 free, 37721664 used, 21574524 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used.  3618372 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
  5610 root      20   0 13.875g 7.683g  24144 S 397.7 12.8  78:40.24 java
```

#### 场景2: server3

```text
top - 21:02:40 up 6 days,  5:01,  1 user,  load average: 10.67, 9.64, 6.02
Tasks:  33 total,   1 running,  32 sleeping,   0 stopped,   0 zombie
%Cpu0  : 23.3 us,  8.3 sy,  0.0 ni, 63.1 id,  1.0 wa,  0.0 hi,  0.0 si,  4.3 st
%Cpu1  : 15.6 us, 11.6 sy,  0.0 ni, 67.4 id,  1.0 wa,  0.0 hi,  0.0 si,  4.3 st
%Cpu2  : 14.3 us, 10.7 sy,  0.0 ni, 69.0 id,  1.0 wa,  0.0 hi,  0.0 si,  5.0 st
%Cpu3  : 14.3 us, 10.6 sy,  0.0 ni, 69.4 id,  1.0 wa,  0.0 hi,  0.0 si,  4.7 st
%Cpu4  : 30.5 us,  7.6 sy,  0.0 ni, 57.0 id,  0.7 wa,  0.0 hi,  0.0 si,  4.3 st
%Cpu5  : 13.3 us, 10.7 sy,  0.0 ni, 69.3 id,  1.3 wa,  0.0 hi,  0.0 si,  5.3 st
%Cpu6  : 23.5 us,  6.6 sy,  0.0 ni, 64.6 id,  1.0 wa,  0.0 hi,  0.0 si,  4.3 st
%Cpu7  : 13.0 us, 10.3 sy,  0.0 ni, 69.8 id,  1.0 wa,  0.0 hi,  0.0 si,  6.0 st
%Cpu8  : 16.6 us, 10.6 sy,  0.0 ni, 69.8 id,  1.0 wa,  0.0 hi,  0.0 si,  2.0 st
%Cpu9  : 14.7 us, 10.7 sy,  0.0 ni, 71.0 id,  1.0 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu10 : 17.1 us, 10.4 sy,  0.0 ni, 69.6 id,  1.0 wa,  0.0 hi,  0.0 si,  2.0 st
%Cpu11 : 22.9 us,  7.6 sy,  0.0 ni, 66.8 id,  1.0 wa,  0.0 hi,  0.0 si,  1.7 st
%Cpu12 : 16.6 us, 10.3 sy,  0.0 ni, 70.4 id,  1.0 wa,  0.0 hi,  0.0 si,  1.7 st
%Cpu13 : 16.0 us, 10.0 sy,  0.0 ni, 70.3 id,  1.3 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu14 : 15.6 us, 11.0 sy,  0.0 ni, 70.1 id,  1.0 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu15 : 24.3 us,  7.3 sy,  0.0 ni, 66.4 id,  0.3 wa,  0.0 hi,  0.0 si,  1.7 st
KiB Mem : 62914560 total, 25306552 free, 11674440 used, 25933568 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used. 25306552 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 28781 root      20   0 14.315g 7.042g  23948 S 436.0 11.7  83:37.86 java
```

### 场景2: 8 个 client 的 ops 数据

#### client1：3.4w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 27063068
         mean rate = 34618.47 calls/second
     1-minute rate = 27821.82 calls/second
     5-minute rate = 30759.93 calls/second
    15-minute rate = 29420.06 calls/second
               min = 0.26 milliseconds
               max = 651.76 milliseconds
              mean = 12.97 milliseconds
            stddev = 35.78 milliseconds
            median = 10.89 milliseconds
              75% <= 12.24 milliseconds
              95% <= 14.66 milliseconds
              98% <= 16.69 milliseconds
              99% <= 80.38 milliseconds
            99.9% <= 638.77 milliseconds
get_benchmark_timer
             count = 2706330
         mean rate = 3461.87 calls/second
     1-minute rate = 2782.23 calls/second
     5-minute rate = 3076.27 calls/second
    15-minute rate = 2943.51 calls/second
               min = 0.22 milliseconds
               max = 7.80 milliseconds
              mean = 1.00 milliseconds
            stddev = 0.81 milliseconds
            median = 0.76 milliseconds
              75% <= 1.34 milliseconds
              95% <= 2.53 milliseconds
              98% <= 3.44 milliseconds
              99% <= 4.13 milliseconds
            99.9% <= 4.62 milliseconds
put_benchmark_timer
             count = 24356738
         mean rate = 31156.48 calls/second
     1-minute rate = 25039.79 calls/second
     5-minute rate = 27683.70 calls/second
    15-minute rate = 26476.56 calls/second
               min = 7.02 milliseconds
               max = 669.96 milliseconds
              mean = 14.28 milliseconds
            stddev = 39.64 milliseconds
            median = 11.29 milliseconds
              75% <= 12.46 milliseconds
              95% <= 14.87 milliseconds
              98% <= 16.10 milliseconds
              99% <= 30.76 milliseconds
            99.9% <= 644.50 milliseconds
```

#### client2：3.3w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 26958831
         mean rate = 33228.27 calls/second
     1-minute rate = 24381.18 calls/second
     5-minute rate = 29993.96 calls/second
    15-minute rate = 33389.17 calls/second
            stddev = 58.01 milliseconds
            median = 11.18 milliseconds
              75% <= 12.93 milliseconds
              95% <= 21.01 milliseconds
              98% <= 54.43 milliseconds
              99% <= 130.17 milliseconds
            99.9% <= 720.17 milliseconds
get_benchmark_timer
             count = 2624025
         mean rate = 3358.44 calls/second
     1-minute rate = 2464.79 calls/second
     5-minute rate = 3062.32 calls/second
    15-minute rate = 3372.49 calls/second
               min = 0.21 milliseconds
               max = 31.64 milliseconds
              mean = 1.27 milliseconds
            stddev = 1.95 milliseconds
            median = 0.79 milliseconds
              75% <= 1.37 milliseconds
              95% <= 3.43 milliseconds
              98% <= 5.91 milliseconds
              99% <= 7.85 milliseconds
            99.9% <= 31.64 milliseconds
put_benchmark_timer
             count = 23616175
         mean rate = 30225.79 calls/second
     1-minute rate = 22183.57 calls/second
     5-minute rate = 27557.31 calls/second
    15-minute rate = 30331.83 calls/second
               min = 7.17 milliseconds
               max = 909.81 milliseconds
              mean = 16.54 milliseconds
            stddev = 42.13 milliseconds
            median = 11.70 milliseconds
              75% <= 13.49 milliseconds
              95% <= 23.07 milliseconds
              98% <= 42.74 milliseconds
              99% <= 74.63 milliseconds
            99.9% <= 656.58 milliseconds
```

#### client3：3.3w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 26253677
         mean rate = 33617.12 calls/second
     1-minute rate = 25187.58 calls/second
     5-minute rate = 30816.67 calls/second
    15-minute rate = 33638.31 calls/second
               min = 0.17 milliseconds
               max = 767.76 milliseconds
              mean = 18.57 milliseconds
            stddev = 64.92 milliseconds
            median = 11.57 milliseconds
              75% <= 13.46 milliseconds
              95% <= 19.38 milliseconds
              98% <= 50.42 milliseconds
              99% <= 183.79 milliseconds
            99.9% <= 767.76 milliseconds
get_benchmark_timer
             count = 2625390
         mean rate = 3361.74 calls/second
     1-minute rate = 2518.65 calls/second
     5-minute rate = 3081.81 calls/second
    15-minute rate = 3364.76 calls/second
               min = 0.18 milliseconds
               max = 28.92 milliseconds
              mean = 0.97 milliseconds
            stddev = 1.49 milliseconds
            median = 0.60 milliseconds
              75% <= 1.16 milliseconds
              95% <= 2.51 milliseconds
              98% <= 3.91 milliseconds
              99% <= 4.87 milliseconds
            99.9% <= 28.92 milliseconds
put_benchmark_timer
             count = 23628287
         mean rate = 30255.31 calls/second
     1-minute rate = 22669.02 calls/second
     5-minute rate = 27734.88 calls/second
    15-minute rate = 30273.56 calls/second
               min = 6.54 milliseconds
               max = 669.53 milliseconds
              mean = 16.63 milliseconds
            stddev = 42.65 milliseconds
            median = 12.04 milliseconds
              75% <= 13.89 milliseconds
              95% <= 21.06 milliseconds
              98% <= 54.34 milliseconds
              99% <= 91.46 milliseconds
            99.9% <= 669.53 milliseconds
```

#### client4：3.2w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 24419381
         mean rate = 32518.91 calls/second
     1-minute rate = 24838.53 calls/second
     5-minute rate = 29790.41 calls/second
    15-minute rate = 29588.00 calls/second
               min = 0.17 milliseconds
               max = 725.16 milliseconds
              mean = 16.39 milliseconds
            stddev = 54.53 milliseconds
            median = 11.47 milliseconds
              75% <= 13.78 milliseconds
              95% <= 19.28 milliseconds
              98% <= 30.65 milliseconds
              99% <= 105.18 milliseconds
            99.9% <= 725.16 milliseconds
get_benchmark_timer
             count = 2441960
         mean rate = 3251.92 calls/second
     1-minute rate = 2483.80 calls/second
     5-minute rate = 2979.44 calls/second
    15-minute rate = 2960.96 calls/second
               min = 0.20 milliseconds
               max = 46.11 milliseconds
              mean = 1.10 milliseconds
            stddev = 2.07 milliseconds
            median = 0.65 milliseconds
              75% <= 1.17 milliseconds
              95% <= 3.21 milliseconds
              98% <= 4.67 milliseconds
              99% <= 7.19 milliseconds
            99.9% <= 46.11 milliseconds
put_benchmark_timer
             count = 21977431
         mean rate = 29266.92 calls/second
     1-minute rate = 22354.78 calls/second
     5-minute rate = 26810.98 calls/second
    15-minute rate = 26627.05 calls/second
               min = 6.26 milliseconds
               max = 686.77 milliseconds
              mean = 19.55 milliseconds
            stddev = 60.66 milliseconds
            median = 11.64 milliseconds
              75% <= 13.79 milliseconds
              95% <= 20.49 milliseconds
              98% <= 51.49 milliseconds
              99% <= 158.31 milliseconds
            99.9% <= 686.77 milliseconds
```

#### client5：3.1w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 24433633
         mean rate = 31287.05 calls/second
     1-minute rate = 25593.06 calls/second
     5-minute rate = 28834.95 calls/second
    15-minute rate = 28794.75 calls/second
               min = 0.14 milliseconds
               max = 669.59 milliseconds
              mean = 16.72 milliseconds
            stddev = 57.19 milliseconds
            median = 11.28 milliseconds
              75% <= 12.70 milliseconds
              95% <= 16.14 milliseconds
              98% <= 20.97 milliseconds
              99% <= 165.17 milliseconds
            99.9% <= 657.06 milliseconds
get_benchmark_timer
             count = 2443392
         mean rate = 3128.74 calls/second
     1-minute rate = 2559.29 calls/second
     5-minute rate = 2883.82 calls/second
    15-minute rate = 2881.30 calls/second
               min = 0.16 milliseconds
               max = 149.27 milliseconds
              mean = 1.18 milliseconds
            stddev = 6.21 milliseconds
            median = 0.61 milliseconds
              75% <= 1.14 milliseconds
              95% <= 2.81 milliseconds
              98% <= 3.75 milliseconds
              99% <= 4.15 milliseconds
            99.9% <= 149.27 milliseconds
put_benchmark_timer
             count = 21990253
         mean rate = 28158.26 calls/second
     1-minute rate = 23033.89 calls/second
     5-minute rate = 25951.15 calls/second
    15-minute rate = 25913.45 calls/second
               min = 6.84 milliseconds
               max = 763.56 milliseconds
              mean = 16.03 milliseconds
            stddev = 47.95 milliseconds
            median = 11.42 milliseconds
              75% <= 12.76 milliseconds
              95% <= 16.15 milliseconds
              98% <= 19.67 milliseconds
              99% <= 114.30 milliseconds
            99.9% <= 699.76 milliseconds
```

#### client6：3.1w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 20830219
         mean rate = 31516.69 calls/second
     1-minute rate = 25118.51 calls/second
     5-minute rate = 29308.51 calls/second
    15-minute rate = 27446.80 calls/second
               min = 0.18 milliseconds
               max = 691.10 milliseconds
              mean = 18.82 milliseconds
            stddev = 64.48 milliseconds
            median = 11.52 milliseconds
              75% <= 13.91 milliseconds
              95% <= 20.09 milliseconds
              98% <= 44.41 milliseconds
              99% <= 514.14 milliseconds
            99.9% <= 691.10 milliseconds
get_benchmark_timer
             count = 2083040
         mean rate = 3151.69 calls/second
     1-minute rate = 2511.87 calls/second
     5-minute rate = 2931.39 calls/second
    15-minute rate = 2747.00 calls/second
               min = 0.17 milliseconds
               max = 133.46 milliseconds
              mean = 1.07 milliseconds
            stddev = 2.73 milliseconds
            median = 0.62 milliseconds
              75% <= 1.22 milliseconds
              95% <= 3.12 milliseconds
              98% <= 4.54 milliseconds
              99% <= 6.36 milliseconds
            99.9% <= 12.35 milliseconds
put_benchmark_timer
             count = 18747261
         mean rate = 28365.02 calls/second
     1-minute rate = 22606.89 calls/second
     5-minute rate = 26377.15 calls/second
    15-minute rate = 24699.81 calls/second
               min = 6.56 milliseconds
               max = 610.15 milliseconds
              mean = 14.15 milliseconds
            stddev = 19.10 milliseconds
            median = 11.71 milliseconds
              75% <= 13.72 milliseconds
              95% <= 19.98 milliseconds
              98% <= 33.31 milliseconds
              99% <= 49.35 milliseconds
            99.9% <= 256.55 milliseconds
```

#### client7: 2.7w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 1662169
         mean rate = 27281.91 calls/second
     1-minute rate = 26451.07 calls/second
     5-minute rate = 25433.35 calls/second
    15-minute rate = 25184.94 calls/second
               min = 0.19 milliseconds
               max = 653.89 milliseconds
              mean = 17.29 milliseconds
            stddev = 63.40 milliseconds
            median = 10.89 milliseconds
              75% <= 12.30 milliseconds
              95% <= 15.52 milliseconds
              98% <= 20.74 milliseconds
              99% <= 609.59 milliseconds
            99.9% <= 653.89 milliseconds
get_benchmark_timer
             count = 166240
         mean rate = 2728.46 calls/second
     1-minute rate = 2645.56 calls/second
     5-minute rate = 2544.26 calls/second
    15-minute rate = 2519.52 calls/second
               min = 0.15 milliseconds
               max = 7.26 milliseconds
              mean = 0.90 milliseconds
            stddev = 0.85 milliseconds
            median = 0.62 milliseconds
              75% <= 1.14 milliseconds
              95% <= 2.56 milliseconds
              98% <= 3.32 milliseconds
              99% <= 3.98 milliseconds
            99.9% <= 7.26 milliseconds
put_benchmark_timer
             count = 1496129
         mean rate = 24554.50 calls/second
     1-minute rate = 23805.54 calls/second
     5-minute rate = 22889.10 calls/second
    15-minute rate = 22665.42 calls/second
               min = 6.81 milliseconds
               max = 676.67 milliseconds
              mean = 16.38 milliseconds
            stddev = 53.58 milliseconds
            median = 11.06 milliseconds
              75% <= 12.45 milliseconds
              95% <= 15.37 milliseconds
              98% <= 18.17 milliseconds
              99% <= 80.63 milliseconds
            99.9% <= 676.67 milliseconds
```

#### client8：2.6w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 1600602
         mean rate = 26257.11 calls/second
     1-minute rate = 24534.93 calls/second
     5-minute rate = 21923.66 calls/second
    15-minute rate = 21298.22 calls/second
               min = 0.19 milliseconds
               max = 682.09 milliseconds
              mean = 16.39 milliseconds
            stddev = 58.25 milliseconds
            median = 10.92 milliseconds
              75% <= 12.34 milliseconds
              95% <= 14.90 milliseconds
              98% <= 19.40 milliseconds
              99% <= 157.02 milliseconds
            99.9% <= 677.99 milliseconds
get_benchmark_timer
             count = 160080
         mean rate = 2625.94 calls/second
     1-minute rate = 2455.55 calls/second
     5-minute rate = 2196.64 calls/second
    15-minute rate = 2134.65 calls/second
               min = 0.17 milliseconds
               max = 641.93 milliseconds
              mean = 2.25 milliseconds
            stddev = 28.01 milliseconds
            median = 0.65 milliseconds
              75% <= 1.17 milliseconds
              95% <= 2.72 milliseconds
              98% <= 3.65 milliseconds
              99% <= 4.17 milliseconds
            99.9% <= 641.93 milliseconds
put_benchmark_timer
             count = 1440522
         mean rate = 23629.27 calls/second
     1-minute rate = 22077.83 calls/second
     5-minute rate = 19726.70 calls/second
    15-minute rate = 19163.46 calls/second
               min = 7.15 milliseconds
               max = 669.63 milliseconds
              mean = 16.56 milliseconds
            stddev = 55.32 milliseconds
            median = 11.10 milliseconds
              75% <= 12.30 milliseconds
              95% <= 14.86 milliseconds
              98% <= 17.11 milliseconds
              99% <= 83.11 milliseconds
            99.9% <= 655.09 milliseconds
```

# 测试场景3

## 场景3: 测试条件

| Client 数量 | Client-Batching | Storage-Type | 读写比例 | Replicator-Pipeline | key 大小 | value 大小 |
| ---------- | --------------- | ------------ | -------- | ---------- | -------- | ---------- |
|     2      | **关闭**         | Memory     | 1:9      | **开启**  | 16 字节 | 16字节 |

## 场景3: 结果汇总

* 2 个 client 一共达到 10w+ ops，p95 RT 在 10ms 以内
* 3 个 server 节点负载达到极限 load 接近 20，cpu 超过 50%
* ops 降低的原因在于关闭了 client-batching 后 RPC(bolt) 层面也出现了瓶颈，所以还是建议打开 client-batching 开关，client-batching 没有副作用，完全不会影响单个消息的延迟

### 场景3: 3 个 server 机器负载

#### 场景3: server1

```text
top - 22:39:42 up 11 days,  1:37,  1 user,  load average: 15.82, 8.18, 4.28
Tasks:  33 total,   1 running,  32 sleeping,   0 stopped,   0 zombie
%Cpu0  : 49.3 us, 18.5 sy,  0.0 ni, 24.2 id,  1.0 wa,  0.0 hi,  0.0 si,  7.0 st
%Cpu1  : 33.7 us, 21.2 sy,  0.0 ni, 36.7 id,  1.0 wa,  0.0 hi,  0.0 si,  7.4 st
%Cpu2  : 33.8 us, 22.7 sy,  0.0 ni, 35.1 id,  1.3 wa,  0.0 hi,  0.0 si,  7.0 st
%Cpu3  : 34.9 us, 22.3 sy,  0.0 ni, 34.2 id,  1.7 wa,  0.0 hi,  0.0 si,  7.0 st
%Cpu4  : 36.5 us, 21.6 sy,  0.0 ni, 35.5 id,  1.0 wa,  0.0 hi,  0.0 si,  5.3 st
%Cpu5  : 35.3 us, 22.0 sy,  0.0 ni, 35.0 id,  1.3 wa,  0.0 hi,  0.0 si,  6.3 st
%Cpu6  : 27.9 us, 24.2 sy,  0.0 ni, 34.3 id,  1.0 wa,  0.0 hi,  0.0 si, 12.5 st
%Cpu7  : 35.8 us, 22.4 sy,  0.0 ni, 35.1 id,  1.0 wa,  0.0 hi,  0.0 si,  5.7 st
%Cpu8  : 61.1 us,  9.0 sy,  0.0 ni, 27.9 id,  0.7 wa,  0.0 hi,  0.0 si,  1.3 st
%Cpu9  : 50.3 us, 12.7 sy,  0.0 ni, 34.3 id,  0.7 wa,  0.0 hi,  0.0 si,  2.0 st
%Cpu10 : 49.3 us, 15.3 sy,  0.0 ni, 32.3 id,  1.0 wa,  0.0 hi,  0.0 si,  2.0 st
%Cpu11 : 42.5 us, 20.3 sy,  0.0 ni, 33.6 id,  1.0 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu12 : 50.3 us, 14.9 sy,  0.0 ni, 31.8 id,  0.7 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu13 : 39.5 us, 21.3 sy,  0.0 ni, 35.2 id,  1.3 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu14 : 37.5 us, 21.6 sy,  0.0 ni, 36.9 id,  1.3 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu15 : 38.7 us, 21.7 sy,  0.0 ni, 36.0 id,  1.0 wa,  0.0 hi,  0.0 si,  2.7 st
KiB Mem : 62914560 total, 23990152 free, 36612212 used,  2312196 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used. 23990152 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 93733 root      20   0 10.266g 6.475g  23748 S 968.0 10.8  13:03.22 java
```

#### 场景3: server2

```text
top - 22:39:55 up 11 days,  1:31,  1 user,  load average: 17.92, 9.24, 4.61
Tasks:  34 total,   1 running,  33 sleeping,   0 stopped,   0 zombie
%Cpu0  : 36.5 us, 21.9 sy,  0.0 ni, 25.9 id,  0.7 wa,  0.0 hi,  0.0 si, 15.0 st
%Cpu1  : 45.8 us, 22.4 sy,  0.0 ni, 24.4 id,  0.7 wa,  0.0 hi,  0.0 si,  6.7 st
%Cpu2  : 67.1 us, 13.6 sy,  0.0 ni, 12.3 id,  0.7 wa,  0.0 hi,  0.0 si,  6.3 st
%Cpu3  : 44.3 us, 22.7 sy,  0.0 ni, 25.7 id,  1.0 wa,  0.0 hi,  0.0 si,  6.3 st
%Cpu4  : 40.1 us, 21.4 sy,  0.0 ni, 24.1 id,  0.7 wa,  0.0 hi,  0.0 si, 13.7 st
%Cpu5  : 53.2 us, 17.9 sy,  0.0 ni, 21.3 id,  1.0 wa,  0.0 hi,  0.0 si,  6.6 st
%Cpu6  : 47.2 us, 20.9 sy,  0.0 ni, 24.9 id,  1.0 wa,  0.0 hi,  0.0 si,  6.0 st
%Cpu7  : 51.5 us, 18.6 sy,  0.0 ni, 24.6 id,  0.7 wa,  0.0 hi,  0.0 si,  4.7 st
%Cpu8  : 48.3 us, 21.3 sy,  0.0 ni, 26.7 id,  0.7 wa,  0.0 hi,  0.0 si,  3.0 st
%Cpu9  : 52.5 us, 17.6 sy,  0.0 ni, 26.9 id,  0.7 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu10 : 52.2 us, 20.1 sy,  0.0 ni, 24.4 id,  0.7 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu11 : 50.2 us, 19.5 sy,  0.0 ni, 26.4 id,  1.0 wa,  0.0 hi,  0.0 si,  3.0 st
%Cpu12 : 56.3 us, 15.2 sy,  0.0 ni, 25.2 id,  1.0 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu13 : 61.3 us, 16.0 sy,  0.0 ni, 19.7 id,  0.7 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu14 : 49.8 us, 19.6 sy,  0.0 ni, 26.6 id,  1.3 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu15 : 52.8 us, 14.6 sy,  0.0 ni, 29.2 id,  1.0 wa,  0.0 hi,  0.0 si,  2.3 st
KiB Mem : 62914560 total, 24122012 free, 36653792 used,  2138756 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used. 24122012 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 64477 root      20   0 10.243g 6.651g  24096 S  1108 11.1  15:44.10 java
```

#### 场景3: server3

```text
top - 22:40:06 up 6 days,  6:39,  1 user,  load average: 18.66, 8.40, 4.05
Tasks:  33 total,   1 running,  32 sleeping,   0 stopped,   0 zombie
%Cpu0  : 35.1 us, 21.7 sy,  0.0 ni, 34.1 id,  1.0 wa,  0.0 hi,  0.0 si,  8.0 st
%Cpu1  : 31.9 us, 20.6 sy,  0.0 ni, 38.5 id,  1.0 wa,  0.0 hi,  0.0 si,  8.0 st
%Cpu2  : 33.6 us, 20.9 sy,  0.0 ni, 36.9 id,  1.3 wa,  0.0 hi,  0.0 si,  7.3 st
%Cpu3  : 29.7 us, 21.3 sy,  0.0 ni, 37.5 id,  1.4 wa,  0.0 hi,  0.0 si, 10.1 st
%Cpu4  : 32.8 us, 21.7 sy,  0.0 ni, 35.1 id,  1.3 wa,  0.0 hi,  0.0 si,  9.0 st
%Cpu5  : 32.1 us, 21.7 sy,  0.0 ni, 36.5 id,  1.7 wa,  0.0 hi,  0.0 si,  8.0 st
%Cpu6  : 34.4 us, 21.2 sy,  0.0 ni, 36.4 id,  2.0 wa,  0.0 hi,  0.0 si,  6.0 st
%Cpu7  : 32.6 us, 22.3 sy,  0.0 ni, 36.2 id,  1.7 wa,  0.0 hi,  0.0 si,  7.3 st
%Cpu8  : 39.4 us, 19.5 sy,  0.0 ni, 36.1 id,  1.3 wa,  0.0 hi,  0.0 si,  3.6 st
%Cpu9  : 39.3 us, 18.7 sy,  0.0 ni, 37.0 id,  1.3 wa,  0.0 hi,  0.0 si,  3.7 st
%Cpu10 : 32.3 us, 20.7 sy,  0.0 ni, 42.3 id,  1.0 wa,  0.0 hi,  0.0 si,  3.7 st
%Cpu11 : 36.9 us, 19.9 sy,  0.0 ni, 38.2 id,  1.7 wa,  0.0 hi,  0.0 si,  3.3 st
%Cpu12 : 35.5 us, 21.3 sy,  0.0 ni, 38.2 id,  1.3 wa,  0.0 hi,  0.0 si,  3.7 st
%Cpu13 : 36.4 us, 21.5 sy,  0.0 ni, 36.8 id,  1.7 wa,  0.0 hi,  0.0 si,  3.6 st
%Cpu14 : 37.9 us, 20.3 sy,  0.0 ni, 36.9 id,  1.7 wa,  0.0 hi,  0.0 si,  3.3 st
%Cpu15 : 38.2 us, 20.3 sy,  0.0 ni, 36.9 id,  1.3 wa,  0.0 hi,  0.0 si,  3.3 st
KiB Mem : 62914560 total, 46373164 free, 11221960 used,  5319436 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used. 46373164 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 80602 root      20   0 10.248g 6.683g  23852 S 892.4 11.1  17:00.73 java
```

### 场景3: 2 个 client 的 ops 数据

#### client1：6.7w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 4179630
         mean rate = 67738.98 calls/second
     1-minute rate = 50557.06 calls/second
     5-minute rate = 29763.94 calls/second
    15-minute rate = 24315.01 calls/second
               min = 0.26 milliseconds
               max = 180.11 milliseconds
              mean = 3.41 milliseconds
            stddev = 12.61 milliseconds
            median = 1.95 milliseconds
              75% <= 2.81 milliseconds
              95% <= 5.50 milliseconds
              98% <= 8.18 milliseconds
              99% <= 13.32 milliseconds
            99.9% <= 175.37 milliseconds
get_benchmark_timer
             count = 417963
         mean rate = 6773.36 calls/second
     1-minute rate = 5055.28 calls/second
     5-minute rate = 2975.47 calls/second
    15-minute rate = 2430.44 calls/second
               min = 0.21 milliseconds
               max = 172.13 milliseconds
              mean = 1.92 milliseconds
            stddev = 8.21 milliseconds
            median = 1.17 milliseconds
              75% <= 1.81 milliseconds
              95% <= 3.59 milliseconds
              98% <= 5.11 milliseconds
              99% <= 7.12 milliseconds
            99.9% <= 170.09 milliseconds
put_benchmark_timer
             count = 3761900
         mean rate = 60957.97 calls/second
     1-minute rate = 45499.16 calls/second
     5-minute rate = 26782.83 calls/second
    15-minute rate = 21878.18 calls/second
               min = 0.52 milliseconds
               max = 378.67 milliseconds
              mean = 3.61 milliseconds
            stddev = 14.97 milliseconds
            median = 1.99 milliseconds
              75% <= 2.83 milliseconds
              95% <= 5.18 milliseconds
              98% <= 9.14 milliseconds
              99% <= 25.40 milliseconds
            99.9% <= 170.50 milliseconds
```

#### client2：5w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 4654332
         mean rate = 50967.66 calls/second
     1-minute rate = 45068.29 calls/second
     5-minute rate = 30478.74 calls/second
    15-minute rate = 25927.10 calls/second
               min = 0.23 milliseconds
               max = 137.20 milliseconds
              mean = 4.46 milliseconds
            stddev = 12.00 milliseconds
            median = 2.13 milliseconds
              75% <= 3.30 milliseconds
              95% <= 9.63 milliseconds
              98% <= 31.22 milliseconds
              99% <= 78.35 milliseconds
            99.9% <= 137.20 milliseconds
get_benchmark_timer
             count = 465471
         mean rate = 5096.89 calls/second
     1-minute rate = 4507.05 calls/second
     5-minute rate = 3048.50 calls/second
    15-minute rate = 2593.46 calls/second
               min = 0.17 milliseconds
               max = 171.40 milliseconds
              mean = 2.84 milliseconds
            stddev = 11.44 milliseconds
            median = 1.11 milliseconds
              75% <= 1.88 milliseconds
              95% <= 5.50 milliseconds
              98% <= 10.88 milliseconds
              99% <= 63.25 milliseconds
            99.9% <= 149.80 milliseconds
put_benchmark_timer
             count = 4189457
         mean rate = 45872.23 calls/second
     1-minute rate = 40560.19 calls/second
     5-minute rate = 27427.51 calls/second
    15-minute rate = 23330.54 calls/second
               min = 0.50 milliseconds
               max = 180.62 milliseconds
              mean = 5.11 milliseconds
            stddev = 15.16 milliseconds
            median = 2.27 milliseconds
              75% <= 3.38 milliseconds
              95% <= 9.20 milliseconds
              98% <= 61.84 milliseconds
              99% <= 102.72 milliseconds
            99.9% <= 180.62 milliseconds
```

# 场景4: 测试场景4

## 场景4: 测试条件

| Client 数量 | Client-Batching | Storage-Type | 读写比例 | Replicator-Pipeline | key 大小 | value 大小 |
| ---------- | --------------- | ------------ | -------- | ---------- | -------- | ---------- |
|     2      | **关闭**         | Memory     | 1:9      | **关闭**  | 16 字节 | 16字节 |

## 场景4: 结果汇总

* 2 个 client 一共达到 7.5w ops，p95 RT 在 15ms 以内
* 3 个 server 节点负载达到极限 load 接近 20 (有一台超过 20), cpu 超过 50%
* ops 降低的原因在于关闭了 client-batching 后 RPC(bolt) 层面也出现了瓶颈，所以还是建议打开 client-batching 开关，client-batching 没有副作用，完全不会影响单个消息的延迟

### 场景4: 3 个 server 机器负载

#### 场景4: server1

```text
top - 23:19:52 up 11 days,  2:18,  1 user,  load average: 17.16, 9.82, 5.15
Tasks:  28 total,   1 running,  27 sleeping,   0 stopped,   0 zombie
%Cpu0  : 20.1 us, 13.4 sy,  0.0 ni, 60.2 id,  1.3 wa,  0.0 hi,  0.0 si,  5.0 st
%Cpu1  : 15.6 us, 12.0 sy,  0.0 ni, 66.1 id,  1.0 wa,  0.0 hi,  0.0 si,  5.3 st
%Cpu2  : 19.3 us, 12.3 sy,  0.0 ni, 63.7 id,  1.0 wa,  0.0 hi,  0.0 si,  3.7 st
%Cpu3  : 19.3 us, 12.7 sy,  0.0 ni, 62.3 id,  1.7 wa,  0.0 hi,  0.0 si,  4.0 st
%Cpu4  : 18.6 us, 12.3 sy,  0.0 ni, 63.8 id,  1.3 wa,  0.0 hi,  0.0 si,  4.0 st
%Cpu5  : 73.1 us,  6.0 sy,  0.0 ni, 16.9 id,  0.3 wa,  0.0 hi,  0.0 si,  3.7 st
%Cpu6  : 22.6 us, 10.6 sy,  0.0 ni, 60.8 id,  1.0 wa,  0.0 hi,  0.0 si,  5.0 st
%Cpu7  : 18.7 us, 12.0 sy,  0.0 ni, 62.7 id,  1.3 wa,  0.0 hi,  0.0 si,  5.3 st
%Cpu8  : 20.6 us, 11.0 sy,  0.0 ni, 65.1 id,  1.7 wa,  0.0 hi,  0.0 si,  1.7 st
%Cpu9  : 19.0 us, 11.3 sy,  0.0 ni, 66.3 id,  1.3 wa,  0.0 hi,  0.0 si,  2.0 st
%Cpu10 : 33.9 us,  8.6 sy,  0.0 ni, 54.8 id,  1.0 wa,  0.0 hi,  0.0 si,  1.7 st
%Cpu11 : 19.6 us, 12.0 sy,  0.0 ni, 65.1 id,  1.7 wa,  0.0 hi,  0.0 si,  1.7 st
%Cpu12 : 19.7 us, 11.7 sy,  0.0 ni, 66.0 id,  1.0 wa,  0.0 hi,  0.0 si,  1.7 st
%Cpu13 : 17.3 us, 11.6 sy,  0.0 ni, 68.4 id,  1.0 wa,  0.0 hi,  0.0 si,  1.7 st
%Cpu14 : 21.7 us, 11.3 sy,  0.0 ni, 64.0 id,  1.3 wa,  0.0 hi,  0.0 si,  1.7 st
%Cpu15 : 18.8 us, 11.9 sy,  0.0 ni, 65.7 id,  1.7 wa,  0.0 hi,  0.0 si,  2.0 st
KiB Mem : 62914560 total, 21751724 free, 36954048 used,  4208788 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used. 21751724 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
112036 root      20   0 10.756g 6.728g  23928 S 556.8 11.2  33:35.32 java
```

#### 场景4: server2

```text
top - 23:20:07 up 11 days,  2:11,  1 user,  load average: 11.21, 8.29, 5.24
Tasks:  34 total,   1 running,  33 sleeping,   0 stopped,   0 zombie
%Cpu0  : 25.5 us, 14.4 sy,  0.0 ni, 44.3 id,  1.0 wa,  0.0 hi,  0.0 si, 14.8 st
%Cpu1  : 27.1 us, 17.1 sy,  0.0 ni, 47.8 id,  1.7 wa,  0.0 hi,  0.0 si,  6.4 st
%Cpu2  : 27.5 us, 17.5 sy,  0.0 ni, 47.0 id,  2.0 wa,  0.0 hi,  0.0 si,  6.0 st
%Cpu3  : 38.8 us, 13.7 sy,  0.0 ni, 40.1 id,  1.3 wa,  0.0 hi,  0.0 si,  6.0 st
%Cpu4  : 23.1 us, 17.7 sy,  0.0 ni, 42.8 id,  1.3 wa,  0.0 hi,  0.0 si, 15.1 st
%Cpu5  : 25.3 us, 18.7 sy,  0.0 ni, 48.0 id,  1.3 wa,  0.0 hi,  0.0 si,  6.7 st
%Cpu6  : 38.3 us, 14.3 sy,  0.0 ni, 40.0 id,  1.7 wa,  0.0 hi,  0.0 si,  5.7 st
%Cpu7  : 26.2 us, 17.9 sy,  0.0 ni, 49.2 id,  1.3 wa,  0.0 hi,  0.0 si,  5.3 st
%Cpu8  : 55.5 us, 10.6 sy,  0.0 ni, 30.9 id,  1.0 wa,  0.0 hi,  0.0 si,  2.0 st
%Cpu9  : 40.7 us, 13.0 sy,  0.0 ni, 43.3 id,  1.0 wa,  0.0 hi,  0.0 si,  2.0 st
%Cpu10 : 40.4 us, 14.2 sy,  0.0 ni, 40.7 id,  1.3 wa,  0.0 hi,  0.0 si,  3.3 st
%Cpu11 : 24.5 us, 18.5 sy,  0.0 ni, 52.3 id,  2.0 wa,  0.0 hi,  0.0 si,  2.6 st
%Cpu12 : 26.5 us, 17.2 sy,  0.0 ni, 51.7 id,  1.7 wa,  0.0 hi,  0.0 si,  3.0 st
%Cpu13 : 29.2 us, 16.9 sy,  0.0 ni, 49.8 id,  1.7 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu14 : 29.1 us, 16.9 sy,  0.0 ni, 49.3 id,  2.0 wa,  0.0 hi,  0.0 si,  2.6 st
%Cpu15 : 29.5 us, 17.2 sy,  0.0 ni, 49.3 id,  1.3 wa,  0.0 hi,  0.0 si,  2.6 st
KiB Mem : 62914560 total, 22364924 free, 37127368 used,  3422268 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used. 22364924 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 82346 root      20   0 10.710g 7.086g  23864 S 770.7 11.8  27:31.04 java
```

#### 场景4: server3

```text
top - 23:20:36 up 6 days,  7:19,  1 user,  load average: 23.60, 11.37, 5.58
Tasks:  36 total,   1 running,  35 sleeping,   0 stopped,   0 zombie
%Cpu0  : 61.0 us, 15.3 sy,  0.0 ni, 15.3 id,  0.3 wa,  0.0 hi,  0.0 si,  8.0 st
%Cpu1  : 53.3 us, 20.0 sy,  0.0 ni, 17.7 id,  0.7 wa,  0.0 hi,  0.0 si,  8.3 st
%Cpu2  : 63.3 us, 16.7 sy,  0.0 ni, 11.7 id,  0.3 wa,  0.0 hi,  0.0 si,  8.0 st
%Cpu3  : 76.4 us, 11.0 sy,  0.0 ni,  7.6 id,  0.0 wa,  0.0 hi,  0.0 si,  5.0 st
%Cpu4  : 61.1 us, 15.9 sy,  0.0 ni, 15.9 id,  0.3 wa,  0.0 hi,  0.0 si,  6.6 st
%Cpu5  : 73.6 us, 10.7 sy,  0.0 ni,  9.4 id,  0.0 wa,  0.0 hi,  0.0 si,  6.4 st
%Cpu6  : 52.3 us, 19.3 sy,  0.0 ni, 15.7 id,  0.3 wa,  0.0 hi,  0.0 si, 12.3 st
%Cpu7  : 74.3 us, 11.0 sy,  0.0 ni,  8.7 id,  0.0 wa,  0.0 hi,  0.0 si,  6.0 st
%Cpu8  : 70.1 us, 12.3 sy,  0.0 ni, 14.6 id,  0.3 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu9  : 72.1 us, 12.3 sy,  0.0 ni, 13.0 id,  0.3 wa,  0.0 hi,  0.0 si,  2.3 st
%Cpu10 : 70.4 us, 14.3 sy,  0.0 ni, 12.6 id,  0.0 wa,  0.0 hi,  0.0 si,  2.7 st
%Cpu11 : 59.5 us, 18.3 sy,  0.0 ni, 18.3 id,  0.3 wa,  0.0 hi,  0.0 si,  3.7 st
%Cpu12 : 66.2 us, 13.9 sy,  0.0 ni, 16.9 id,  0.3 wa,  0.0 hi,  0.0 si,  2.6 st
%Cpu13 : 66.4 us, 15.3 sy,  0.0 ni, 15.0 id,  0.3 wa,  0.0 hi,  0.0 si,  3.0 st
%Cpu14 : 85.1 us,  6.0 sy,  0.0 ni,  7.3 id,  0.0 wa,  0.0 hi,  0.0 si,  1.7 st
%Cpu15 : 76.9 us, 11.2 sy,  0.0 ni,  9.2 id,  0.3 wa,  0.0 hi,  0.0 si,  2.3 st
KiB Mem : 62914560 total, 44333956 free, 12042248 used,  6538356 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used. 44333956 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 94729 root      20   0 10.931g 7.454g  23852 S  1300 12.4  39:10.99 java
```

### 场景4: 2 个 client 的 ops 数据

#### client1：5w ops

```text
-- Timers ----------------------------------------------------------------------
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 13865824
         mean rate = 50991.58 calls/second
     1-minute rate = 36409.73 calls/second
     5-minute rate = 36313.26 calls/second
    15-minute rate = 27293.11 calls/second
               min = 0.22 milliseconds
               max = 176.44 milliseconds
              mean = 4.76 milliseconds
            stddev = 10.70 milliseconds
            median = 1.83 milliseconds
              75% <= 3.94 milliseconds
              95% <= 14.85 milliseconds
              98% <= 42.14 milliseconds
              99% <= 51.69 milliseconds
            99.9% <= 120.15 milliseconds
get_benchmark_timer
             count = 1386585
         mean rate = 5099.09 calls/second
     1-minute rate = 3640.95 calls/second
     5-minute rate = 3631.72 calls/second
    15-minute rate = 2730.02 calls/second
               min = 0.18 milliseconds
               max = 163.21 milliseconds
              mean = 2.59 milliseconds
            stddev = 10.82 milliseconds
            median = 0.61 milliseconds
              75% <= 1.33 milliseconds
              95% <= 7.23 milliseconds
              98% <= 15.76 milliseconds
              99% <= 38.85 milliseconds
            99.9% <= 163.21 milliseconds
put_benchmark_timer
             count = 12479370
         mean rate = 45891.51 calls/second
     1-minute rate = 32768.72 calls/second
     5-minute rate = 32678.93 calls/second
    15-minute rate = 24558.33 calls/second
               min = 0.47 milliseconds
               max = 194.99 milliseconds
              mean = 5.52 milliseconds
            stddev = 14.86 milliseconds
            median = 1.88 milliseconds
              75% <= 3.98 milliseconds
              95% <= 17.87 milliseconds
              98% <= 44.19 milliseconds
              99% <= 64.29 milliseconds
            99.9% <= 194.99 milliseconds
```

#### client2：2.6w ops

```text
-- Timers ----------------------------------------------------------------------
benchmark_timer
             count = 3517274
         mean rate = 26758.85 calls/second
     1-minute rate = 25361.61 calls/second
     5-minute rate = 9553.50 calls/second
    15-minute rate = 3606.93 calls/second
               min = 0.16 milliseconds
               max = 244.37 milliseconds
              mean = 5.79 milliseconds
            stddev = 15.54 milliseconds
            median = 2.02 milliseconds
              75% <= 4.67 milliseconds
              95% <= 16.92 milliseconds
              98% <= 44.83 milliseconds
              99% <= 84.95 milliseconds
            99.9% <= 244.37 milliseconds
get_benchmark_timer
             count = 351743
         mean rate = 2675.91 calls/second
     1-minute rate = 2536.20 calls/second
     5-minute rate = 955.37 calls/second
    15-minute rate = 360.70 calls/second
               min = 0.16 milliseconds
               max = 107.90 milliseconds
              mean = 2.00 milliseconds
            stddev = 6.64 milliseconds
            median = 0.57 milliseconds
              75% <= 1.32 milliseconds
              95% <= 7.01 milliseconds
              98% <= 10.18 milliseconds
              99% <= 14.93 milliseconds
            99.9% <= 107.90 milliseconds
put_benchmark_timer
             count = 3165875
         mean rate = 24083.79 calls/second
     1-minute rate = 22825.39 calls/second
     5-minute rate = 8598.12 calls/second
    15-minute rate = 3246.22 calls/second
               min = 0.51 milliseconds
               max = 192.06 milliseconds
              mean = 5.92 milliseconds
            stddev = 13.93 milliseconds
            median = 2.18 milliseconds
              75% <= 4.99 milliseconds
              95% <= 18.09 milliseconds
              98% <= 48.30 milliseconds
              99% <= 71.10 milliseconds
            99.9% <= 192.06 milliseconds
```

