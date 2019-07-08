---
title: Docker 入门笔记
date: 2019-07-01 19:52:55
id: getting-started-with-docker
categories: ["DevOps", "Docker"]
tags:
  - Docker
keywords:
  - Docker
description:
---

本文是学习 Docker 时的初学者记录，内容是关于 Docker 基本命令的使用。如果您对此已经熟悉，大可略过本文。

<!-- more -->

Docker 是什么？我将其简单理解为一种容器技术。我尝试用以下场景来描述这个技术。

常常会有这样的情况，将代码分享给别人，别人却跑不起来。而在代码相同的情况下，这往往是环境差异导致的，也就是常说的“这在我电脑上是好的”。那么，换一种方式。我将代码的结果（比如一些需构建的项目结果）、各种配置（环境变量、项目配置）放进一种可运行的容器中；而后，确保该容器可正常运行；最后，将容器分享给他人。此时，他人只需要启动容器即可。

Docker 就是这么一种技术。实际上，用于分享的是 image（镜像），container（容器）通过 image 生成、运行于本机，最终的项目也是运行于容器当中。接下来可以看看[阮一峰](http://www.ruanyifeng.com/blog/2018/02/docker-tutorial.html)更为专业、清晰的描述：

> Docker 属于 Linux 容器的一种封装，提供简单易用的容器使用接口。它是目前最流行的 Linux 容器解决方案。
>
> Docker 将应用程序与该程序的依赖，打包在一个文件里面。运行这个文件，就会生成一个虚拟容器。程序在这个虚拟容器里运行，就好像在真实的物理机上运行一样。有了 Docker，就不用担心环境问题。
>
> 总体来说，Docker 的接口相当简单，用户可以方便地创建和使用容器，把自己的应用放入容器。容器还可以进行版本管理、复制、分享、修改，就像管理普通的代码一样。

## 安装

目前的系统是 macOS Mojave，所以直接通过 brew 安装。

```bash
$ brew cask install docker
```

## 容器的增、删、查

首先学习一下基本操作。

启动一个 Nginx 的镜像（下一节对此有说明），官方镜像名为 `nginx`。如果本地没有该镜像，Docker 会自动进行拉取再启动。注意，不添加 `--rm` 的每次启动都会创建一个新的容器。

```bash
$ docker container run nginx
```

此时启动的进程是常驻控制台的，可以通过以下命令在后台的方式启动。

```bash
# 使用 -d 可设置容器在后台运行
$ docker container run -d nginx
```

查看容器。可以看到容器 ID、对应的镜像、状态等信息。

```bash
# 添加 -a 列出所有容器
# 默认只列出本机正在运行的容器
$ docker ps -a

CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS                      PORTS               NAMES
9752e761d34d        nginx               "nginx -g 'daemon of…"   32 seconds ago       Exited (0) 22 seconds ago                       brave_noether
```

查看镜像，列出本机镜像的信息。

```bash
$ docker image ls

REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
nginx               latest              719cd2e3ed04        2 weeks ago         109MB
```

如果容器正在后台运行，可以通过 `kill` 或 `stop` 停止正在运行的容器。

```bash
# 指定容器 ID
$ docker kill 9752e761d34d
```

通过 `start` 命令启动一个已存在的容器。

```bash
$ docker start 9752e761d34d
```

通过 `rm` 删除容器。

```bash
$ docker rm 9752e761d34d
```

## 容器端口、文件映射

启动一了个 Nginx 的镜像到底是什么情况？此时有一个容器在机子上跑着，同时有一个 Nginx 服务在这个容器里跑着。而事实上，提供服务的是当前这台机子；目前这种情况，用户是无法访问到 Nginx 服务的。接下来的设置，让容器内的服务能够对外开放。

停止容器并按照如下命令重新启动。`-d` 参数让容器在后台运行；`-p 8088:80` 配置端口映射，让容器内的 80 和本机的 8088 端口进行映射（Nginx 服务的默认端口为 80）；`--rm` 表示在该容器停止后自动进行删除；`--name` 为容器命名，如此一来存在多个容器时能够一眼辨识。

```bash
$ docker container run \
  -d \
  -p 8088:80 \
  --rm \
  --name mynginx \
  nginx
```

启动完成后访问 [http://localhost:8088](http://localhost:8088)， 可以看到 Nginx 的欢迎页面，说明容器、Nginx 都已经成功启动，端口映射也没有问题。

不过访问其他路由都是 404，因为容器内此时只是个空白的 Nginx 服务。接下来将本地静态目录挂载到容器内，让容器内访问到外面的文件，更新文件内容时，容器内也是同步更改的。

在当前路径创建一个文件夹 `nginx-demo`，添加 html 文件 `html/a.html`。重新按照如下命令参数启动容器。`--volume` 把 `html` 目录映射到容器的网页文件目录 `/usr/share/nginx/html`。

```bash
$ docker container run \
  -d \
  -p 8088:80 \
  --rm \
  --volume "$PWD/nginx-demo/html":/usr/share/nginx/html \
  --name mynginx \
  nginx
```

此时访问 [http://localhost:8088/a.html](http://localhost:8088/a.html) 可以看到对应页面，目录映射成功。修改 html 文件，刷新页面也能看到预期的变化。

## 使用 Dockerfile 构建 image

本文记录了两种创建镜像的方式：
  1. 直接通过 Dockerfile 进行构建
  2. 通过现有容器生成新的镜像

本小节描述了第一种方式，第二种会在下节的内容中出现。

现在开始用 Dockerfile 来构建 image。Dockerfile 是一个文本文件，用来配置 image。Docker 根据该文件生成二进制的 image 文件。

进入 nginx-demo 目录，在根目录创建 `.dockerignore`、`Dockerfile`，目录结构参考如下：

```bash
nginx-demo
├── .dockerignore
├── Dockerfile
└── html
    └── a.html
```

`.dockerignore` 表示，打包 image 的时候忽略列出的内容：

```bash
# .dockerignore
.git
*.log
```

一个简单的 `Dockerfile` 如下：

```bash
# Dockerfile

# FROM
# 表示该镜像继承自官方的 nginx 镜像，版本为最新
FROM nginx:latest

# COPY
# 将 ./html 目录下的所有文件（除了.dockerignore 排除的路径）
# 都拷贝到 image 文件的 /usr/share/nginx/html 目录
COPY ./html /usr/share/nginx/html

# 将容器 80 端口暴露出来， 允许外部连接这个端口
EXPOSE 80
```

> [`Dockerfile` 的更多选项可参考这里](https://devdocs.io/docker~17/engine/userguide/eng-image/dockerfile_best-practices/index)。

创建 image 文件。

```bash
# -t 参数用来指定 image 文件的名字, . 表示当前路径（也可以指定 Dockerfile 的路径）
$ docker image build -t nginx-demo .
# 或者添加冒号记录版本信息
$ docker image build -t nginx-demo:0.0.1 .
```

此时就可以看到刚刚添加的镜像。

查看 images。

```bash
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
nginx-demo          0.0.1               fdd278ef340c        22 seconds ago      109MB
nginx-demo          latest              fdd278ef340c        22 seconds ago      109MB
nginx               latest              719cd2e3ed04        2 weeks ago         109MB
```

在自定义的 image 上运行容器。

```bash
# 通过 nginx-demo:0.0.1 的 image 启动容器，并映射端口
$ docker container run -d -p 8088:80 --rm nginx-demo:0.0.1
```

访问 [http://localhost:8088/a.html](http://localhost:8088/a.html) 可以看到相应页面。

**注意此时没有映射文件目录，看到的页面已经是 image 里的内容了。这时候即使修改本机上的 a.html，页面也不会有变化。**

创建好 image，就可以把它上传到仓库，这样他人就能方便地进行下载。

## 进入容器

容器内可看作是一个微型虚拟机，可以进入容器进行一些操作。

使用 `docker ps` 找到刚刚启动容器的 ID。

```bash
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                  NAMES
53d51b734e3f        nginx-demo:0.0.1    "nginx -g 'daemon of…"   12 seconds ago      Up 11 seconds       0.0.0.0:8088->80/tcp   zealous_nobel
```

进入容器并打开容器的终端：

```bash
$ docker container exec -it 53d51b734e3f /bin/bash
```

这一步找到容器内的 a.html，并尝试进行修改（以下的 `$` 实际上显示的是 `#`，但在渲染时会变成注释，所以替换了一下 ）。

```bash
root@53d51b734e3f:/$ cd /usr/share/nginx/html/
root@53d51b734e3f:/usr/share/nginx/html$ ls
50x.html  a.html  index.html
# 修改文件内容
root@53d51b734e3f:/usr/share/nginx/html$ echo 'hello world' > a.html
# 退出容器
root@53d51b734e3f:/usr/share/nginx/html$ exit
```

退出容器、查看页面，能看到更新后的内容。

> 上述使用 `docker exec -it ID /bin/bash` 进入容器并执行 `/bin/bash`，很是在 alpine 中没有 `/bin/bash` 文件，不过改成 `docker exec -it ID sh` 就能进入并启动终端了。

**注意此时修改的是容器内的文件，当容器停止后修改的内容就会丢失。**

接下来通过当前容器创建一个新的 image 以保存修改，使用 `docker commit` 命令。

```bash
# docker commit [容器ID]      [新镜像名] :[TAG]
$ docker commit 53d51b734e3f nginx-demo:0.0.2
```

查看现在的镜像情况。

```bash
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
nginx-demo          0.0.2               be392c708cb9        3 seconds ago       109MB
nginx-demo          0.0.1               fdd278ef340c        16 hours ago        109MB
nginx-demo          latest              fdd278ef340c        16 hours ago        109MB
nginx               latest              719cd2e3ed04        3 weeks ago         109MB
```

停止正在运行的容器，分别以不同的镜像启动、查看页面内容。

## 结语

本文的描述十分简单，只包含了一些基本操作，更多详细的内容可参考文末链接。

文章多有疏漏，还望读者斧正。

完。

---

参考链接 & 相关阅读：

- [Docker 官网](https://www.docker.com)
- [Docker 入门教程 - 阮一峰](http://www.ruanyifeng.com/blog/2018/02/docker-tutorial.html)
- [devdocs - docker 17](https://devdocs.io/docker~17/)
- [菜鸟教程](https://www.runoob.com/docker/docker-tutorial.html)
