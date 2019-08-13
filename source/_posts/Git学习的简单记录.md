---
title: Git 学习的简单记录
date: 2017-7-16 21:01:31
id: git-general-knowledge
categories: 'Git'
tags:
  - Git
  - GitHub
description: #你對本頁的描述 可以省略
---

回想自己最初接触 git，先是在 github 上注册账号，接着是下载 git bash，然后根据 github 的提示建了个仓库，最后就不知道干嘛了，克隆仓库都不会，当时也没有再继续学习了。现在学会用了一点点，做个记录加深印象。

<!-- more -->

首先推荐教程：[廖雪峰 Git 教程](https://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000)

### Git 的一些使用（已经创建了 github 账号以及下载了[git 命令行工具](https://git-scm.com/downloads)）

### 配置本机的用户名和 Email 地址

```bash
$ git config --global user.name "Your Name"
$ git config --global user.email "email@example.com"
```

### 生成 SSH 密钥

```bash
$ ssh-keygen -t rsa -C "email@example.com"
Generating public/private rsa key pair.
Enter file in which to save the key (/c/Users/Administrator/.ssh/id_rsa): ssh_file_name
#ssh_file_name是密钥的文件名，括号内是密钥保存的路径(win7)，但本次产生的文件实际上在我打开git bash的目录下，原因暂时不明
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in ssh_file_name.
Your public key has been saved in ssh_file_name.pub.
The key fingerprint is:
SHA256:ZptcB8DkcM1z0NujOQ2ixEyOXpVzSQkJI4lMjxAoOqg email@example.com
The key's randomart image is:
+---[RSA 2048]----+
| .o+..o+*+oB.o   |
|o  .oo.=ooO *    |
|+   . .*...= o   |
|+     . * ..o o  |
|..   . oS....= . |
|E     .+.+ .+ .  |
|        +    .   |
|                 |
|                 |
+----[SHA256]-----+

```

### 将 SSH 公钥添加到 git 服务器

上一步会生成两个文件，ssh_file_name 和 ssh_file_name.pub，打开 ssh_file_name.pub 复制其中所有的内容；
打开[github](https://github.com/)，登录自己的账号，找到 setting ==> SSH and GPG keys ==> New SSH key，将刚才复制的内容粘贴进去。
其他 git 服务器类似，登录后找到 SSH 管理添加即可。

### 创建版本库（仓库、repository）

选择一个空目录，建立本地仓库

```bash
$ git init
Initialized empty Git repository in C:/Users/Administrator/Desktop/ex/.git/
```

### 与远程仓库关联，关联的前提是已经添加了 SSH

先在 github 上创建一个空仓库，然后选择一个空目录下进行 clone，关联的是空仓库，新开始的工作，没添加 SSH 的话只能克隆下来不能推送修改

```bash
$ git clone git@github.com:daief/daief.github.io.git
```

在 github 建立 repository-name 仓库，然后将本地仓库添加到远程，本地仓库已经进行了一些工作，中途关联远程，没添加 SSH 的话不能添加

```bash
$ git remote add origin git@github.com:username/repository-name.git
```

### 一次 git 推送的过程

```bash
$ git status	#查看状态，可以看到做出的改动
On branch master
Your branch is up-to-date with 'origin/master'.
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   index.html		#可以看出index.html被修改了

no changes added to commit (use "git add" and/or "git commit -a")
#接着将修改过的文件添加到暂存区
$ git add index.html #或者使用git add . 添加所有文件
$ git status	# 再次查看状态
On branch master
Your branch is up-to-date with 'origin/master'.
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   index.html
$ git commit -m '描述做了什么改动'	#将改动提交
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git push origin master 	#推送到远端
```

[工作区和暂存区详见](https://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000/0013745374151782eb658c5a5ca454eaa451661275886c6000)

### 推送冲突

```bash
$ git push origin master    # 推送到远程仓库的master分支，被拒绝
To git@git.oschina.net:defeng/graduation-project.git
 ! [rejected]        master -> master (fetch first)
error: failed to push some refs to 'git@git.oschina.net:defeng/graduation-project.git'
hint: Updates were rejected because the remote contains work that you do
hint: not have locally. This is usually caused by another repository pushing
hint: to the same ref. You may want to first integrate the remote changes
hint: (e.g., 'git pull ...') before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
# git提示可以先pull下来处理后再push
```

实际上，我模拟了一个双人合作的场景，有两个人对 readme.md 文件作出修改
原来 readme.md 的内容：

```bash
---
paper
===

test text
```

另一个小伙伴对其进行修改：

```bash
---
paper
===

test text

add 22222
```

我对其进行的修改：

```bash
---
paper
===

test text

add 111
```

这时候，小伙伴先行将修改 push 到了远端，之后我也尝试 push，这时候就出现了开始的情况，push 失败了，因为跟小伙伴推送的修改产生了冲突，那么接下来解决冲突

```bash
$ git pull  # 先pull，如果pull失败可能需要指定分支名，git pull origin master
remote: Counting objects: 3, done.
remote: Total 3 (delta 0), reused 0 (delta 0)
Unpacking objects: 100% (3/3), done.
From git.oschina.net:defeng/graduation-project
   767915d..029e618  master     -> origin/master
Auto-merging readme.md # git提示自动合并了冲突，提醒解决冲突
CONFLICT (content): Merge conflict in readme.md
Automatic merge failed; fix conflicts and then commit the result.
```

现在查看 readme.md 的内容，冲突的部分 git 使用<<<<<<<、=======、>>>>>>>标出：

```bash
<<<<<<< HEAD    # 从这里开始是我做出的修改
---
paper
===

test text

add 111
=======     # 我的部分结束，以下开始小伙伴推送的修改
---
paper
===

test text

add 22222
>>>>>>> 029e618cacf774f502e2d8b532b97d2b1b281d0d    # 小伙伴部分结束
```

在冲突的文件中搜索<<<<<<<、>>>>>>>可快速找到冲突的部分，处理冲突后的 readme.md：

```bash
---
paper
===

test text

add 111,22222
```

之后再次 add、commit、push 即可

```bash
$ git add readme.md
warning: LF will be replaced by CRLF in readme.md.
The file will have its original line endings in your working directory.

$ git commit -m '解决冲突'
[master feb9f4f] 解决冲突

$ git push origin master
Counting objects: 6, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (2/2), done.
Writing objects: 100% (6/6), 558 bytes | 0 bytes/s, done.
Total 6 (delta 0), reused 0 (delta 0)
To git@git.oschina.net:defeng/graduation-project.git
   029e618..feb9f4f  master -> master
```

### 撤销更改

#### 修改了工作区的内容，但是还没有进行 git add

编辑 readme.md：

```bash
paper
===

test text

add 111,22222

add a new line
```

查看状态：

```bash
$ git status
On branch master
Your branch is up-to-date with 'origin/master'.
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   readme.md

no changes added to commit (use "git add" and/or "git commit -a")
```

Git 会告诉你，git checkout -- file 可以丢弃工作区的修改

```bash
$ git checkout -- readme.md
# 然后再查看状态
$ git status
On branch master
Your branch is up-to-date with 'origin/master'.
nothing to commit, working directory clean
```

现在查看 readme.md 的内容

```bash
---
paper
===

test text

add 111,22222
```

#### 修改了工作区的内容，执行了 git add

```bash
$ git add readme.md
$ git status
On branch master
Your branch is up-to-date with 'origin/master'.
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   readme.md

```

git 同样提示可以使用`git reset HEAD <file>`来撤销

```bash
$ git reset head readme.md
Unstaged changes after reset:
M       readme.md
$ git checkout -- readme.md     # 撤销工作区的修改
$ git status
On branch master
Your branch is up-to-date with 'origin/master'.
nothing to commit, working directory clean

```

#### 修改了工作区的内容，并且 commit 了

使用`git log`或'git reflog`查看提交记录，然后也是使用`git reset <commit id>`来跳到指定commit版本，提交记录过长按`q`可以退出

```bash
$ git log
commit cc4de9b788bf3a23f035dc6f9d14b378d54e1569
Author: DeFeNG <1437931235@qq.com>
Date:   Sat Jul 22 21:14:58 2017 +0800

    add a new line

commit feb9f4f66a0d3d1d5dc2ccb6ca3d3c081ac3dc0f
Merge: 5425240 029e618
Author: DeFeNG <1437931235@qq.com>
Date:   Sat Jul 22 19:43:35 2017 +0800

    解决冲突

commit 5425240257d32aff59da46477dd21156d76f2555
Author: DeFeNG <1437931235@qq.com>
Date:   Sat Jul 22 19:20:52 2017 +0800

    add 111

$ git reset feb9    # 指定版本号的前几位就行，但也不要太短避免重复
Unstaged changes after reset:
M       readme.md

```

### 分支

分支相当于平行的世界线，之间互不影响，特定的时候可以让世界线接触（分支合并）。

使用`git branch`可以查看分支,`*`指向当前所在的分支

```bash
$ git branch
* master

```

创建分支 dev，然后切换到 dev

```bash
$ git branch dev    # 创建分支dev
$ git checkout dev  # 切换到dev
M       readme.md
Switched to branch 'dev'
$ git branch
* dev
  master

```

也可以使用`git checkout -b dev`，创建 dev 的同时切换到 dev，代替上述两条命令

现在在 dev 分支修改 readme.md：

```bash
---
paper
===

test text

add 111,22222

edit in dev
```

然后提交修改

```bash
$ git add readme.md
$ git commit -m 'edit in dev'
[dev 6b23c0d] edit in dev
 1 file changed, 2 insertions(+)

```

现在切回 master 分支:

```bash
$ git checkout master
Switched to branch 'master'
Your branch is up-to-date with 'origin/master'.
```

查看 readme.md：

```bash
---
paper
===

test text

add 111,22222

```

可以看到在 dev 分支上的改动不会影响到 master 分支，现在让世界线碰撞一下，把 dev 上的内容合并到 master 上：

```bash
$ git merge dev
Updating feb9f4f..6b23c0d
Fast-forward
 readme.md | 2 ++
 1 file changed, 2 insertions(+)

```

查看 readme.md，可以看到与 dev 合并了`git merge dev`将指定分支合并到当前分支：

```bash
---
paper
===

test text

add 111,22222

edit in dev
```

接着可以删除 dev 分支：

```bash
$ git branch -d dev
Deleted branch dev (was 6b23c0d).

$ git branch
* master

```

你在本地创建了新的分支，没有 push 到远端别人是看不见的。
通常，协作的时候每个人都会在自己的分支上进行工作，然后将自己的修改统一推送到比如 dev 分支，所以这时候想要推送自己的修改的时候一般是`将本地修改commit`==>`将dev分支合并到自己的分支`==>`处理冲突`==>`提交修改`==>`推送到远端dev`

删除远程`dev`分支：

```bash
$ git push origin --delete dev
```

### .gitignore 文件

在仓库的根目录下创建.gitignore 文件，可以告诉 git 哪些文件不需要追踪管理，使用`git add .`的时候也会自动忽略。
.gitignore 文件的内容参考如下，忽略日志、public 目录下的文件：

```bash
*.log
public/
```

当然我们可以使用`git add -f <file>`来强制添加指定的文件进行提交。

### 让 git 取消对指定文件的管理

有时候我们中途发现有些文件不需要让 git 管理，比如`node_modules/`，我们可以将其从 git 中移除，不会删除磁盘上的文件

```bash
$ git rm -r -n --cached <file>    # 加上-n可以查看将会移除的文件
$ git rm -r --cached <file>       # 会真正执行移除跟踪操作
$ git rm -r <file>                # 注意:删除磁盘上的文件
```

移除之后在.gitignore 文件中添加 node_modules/，以后 git 就不会对其进行追踪修改。

移除版本跟踪并删除远程文件

```bash
$ git rm -r --cached out/

$ git commit -m 'remove'

$ git push origin master
```

### 更改关联的远程仓库

#### 更改`/.git/config`中的`url`

#### 使用命令更改

```bash
$ git remote set-url origin <url>
```

### 比较更改

比较两个分支的更改差异：

```bash
# --stat 是显示文件列表, 否则显示更改内容
git diff branch1 branch2 --stat
```
