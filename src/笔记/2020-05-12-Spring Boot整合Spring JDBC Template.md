---
layout: post
title: Spring Boot整合Spring JDBC Template
slug: bj18
date: 2020-05-12 16:20
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
  - Spring Boot
  - Jdbc Template
excerpt: 笔记
---

## 1.简单使用

#### 1.添加依赖

```xml
		<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
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
		<!--也可以只引入druid，但是配置多数据源要starter-->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid-spring-boot-starter</artifactId>
            <version>1.1.20</version>
        </dependency>
```

#### 2.配置数据源

```properties
spring.datasource.type=com.alibaba.druid.pool.DruidDataSource
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/test
spring.datasource.username=root
spring.datasource.password=root
```

#### 3.写代码

```java
//bean
@Data
public class User {
    private Integer id;
    private String username;
    private String address;
}
```

```java
@Service
public class UserService {
    @Autowired
	private JdbcTemplate jdbcTemplate;
	//添加
    public Integer adduser(User user) {
        return jdbcTemplate.update("insert into user (username,address) values (?,?)",
                user.getUsername(), user.getAddress());
    }
    //更新
    public Integer updateUserById(User user) {
        return jdbcTemplate.update("update user set username = ?,address = ? where id = ? ",
                user.getUsername(), user.getAddress(), user.getId());

    }
    //删除
    public Integer delUserById(Integer id) {
        return jdbcTemplate.update("delete from user where id = ? ", id);
    }
    
    //查询
    //字段名与属性名不一致时，需要手动映射
    public List<User> getAllUsers01() {
        return jdbcTemplate.query("select * from user", new RowMapper<User>() {
            @Override
            public User mapRow(ResultSet rs, int rowNum) throws SQLException {
                //ResultSet已经进行了游标移动了（不用再调用next()）
                User user = new User();
                int id = rs.getInt("id");
                String username = rs.getString("username");
                String address = rs.getString("address");
                user.setId(id);
                user.setUsername(username);
                user.setAddress(address);
                return user;
            }
        });
    }
    
    //字段名与属性名一致时，自动映射
    public List<User> getAllUsers() {
        return jdbcTemplate.query("select * from user", new BeanPropertyRowMapper<>(User.class));
    }
    
    //查询单个
    public User getUserById(Integer id) {
        return jdbcTemplate.queryForObject("select * from user where id = ? ", new BeanPropertyRowMapper<>(User.class), id);
    }
}
```

```java
@SpringBootTest
class JdbctemplateApplicationTests {
    @Autowired
    private UserService userService;

    @Test
    void contextLoads1() {
        User user = new User();
        user.setUsername("xuxx");
        user.setAddress("四川");
        Integer adduser = userService.adduser(user);
        if (adduser == 1) {
            System.out.println("添加执行成功");
        }
    }

    @Test
    void contextLoads2() {
        User user = new User();
        user.setId(4);
        user.setUsername("xuxx02");
        user.setAddress("四川02");
        Integer adduser = userService.updateUserById(user);
        if (adduser == 1) {
            System.out.println("更新执行成功");
        }
    }

    @Test
    void contextLoads3() {
        if (userService.delUserById(4) == 1) {
            System.out.println("删除执行成功");
        }
    }
    
    @Test
    void contextLoads5() {
        User user = userService.getUserById(1);
        System.out.println(user);
    }
}
```

## 2.整合多数据源

#### 1.添加依赖

```xml
		<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
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
		<!--也可以只引入druid，但是配置多数据源要starter-->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid-spring-boot-starter</artifactId>
            <version>1.1.20</version>
        </dependency>
```

#### 2.配置多数据源

```properties
#配置多数据源，此时数据源相关的自动化配置失效（key不能被识别了）
spring.datasource.one.type=com.alibaba.druid.pool.DruidDataSource
spring.datasource.one.url=jdbc:mysql://127.0.0.1:3306/test
spring.datasource.one.username=root
spring.datasource.one.password=root

spring.datasource.two.type=com.alibaba.druid.pool.DruidDataSource
spring.datasource.two.url=jdbc:mysql://127.0.0.1:3306/test2
spring.datasource.two.username=root
spring.datasource.two.password=root
```

#### 3.写代码

1. 配置`DataSource`

```java
@Configuration
public class DataSourceConfig {

    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.one")
    DataSource dataSource1() {
        return DruidDataSourceBuilder.create().build();
    }

    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.two")
    DataSource dataSource2() {
        return DruidDataSourceBuilder.create().build();
    }

}
```

2. 配置`JdbcTemplate`

```java
@Configuration
public class JdbcTemplateConfig {

    @Bean
    JdbcTemplate jdbcTemplate1(@Qualifier("dataSource1") DataSource ds1) {
        return new JdbcTemplate(ds1);
    }

    @Bean
    JdbcTemplate jdbcTemplate2(@Qualifier("dataSource2") DataSource ds2) {
        return new JdbcTemplate(ds2);
    }
}
```

3. Service（beanh还是User）

```java
@Service
public class UserService2 {
    @Autowired
    @Qualifier("jdbcTemplate1")
    JdbcTemplate jdbcTemplate1;

    @Resource(name = "jdbcTemplate2")
    JdbcTemplate jdbcTemplate2;

    public List<User> getAllUsers1() {
        return jdbcTemplate1.query("select * from user", new BeanPropertyRowMapper<>(User.class));
    }

    public List<User> getAllUsers2() {
        return jdbcTemplate2.query("select * from user", new BeanPropertyRowMapper<>(User.class));
    }
}
```

4. 测试

```java
@SpringBootTest
class JdbctemplateApplicationTests2 {
    @Autowired
    private UserService2 userService2;

    @Test
    void test1() {
        List<User> users1 = userService2.getAllUsers1();
        System.out.println(users1);
        System.out.println("----------------------");
        List<User> users2 = userService2.getAllUsers2();
        System.out.println(users2);
    }
}
```

补充：由于配置了多数据源，所以在注入JdbcTemplate时，需要如下

```java
@Autowired
@Qualifier("jdbcTemplate1")//配置了多数据源后
private JdbcTemplate jdbcTemplate;
//或者
@Resource(name = "jdbcTemplate2")
private JdbcTemplate jdbcTemplate2;
```

