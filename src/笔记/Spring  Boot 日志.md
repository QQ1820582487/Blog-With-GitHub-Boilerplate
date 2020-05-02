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

![](https://github.com/QQ1820582487/Xuxx_Blogs/blob/source/src/static/Spring%20%20Boot%20%E8%AE%B0%E5%BD%95%E6%97%A5%E5%BF%97_1.png)

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

![](https://github.com/QQ1820582487/Xuxx_Blogs/blob/source/src/static/Spring%20%20Boot%20%E8%AE%B0%E5%BD%95%E6%97%A5%E5%BF%97_1.png)