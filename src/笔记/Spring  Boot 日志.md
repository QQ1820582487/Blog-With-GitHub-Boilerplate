---
layout: post
title: Spring  Boot 记录日志
slug: bj08
date: 2020-05-03 01:55
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - 笔记
  - 日志
excerpt: 笔记
---
## Spring  Boot 记录日志

### 1.基本操作

#### 1.在类中添加Logger

```java
private static final Logger log = LoggerFactory.getLogger(SpringbootJpaApplication.class);
```

#### 2.使用log记录日志

例：

```java
@SpringBootApplication
public class SpringbootApplication {
    private static final Logger log = LoggerFactory.getLogger(SpringbootApplication.class);

    public static void main(String[] args) {
        log.debug("日志记录");
        log.info("日志记录");
        log.error("日志记录");
        SpringApplication.run(SpringbootApplication.class, args);
    }
}
```

![1588446986097](D:\UserData\Desktop\杂物\Xuxx_Blogs\src\static\Spring  Boot 记录日志_1.png)

### 2.便捷操作

#### 1.在类上添加@Slf4j注解

#### 2.使用log记录日志

例：

```java
@Slf4j
@SpringBootApplication
public class SpringbootApplication {
    public static void main(String[] args) {
        log.debug("日志记录");
        log.info("日志记录");
        log.error("日志记录");
        SpringApplication.run(SpringbootApplication.class, args);
    }
}
```

![1588446986097](D:\UserData\Desktop\杂物\Xuxx_Blogs\src\static\Spring  Boot 记录日志_1.png)