---
title: 'Nginx vs Envoy vs MOSN 平滑升级原理解析'
---

## 前言

本文是对 Nginx、Envoy 及 MOSN 的平滑升级原理区别的分析，适合对 Nginx 实现原理比较感兴趣的同学阅读，需要具备一定的网络编程知识。

**平滑升级的本质就是 listener fd 的迁移**，虽然 Nginx、Envoy、MOSN 都提供了平滑升级支持，但是鉴于它们进程模型的差异，反映在实现上还是有些区别的。这里来探讨下它们其中的区别，并着重介绍 Nginx 的实现。

## Nginx

相信有很多人认为 Nginx 的 reload 操作就能完成平滑升级，其实这是个典型的理解错误。实际上 reload 操作仅仅是平滑重启，并没有真正的升级新的二进制文件，也就是说其运行的依然是老的二进制文件。

Nginx 自身也并没有提供平滑升级的命令选项，其只能靠手动触发信号来完成。具体正确的操作步骤可以参考这里：[Upgrading Executable on the Fly](http://nginx.org/en/docs/control.html#upgrade)，这里只分析下其实现原理。

**Nginx 的平滑升级是通过 `fork` + `execve` 这种经典的处理方式来实现的**。准备升级时，Old Master 进程收到信号然后 `fork` 出一个子进程，注意此时这个子进程运行的依然是老的镜像文件。紧接着这个子进程会通过 `execve` 调用执行新的二进制文件来替换掉自己，成为 New Master。

那么问题来了：New Master 启动时按理说会执行 `bind` + `listen` 等操作来初始化监听，而这时候 Old Master 还没有退出，端口未释放，执行 `execve` 时理论上应该会报：`Address already in use` 错误，但是实际上这里却没有任何问题，这是为什么？

因为 Nginx 在 `execve` 的时候压根就没有重新 `bind` + `listen`，而是直接把 listener fd 添加到 `epoll` 的事件表。因为这个 New Master 本来就是从 Old Master 继承而来，自然就继承了 Old Master 的 listener fd，但是这里依然有一个问题：该怎么通知 New Master 呢？

**环境变量**。`execve` 在执行的时候可以传入环境变量。实际上 Old Master 在 `fork` 之前会将所有 listener fd 添加到 `NGINX` 环境变量：

```nginx
ngx_pid_t
ngx_exec_new_binary(ngx_cycle_t *cycle, char *const *argv)
{
...
    ctx.path = argv[0];
    ctx.name = "new binary process";
    ctx.argv = argv;

    n = 2;
    env = ngx_set_environment(cycle, &n);
...
    env[n++] = var;
    env[n] = NULL;
...
    ctx.envp = (char *const *) env;

    ccf = (ngx_core_conf_t *) ngx_get_conf(cycle->conf_ctx, ngx_core_module);

    if (ngx_rename_file(ccf->pid.data, ccf->oldpid.data) == NGX_FILE_ERROR) {
       ...
        return NGX_INVALID_PID;
    }

    pid = ngx_execute(cycle, &ctx);

    return pid;
}
```

Nginx 在启动的时候，会解析 `NGINX` 环境变量：

```nginx
static ngx_int_t
ngx_add_inherited_sockets(ngx_cycle_t *cycle)
{
...
    inherited = (u_char *) getenv(NGINX_VAR);
    if (inherited == NULL) {
        return NGX_OK;
    }
    if (ngx_array_init(&cycle->listening, cycle->pool, 10,
                       sizeof(ngx_listening_t))
        != NGX_OK)
    {
        return NGX_ERROR;
    }

    for (p = inherited, v = p; *p; p++) {
        if (*p == ':' || *p == ';') {
            s = ngx_atoi(v, p - v);
            ...
            v = p + 1;

            ls = ngx_array_push(&cycle->listening);
            if (ls == NULL) {
                return NGX_ERROR;
            }

            ngx_memzero(ls, sizeof(ngx_listening_t));

            ls->fd = (ngx_socket_t) s;
        }
    }
    ...
    ngx_inherited = 1;

    return ngx_set_inherited_sockets(cycle);
}
```

一旦检测到是继承而来的 socket，那就说明已经打开了，不会再继续 `bind` + `listen` 了：

```nginx
ngx_int_t
ngx_open_listening_sockets(ngx_cycle_t *cycle)
{
    ...
    /* TODO: configurable try number */

    for (tries = 5; tries; tries--) {
        failed = 0;

        /* for each listening socket */

        ls = cycle->listening.elts;
        for (i = 0; i < cycle->listening.nelts; i++) {
        ...
            if (ls[i].inherited) {

                /* TODO: close on exit */
                /* TODO: nonblocking */
                /* TODO: deferred accept */

                continue;
            }
            ...

            ngx_log_debug2(NGX_LOG_DEBUG_CORE, log, 0,
                           "bind() %V #%d ", &ls[i].addr_text, s);

            if (bind(s, ls[i].sockaddr, ls[i].socklen) == -1) {
                ...
            }
            ...
        }
    }

    if (failed) {
        ngx_log_error(NGX_LOG_EMERG, log, 0, "still could not bind()");
        return NGX_ERROR;
    }

    return NGX_OK;
}
```

## Envoy

Envoy 使用的是单进程多线程模型，其局限就是无法通过环境变量来传递 listener fd。因此 Envoy 采用的是 UDS（unix domain sockets）方案。当 New Envoy 启动完成后，会通过 UDS 向 Old Envoy 请求 listener fd 副本，拿到 listener fd 之后开始接管新来的连接，并通知 Old Envoy 终止运行。

> file descriptor 是可以通过 `sendmsg/recvmsg` 来传递的。

## MOSN

MOSN 的方案和 Envoy 类似，都是通过 UDS 来传递 listener fd。但是其比 Envoy 更厉害的地方在于它可以把老的连接从 Old MOSN 上迁移到 New MOSN 上。**也就是说把一个连接从进程 A 迁移到进程 B，而保持连接不断**！！！厉不厉害？听起来很简单，但是实现起来却没那么容易，比如数据已经被拷贝到了应用层，但是还没有被处理，怎么办？这里面有很多细节需要处理。它子所以能做到这种层面，靠的也是内核的 `sendmsg/recvmsg` 技术。

> SCM_RIGHTS - Send or receive a set of open file descriptors from another process. The data portion contains an integer array of the file descriptors. The passed file descriptors behave as though they have been created with dup(2). http://linux.die.net/man/7/unix

这里有一个 Go 实现的小 Demo: [tcp链接迁移](https://zhuanlan.zhihu.com/p/97340154)。

## 对比

Nginx 的实现是兼容性最强的，因为 Envoy 和 MOSN 都依赖 `sendmsg/recvmsg` 系统调用，需要内核 3.5+ 支持。MOSN 的难度最高，算得上是真正的无损升级，而 Nginx 和 Envoy 对于老的连接，仅仅是实现 graceful shutdown，严格来说是有损的。这对于 HTTP(通过 `Connection: close`) 和 gRPC(GoAway Frame) 协议支持很友好，但是遇到自定义的 TCP 协议就抓瞎了。如果遇到客户端没有处理 `close` 异常，很容易发生 socket fd 泄露问题。

本文作者 ms2008，转载自[Nginx vs Envoy vs Mosn 平滑升级原理解析](https://ms2008.github.io/2019/12/28/hot-upgrade/)。