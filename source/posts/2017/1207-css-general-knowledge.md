---
title: CSS小知识
date: 2017-12-7 16:52:48
id: css-general-knowledge
categories: ["前端","CSS"]
tags:
  - CSS
description:
---

记录 CSS 一些有用、易忘的知识。

<!-- more -->

### pointer-events

> 指定在什么情况下 (如果有) 某个特定的图形元素可以成为鼠标事件的 target。

可以用于屏蔽鼠标事件。
```css

/* 元素不会成为鼠标事件的target。*/
div {
  pointer-events: none;
}

```

> 说明：使用pointer-events来阻止元素成为鼠标事件目标不一定意味着元素上的事件侦听器永不会触发。如果元素后代明确指定了pointer-events属性并允许其成为鼠标事件的目标，那么指向该元素的任何事件在事件传播过程中都将通过父元素，并以适当的方式触发其上的事件侦听器。当然位于屏幕上在父元素上但不在后代元素上的鼠标活动都不会被父元素和后代元素捕获（将会穿过父元素而指向位于其下面的元素）。

### touch-action

> 用于指定某个给定的区域是否允许用户操作，以及如何响应用户操作（比如浏览器自带的划动、缩放等）。

可用于屏蔽移动端`touch`事件。
```css
/* 触控事件发生在元素上时，不进行任何操作 */
div {
  touch-action: none;
}
```

触摸动作也经常用于完全解决由支持双击缩放手势引起的点击事件的延迟。
```css
html {
  /* 浏览器只允许进行滚动和持续缩放操作。
  任何其它被auto值支持的行为不被支持。 */
  touch-action: manipulation;
}
```

### 居中
> [CSS居中完整指南 https://www.w3cplus.com/css/centering-css-complete-guide.html](https://www.w3cplus.com/css/centering-css-complete-guide.html)
#### 水平居中

1. 行内元素的居中，父元素使用`text-align: center;`

    ```html
    <style>
        div.out {
            text-align: center;
        }
    </style>

    <div class="out">
        div { text-align: center; }
        <br />
        <span>span</span>
        <br />
        <a href="javascript:;" style="display: inline-block;">
            a { display:inline-block; }
        </a>
        <br />
        <div style="display: inline-table;">
            div { display:inline-table; }
        </div>
    </div>
    ```


2. 块级元素居中，设定宽度，使用`margin: 0 auto;`

    ```html
    <style>
        div.center {
            width: 65%;
            margin: 0 auto;
        }
    </style>

    <div class="center">
        div { width: 65%;margin: 0 auto; }
    </div>
    ```

3. 使用`position: absloute; left: 50%; margin-left: -(宽度 / 2);`
    ```html
    <style>
        div.center {
            width: 60%;
            position: absolute;
            left: 50%;
            margin-left: -30%;
        }
    </style>


    <div class="center">
        div { width: 65%;}
    </div>
    ```

4. 使用`flex`布局
    ```html
    <style>
        /* 父容器 */
        div.out {
            display: flex;
            justify-content: center;
        }
    </style>

    <div class="out">
        <div class="center">
            div.center
        </div>
    </div>
    ```

#### 垂直居中

1. 设置`line-height`与`height`相等
    ```html
    <style>
        .div1 {
            height: 60px;
            line-height: 60px;
        }
    </style>

    <div class="div1">
        文本文本 text text
    </div>

    ```

2. 设置一个类似`table-cell`的父级容器，使用`vertical-align: middle;`
    ```html
    <style>
        div {
            height: 60px;
            vertical-align: middle;
            display: table-cell;
        }
    </style>

    <div>
        文本文本 text text
    </div>

    ```

3. 使用`flex`布局
    ```html
    <style>
        .out {
            height: 60px;
            display: flex;
            align-items: center;
        }
    </style>

    <div class="out">
        <div class="center">
            content
        </div>
    </div>
    ```

4. 幽灵元素，在垂直居中的元素上添加伪元素，设置伪元素的高等于父级容器的高，然后为文本添加`vertical-align: middle;`样式，即可实现垂直居中。

    ```html
    <style>
        .ghost-center {
            position: relative;
        }
        .ghost-center::before {
            content: " ";
            display: inline-block;
            height: 100%;
            width: 1%;
            vertical-align: middle;
        }
        .ghost-center p {
            display: inline-block;
            vertical-align: middle;
        }
    </style>

    <div class="ghost-center">
        <p>
            文本文本文本文本文本文本文本文本
        </p>
    </div>
    ```

5. 未知元素的高度，使用`transform`的`translate`，将元素的中心和父容器的中心重合，从而实现垂直居中
> 使用`transform`有一个缺陷，就是当计算结果含有小数时（比如 0.5），会让整个元素看起来是模糊的，一种解决方案就是为父级元素设置 `transform-style: preserve-3d;`

    ```html
    <style>
        .center {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
        }
    </style>

    <div class="center">
        文本文本 内容内容
    </div>
    ```

### 一种居中设置背景图像的方式
```css
body{
    background: url(../../images/body.jpg);
    background-repeat: no-repeat;
    /* 当页面的其余部分滚动时，背景图像不会移动。 */
    background-attachment: fixed;
    /* 背景图像的起始位置 */
    background-position: center;
    /* 把背景图像扩展至足够大，以使背景图像完全覆盖背景区域。
        背景图像的某些部分也许无法显示在背景定位区域中。*/
    background-size: cover;
}
```

### 自定义`radio`样式
```html
<style>
    input.css-radio {
        width: 20px;
        height: 20px;
        display: inline-block;
        position: relative;
        border: solid #999 1px;
        border-radius: 50%;
        outline: none;
        /* 取消浏览器默认外观 */
        -webkit-appearance: none;
        appearance: none;
        transition: all .3s;
    }
    input.css-radio:checked {
        border: solid #ff4081 1px;
        background: #ff4081;
    }
</style>

<input type="radio" class="css-radio" value="red" name="color" />

<input type="radio" class="css-radio" value="blue" name="color" />
```

### 0.5px 边框
```html
<style>
.tiny-border {
  position: relative;
  text-align: center;
  width: 50%;
  height: 50px;
  line-height: 50px;
  margin: 10px auto;
  background-color: #18FFFF;
}
.tiny-border:before {
  content: "";
  position: absolute;
  box-sizing: border-box;
  width: 200%;
  height: 200%;
  top: 0;
  left: 0;
  transform: scale(0.5);
  transform-origin: 0 0;
  border: 1px solid #000;
}
</style>

<div class="tiny-border">0.5px border</div>

```
