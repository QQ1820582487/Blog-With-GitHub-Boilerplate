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
  - 日志
  - Java
  - Spring Boot
excerpt: 笔记
---


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

![](..\static\笔记图片\2020-05-03-Spring  Boot 日志_01.png)

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

![](..\static\笔记图片\2020-05-03-Spring  Boot 日志_01.png)

### 3.日志配置

Spring Boot对各种日志框架都做了支持，我们可以通过配置来修改默认的日志的配置
默认情况下，Spring Boot使用Logback作为日志框架

```yaml
logging:
	file: ../1ogs/xxx.1og                      (../是当前项目的上级目录)
	level.com.xuxx.xxx.xxx: DEBUG
```

