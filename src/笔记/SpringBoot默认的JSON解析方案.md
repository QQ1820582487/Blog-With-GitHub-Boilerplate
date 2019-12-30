---
layout: post
title: SpringBoot默认的JSON解析方案
slug: bj05
date: 2019-12-31 01:58
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

> **约定大于配置**   		~ SpringBoot

## 1.HttpMessageConverter

`HttpMessageConverter` ，这是一个消息转换工具，有两方面的功能：

1. 将服务端返回的对象序列化成 JSON 字符串
2. 将前端传来的 JSON 字符串反序列化成 Java 对象

所有的 JSON 生成都离不开相关的 HttpMessageConverter

SpringMVC 自动配置了 `Jackson` 和 `Gson` 的 `HttpMessageConverter`，Spring Boot 中又对此做了自动化配置：

- org.springframework.boot.autoconfigure.http.JacksonHttpMessageConvertersConfiguration

- org.springframework.boot.autoconfigure.http.GsonHttpMessageConvertersConfiguration

所以，如果用户使用 `jackson` 和 `gson` 的话，==没有其他额外配置==，则只需要添加依赖即可。

## 2 返回json

#### 1. 引入web依赖

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

#### 2. 编写bean

```java
public class User {
    private Integer id;
    private String username;
    private String address;
    //set/get/toString略
}
```

#### 3.编写controller

```java
@RestController// @Controller + @ResponseBody
public class UserController {

    @GetMapping("/user")
    public List<User> getAllUaer() {
        List<User> users = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            User user = new User();
            user.setId(i);
            user.setUsername("Xuxx>>" + i);
            user.setAddress("中国>>" + i);
            users.add(user);
        }
        return users;
    }
}
```

#### 4.测试，查看结果

```xml
[
  {
    "id": 0,
    "username": "Xuxx>>0",
    "address": "中国>>0"
  },...
]
```



## 3. 配置Jackson

#### 1.问题 - 单独配置 Jackson

修改bean

```java
public class User {
    private Integer id;
    private String username;
    private String address;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date birthday;
    //set/get/toString略
}
```

访问结果

```xml
[
  {
    "id": 0,
    "username": "Xuxx>>0",
    "address": "中国>>0",
    "birthday": "2019-12-30"
  },
  {
    "id": 1,
    "username": "Xuxx>>1",
    "address": "中国>>1",
    "birthday": "2019-12-30"
  },...
]
```

#### 2.解决 - Jackson的全局配置

先注释上一步中的`@JsonFormat(pattern = "yyyy-MM-dd")`

##### 2.1 配置`MappingJackson2HttpMessageConverter`

新建配置类`WebMvcConfig.java`

```java
@Configuration
public class WebMvcConfig {

    @Bean
    MappingJackson2HttpMessageConverter jackson2HttpMessageConverter() {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        //配置Jackson         此处可配置很多东西
        ObjectMapper mapper = new ObjectMapper();
        mapper.setDateFormat(new SimpleDateFormat("yyyy年MM月dd日"));

        //将配置好的Jackson注入回MappingJackson2HttpMessageConverter
        converter.setObjectMapper(mapper);
        return converter;
    }
}
```

再次测试，结果为

```xml
[
  {
    "id": 0,
    "username": "Xuxx>>0",
    "address": "中国>>0",
    "birthday": "2019年12月31日"
  },
  {
    "id": 1,
    "username": "Xuxx>>1",
    "address": "中国>>1",
    "birthday": "2019年12月31日"
  },...
]
```

上面可以看到此时我只需要配置 `ObjectMapper`，与`MappingJackson2HttpMessageConverter`没太大关系（当然，它有它的用处，例如这些：<img src="..\images\笔记\6.png" style="zoom:50%;" />）

所以我可以采取另一种方式来配置Jackson——直接注入自己定义的`ObjectMapper`，替换掉springboot中自动配置的`ObjectMapper`。

> *这里我们可以发现，我们是可以注入自己配置的类来替换掉springboot中自动配置的类的，也就是springboot中的**“约定大于配置 ”**。*

##### 2.2 直接配置`ObjectMapper`

注释上一步的配置，修改配置类为

```java
@Configuration
public class WebMvcConfig {
   @Bean
    ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.setDateFormat(new SimpleDateFormat("yyyy/MM/dd"));
        return mapper;
    }
}
```
再次测试，结果为
```xml
[
  {
    "id": 0,
    "username": "Xuxx>>0",
    "address": "中国>>0",
    "birthday": "2019/12/31"
  },...
]
```
