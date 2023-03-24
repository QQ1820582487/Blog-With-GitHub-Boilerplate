---
layout: post
title: Spring Boot通过CORS实现跨域
slug: bj12
date: 2020-05-07 00:50
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
  - Spring Boot
excerpt: 笔记
---

## CORS概述

当一个资源从与该资源本身所在的服务器不同的`域、协议、端口`请求一个资源时，资源会发起一个跨域 HTTP 请求。同源策略参考[浏览器的同源策略 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy)

出于安全原因，浏览器限制从脚本内发起的跨源HTTP请求，XMLHttpRequest和Fetch API，只能从加载应用程序的同一个域请求HTTP资源，除非使用`CORS头文件`

对于**浏览器限制**这个词，要着重解释一下：不一定是浏览器限制了发起跨站请求，也可能是跨站请求可以正常发起，但是返回结果被浏览器拦截了。

### 简单请求

不会触发CORS预检的请求称为简单请求，满足以下**所有条件**的才会被视为简单请求，基本上我们日常开发只会关注**前两点**

1. 使用`GET、POST、HEAD`其中一种方法

2. 只使用了如下的安全首部字段，不得人为设置其他首部字段

   - `Accept`

   - `Accept-Language`

   - `Content-Language`

   - `Content-Type`
     
     仅限以下三种

     - `text/plain`
- `multipart/form-data`
     - `application/x-www-form-urlencoded`

   - HTML头部header field字段：`DPR、Download、Save-Data、Viewport-Width、WIdth`
   
3. 请求中的任意`XMLHttpRequestUpload` 对象均没有注册任何事件监听器；XMLHttpRequestUpload 对象可以使用 XMLHttpRequest.upload 属性访问

4. 请求中没有使用 ReadableStream 对象

### 预检请求

需预检的请求要求必须首先使用 `OPTIONS` 方法发起一个预检请求到服务器，以获知服务器是否允许该实际请求。"预检请求“的使用，可以避免跨域请求对服务器的用户数据产生未预期的影响

下面的请求会触发预检请求，其实非简单请求之外的就会触发预检，就不用记那么多了

1. 使用了`PUT、DELETE、CONNECT、OPTIONS、TRACE、PATCH`方法

2. 人为设置了非规定内的其他首部字段，参考上面简单请求的安全字段集合，还要特别注意`Content-Type`的类型

3. `XMLHttpRequestUpload` 对象注册了任何事件监听器

4. #### 请求中使用了`ReadableStream`对象

## 1. 问题演示

创建两个Spring Boot项目，一个提供接口，另一个来访问。

cors1(端口为8080)提供的接口 访问URL:`http://localhost:8080/hello`

```java
@RestController
public class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello cors1";
    }
}
```

cors2(端口为8081)编写一个HTML来访问`http://localhost:8080/hello`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="jquery-3.3.1.min.js"></script>
</head>
<body>
<div id="app"></div>
<input type="button" value="GET" onclick="getData()">
<script>
    function getData() {
        $.get('http://localhost:8080/hello', function (msg) {
            $("#app").html(msg);
        })
    }
</script>
</body>
</html>
```

访问结果：

![访问结果](..\static\笔记图片\2020-05-07-Spring Boot通过CORS实现跨域_01.png)

点击 get 按钮时报错 （从源地址`http://localhost:8080/hello`访问 XMLHttpRequest 已被CORS策略阻塞:在被请求的资源上没有`Access-Control-Allow-Origin`报头。）

## 2. 解决问题

上面的报错是因为在被请求的资源上没有`Access-Control-Allow-Origin`报头，在 Spring Boot 中，可以简单的通过`@CrossOrigin`注解为接口配置。

改写 cros1 的 Controller，添加`@CrossOrigin`注解

其中 @CrossOrigin 中的2个常用参数：

**origins**  ： 允许可访问的域列表

**maxAge**：准备响应前的缓存持续的最大时间（以秒为单位）。

`@CrossOrigin`注解不仅能在方法上使用，也可以在类上使用。

```
@RestController
public class HelloController {
    @GetMapping("/hello")
    @CrossOrigin(origins = {"http://localhost:8081"})
    public String hello() {
        return "Hello cors1";
    }
}
```

访问结果：响应头中多了**Access-Control-Allow-Origin: http://localhost:8081**

![访问结果](..\static\笔记图片\2020-05-07-Spring Boot通过CORS实现跨域_02.png)

## 3. 全局CORS配置

编写配置类

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")//允许跨域的接口
                .allowedOrigins("http://localhost:8081")//允许的来源
                .allowedHeaders("*")//允许的Headers,默认允许所有
                .allowedMethods("*")//允许的Methods，默认允许GET、HEAD、POST
                .maxAge(1800);//最大有效时间，默认为1800秒(30分钟)
    }
}
```

此时cros1中所有的接口都开启了CORS，就可以跨域访问了。

## 4. 预检请求（探测请求）

