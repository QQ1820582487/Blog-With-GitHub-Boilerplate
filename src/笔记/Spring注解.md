---
layout: post
title: Spring注解
slug: bj03
date: 2019-12-30 00:58
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

### 1.属性注入

#####  1.@Value

实体类

```java
@Component
public class Book {

    @Value("${book.id}")
    private Long id;
    @Value("${book.name}")
    private String name;
    @Value("${book.author}")
    private String author;
    //get/set/toString方法略
```

配置文件

```xml
book.id=1
book.name=Java开发
book.author=Xuxx
```

测试

```java
	@Autowired
    Book book;

    @Test
    void contextLoads() {
        System.out.println(book);
    }
```

##### 2.  @PropertySource

创建配置文件book.properties

```xml
book.id=1
book.name=Java开发2.0
book.author=Xuxx
```

实体类

```java
@Component
@PropertySource(value = "classpath:book.properties")
public class Book {

    @Value("${book.id}")
    private Long id;
    @Value("${book.name}")
    private String name;
    @Value("${book.author}")
    private String author;
    //get/set/toString方法略
```

测试

```java
	@Autowired
    Book book;

    @Test
    void contextLoads() {
        System.out.println(book);
    } 
```

##### 3.类型安全的属性注入  @ConfigurationProperties

创建配置文件book.properties

```xml
book.id=1
book.name=Java开发3.0
book.author=Xuxx
```

实体类

```java
@Component
@PropertySource(value = "classpath:book.properties")
@ConfigurationProperties(prefix = "book")
public class Book {
    private Long id;
    private String name;
    private String author;
    //get/set/toString方法略
```

测试

```java
	@Autowired
    Book book;

    @Test
    void contextLoads() {
        System.out.println(book);
    } 
```

