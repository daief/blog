---
title: Linux-部署 Java 应用程序
date: 2017-9-17 18:50:38
id: deploy-java-app-on-linux
categories: ['Linux']
tags:
  - Linux
  - Java
description:
---

CentOS 云主机上部署 java 应用程序。

<!-- more -->

## java 应用打包

我通过 Eclipse 将应用打包成 jar，然后将依赖的 jar 复制到同一目录的`lib/`下，
例如，在`app/`目录下：

```bash
│  androidServer.jar
│
└─lib
  gson-2.2.1.jar
  mysql-connector-java-5.1.18-bin.jar
  xpp3_min-1.1.4c.jar
  xstream-1.4.7.jar
```

之后用解压工具打开项目的 jar，更改`META-INF/MANIFEST.MF`的内容:

```
Manifest-Version: 1.0
Main-Class: com.server.main.Main
Class-Path: lib/gson-2.2.1.jar
  lib/mysql-connector-java-5.1.18-bin.jar
  lib/xpp3_min-1.1.4c.jar
  lib/xstream-1.4.7.jar


```

**注意格式：**

1. 冒号后有空格
2. 在 class-path 后写上引用到的所有 jar 包，此处的 lib 对应上述的子目录，一行不可过长，分行写最前面加两个空格
3. 最后留一行空行

## 部署应用

1. 将 jar 上传到云主机
2. 确认已安装 java 环境（[Linux-Java 环境、Tomcat 服务器的安装](./0910-install-java-tomcat-on-linux.md)）
3. 运行项目，使用`java -jar xxx.jar`
