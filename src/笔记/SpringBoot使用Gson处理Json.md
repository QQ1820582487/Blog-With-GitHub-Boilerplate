```
layout: post
title: SpringBoot使用Gson处理Json
slug: bj06
date: 2019-12-31 03:58
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - 笔记
  - java
  - spring
excerpt: 笔记
```

## 1. 基本使用

自动化配置类：

> `org.springframework.boot.autoconfigure.http.GsonHttpMessageConvertersConfiguration`
>
> `org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration`


### 1. 配置依赖

#### 1.1 排除默认的Jackson

```xml
<dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <!--排除默认的Jackson-->
        <exclusions>
            <exclusion>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-json</artifactId>
            </exclusion>
        </exclusions>
</dependency>
```

#### 1.2 引入Gson依赖

```xml
<!--Gson-->
<dependency>
	<groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
</dependency>
```

### 2. Bean

```java
public class User {
    private Integer id;
    private String username;
    private String address;
    private Date birthday;
    //set/get/toString略
}
```

### 3. Controller

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
            user.setBirthday(new Date());
            users.add(user);
        }
        return users;
    }
}
```

### 4.测试结果

```xml
[
  {
    "id": 0,
    "username": "Xuxx>>0",
    "address": "中国>>0",
    "birthday": "Dec 31, 2019 3:37:48 AM"
  },...
]
```

## 2. Gson配置

### 1.配置`GsonHttpMessageConverter`

#### 1.1 创建配置类 WebMvcConfig

与配置Jackson类似

```java
@Configuration
public class WebMvcConfig {
    
    @Bean
    GsonHttpMessageConverter gsonHttpMessageConverter() {
        GsonHttpMessageConverter converter = new GsonHttpMessageConverter();
        converter.setGson(new GsonBuilder().setDateFormat("yyyy-MM-dd").create());
        return converter;
    }

}
```

#### 1.2 测试结果

```xml
[
  {
    "id": 0,
    "username": "Xuxx>>0",
    "address": "中国>>0",
    "birthday": "2019-12-31"
  },...
]
```

### 2.直接配置Gson

#### 2.1 配置类

```java
@Configuration
public class WebMvcConfig {
    @Bean
    Gson gson() {
        return new GsonBuilder().setDateFormat("yyyy年MM月dd日").create();
    }
}
```

#### 2.2 测试

```xml
[
  {
    "id": 0,
    "username": "Xuxx>>0",
    "address": "中国>>0",
    "birthday": "2019年12月31日"
  },...
]
```

