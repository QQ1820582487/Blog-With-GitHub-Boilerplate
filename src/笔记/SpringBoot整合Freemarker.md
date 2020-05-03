---
layout: post
title: SpringBoot整合Freemarker
slug: bj04
date: 2019-12-30 02:58
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - 笔记
  - java
  - spring
excerpt: 笔记
---

### 基本步骤

- 添加`pom`依赖
- 在`application.yml`中添加相关配置
- 创建`freemarker`模板
- 创建控制层
- 测试访问

### 1. 添加`pom`依赖

```xml
<!-- springboot整合freemarker -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-freemarker</artifactId>
</dependency>

```

### 2. 在`application.yml`中添加相关配置

```
# 配置freemarker
spring:
  freemarker:
    # 设置模板后缀名 默认.ftl (现已改为ftlh)
    #suffix: .ftl
    # 设置文档类型  默认 text/html
    #content-type: text/html
    # 设置页面编码格式  默认 UTF-8
    #charset: UTF-8
    # 设置页面缓存  默认false
    #cache: false
    # 设置ftl文件路径 默认classpath:/templates
    #template-loader-path:
    # - classpath:/templates
      
  # 设置静态文件路径，js,css等
  mvc:
    static-path-pattern: /static/**
```

### 3. 创建`freemarker`模板

目录：src/main/resources 创建templates文件夹，文件夹里新建`freemarker.ftl`文件
```html
<!DOCTYPE>
<html>
    <head>
        <title>freemark</title>
    </head>
    <body>
        <h1>Hello ${name} from resource freemark!</h1>
    </body>
</html>
```

### 4. 创建控制层

```java
@Controller
@RequestMapping(value = "/freemarker")
public class FreemarkerAction {
    /**
     * 跳转freemarker页面
     */
    @RequestMapping(value = "/toDemo")
    public String toDemo(Model model) {
        model.addAttribute("name", "Xuxx");
        return "freemarker";
    }
}
```

### 5. 测试访问

启动项目，输入http://localhost:8080/freemarker/toDemo