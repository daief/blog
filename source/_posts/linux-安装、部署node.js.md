---
title: linux-安装、部署node.js
date: 2017-9-17 19:34:55
id: install-nodejs-on-linux
categories: ["Linux"]
tags:
  - linux
  - nodejs
description:
---

CentOS 云主机上安装 nodejs，部署 node 应用。

<!-- more -->

## 安装 nodejs

访问[官网](https://nodejs.org/en/download/)下载对应的包，将其上传到云主机的目录，例如`/usr/local/src/nodejs`

我下载的包`node-v8.4.0-linux-x64.tar.xz`，是.xz 格式的压缩包，现将其解压成.tar 格式：

```bash
xz -d node-v8.4.0-linux-x64.tar.xz
```

如果系统没有 xz 命令，需要进行安装，运行：

```bash
yum install xz
```

再对 tar 的包执行：

```bash
tar -xvf node-v8.4.0-linux-x64.tar
```

然后进入目录，在`node/bin/`下执行：

```bash
# 看到版本号代表成功
./node -v
v8.4.0
```

配置环境变量，从而在其他目录使用`node`命令：

```bash
# 编辑profile
vim /etc/profile
# 在最后加入以下内容，注意路径
export NODE_HOME=/usr/local/src/nodejs/node-v8.4.0-linux-x64
export PATH=$NODE_HOME/bin:$PATH
export NODE_PATH=$NODE_HOME/lib/node_modules:$PATH

# 保存退出，然后使之生效
source /etc/profile
```

## 部署、运行 node 项目

将 node 项目上传的云主机，执行：

```bash
node app.js
```
