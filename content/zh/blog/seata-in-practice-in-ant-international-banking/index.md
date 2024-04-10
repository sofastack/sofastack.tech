---
title: "Seata 在蚂蚁国际银行业务的落地实践"
authorlink: "https://github.com/sofastack"
description: "蚂蚁国际境外银行业务正在部分迁移至阿里云，原内部使用的 SOFA 技术栈无法在阿里云上得到支持。为了满足银行业务快速发展、简化银行系统技术栈的目标，我们采用了 Spring+Dubbo 等一套开源的技术方案重新构建起了新的技术栈。"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-07-26T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*pF9YQrsaWMYAAAAAAAAAAAAAARQnAQ"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/63813abf84704923916c3d613018252b~tplv-k3u1fbpfcp-zoom-1.image)

文｜李乔（花名：南桥)、李宗杰（花名：白鹰)

李乔：蚂蚁集团高级开发工程师，负责蚂蚁境外银行支付结算系统开发

李宗杰：蚂蚁集团技术专家，负责蚂蚁分布式事务中间件研发

**本文 11580 字 阅读 25 分钟**

## PART. 1--背景

蚂蚁国际境外银行业务正在部分迁移至阿里云，原内部使用的 SOFA 技术栈无法在阿里云上得到支持。为了满足银行业务快速发展、简化银行系统技术栈的目标，我们采用了 Spring+Dubbo 等一套开源的技术方案重新构建起了新的技术栈。蚂蚁集团作为金融机构，内部应用采用了微服务架构，数据间的一致性极其重要，但蚂蚁内部原有的分布式事务框架，在阿里云上也无法提供技术支持。

Seata 是分布式事务解决方案，囊括了阿里集团的 TXC *（阿里云版本称为 GTS）* 和蚂蚁集团的 TCC/SAGA 等多种模式，是一款经过多年双十一大规模流量验证的金融级分布式事务框架。因此在综合比较各个现有的分布式事务框架之后，我们选择了 Seata。

本文介绍了蚂蚁集团境外银行技术部在国际站点建设过程中，使用开源的 Seata 1.4.2 版本进行分布式事务管理的详细方案。同时本文也介绍如何在客户端实现对事务悬挂、幂等、空提交以及空回滚等情形的处理方法。

## PART. 2--调研

Seata 经过四年建设后，已经形成了一个非常庞大的技术体系。但不管其如何演进，Seata 整体保持了架构的稳定性与使用接口的向后兼容性。

### 2.1--Seata 架构

Seata 官网给出了其如下架构图：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c692f754327b48298914fc3f49475797~tplv-k3u1fbpfcp-zoom-1.image)

**总体由如下角色构成：**

●TC: Transaction Coordinator

事务协调器：维护全局事务和分支事务的状态，驱动全局事务提交或者回滚。

●TM: Transaction Manager

事务管理器：定义全局事务的范围，提交或者回滚全局事务。

●RM：Resource Manager

资源管理器：和分支事务在同一个应用，进行分支事务的注册，报告分支事务的状态，驱动分支事务的提交或者回滚。

TC 与 TM 以及各个 RM 之间使用 netty 框架进行长链接通信，通信协议是在四层 TCP 协议之上自定义的一套二进制双向通信协议，所以 Seata 总体的通信效率非常高。

### 2.2--事务模式

在这套架构之上，Seata 提供了 TCC、AT、SAGA 和 XA 四种事务模式：

**TCC 模式**

参与者需要实现 Prepare/Commit/Rollback 接口，在一阶段实现数据资源的预处理，在二阶段实现提交和回滚逻辑完成两阶段的提交。优点是通过业务逻辑实现数据可见性和隔离性，快速释放本地事务，提高对同一个资源的并发度，缺点是引入了中间数据的预处理过程，增加了业务复杂度。因此 TCC 模式具有很好的性能与隔离性，尤其适合在银行金融场景下同一个账户的并发交易处理。

**AT 模式**

在一阶段时通过解析 SQL，生成二阶段回滚日志：二阶段提交时，删除回滚日志；二阶段回滚时，通过回滚日志来恢复记录到一阶段之前的状态。类似于 TCC 的两阶段，不过二阶段的 Commit/Rollback 由框架自动生成，自动实现了二阶段操作，易用性好于 TCC。但 AT 模式通过全局锁来实现数据的隔离性，因此对于同一个资源的事务处理只能串行操作，所以性能逊于 TCC。当然如果不存在并发使用同一个资源的场景，则 AT 模式可以很好的兼顾性能和隔离性，以及更好的开发效率。

**SAGA 模式**

是一种长事务解决方案，其一阶段正向服务和二阶段补偿服务都由业务开发实现，它在微服务编排领域有大量应用。但其数据隔离性不好，业务数据有被脏写的风险。

**XA 模式**

其使用接口与 AT 模式一致，提供了最严格的隔离性，可以保证了用户不会出现脏读。XA 模式的缺点是其事务范围较长，其性能较低。

### 2.3--小结

Seata 四种模式都是二阶段事务的技术实现。结合 Seata 自身的技术架构，其事务模型总体有如下特点：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0fe860131a54389a30fe5c973ce8e21~tplv-k3u1fbpfcp-zoom-1.image)

## PART. 3--实践

进行总体技术调研后，我们认为 Seata 的总体技术栈可以满足我们所有金融业务场景的需求。在实施过程中，在不同的业务场景下根据不同的技术需求进行了取舍，我们在发起者本地的交易流水部分使用了 AT 模式，在下游账户相关的服务中使用了 TCC 模式。本章接下来我们将以业务中最经典的账务余额模型为例详述本次实践，包括为了适配相应的事务模型所做的工作。

### 3.1--交易流水使用 AT 模式

为了记录每次的交易流水状态，在发起每笔交易前，我们都要将本次交易流水做记录，交易状态流水简化模型如下：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/268c62368538417bb57f985ada99279d~tplv-k3u1fbpfcp-zoom-1.image)

在接收到请求时，首先记录初始化状态的交易流水，然后发起分布式事务。本次交易的分布式事务执行成功后，预期该笔交易流水需要是执行成功状态。为了对失败的交易发起重试，我们启动了一个定时任务，定时扫描交易流水状态，扫描到一定时间后未完成的记录需要重新发起重试。

从上面的场景可以看出，在发起者的交易流水记录的状态变更中，也需要参与到整个分布式事务中。分布式事务成功，则流水状态需要更新为成功，如果分布式事务失败，则需要更新为失败。同时交易流水记录之间是独立的，不存在并发操作的可能，只有异步任务的扫描才会和交易中的事务做抢锁处理。

针对这个场景，就非常适合使用 AT 模式，无需通过业务代码记录事务执行状态，而是直接在发起者中通过 AT 模式提供的代理数据源执行修改流水状态为“执行成功”状态，由框架自动完成 AT 模式下的一二阶段的提交和回滚，保证交易流水状态和整体分布式事务的状态一致，同时可以保持简洁的代码和更高的开发效率。

### 3.2--账户使用 TCC 模式

从业务原理上来分析，账户的余额是不能凭空增加或者减少的，每个余额变动必须有明细对应。所以账户余额模型应该具备以下几个关键要素：账户 *（明确到底是谁的账户）、* 余额 *（承载的客户资产具体数值）、* 账务明细 *（记载账户余额变动的数值、时间和原因）* 。这三个其实构成了最朴素的账户余额模型。

根据从业务原理的分析，我们就产生了一个最简单的账户余额基础数据模型：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c6557b4684c849fabc048bd39ffd3df7~tplv-k3u1fbpfcp-zoom-1.image)

**账户（ip_account）**

账户模型确定了基本的账户信息：

●账号：该账号与会员的信息映射在一起，作为会员的余额资产；

●账户类型：对公 *（商户账号）* ，对私 *（个人账号）* ，平台户、营销户、商户待结算账户等类型；

●余额：记录当前客户资产具体数据的余额；

●交易状态：控制四种交易方式：流入、流出、充值、提现，这是在账务层做的一个资金安全兜底保障。每一种类型用 T/F 来表示是否可以进行此类交易，T 是可以，F 是不可以 ；

●核算主体：用于表示当前账号在那个核算主体下面进行核算。

**账户明细（ip_account_log,ip_trans_log）**

ip_trans_log 是指账户的交易明细，用于解释为什么这个账户是要发生这笔记账请求。可以理解为业务原始凭证，用于和业务系统数据关联校验。以你用支付宝在便利店买了一瓶矿泉水为例，就是记录的这花 2 元买水的原始信息。

ip_account_log 是指账务明细，用于解释这个账户到底扣减了多少钱，记账的对方账户是谁。仍然以你用支付宝在便利店买了一瓶 2 块钱的水为例。这里就记录两条记账明细，一条是从你的支付宝账号扣除 2 元，一条是便利店的商户待结算账号上增加 2 元。

蚂蚁国际境外银行的这类对账户操作的业务具有较高的金融属性，对系统的高可用、高性能方面均提出一定的要求，同时要对账户、交易数据之间做一致性处理，而且对并发请求的隔离性要求极高。

因此，在这四种模式下我们首先排除掉了隔离性较差的 SAGA 模式，这种账务操作的业务场景下，使用 AT 模式会对整个账户进行加锁，XA 模式同样因为长事务原因会有性能问题。而使用 TCC 模式只需冻结变动的金额就行，所以 TCC 模式因其性能、隔离性方面的突出优点被我们选用，下面介绍一下我们在使用 Seata 做分布式事务实践中的业务模型转换。

在 TCC 模式中包含着两个角色：事务协调者和事务参与者。它们之间的交互流程如下：

#### 3.2.1--第一阶段解析

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d258334fdea44afd9f907c4431da321d~tplv-k3u1fbpfcp-zoom-1.image)

第一阶段又称为准备 (Prepare) 阶段，其具体流程如下：

**1.** 首先事务协调者（发起者）所在的节点会向所有的参与者节点发送 Prepare 请求;

**2.** 每个参与者节点收到 Prepare 请求后各自执行与本地事务有关的数据更新，包括主事务 ID 和分支事物 ID 的落库，及交易快照信息记录等；

**3.** 如果参与者本地事务执行成功，向事务协调节点返回“成功”消息，否则返回 “失败”消息；

**4.** 事务协调者接到了所有参与者的返回消息后，整个分布式事务进入第二阶段。

本质上来说，TCC Prepare 阶段是要预留资源。而我们的账户模型的升级也正是为了支持一阶段的余额预留。

#### 3.2.2--第二阶段解析

分布式事务的第二阶段又称为执行 *（Execute）* 阶段，其具体流程如下：

**1.** 如果所有事务参与者都向事务协调节点返回“成功”消息，则它会向所有的参与者节点发送 Commit 请求，否则发送 Rollback 请求；

**2.** 每个参与者接到 Commit/Rollback 请求之后，各自执行本地的事务提交，并释放锁资源，向事务协调者返回“执行完成”消息；

**3.** 事务协调者接收到所有事务参与者的“执行完成”反馈，修改事务状态，结束流程。

在我们的模型中，二阶段实际上是对一阶段中已经预留资源的一个确认和取消操作。比如转账过程中，在一阶段先确认是否余额足够，如果余额足够，则对需要转账的金额进行冻结的预留操作，在二阶段时提交时，即完成转账时，需要对一阶段冻结的金额做真实的删除确认操作。

#### 3.2.3--适配 TCC 的余额模型

经过上面的分布式事务讲解，针对分布式事物的执行过程，在技术层面我们对账户余额模型会产生另一角度的认识，在整个分布式事物涉及的金额进行“锁定并标识”可以暂时统称为“事务金额”。

在业务本质上来讲，对于一个账户只存在“收入”和“支出”两种动作，为了达到一阶段和二阶段之间一个中间数据预留和确认的目的，我们将在事务过程中账户支出记账金额称之为系统金额，将事务中账户收入金额称之为事务未达金额。

模型如下：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0ec67f88c9e34291a530d6c3ed7d4076~tplv-k3u1fbpfcp-zoom-1.image)

**系统金额：**

在事务外也是可见的，并且在账户模型 ip_account 有体现。这样设计也是符合业务逻辑的，如果一个账号同时有多笔交易，存在多个事务过程中，每个事务理应感知当前被占用的系统金额--“事务中支出金额”，不然有透支风险；

**事务未达金额：**

只在同一事务中可见，因为事务未达金额在整个事务未完成前，都不确定是否能够成功完成整个事务，如果在事务外可见，有可能会被其他事务使用，一旦发生回滚，就会造成资损，产生资金风险。

#### 3.2.4--可用余额计算

根据上面的模型和分析可以得知：

**可用余额=账户余额-冻结金额-系统金额+本事务未达余额**

#### 3.2.5--系统金额计算

示例表格如下 *（红圈的数字为旁注）* ：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5c4e8d3c0bf44f92988b4d7a4dd7a66a~tplv-k3u1fbpfcp-zoom-1.image)

解释说明 *（对照表格中的红圈旁注）* ：

**1.** 系统金额记录将付未付的额度，可以看成是一种特殊的冻结。

**2.** 未达金额是一个事务中将收未收的额度，只能在同一个事务中被使用。

**3.** 事务中可用余额和事务外可用余额是指主事务号是否相同的交易，本表格举的例子是在同一个事务中的多次交易。

**4.** 付款预处理账户余额并不减少，而是增加系统金额。

**5.** 增加系统金额，根据可用余额计算公式，就相当于可用余额减少。

**6.** 收款预处理账户余额并不增加，而是增加未达金额。

**7.** 未达金额只有在同一个事务中可以使用，事务外不可见。

**8.** 同一个事务中优先使用 *（减少）* 未达金额。

**9.** 未达金额不够支付时，使用 *（增加）* 系统金额。

**10.** 提交时根据计算公式更新账户余额。

综上，在一个 Seata 分布式事务中，可以既存在 TCC 模式的参与者，也存在 AT 模式的参与者，TM 不会感知到参与者使用了何种模式。所以我们根据不同场景分别使用了 TCC 和 AT 模式，在发起者处使用 AT 模式控制交易流水记录的一致性，在账务参与者中使用 TCC 模式，在保证隔离性的同时又能获取较高的性能。

下面是我们的整体结构说明：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/55262de236bb4eb4945d6d057b5d2f58~tplv-k3u1fbpfcp-zoom-1.image)

### 3.3--交易流程实例详解

我们先假设一个业务场景：这次你来到超市买了 100 元的水果，结账的时候打开支付宝付款，支付宝余额只有 20 元了，剩下的 80 元需要从银行卡扣除，假设这次的支付流程是先支付 20 元，然后从银行卡充值 80 元到支付宝，最后再支付 80 元。

#### 3.3.1--发起者一阶段过程 *（AT）*

交易事务启动前，资产交换作为发起者，首先插入交易流水记录表，记录初始状态为未执行，然后启动分布式事务，在发起者本地一阶段通过 AT 模式执行状态流水的串行更新操作。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cc3d4bf0c56e4f718ae05052c35a3744~tplv-k3u1fbpfcp-zoom-1.image)

交易流水记录表本身不存在并发读写问题，因此由 AT 模式在一阶段就更新状态为转账成功，如果转账失败，该状态会被回滚到未执行状态；如果转账成功，分布式事务二阶段提交会释放该锁。事务执行期间，定时轮询任务会定时检测该记录，所以为了提高隔离性，对流水的读取操作使用 select for update，设置 AT 模式隔离界别为串行化隔离级别，这样定时任务因为拿不到读锁会一直重试轮询，直到事务超时释放锁后，读取到状态为未执行后，再次发起重试。

#### 3.3.2--参与者一阶段过程及账务余额模型变化 *（TCC）*

接下来先说明账务一阶段的处理流程，如下图：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/709aa264d63e48f9afa44b8ac1446429~tplv-k3u1fbpfcp-zoom-1.image)

分布式事务记账金额的处理：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b855e14160db4ca6af8229fffbfb320f~tplv-k3u1fbpfcp-zoom-1.image)

**说明一下：**

**第二行**：付款 20，将资源预留，冻结余额中的 20，系统金额 20(0+20)，事务中可用余额为 0，事务外可用余额 0(20-0-20+0)。

**第三行**：充值 80，预处理时未达金额增加，等于 80(0+80)，事务中可用余额 80(20-0-20+80)，事务外可用余额 0(20-0-20+0)，未达金额在事务外不可见，等于 0。

**第四行**：付款 80，资源预留先冻住，优先使用未达金额，所以系统金额 20(20+80-80)，未达金额 0(80-80)，事务中事务外可用余额 0(20-0-20+0)。

#### 3.3.3--发起者二阶段过程 *（AT）*

发起者二阶段是通过 AT 框架自动提交完的，不需要业务关心，二阶段提交后，交易流水记录会释放行锁。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9b2855aa058f496bb4132ab985512bcf~tplv-k3u1fbpfcp-zoom-1.image)

#### 3.3.4--参与者二阶段过程及账务余额模型变化 *（TCC）*

参与者账务部分二阶段处理流程如下图：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9abe8dfb19774279821406919718fb8d~tplv-k3u1fbpfcp-zoom-1.image)

根据以上流程，在结合一阶段记账的过程，我们得到以下的余额变动过程：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fb3c9aeb472f4e79bae0287665dde9af~tplv-k3u1fbpfcp-zoom-1.image)

**说明一下：**

**第五行**提交事务时，应用捞取所有事务中金额。由于未达金额优先被扣减，因此充值和第二次付款正好相抵，应用捞取到一条金额为零的未达金额，一条金额为 20 的系统金额明细，并将系统金额还原 20 为 0。接着应用遍历分支事务，对账户完成余额 20-20+80-80=0 的计算后持久化到账户模型中，并落地记账明细。

### 3.4--AT+TCC 编程实践

Seata 的客户端区分为事务发起者与事务参与者。发起者开启 Seata 的 AT 模式时，需要通过配置，开启数据源的自动代理，也可以在代码中手动指定代理源。参与者的 Prepare/Commit/Rollback 应当在本地事务中进行，其 Commit/Rollback 接口只需关注当前应用的提交或者回滚即可，无需调用下层参与者的 Commit 或 Rollback 接口。

#### 3.4.1--发起者接入 AT 模式

AT 模式是面向数据库由框架自动托管的两阶段协议模式，在发起者中要使用 AT 模式，只需要将应用的数据源通过框架做代理即可。

需要注意的是，在 AT 模式下，一个表只能有一个字段做主键，不可以使用复合主键。

#### 3.4.2--参与者接入 TCC 模式

接入 TCC 模式，需要业务上将原先的一个阶段设计为两阶段。因此需要提供三个接口，分别是一阶段的 Prepare，和二阶段的 Commit 和 Rollback 接口，同时需要将一阶段接口上打上 Seata 的 TCC 两阶段注解 @TwoPhaseBusinessAction，如下：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d17f8b1b551f4c9abe2606b6a565471f~tplv-k3u1fbpfcp-zoom-1.image)

**在使用 Seata 时，有如下注意事项：**

**1.** 如果参与者超时或 TM 一直没提交事务，可以在发起者端设置事务超时时长，默认 60 s，如果超过设置时长后，TM 还没发起提交，则 TC 会自动发起事务回滚；

**2.** 无论是 TCC 还是 AT，都是补偿型事务，在提交本地事务时，分布式事务并没有完成，不能保证用户全局视角的数据一致性，需要防止脏读脏写的场景。为提高发起者一阶段的隔离性，select 语句都需要加上 for update，进行加锁串行处理：

a.脏写场景需要加上 @GlobalTransaction；

b.脏读场景需要加上 @GlobalLock + @Transactional  或者 @GlobalTransaction；

**3.** TwoPhaseBusinessAction 注解中的 name 作为 RM 的 resourceId，而 resourceId 和 applicationName 唯一确定一个 RM，因此在同一个应用中不能存在相同的 name。如果一个系统实现了多次有相同 name 的 SPI，Seata 将无法区分开这两个接口。

## PART. 4--异常

分布式系统中，网络中会经常发生丢包、请求超时、请求重试、程序假死或崩溃以及运行环境崩溃等异常情况，Seata 当然也会面临这些问题。

第一阶段，如果某个事务参与者反馈失败消息，说明该节点的本地事务执行不成功，必须回滚。第二阶段，事务协调节点向所有的事务参与者发送回滚请求，接收到回滚请求之后，各个事务参与者节点需要在本地进行事务的回滚操作。其他的还会因为网络超时抖动引起的异常失败，重试请求等场景，这些异常也是需要在分布式事务开发过程中必须要解决的。

### 4.1--四种异常

就分布式事务场景而言，有以下常见问题：

**1.** 幂等处理

**2.** 空回滚

**3.** 空提交

**4.** 资源悬挂

这些异常情况需要框架和运维共同兜底，保证服务质量。

### 4.2--解决方法

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d3e1ee2fe9e54573a0d0fdca8e962585~tplv-k3u1fbpfcp-zoom-1.image)

2021 年我们使用 **Seata v1.4.2** 版本时，其没有提供防悬挂能力。对四种异常分别采取了如下应对措施：

**幂等控制：**

在事务一阶段采用了 xid+branchId 作为唯一键进行幂等控制，如发现幂等冲突，则直接抛出异常将事务回滚。如需重试，则由业务系统主动发起。

**允许空回滚：**

一阶段请求由于网络原因没有收到，或者先收到了二阶段的 Rollback 请求。空回滚属于正常情况，系统需要能够正常接收处理空回滚请求。

**拒绝空提交：**

系统只有成功处理了一阶段请求，才会收到二阶段的 Commit 请求。如果在没有收到一阶段请求的情况下，收到了二阶段请求，那么系统肯定出现了异常，应当直接拒绝掉。

**防悬挂：**

在网络抖动等情况下，系统在收到二阶段 Rollback 请求后，又收到了一阶段请求而且进行了处理，那么系统将永远无法收到二阶段 Commit 或者 Rollback，事务将无法到达终态，也就是处于悬挂状态。系统需要在处理空提交时，记录下该回滚记录，在之后收到一阶段请求时，直接拒绝。

```plain
CREATE TABLE IF NOT EXISTS `tcc_fence_log`
(
    `xid`           VARCHAR(128)  NOT NULL COMMENT 'global id',    
    `branch_id`     BIGINT        NOT NULL COMMENT 'branch id',    
    `action_name`   VARCHAR(64)   NOT NULL COMMENT 'action name',    
    `status`        TINYINT       NOT NULL COMMENT 'status(tried:1;committed:2;rollbacked:3;suspended:4)',    
    `gmt_create`    DATETIME(3)   NOT NULL COMMENT 'create time',    
    `gmt_modified`  DATETIME(3)   NOT NULL COMMENT 'update time',    
    PRIMARY KEY (`xid`, `branch_id`),    
    KEY `idx_gmt_modified` (`gmt_modified`),    
    KEY `idx_status` (`status`)
) ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4;
```

解决这几类异常处理主要是依赖每个参与者本地的**防悬挂记录表**，核心逻辑是在一阶段向该表中插入一条事务记录。

在二阶段检查记录是否存在，如果存在说明一阶段已经正常执行过，如果不存在说明是空回滚，此时需要立即插入一条记录表示发生过空回滚，这样如果再次接收到一阶段时会由于主键冲突报错拒绝执行，从而可以防止二阶段回滚先于一阶段先执行导致的悬挂问题。这个方法也被成为双插方案。

### 4.3--最新方案

在 2022 年 6 月份发布的 Seata v1.5.1 版本（*[https://github.com/seata/seata/releases/tag/v1.5.1](https://github.com/seata/seata/releases/tag/v1.5.1)*）中，针对上面 4 个异常问题都已经提供了解决方案，而且使用非常方便，只需要在注解 @TwoPhaseBusinessAction 中设置属性 useTCCFence=true 即可。

## PART. 5--压测

为了在线上提供稳定可靠的服务，我们通过压测对 Seata 的承载能力进行摸底。

压测方法借鉴了 Seata 官方方案

([https://github.com/seata/seata/pull/2611](https://github.com/seata/seata/pull/2611))。在类似的压测环境下，我们把服务替换为自己的业务场景，并进行了如下改动：

●有 2 个发起者，3 个下游参与者

●请求 TPS 设定为正常业务高峰的 4 倍：50*4 = 200 tps

●按 100 并发步长开始阶梯压测，每个阶梯压测 4 次

结果如下：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/52f25a05ad584959af9ce935e8050a35~tplv-k3u1fbpfcp-zoom-1.image)

注：请求耗时时间为完整的 2B 业务请求耗时，正常整体链路耗时 400 ms 左右；

整个压测的过程中，内存和磁盘毫无压力，压测到 500 并发时，CPU 压力开始上升，出现超时现象。根据上述压测结果，我们制定了线上服务保障方案：当服务端接收到的请求超过 400 或者有服务 RT 耗时超过 400 ms 时，自动对服务进行扩容。

## PART. 6--监控

分布式系统的可观测性手段无外乎 Logging、Metrics 和 Tracing，Seata 自身支持接入 Prometheus 收集其 Metrics，接入 Skywalking 收集其 Tracing。由于我们的系统是在阿里云部署的，所以我们基于阿里云的 APM 技术体系打造了 Seata 的整体监控告警体系。

●Logging  切分日志后接入阿里云 SLS

●Metrics  阿里云 Prometheus

●Monitor 阿里云 ARMS 以及 SLS 仪表盘

●Alert SLS 关键字告警、SLS 仪表盘告警以及 Prometheus Metrics 告警

至于 Tracing 能力，我们对 Seata 相关能力进行了增强，通过在客户端和服务端进行 TraceId 打通，打通整个 Tracing 链路。

整体监控系统架构如下：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b8eef96d6d744f093caa81cb700557e~tplv-k3u1fbpfcp-zoom-1.image)

同时我们自己打造了一个事务管理端，通过监控如下内容，对超过阈值的异常进行告警：

●在线节点宕机数

●注册到 TC 的 TM/RM 异常事务状态

●超时请求个数

●一段时间内错误日志的数

```plain
select count(*) as error_log_num where level = 'ERROR'
```

●断开或者重建的事务连接

```plain
-- 过去X时间段内重建连接数量
select count(*) where context like '% to server channel inactive.'
-- 过去X时间段内断开连接数量
select count(*) where context like 'remove unused channel:%' 
```

●超时心跳

```plain
SELECT cost_time,method,logtime WHERE method = 'heartBeat' and cost_time >= 60
```

●一段时间内的错误数量

```plain
select count(*) as error_log_num where level = 'ERROR'
```

●二阶段异常挂起时的事务、分支事务

```plain
-- 获取二阶段 Commit 时挂起的事务以及分支
select regexp_extract(context, '(?<=[)(\S+)(?=])') as xid, regexp_extract(context, '(?<=[)(\d+)(?=])') as branch_id where context like  'Committing global transaction[%' 
-- 获取二阶段 Commit 时挂起事务的 xid， 并且去重
select DISTINCT regexp_extract(context, '(?<=[)(\S+)(?=])') as xid   where context like  'Committing global transaction[%'
-- 获取二阶段 Commit 时挂起的事务分支 branch_id， 并去重
select DISTINCT regexp_extract(context, '(?<=[)(\d+)(?=])') as branch_id  where context like  'Committing global transaction[%'  
-- 获取二阶段 Commit 时挂起的事务分支 xid、branch_id
select DISTINCT  regexp_extract(context, '(?<=[)(\S+)(?=])') as xid, regexp_extract(context, '(?<=[)(\d+)(?=])') as branch_id where context like  'Committing global transaction[%' 
-- 获取二阶段 Commit 时挂起的事务分支条目数量
select count(DISTINCT regexp_extract(context, '(?<=[)(\S+)(?=])') ) as commit_error_times where context like  'Committing global transaction[%'
```

●二阶段 Rollback 时的事务、分支事务

```plain
-- 获取二阶段 Rollback 时挂起的事务分支日志的条目数量
select count(*) where context like 'Rollback branch transaction fail and will retry, xid =%' 
-- 获取二阶段 Rollback 时挂起的事务分支日志 
select * where context like 'Rollback branch transaction fail and will retry, xid =%' 
-- 获取二阶段 Rollback 时挂起的事务的 xid 和 branch_id
select regexp_extract(context, '(?<=xid\ =\ )(\S+)(?=\ )') as xid, regexp_extract(context, '(?<=branchId\ =\ )(\S+)(?=)') as branch_id where context like 'Rollback branch transaction fail and will retry, xid =%' 
-- 获取二阶段 Rollback 时挂起的事务的 xid 和 branch_id，并去重
select DISTINCT regexp_extract(context, '(?<=xid\ =\ )(\S+)(?=\ )') as xid, regexp_extract(context, '(?<=branchId\ =\ )(\S+)(?=)') as branch_id where context like 'Rollback branch transaction fail and will retry, xid =%' 
-- 获取二阶段 Rollback 时挂起的事务的数量
select count(DISTINCT regexp_extract(context, '(?<=xid\ =\ )(\S+)(?=\ )') ) where context like 'Rollback branch transaction fail and will retry, xid =%'
```

**注：**

**1.** 监控对象是 Seata v1.4.2 的日志，不同 Seata 版本或有异同；

**2.** 收集日志的 SQL 是 SLS SQL。

## PART. 7--展望

本文详细介绍了蚂蚁集团国际站点接入 Seata v1.4.2 过程的一些关键的技术步骤与使用细节，并对其中存在的一些问题给出了一套综合解决方案。近期 Seata 已经发布了 v1.5.2，包含了控制台等让我们非常 excited 的新 feature，我们计划在下半年及时升级到新版本并进行相关的稳定性建设，充分利用开源版本的最新技术红利。

作为开源技术的坚定拥护者，蚂蚁集团既是 Seata 的大规模使用者， 也是 Seata 开源的共建方，先后为 Seata 提交了 TCC 和 SAGA 模式实现。在积极推动 Seata 2.0 的建设过程中，我们将陆续贡献 SAGA 注解化模式、二阶段执行异步化、二阶段并行提交以及基于 RocketMQ 的分布式消息事务等技术。

开源技术，普惠大众。我们将保持开源和内部工作联动，共用一个 Seata 开源内核， 保持项目和社区的健康可持续发展。

**了解更多……**

**Seata Star 一下✨：**
*[https://seata.io/zh-cn/](https://seata.io/zh-cn/)*

### 本周推荐阅读

Seata 多语言体系建设

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/36347c332e1f46d4a372c25facbea212~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512283&idx=2&sn=179ef79e922a7c7475d5db288c9af96d&chksm=faa35f01cdd4d617ec9a818bdbe65b3581fa91e2f4b6162551bbacb93c11c0aef211bae8195e&scene=21)

KusionStack｜Kusion 模型库和工具链的探索实践

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d91da4d3339945829e99fe93c5520947~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512283&idx=1&sn=b1a6218e9c396749846baaa9b6b38a2d&chksm=faa35f01cdd4d6177f00938c93b0c652533da148e5ecb888280205525f0e89e4636d010b64ee&scene=21)

Go 原生插件使用问题全解析

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/81c500ef35fb4ac096507bb13b683a59~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

SOFARegistry 源码｜数据同步模块解析

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a06f68fe70b14fa9b252bd1b414a0010~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511796&idx=1&sn=14045ed1b3e634061e719ef434816abf&chksm=faa3412ecdd4c83808c5945af56558fe157395b21bc0d56665e102edb92316c6f245f94d306c&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a0e78b68eec345068c3222f352862a0d~tplv-k3u1fbpfcp-zoom-1.image)
