---
layout: post
title: Spring Boot整合Mybatis
slug: bj17
date: 2020-05-12 22:20
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
  - Spring Boot
  - Mybatis
excerpt: 笔记
---

## 1.基本使用

### 1.依赖

```
<dependency>
	<groupId>org.mybatis.spring.boot</groupId>
	<artifactId>mybatis-spring-boot-starter</artifactId>
	<version>2.1.1</version>
</dependency>

<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid-spring-boot-starter</artifactId>
    <version>1.1.20</version>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
	<version>5.1.27</version>
</dependency>
```

### 2.配置数据源

```properties
spring.datasource.type=com.alibaba.druid.pool.DruidDataSource
spring.datasource.url=jdbc:mysql:///test?useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=root
```

### 3.写代码

`User`

```java
@Data
public class User {
    private Integer id;
    private String username;
    private String address;
}
```

`UserMapper`

```java
//单个Mapper可以直接加@Mapper，也可以在启动类上加//@MapperScan(basePackages = "com.xuxx.mybatis.mapper")
@Mapper
public interface UserMapper {
//    @Select("select * from user ")
    List<User> getAllUsers();
}
```

`Mapper.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.xuxx.mybatis.mapper.UserMapper">
    <select id="getAllUsers" resultType="com.xuxx.mybatis.bean.User">
        select * from user
    </select>
</mapper>
```

补充：

此时Mapper.xml会被Maven忽略，运行会报错`org.apache.ibatis.binding.BindingException: Invalid bound statement (not found): com.xuxx.mybatis.mapper.UserMapper.getAllUsers`

解决方法：（三种方式任选其一即可）

1. 在`resources`目录下创建与Mapper位置对应的多级目录`com/xuxx/mybatis/mapper`,并将`Mapper.xml`放到创建的目录下

2. 在`pom.xml`文件中配置不忽略需要的xml文件

   ```xml
   <build>
       ....
   <!--让maven不忽略Mapper.xml-->
           <resources>
               <resource>
                   <directory>src/main/java</directory>
                   <includes>
                       <include>**/*.xml</include>
                   </includes>
               </resource>
               <resource>
                   <directory>src/main/resources</directory>
               </resource>
           </resources>
   ```

3. 在`resources`目录下创建自定义目录，并在`application.properties`中配置

   ```properties
   #将Mapper.xml文件放在resources目录的mapper下，再指定mapper.xml位置
   mybatis.mapper-locations=classpath:mapper/*.xml
   ```

**测试**

```java
@SpringBootTest
class MybatisApplicationTests {

    @Autowired
    UserMapper userMapper;

    @Test
    void contextLoads() {
        List<User> users = userMapper.getAllUsers();
        System.out.println(users);
    }
}
```

**结果**

```
[User(id=1, username=xu, address=四川), User(id=6, username=xu2, address=四川)]
```

## 2.配置多数据源

### 1.依赖

```xml
<dependency>
	<groupId>org.mybatis.spring.boot</groupId>
	<artifactId>mybatis-spring-boot-starter</artifactId>
	<version>2.1.1</version>
</dependency>

<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid-spring-boot-starter</artifactId>
    <version>1.1.20</version>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
	<version>5.1.27</version>
</dependency>
```

### 2.配置多数据源

```properties
#配置多数据源
spring.datasource.one.type=com.alibaba.druid.pool.DruidDataSource
spring.datasource.one.url=jdbc:mysql:///test?useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.one.username=root
spring.datasource.one.password=root

spring.datasource.two.type=com.alibaba.druid.pool.DruidDataSource
spring.datasource.two.url=jdbc:mysql:///test2?useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.two.username=root
spring.datasource.two.password=root
```

### 3.写代码

`DataSourceConfig`

```java
@Configuration
public class DataSourceConfig {
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.one")
    DataSource dsOne() {
        return DruidDataSourceBuilder.create().build();
    }

    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.two")
    DataSource dsTwo() {
        return DruidDataSourceBuilder.create().build();
    }
}
```

`MybatisConfigOne`

```java
@Configuration
@MapperScan(basePackages = "com.xuxx.mybatis2.mapper1", sqlSessionFactoryRef = "sqlSessionFactoryOne"
        , sqlSessionTemplateRef = "sqlSessionTemplateOne")
public class MybatisConfigOne {
    @Resource(name = "dsOne")
    DataSource dsOne;

    @Bean
    SqlSessionFactory sqlSessionFactoryOne() {
        SqlSessionFactoryBean bean = new SqlSessionFactoryBean();
        try {
            bean.setDataSource(dsOne);
            return bean.getObject();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Bean
    SqlSessionTemplate sqlSessionTemplateOne() {
        return new SqlSessionTemplate(sqlSessionFactoryOne());
    }
}
```

`MybatisConfigTwo`

```java
@Configuration
@MapperScan(basePackages = "com.xuxx.mybatis2.mapper2", sqlSessionFactoryRef = "sqlSessionFactoryTwo"
        , sqlSessionTemplateRef = "sqlSessionTemplateTwo")
public class MybatisConfigTwo {
    @Resource(name = "dsTwo")
    DataSource dsTwo;

    @Bean
    SqlSessionFactory sqlSessionFactoryTwo() {
        SqlSessionFactoryBean bean = new SqlSessionFactoryBean();
        try {
            bean.setDataSource(dsTwo);
            return bean.getObject();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Bean
    SqlSessionTemplate sqlSessionTemplateTwo() {
        return new SqlSessionTemplate(sqlSessionFactoryTwo());
    }
}
```

到此，多数据源就配置好了，使用数据源1就在包mapper1下，使用数据源2就在包mapper2下。

测试一下

`User`

```java
@Data
public class User {
    private Integer id;
    private String username;
    private String address;
}
```

`com\xuxx\mybatis2\mapper1\UserMapper1.java`

```java
public interface UserMapper1 {
    @Select("select * from user ")
    List<User> getAllUsers();
}
```

`com\xuxx\mybatis2\mapper2\UserMapper2.java`

```java
public interface UserMapper2 {
    @Select("select * from user ")
    List<User> getAllUsers();
}
```

测试类

```java
@SpringBootTest
class Mybatis2ApplicationTests {
    @Autowired
    UserMapper1 userMapper1;
    @Autowired
    UserMapper2 userMapper2;

    @Test
    void contextLoads() {
        List<User> users1 = userMapper1.getAllUsers();
        System.out.println("user1："+users1);
        List<User> users2 = userMapper2.getAllUsers();
        System.out.println("user2："+users2);
    }
    
}
```

控制台

```
user1：[User(id=1, username=xu, address=四川), User(id=6, username=xu2, address=四川)]
user2：[User(id=1, username=zhangsan, address=四川2), User(id=2, username=lisi, address=北京2), User(id=3, username=xuxx, address=四川2)]
```