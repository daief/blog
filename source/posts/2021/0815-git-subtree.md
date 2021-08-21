---
title: Git Subtree 的使用
date: 2021-08-15 21:07:02
id: git-subtree
categories: ['Git']
tags:
  - Git
keywords:
  - Git Subtree
description:
---

git 的 `subtree` 是一种复用源代码的方式，可以让多个仓库引用某个仓库的代码，也可以将仓库中的某个目录拆分成一个子仓库以供其他仓库使用。

相较于 git 的 `submodule`，目前多更推崇 subtree，自己在使用了一段时间后总体也是认为 subtree 会更好用一些。

但同时，两者都有各自的一些问题，而 subtree 的问题目前有其他方式规避，整体用起来比较流畅，所以最终选择了 subtree。

> 实际上 subtree 命令需要在某个版本的 git 之后才被支持，但目前 git 的常用版本是远远够的，所以也没去深究过。
>
> 另外还有一点也是挺苦恼的，搜到的资料都会说 subtree 会更好，但关于 subtree 的资料都比较少、简单，甚至大多数会连 subtree 一个最致命的问题都没有提及。

<!-- more -->

## 为什么？

在前端领域都有 npm 了，就算不想发包、装包、升级也还有 script 直接引入的方式，为何还需要折腾 subtree 或是 submodule？

首先需要认清的是，subtree 并不是为了取代已有的一些模式，而是为了解决上述方式不能很好解决的一些场景。

假设你所在的业务线上，有两个产品 α、β，分别由两个仓库 A、B 维护，两个产品背后的业务逻辑有诸多相似，会存在一些共同的业务组件、方法或是更大的功能模块，同时这些内容可能会需要快速、同步地迭代。

虽说这样的场景可能会比较少，但确实是我最近的处境。在此之前最初的解决方式就是拷贝，简单而直接；再后来迭代更新地多了，就蛋疼了，于是转成 npm 包的方式，好歹不再复制粘贴了；过了一段时间，又厌烦了，写业务代码的时候，还要把逻辑拆到另一个包里，还得去维护 npm 包的版本，完了依赖方得进行相应地升级，开发体验还是不流畅，往往最终又回归拷贝。

想要表达的是，会有一些或零碎、或具备特定业务的特性、或需要快速更迭的内容，如何用合理的方式去复用，如何能保持开发的流畅性，如何尽可能多地解决问题。

> 想起来这样的一个场景应该会是更常见，也是比较适合使用 subtree：你原本一直在某个仓库上开发，时间久了自然会有一些仓库的沉淀（方法、组件），突然有一天组里立项了一个新的项目，你建了一个新的仓库，对于一个全新的仓库，你想使用之前的沉淀，这个使用该怎么办呢？（我所遇到的现实当中往往是拷贝，在多个仓库中能见到完全一样的代码，说明这种场景的代码复用实际上算是一个问题）

现在，私以为通过 subtree 能较好地解决上述的问题。

## Subtree 的使用

如何在已有仓库中引用另一个仓库，例如想要在 repo-a 中引用 sub-repo，且仓库的信息如下：

- repo-a：http://example.com/repo-a.git
- sub-repo：http://example.com/sub-repo.git

### 添加

首先需要在 repo-a 中添加子仓库 sub-repo，该命令只需在首次执行：

```bash
$ cd repo-a
$ git subtree add --prefix=subtrees/sub-repo http://example.com/sub-repo.git master
# 可以添加 squash 参数压缩自仓库的提交
$ git subtree add --prefix=subtrees/sub-repo http://example.com/sub-repo.git master --squash
```

该命令表示将 `http://example.com/sub-repo.git` 仓库 `master` 分支的内容添加到 `repo-a` 仓库的 `subtrees/sub-repo` 目录。

subtree 的一个好处开始体现了，对于 `repo-a` 的 `subtrees/sub-repo` 目录，在日常使用中不需要特殊对待，它就是一个普通的目录，可以正常修改其中的内容、正常提交、正常地切分支、回滚或是 revert 等等。

### 拉取更新 subtree

当需要拉取子仓库的内容时，需要使用 `git subtree pull` 命令：

```bash
# 同样支持 squash 参数
$ git subtree pull --prefix=subtrees/sub-repo http://example.com/sub-repo.git master --squash
```

该命令会将远端 `http://example.com/sub-repo.git` 仓库 `master` 分支的内容同步到当前 `repo-a` 仓库的 `subtrees/sub-repo` 目录。

### 删除子仓库

直接删除 `subtrees/sub-repo` 目录，将删除操作提交。

### 推送本地对子仓库的更新

subtree 也提供了原生的推送命令，但我个人并不推荐直接使用，不过还是得先记录下原生的用法。

当需要将本地 `subtrees/sub-repo` 的更新推送到源仓库的时候，可以使用 push 命令：

```bash
$ git subtree push --prefix=subtrees/sub-repo http://example.com/sub-repo.git master
```

该命令会将本地仓库 `subtrees/sub-repo` 目录下的内容推送到 `http://example.com/sub-repo.git` 的 `master` 分支。

**当执行 `git subtree push` 的时候，git 会去遍历当前所有的 commit，计算出其中对 `subtrees/sub-repo` 目录的修改，再将这些 commit 推送到子仓库去**。

```bash
# 该仓库有 1470 个提交
1451/  1470 (1450) [19]
```

除了上面这个一千多提交的仓库，另一个我实际在日常迭代的仓库已达到了三千多的提交，这导致在 push 子仓库的时候就很痛苦，每次 push 都需要耗费大量时间来计算提交。

为了改善这种情况，git 还提供了一个 `split` 命令，使用如下：

```bash
# 先执行 split 生成临时分支 subtree/split-tmp
$ git subtree split --prefix=subtrees/sub-repo --rejoin --branch subtree/split-tmp
# 再将临时分支 subtree/split-tmp 推送到子仓库的 master
$ git push http://example.com/sub-repo.git subtree/split-tmp:master
```

`split` 命令执行后会产生一个新的提交，后续再进行 push，那么只会从 split 这个提交开始计算。

但仓库比较大的话，git 还可能因为性能问题直接抛出异常中断操作，原因可能是内存超过了操作系统给到这个程序的内存空间。该异常的错误信息常带有 `Segmentation fault: 11` 字样。

但就我个人的实际使用而言，实在是充满了坑。说好的用了 split 命令，往后的 push 将不再遍历全部提交，但不知咋地用着用着就不好使了，又会出现遍历全部的情况；还有直接出现 Segmentation fault 的问题，更甚至有个仓库内 push 会将主仓库的所有 commit 都推送的子仓库（实际上的内容倒是子仓库自身范围的）。

说回来可能没人信，我把子仓库删除重新添加，主仓库依旧会把所有提交推送至子仓库，实在是无能为力，要说去看源码什么的，对我而言还是太有难度了。

总之，我对 subtree 原生的 push 命令是拒绝的。为了解决推送的问题，我选择自定义脚本的方式去实现，过程就是每次推送的时候进入子目录，初始化一个临时的仓库，将子目录的仓库进行提交并推送即可，脚本的大概内容如下：

```js
// subtrees/sub-repo/scripts/push.js
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const dayjs = require('dayjs');

const baseRoot = path.resolve(__dirname, '..');
const baseGit = path.resolve(baseRoot, '.git');

const hasGit = (() => {
  try {
    return fs.statSync(baseGit).isDirectory();
  } catch (error) {
    return false;
  }
})();

const now = dayjs();
const branchName = `script/${now.format('YYYY-MM-DD_HH_mm')}`;

const commands = [
  ...(hasGit
    ? []
    : [
        'git init',
        'git remote add origin http://example.com/sub-repo.git',
        `git checkout -b ${branchName}`,
      ]),
  'git add .',
  `git commit -m "script: ${now.format('YYYY-MM-DD HH:mm:ss')}" -n`,
  'git pull origin master --allow-unrelated-histories',
  `git push origin HEAD:${branchName}`,
];

exec(
  commands.join(' && '),
  {
    cwd: baseRoot,
  },
  (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      console.log('Error:\n', stderr);
    } else {
      console.log(stdout);
      console.log('\n', stderr);
      exec(`rm -r ${baseGit}`);
    }
  },
);
```

这样一来，需要 push 的时候只需执行 `node subtrees/sub-repo/scripts/push.js`，完成之后会在远端新建一个临时分支，真正合并的时候在 gitlab 或 github 提交 MR 即可，这样一来子仓库的改动也能经过团队的评审。

push 的脚本里会自动拉取同步一下 master 分支，可能会出现冲突的情况，此时只需在本地解决冲突，进行提交，再次执行 `push.js` 脚本即可。

使用这种推送方式，就不再有上述“遍历 commit”的问题，心情都舒畅了。不过这种方式已知的一个问题就是子仓库的提交会被丢失，但实际上问题不大，因为子仓库的改动实际上都和主仓库在一起。

## 结语

submodule 我也简单使用过，它和 subtree 很大的不同就是会存在多个 git 仓库，在使用的过程中总是要关心是父仓库、还是子仓库。而 subtree 除了在与子仓库交互的时候（add、pull、push），其他情况完全可以抛弃 subtree 的概念，就是仓库中的一个目录，对于切分支、回滚等操作都很友好，推送的问题也能使用简单的方式进行规避，所以我也更推崇 subtree。

参考资料：

- [Git subtree 用法与常见问题分析](https://juejin.cn/post/6881580754854215687)
- [Git SubTree 使用](https://juejin.cn/post/6936459179049615397)
- [用 Git Subtree 在多个 Git 项目间双向同步子项目，附简明使用手册](https://tech.youzan.com/git-subtree/)
