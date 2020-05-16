---
layout: post
title: Spring Boot构建REST服务
slug: bj19
date: 2020-05-16 02:20
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - java
  - spring
excerpt: 笔记
---

# Spring Boot构建REST服务

## 1.基础版

1. 依赖

   ```xml
   <dependency>
   	<groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-data-jpa</artifactId>
   </dependency>
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-data-rest</artifactId>
   </dependency>
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-web</artifactId>
   </dependency>
   <dependency>
       <groupId>mysql</groupId>
       <artifactId>mysql-connector-java</artifactId>
       <scope>runtime</scope>
       <version>5.1.27</version>
   </dependency>
   <dependency>
       <groupId>org.projectlombok</groupId>
       <artifactId>lombok</artifactId>
   </dependency>
   ```

2. 配置

   ```yaml
   spring:
     datasource:
       username: root
       password: root
       url: jdbc:mysql://127.0.0.1:3306/jpa?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
       type: com.zaxxer.hikari.HikariDataSource
   
     jpa:
       database: mysql #连接数据库类型
       database-platform: org.hibernate.dialect.MySQL57Dialect #配置默认引擎
       hibernate:
         ddl-auto: update
       show-sql: true
   ```

   

3. 实体类

   ```java
   @Data
   @Entity(name = "user_jpa")
   public class User {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       public Integer id;
       public String name;
       public Integer age;
   }
   ```

4. dao

   ```java
   public interface UserDao extends JpaRepository<User, Integer> {
   }
   ```

5. 测试

   1. 查询（GET请求）

      批量查询 ![批量查询](..\static\笔记图片\2020-05-16-Spring Boot构建REST服务_01.png)

      分页查询

      ![分页查询](..\static\笔记图片\2020-05-16-Spring Boot构建REST服务_02.png)

      分页+排序
   
      ![分页+排序](..\static\笔记图片\2020-05-16-Spring Boot构建REST服务_03.png)
   
      单个查询
   
      ![单个查询](..\static\笔记图片\2020-05-16-Spring Boot构建REST服务_04.png)
   
   2. 保存（POST请求）
   
      ![保存](..\static\笔记图片\2020-05-16-Spring Boot构建REST服务_05.png)
   
   3. 更新（PUT请求）
   
      ![更新](..\static\笔记图片\2020-05-16-Spring Boot构建REST服务_06.png)
   
   4. 删除（DELETE请求）
   
      ![删除](..\static\笔记图片\2020-05-16-Spring Boot构建REST服务_07.png)

到此就是一个基础版的REST服务了。

## 2.进阶版

### 1.自定义查询方法

修改dao

```java
public interface UserDao extends JpaRepository<User, Integer> {
    List<User> findByNameContaining(@Param("name") String name);
}
```

重启项目，访问`http://localhost:8080/users/search`

![](..\static\笔记图片\2020-05-16-Spring Boot构建REST服务_08.png)

此时便可以看到所有的自定义查询方法(默认路径就是方法名)。

访问自定义查询方法`findByNameContaining`

![](..\static\笔记图片\2020-05-16-Spring Boot构建REST服务_09.png)

由于JPA的关键字命名一般较长，为了更加便捷，可以在自定义查询方法上使用`@RestResource`注解

**`@RestResource`参数**:

- exported:是否暴露，默认为true

- path:访问自定义查询方法的路径
- rel:在生成到此资源的链接时要使用的rel值。

```java
public interface UserDao extends JpaRepository<User, Integer> {
    @RestResource(path = "byname", rel = "findByName")
    List<User> findByNameContaining(@Param("name") String name);
}
```

![](..\static\笔记图片\2020-05-16-Spring Boot构建REST服务_10.png)

### 2.自定义请求路径、结果 key 值

（1）默认情况下请求路径都是实体类名小写加 `@RepositoryRestResource`

**`@RepositoryRestResource `参数：**

- path：表示将所有请求路径中的 `(例:)uesrs`，如 `http://localhost:8080/us`
- collectionResourceRel：表示将返回的 JSON 集合中的`(例:)uesrs` 集合的 **key**。
- itemResourceRel ：表示将返回的 JSON 集合中的单个`(例:)uesr` 的 **key**。
- exported:是否暴露，默认为true

```java
@RepositoryRestResource(collectionResourceRel = "userlist", itemResourceRel = "u")
public interface UserDao extends JpaRepository<User, Integer> {
    @RestResource(path = "byname", rel = "findByName")
    List<User> findByNameContaining(@Param("name") String name);
}
```

![](..\static\笔记图片\2020-05-16-Spring Boot构建REST服务_11.png)

### 3.配置REST

1. **配置文件**

```yaml
#rest 配置
  data:
    rest:
      #添加统一前缀
      base-path: api
```

配置后`http://localhost:8080/users`-->`http://localhost:8080/api/users`

```yaml
#rest 配置
  data:
    rest:
      #添加统一前缀
      base-path: api
      #是否在创建实体后返回记录，默认为true
      return-body-on-create: true
      #是否在更新实体后返回记录，默认为true
      return-body-on-update: true
      #每页的默认大小，默认20
      default-page-size: 20
      ......
```

2. **编写配置类**（优先级更高）

```java
/**
 * rest的配置类
 */
@Configuration
public class RestConfig implements RepositoryRestConfigurer {
    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config) {
        config.setBasePath("api").setDefaultPageSize(20);//链式编程，可以配置多个
    }
}
```



### 4.配置 CORS（解决跨域请求问题）

具体参考[Spring Boot通过CROS实现跨域）](https://qq1820582487.github.io/Xuxx_Blogs/archives/bj12/)

1. 单独配置：添加`@CrossOrigin`注解

2. 全局配置：编写配置类，重写`addCorsMappings`方法