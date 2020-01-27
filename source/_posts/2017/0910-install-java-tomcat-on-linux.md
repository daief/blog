---
title: Linux-Java环境、Tomcat服务器的安装
date: 2017-9-10 21:56:44
id: install-java-tomcat-on-linux
categories: ["Linux"]
tags:
  - Linux
  - JDK
  - Tomcat
description:
---

CentOS 云主机上安装 Java 环境和 Tomcat 服务器。

<!-- more -->

## Java 环境安装

方式不唯一，只记录自己了自己的安装过程

先到官网下载对应版本的 JDK 包，然后发送的云主机的`/usr/java`目录下

```bash
# 查看自己的系统
uname -r
```

安装步骤

```bash
# 更新源
yum update

# 在系统上搜索，任何版本的已安装的JDK组件。
rpm -qa | grep -E '^open[jre|jdk]|j[re|dk]'

# 如果预先安装了JAVA1.6或1.7的版本，请执行下列命令，将他们卸载
yum remove java-1.6.0-openjdk

# 进入所在的目录，进行解压
tar -zxvf  jdk-8u144-linux-x64.tar.gz

# 配置环境变量，编辑/etc/profile
vim /etc/profile
    # 可以在文件末尾加入
    export JAVA_HOME=/usr/java/jdk1.8.0_144 # 此处是jdk所在的目录
    export CLASSPATH=.:%JAVA_HOME%/lib/dt.jar:%JAVA_HOME%/lib/tools.jar
    export PATH=$PATH:$JAVA_HOME/bin
    # 保存退出

# 使配置文件生效
source /etc/profile     # 或者reboot，重启

# 查看安装是否成功，能看到版本号
java -version
```

## tomcat 安装

1. 到[官网 http://tomcat.apache.org/](http://tomcat.apache.org/)下载安装包`apache-tomcat-9.0.0.M26.tar.gz`
2. 把安装包`apache-tomcat-9.0.0.M26.tar.gz`发送到`/usr/local`目录
3. 解压安装包，然后删除

  ```bash
  # 进入目录
  cd /usr/local
  # 解压
  tar -zxvf apache-tomcat-9.0.0.M26.tar.gz
  # 删除压缩包
  rm -rf apache-tomcat-8.0.26.tar.gz.tar.gz
  # 将解压的apache-tomcat-8.0.26移到一个目录下并改名称为tomcat
  mv apache-tomcat-8.0.26 tomcat
  ```

4. 启动 tomcat

  ```bash
  /usr/local/tomcat/bin/startup.sh

  ```

5. 出现错误，因为我是先安装了 tomcat，所以报了 Java 环境变量的错误，之后安装了 jdk 错误消失
   Neither the JAVA_HOME nor the JRE_HOME environment variable is defined
   At least one of these environment variable is needed to run this program

6. 防火墙开放 8080 端口，我现在的操作时直接关了防火墙（不安全），因为我对于 Linux 的防火墙还不熟悉，为了避免麻烦暂时的操作

7. 记得添加`安全组规则`——阿里云

8. 访问 127.0.0.1:8080

  ```bash
  curl 127.0.0.1:8080
  # 报错，连接失败failed connected tomcat
  ```

> [原文：](http://www.cnblogs.com/rogear/p/7435074.html)在一个网站上看到说这个是因为环境变量的问题，tomcat 使用的环境变量是自己的或者是继承自当前用户的，所以在 Linux 里面即使你设置了 java_home 也不一定会用这个，所以要么你都继承 root 的环境变量，都统一起来确保你的系统里面的环境变量都是使用的同一个，要么就单独指定要使用的 jdk。tomcat 启动的时候需要盗用 setclasspath.sh。只要在 setclasspath.sh 声明环境变量就可以知道你这个 tomcat 使用哪个 jdk，打开 tomcat 的 bin 目录下面的 setclasspath.sh，添加上，路径自己修改，添加在开头就行

> export JAVA_HOME=/usr/local/java/jdk1.8.0_144
> export JRE_HOME=/usr/local/java/jdk1.8.0_144/jre

然后重启 tomcat 就可以使用了，公网上也能访问了
