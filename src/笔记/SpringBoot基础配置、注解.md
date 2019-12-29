---
layout: post
title: SpringBoot基础配置/注解
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

### 1. 属性注入

#####  1. `@Value`

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

##### 2.  `@PropertySource`

创建配置文件`book.properties`

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

##### 3. 类型安全的属性注入  `@ConfigurationProperties`

属于`springboot`

创建配置文件`book.properties`

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

### 2. yaml属性注入

实体类

```java
@Component
@ConfigurationProperties(prefix = "student")
public class Student {
    private Long id;
    private String name;
    private int age;
    //get/set/toString方法略
```

配置文件 `application.yaml`

**备注：springboot2.16暂时不支持自定义yaml**

```xml
student:
  id: 1
  name: xuxx
  age: 21
```

测试

```java
    @Autowired
    Student student;

    @Test
    void contextLoads02() {
        System.out.println(student);
    }
```

##### 1. 数组

实体类

```java
@Component
@ConfigurationProperties(prefix = "class")
public class Class {
    private String class_name;
     private List<String> teachers;
    //get/set/toString方法略
```

配置文件 `application.yaml`

```xml
class:
  class_name: java一班
  teachers:
    - 张三
    - 李四
    - 王五
```

##### 2. 数组+对象

实体类

```java
@Component
@ConfigurationProperties(prefix = "class")
public class Class {
    private String class_name;
    private List<String> teachers;
    private List<Student> students;
    //get/set/toString方法略
```

配置文件 `application.yaml`

```xml
class:
  class_name: java一班
  teachers:
    - 张三
    - 李四
    - 王五
  students:
    - id: 1
      name: xuxx_01
      age: 18
    - id: 2
      name: xuxx_02
      age: 19
```

### 3. Profile

#### 1. properties 配置

一个应用为了在不同的环境下工作，常常会有不同的配置，代码逻辑处理。Spring Boot 对此提供了简便的支持。

关键词： `@Profile`、`spring.profiles.active`

假设，一个应用的工作环境有：dev、test、prod

那么，我们可以添加 4 个配置文件：

- `applcation.properties` - 公共配置
- `application-dev.properties` - 开发环境配置
- `application-test.properties` - 测试环境配置
- `application-prod.properties` - 生产环境配置

在 `applcation.properties` 文件中可以通过以下配置来激活 profile：

```
spring.profiles.active = test
```

#### 2. yml 配置

与 properties 文件类似，我们也可以添加 4 个配置文件：

- `applcation.yml` - 公共配置
- `application-dev.yml` - 开发环境配置
- `application-test.yml` - 测试环境配置
- `application-prod.yml` - 生产环境配置

在 `applcation.yml` 文件中可以通过以下配置来激活 profile：

```
spring:
  profiles:
    active: prod
```

此外，yml 文件也可以在一个文件中完成所有 profile 的配置：

```
# 激活 prod
spring:
  profiles:
    active: prod
# 也可以同时激活多个 profile
# spring.profiles.active: prod,proddb,prodlog
---
# dev 配置
spring:
  profiles: dev

# 略去配置

---
spring:
  profiles: test

# 略去配置

---
spring.profiles: prod
spring.profiles.include:
  - proddb
  - prodlog

---
spring:
  profiles: proddb

# 略去配置

---
spring:
  profiles: prodlog
# 略去配置
```

注意：不同 profile 之间通过 `---` 分割

#### 3. 使用 `@Profile` 

使用 `@Profile` 注解可以指定类或方法在特定的 Profile 环境生效。

##### 修饰类

```
@Configuration
@Profile("production")
public class JndiDataConfig {

    @Bean(destroyMethod="")
    public DataSource dataSource() throws Exception {
        Context ctx = new InitialContext();
        return (DataSource) ctx.lookup("java:comp/env/jdbc/datasource");
    }
}
```

##### 修饰注解

```
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Profile("production")
public @interface Production {
}
```

##### 修饰方法

```
@Configuration
public class AppConfig {

    @Bean("dataSource")
    @Profile("development")
    public DataSource standaloneDataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.HSQL)
            .addScript("classpath:com/bank/config/sql/schema.sql")
            .addScript("classpath:com/bank/config/sql/test-data.sql")
            .build();
    }

    @Bean("dataSource")
    @Profile("production")
    public DataSource jndiDataSource() throws Exception {
        Context ctx = new InitialContext();
        return (DataSource) ctx.lookup("java:comp/env/jdbc/datasource");
    }
}
```

#### 4. 激活 profile的方式

##### 插件激活 profile

```
spring-boot:run -Drun.profiles=prod
```

##### main 方法激活 profile

```
--spring.profiles.active=prod
```

##### jar 激活 profile

```
java -jar -Dspring.profiles.active=prod *.jar
```

##### 在 Java 代码中激活 profile

直接指定环境变量来激活 profile：

```
System.setProperty("spring.profiles.active", "test");
```

在 Spring 容器中激活 profile：

```
AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
ctx.getEnvironment().setActiveProfiles("development");
ctx.register(SomeConfig.class, StandaloneDataConfig.class, JndiDataConfig.class);
ctx.refresh();
```

### 4. Banner

只要你在 `resources` 目录下放置名为 `banner.txt`、`banner.gif` 、`banner.jpg` 或 `banner.png` 的文件，Spring Boot 会自动加载，并将其作为启动时打印的 logo。

- 对于文本文件，Spring Boot 会将其直接输出。
- 对于图像文件（ `banner.gif` 、`banner.jpg` 或 `banner.png` ），Spring Boot 会将图像转为 ASCII 字符，然后输出。
  