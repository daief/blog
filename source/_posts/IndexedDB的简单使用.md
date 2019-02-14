---
title: IndexedDB的简单使用
date: 2017-11-10 23:19:49
id: html5-indexdb
categories: ["前端","JavaScript"]
tags:
  - javascript
description:
---

使用 IndexedDB 在前端对数据进行缓存，简单记录用法。

> IndexedDB 是一种低级 API，用于客户端存储大量结构化数据(包括, 文件/ blobs)。该 API 使用索引来实现对该数据的高性能搜索。

<!-- more -->

> [使用 IndexedDB http://www.tfan.org/using-indexeddb/](http://www.tfan.org/using-indexeddb/)

### 基本模式

**IndexedDB 的操作都是异步的**

IndexedDB 鼓励使用的基本模式如下所示：

1. 打开数据库并且开始一个事务。
2. 创建一个 object store（IndexedDB 使用对象存储空间而不是表）。
3. 构建一个请求来执行一些数据库操作，像增加或提取数据等。
4. 通过监听正确类型的事件以等待操作完成。
5. 在操作结果上进行一些操作（可以在 request 对象中找到）。

### 实现过程

#### `idb.js`:

```javascript
const DB_NAME = "test_db";
// 数据库版本
const DB_VERSION = 1;
const DB_STORE_NAME = "books";

// IndexedDB 句柄
var db = null;

initDb();

/**
 * 初始化
 */
function initDb() {
  /**
   * open 函数的结果是一个IDBDatabase对象的实例。
   * 第二个参数，就是数据库的版本号。
   * 如果我们打开的数据库不是我们期望的最新版本的话，
   * 我们可以对 object store 进行创建或是删除。
   * 在 onupgradeneeded 事件中进行更新
   */
  var req = indexedDB.open(DB_NAME, DB_VERSION);

  req.onsuccess = function(evt) {
    // 打开成功的事件回调，取得句柄
    db = this.result;
  };

  req.onerror = function(evt) {
    // 数据库打开失败
    console.error("initDb:", evt.target.errorCode);
  };

  req.onupgradeneeded = function(evt) {
    // 更新对象存储空间和索引
    // 创建 object store
    // 以该方式创建使用键值对形式进行存储
    var store = evt.currentTarget.result.createObjectStore(DB_STORE_NAME);
  };
}

/**
 * 读取数据
 * @param {Object} key 键
 * @param {Function} success 读取数据成功的回调
 * @param {Function} fail 读取数据失败的回调
 */
function getBook(key, success, fail) {
  success = success || function() {};
  fail = fail || function() {};
  if (!db) {
    // db 未初始化或不支持
    fail();
    return;
  }

  // 每次读写要创建事务
  // transaction() 方法返回一个事务对象。
  // 第一个参数是事务希望跨越的对象存储空间的列表。空数组表示跨越所有对象存储空间。
  // 如果你没有为第二个参数指定读写方式
  var tx = db.transaction(DB_STORE_NAME, "readonly");
  var store = tx.objectStore(DB_STORE_NAME);
  // 读取数据
  var req = store.get(key);

  req.onsuccess = function(evt) {
    // 在成功的回调中取得结果
    success(this.result);
  };

  req.onerror = function(evt) {
    // 读取失败
    fail();
    console.log("get fail", evt.target.result);
  };
}

/**
 * 添加数据
 * @param {Object} obj 要添加的值
 * @param {Object} key 键
 * @param {Function} success 添加成功后的回调
 * @param {Function} fail 添加数据失败的回调
 */
function addBook(obj, key, success, fail) {
  success = success || function() {};
  fail = fail || function() {};
  if (!db) {
    fail();
    return;
  }

  // 创建事务
  var tx = db.transaction(DB_STORE_NAME, "readwrite");
  var store = tx.objectStore(DB_STORE_NAME);
  // 添加数据
  var req = store.add(obj, key);

  req.onsuccess = function(evt) {
    success();
  };

  req.onerror = function() {
    fail();
    console.error("add error", this.error);
  };
}
```

#### `index.html`中进行使用：

```html
<!DOCTYPE html>
<html>
  <head>
    <title>index</title>
  </head>
  <body>
    <script src="idb.js"></script>
    <script type="text/javascript">
      // 延时操作，确保 indexeddb 初始化完成
      setTimeout(function() {
        addBook(
          "JavaScript",
          1,
          function() {
            // add seccess
            getBook(
              1,
              function(result) {
                console.log("get:", result);
              },
              function() {
                console.log("get err");
              }
            );
          },
          function() {
            console.log("add err");
          }
        );
      }, 500);
    </script>
  </body>
</html>
```

#### 结果：

<img src="https://pic.superbed.cn/item/5c63cec85f3e509ed95668f2">

<img src="https://pic.superbed.cn/item/5c63cec85f3e509ed95668f4">

### 简单扩展

#### object store 键的提供方式

```javascript
db.createObjectStore("books", { keyPath: "id" });
```

| Key Path | Key Generator | Description |
| :------: | :-----------: | :---------: |
|    No    |      No       | 这种对象存储空间可以持有任意类型的值，甚至是像数字和字符串这种基本数据类型的值。每当我们想要增加一个新值的时候，必须提供一个单独的键参数。 |
|   Yes    |      No       | 这种对象存储空间只能持有 JavaScript 对象。这些对象必须具有一个和 key path 同名的属性。 |
|    No    |      Yes      | 这种对象存储空间可以持有任意类型的值。键会为我们自动生成，或者如果你想要使用一个特定键的话你可以提供一个单独的键参数。 |
|   Yes    |      Yes      | 这种对象存储空间只能持有 JavaScript 对象。通常一个键被生成的同时，生成的键的值被存储在对象中的一个和 key path 同名的属性中。然而，如果这样的一个属性已经存在的话，这个属性的值被用作键而不会生成一个新的键。 |
