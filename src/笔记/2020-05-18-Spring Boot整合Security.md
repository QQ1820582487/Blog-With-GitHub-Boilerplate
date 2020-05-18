---
layout: post
title: Spring Boot整合Security
slug: bj21
date: 2020-05-18 15:10
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
  - Spring
  - Security
excerpt: 笔记
---

## 1.Spring Security入门

### 1.Spring Security初体验

#### 1.引入依赖

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
	<groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

#### 2.Controller

```java
@RestController
public class HelloController {
    @GetMapping("hello")
    public String hello() {
        return "Hello Security!";
    }
}
```

#### 3.测试

此时启动项目，访问`http://localhost:8080/hello`，此时会发现，会自动重定向到`http://localhost:8080/login`,也就是说`hello`接口被**Security**保护起来了，不能直接访问了。

![](..\static\笔记图片\2020-05-18-Spring Boot整合Security_01.png)

![](..\static\笔记图片\2020-05-18-Spring Boot整合Security_02.png)

输入用户名（user）和密码（每次生成的密码都不一样），登录后便能访问接口了。

### 2.手动配置Security用户和密码

#### 1.第一种：在配置文件中配置

```properties
spring.security.user.name=xuxx
spring.security.user.password=123
spring.security.user.roles=admin
```

配置后，Security便不会再生成密码了，当然也不会在控制台打印了，所以此时再登录便只能使用配置的用户（xuxx）和密码(123)了。

#### 2.第二种：编写配置类

```java

@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
	/*
    Spring5之后密码必须要加密，所以要配置PasswordEncoder
    */
    @Bean
    PasswordEncoder passwordEncoder() {
        //密码编码器，密码不加密，NoOpPasswordEncoder以过期
        return NoOpPasswordEncoder.getInstance();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        //基于内存的认证
        auth.inMemoryAuthentication()
                .withUser("xuxx").password("123").roles("admin")
                .and()
                .withUser("test").password("123").roles("users");
    }
}
```

## 2.Spring Security进阶

以上的拦截规则是除了Security的方法，会拦截其他所有的请求，为了实现多种权限配置方案，所以需要了解`HttpSecurity`的配置。

### 1.HttpSecurity的配置

还是在之前的配置类中进行配置

```java
package com.xuxx.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    /*
    Spring5之后密码必须要加密，所以必须配置PasswordEncoder
    */
    @Bean
    PasswordEncoder passwordEncoder() {
        //密码编码器，密码不加密，NoOpPasswordEncoder以过期.
        return NoOpPasswordEncoder.getInstance();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        //基于内存的认证
        auth.inMemoryAuthentication()
                .withUser("xuxx").password("123").roles("admin")
                .and()
                .withUser("test").password("123").roles("users");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()//开启授权请求配置
                .antMatchers("/admin/**")//要拦截的请求路径
                .hasRole("admin")//所需要的角色(一个)
                .antMatchers("/users/**")
                .hasAnyRole("admin", "users")//所需要的角色(其中一个)
			   //.antMatchers().access("hasAnyRole('admin','user')")//和上面效果一样
                .anyRequest()//剩下的其他的请求
                .authenticated()//认证后访问
                .and()
                .formLogin()//表单登录
                .loginProcessingUrl("/doLogin")//进行登录处理的Url
                .permitAll()//允许登录相关的所有请求
                .and()
                .csrf()
                .disable();//方便测试，关闭csrf(跨域)保护
    }
}
```

在Controller中添加两个接口

```java
@RestController
public class HelloController {
    @GetMapping("hello")
    public String hello() {
        return "Hello Security!";
    }

    @GetMapping("admin/hello")
    public String admin() {
        return "Hello admin用户";
    }

    @GetMapping("user/hello")
    public String users() {
        return "Hello user用户";
    }
```

测试结果:

使用`xuxx`登录时，可以访问定义的三个接口

使用`test`登录时，只可以访问`hello`和`user/hello`,访问`admin/hello`时报错403(权限不足)

![](..\static\笔记图片\2020-05-18-Spring Boot整合Security_03.png)
此时发现配置的`loginProcessingUrl("/doLogin")`还没用上，那么就用一用，打开**Insomnia**

使用**POST**方式访问`http://localhost:8080/doLogin?username=xuxx&password=123`

![](..\static\笔记图片\2020-05-18-Spring Boot整合Security_04.png)

虽然报了`404`,当时其实已经登录成功了，404只是因为Security登录成功后往`http://localhost:8080/`跳转，但是这个路径下没有东西，所以404了，不信的话再访问一下配置的接口，成功了。

![](..\static\笔记图片\2020-05-18-Spring Boot整合Security_05.png)

### 2.登录表单的详细配置

属于HttpSecurity中的配置

```java
package com.xuxx.security.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    /*
    Spring5之后密码必须要加密，所以必须配置PasswordEncoder
    */
    @Bean
    PasswordEncoder passwordEncoder() {
        //密码编码器，密码不加密，NoOpPasswordEncoder以过期.
        return NoOpPasswordEncoder.getInstance();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        //基于内存的认证
        auth.inMemoryAuthentication()
                .withUser("xuxx").password("123").roles("admin")
                .and()
                .withUser("test").password("123").roles("users");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()//开启授权请求配置
                .antMatchers("/admin/**")//要拦截的请求路径
                .hasRole("admin")//所需要的角色(一个)
                .antMatchers("/users/**")
                .hasAnyRole("admin", "users")//所需要的角色(其中一个)
//                .antMatchers().access("hasAnyRole('admin','user')")//和上面效果一样
                .anyRequest()//剩下的其他请求
                .authenticated()//认证后访问
                .and()
                .formLogin()//表单登录
                .loginProcessingUrl("/doLogin")//进行登录处理的Url
                .loginPage("/login")//登录页面的Url，可以配置自己的登录页面
                .usernameParameter("uname")//用户名的key，默认username
                .passwordParameter("pass")//密码的key，默认password
//                .successForwardUrl("/index")//登录成功自动跳转，一般用于前后端不分
                .successHandler(new AuthenticationSuccessHandler() {//登录成功的处理，一般用于前后端分离
                    //authentication中保存了登录成功的用户信息
                    @Override
                    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                                        Authentication authentication) throws IOException, ServletException {
                        response.setContentType("application/json;charset=utf-8");
                        PrintWriter out = response.getWriter();
                        Map<String, Object> map = new HashMap<>();
                        map.put("status", 200);
                        map.put("msg", authentication.getPrincipal());
                        out.write(new ObjectMapper().writeValueAsString(map));
                        out.flush();
                        out.close();
                    }
                })
//                .failureForwardUrl("/login_error")//登录失败自动跳转
                .failureHandler(new AuthenticationFailureHandler() {//登录失败的处理
                    @Override
                    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
                        response.setContentType("application/json;charset=utf-8");
                        PrintWriter out = response.getWriter();
                        Map<String, Object> map = new HashMap<>();
                        map.put("status", 401);
                        //根据异常类型返回错误信息，相关异常可以查看AuthenticationException的子类
                        if (exception instanceof LockedException) {
                            map.put("msg", "账户被锁定，登录失败！");
                        //Security屏蔽了UsernameNotFoundException，抛出UsernameNotFoundException也会变成BadCredentialsException，防止撞库
                        } else if (exception instanceof BadCredentialsException) {
                            map.put("msg", "用户名或密码输入错误，登录失败！");
                        } else if (exception instanceof DisabledException) {
                            map.put("msg", "账户被禁用，登录失败！");
                        } else if (exception instanceof AccountExpiredException) {
                            map.put("msg", "账户以过期，登录失败！");
                        } else if (exception instanceof CredentialsExpiredException) {
                            map.put("msg", "密码以过期，登录失败！");
                        } else {
                            map.put("msg", "因未知原因登录失败！");
                        }
                        out.write(new ObjectMapper().writeValueAsString(map));
                        out.flush();
                        out.close();
                    }
                })
                .permitAll()//允许登录相关的所有请求
                .and()
                .csrf()
                .disable();//为了方便测试，先关闭csrf(跨域)保护
    }
}
```

测试：

![](..\static\笔记图片\2020-05-18-Spring Boot整合Security_06.png)

![](..\static\笔记图片\2020-05-18-Spring Boot整合Security_07.png)

![](..\static\笔记图片\2020-05-18-Spring Boot整合Security_08.png)

### 3.注销登录配置

与登录表单配置一样，还是属于HttpSecurity中的配置

```java
package com.xuxx.security.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    /*
    Spring5之后密码必须要加密，所以必须配置PasswordEncoder
    */
    @Bean
    PasswordEncoder passwordEncoder() {
        //密码编码器，密码不加密，NoOpPasswordEncoder以过期.
        return NoOpPasswordEncoder.getInstance();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        //基于内存的认证
        auth.inMemoryAuthentication()
                .withUser("xuxx").password("123").roles("admin")
                .and()
                .withUser("test").password("123").roles("user");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()//开启授权请求配置
                .antMatchers("/admin/**")//要拦截的请求路径
                .hasRole("admin")//所需要的角色(一个)
                .antMatchers("/user/**")
                .hasAnyRole("admin", "user")//所需要的角色(其中一个)
//                .antMatchers().access("hasAnyRole('admin','user')")//和上面效果一样
                .anyRequest()//剩下的其他请求
                .authenticated()//认证后访问
                .and()
                .formLogin()//表单登录
                .loginProcessingUrl("/doLogin")//进行登录处理的Url
//                .loginPage("/login")//登录页面的Url，可以配置自己的登录页面
//                .usernameParameter("uname")//用户名的key，默认username
//                .passwordParameter("pass")//密码的key，默认password
//                .successForwardUrl("/index")//登录成功自动跳转，一般用于前后端不分
                .successHandler(new AuthenticationSuccessHandler() {//登录成功的处理，一般用于前后端分离
                    //authentication中保存了登录成功的用户信息
                    @Override
                    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                                        Authentication authentication) throws IOException, ServletException {
                        response.setContentType("application/json;charset=utf-8");
                        PrintWriter out = response.getWriter();
                        Map<String, Object> map = new HashMap<>();
                        map.put("status", 200);
                        map.put("msg", authentication.getPrincipal());
                        out.write(new ObjectMapper().writeValueAsString(map));
                        out.flush();
                        out.close();
                    }
                })
//                .failureForwardUrl("/login_error")//登录失败自动跳转
                .failureHandler(new AuthenticationFailureHandler() {//登录失败的处理
                    @Override
                    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
                        response.setContentType("application/json;charset=utf-8");
                        PrintWriter out = response.getWriter();
                        Map<String, Object> map = new HashMap<>();
                        map.put("status", 401);
                        //根据异常类型返回错误信息，相关异常可以查看AuthenticationException的子类
                        if (exception instanceof LockedException) {
                            map.put("msg", "账户被锁定，登录失败！");
                        //Security屏蔽了UsernameNotFoundException，抛出UsernameNotFoundException也会变成BadCredentialsException，防止撞库
                        } else if (exception instanceof BadCredentialsException) {
                            map.put("msg", "用户名或密码输入错误，登录失败！");
                        } else if (exception instanceof DisabledException) {
                            map.put("msg", "账户被禁用，登录失败！");
                        } else if (exception instanceof AccountExpiredException) {
                            map.put("msg", "账户以过期，登录失败！");
                        } else if (exception instanceof CredentialsExpiredException) {
                            map.put("msg", "密码以过期，登录失败！");
                        } else {
                            map.put("msg", "因未知原因登录失败！");
                        }
                        out.write(new ObjectMapper().writeValueAsString(map));
                        out.flush();
                        out.close();
                    }
                })
                .permitAll()//允许登录相关的所有请求
                .and()
                .logout()//注销登录
                .logoutUrl("/logout")
                //.logoutSuccessUrl("/login")//注销成功后自动跳转
                .logoutSuccessHandler(new LogoutSuccessHandler() {//注销成功的回调
                    @Override
                    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
                        response.setContentType("application/json;charset=utf-8");
                        PrintWriter out = response.getWriter();
                        Map<String, Object> map = new HashMap<>();
                        map.put("status", 200);
                        map.put("msg", "注销成功");
                        out.write(new ObjectMapper().writeValueAsString(map));
                        out.flush();
                        out.close();
                    }
                })
                .and()
                .csrf()
                .disable();//为了方便测试，先关闭csrf(跨域)保护
    }
}
```

测试：先登录，再访问`http://localhost:8080/logout`(GET，POST都行)

![](..\static\笔记图片\2020-05-18-Spring Boot整合Security_09.png)

### 4.多个HttpSecurity

**要先去除上面配置的单个的HttpSecurity**

```
package com.xuxx.security.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 多个Http Security的配置
 */
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class MultiHttpSecurity {
    @Bean
    PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

	//多个Http Security可以共享
    @Autowired
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.inMemoryAuthentication()
                .withUser("xuxx").password("123").roles("admin")
                .and()
                .withUser("test").password("123").roles("users");
    }

    @Configuration
    @Order(1)//存在多个相同的bean时就存在优先级的问题
    public static class AdminSecurity extends WebSecurityConfigurerAdapter {
        @Override
        protected void configure(HttpSecurity http) throws Exception {
            //只会拦截符合/admin/**的所有请求
            http.antMatcher("/admin/**").authorizeRequests().anyRequest().hasRole("admin");
        }
    }

    @Configuration
    //@Order//不配置order时是优先级最低的,2的31次方-1
    public static class OtherSecurity extends WebSecurityConfigurerAdapter {
        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http.authorizeRequests().anyRequest().authenticated()
                    .and()
                    .formLogin()
                    .loginProcessingUrl("/doLogin")
                    .permitAll()
                    .and()
                    .csrf()
                    .disable();
        }
    }
}
```

测试

![](..\static\笔记图片\2020-05-18-Spring Boot整合Security_10.png)

![](..\static\笔记图片\2020-05-18-Spring Boot整合Security_11.png)

因为使用`xuxx`登录了，访问其他接口也是可以的。

再使用`test`登录试试

![](..\static\笔记图片\2020-05-18-Spring Boot整合Security_12.png)

![](..\static\笔记图片\2020-05-18-Spring Boot整合Security_13.png)

### 5.密码加密

上面的例子都是使用的明文密码，这是非常不安全的，所以还是加密下吧。

由Spring Security提供的BCryptPasswordEncoder采用SHA-256+随机盐+密钥对明文密码进行加密。SHA系列是哈希算法，不是加密算法，使用加密算法意味着可以解密（这个与编码/解码一样），但是采用哈希处理，其过程是不可逆的。

1. 加密(encode)：注册用户时，使用SHA-256+随机盐+密钥把用户输入的密码进行哈希处理，得到密码的哈希值，然后将其存入数据库中。

2. 密码匹配(matches)：用户登录时，密码匹配阶段并没有进行密码解密（因为密码经过Hash处理，是不可逆的），而是使用相同的算法把用户输入的密码进行哈希处理，得到密码的hash值，然后将其与从数据库中查询到的密码哈希值进行比较。如果两者相同，说明用户输入的密码正确。

这正是为什么处理密码时要用哈希算法，而不用加密算法。因为这样处理后，即使数据库泄漏，黑客也很难破解密码（只能用彩虹表）。

先看看效果

```java
@SpringBootTest
class SecurityApplicationTests {

    @Test
    void contextLoads() {
        for (int i = 0; i < 10; i++) {
            //构造方法可以传入强度(密钥迭代次数)默认为10次
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            System.out.println(passwordEncoder.encode("123"));
        }
    }
}
```

虽然只是加密**123**,但是每次的结果都不同。

```
$2a$10$cGdG1DACEh2t4AekoCiZ1OyJWHbT4N3kFtSGDg85XNjn6SFb2cDYG
$2a$10$nFCK0tHN3lDXCi8ptZd64usYbxU8gKTRiOSTZ8o1uvfEqWB5C9fwu
$2a$10$1uP74goNp/gwHZehn3Lqfeyz51BnLGCG5xg63zRnIDTZoMa7lJeje
$2a$10$N4CdezU05HFf05cK.eTh3uSuzS6NV1gODD9h3nNdmK71Fp81mYMwy
$2a$10$/tdqqGfDrHh3Jx6IbGOLeu7hJ86IVYljImUDfrzQP5EsVbx70Sy/q
$2a$10$bK6ItziD2vcMdvgiUZ5PkudaMxkswnz7RhEKnCsmhl/bGFWGnA0XG
$2a$10$MIBXmxMyQFtrQ4awOtELXOBAvE8d1B54gCsv0kG6mPM9EooY35MPq
$2a$10$0zCKSIqQVMhJM8OGs/35tOne2EZK/oj.v6LXjkH1FlYPNRdipjdhu
$2a$10$9x/3T.nAUM1YOWhhR1xORuZEbRad5mc3.Rh6MBE2pPkNGUIUG9mYa
$2a$10$xprjfwyAndoCSO3uFjS5ce7lLslmnKo7fNo/jOuEifN4PEZjy8ZTu
```

简单使用一下，改造上面的**MultiHttpSecurity**，将明文密码换成使用**BCryptPasswordEncoder**生成的加密后的密码，当然，要注入的**PasswordEncoder**也要换成**BCryptPasswordEncoder**。

```
/**
 * 多个Http Security的配置
 */
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class MultiHttpSecurity {
    @Bean
    PasswordEncoder passwordEncoder() {
//        return NoOpPasswordEncoder.getInstance();
        return new BCryptPasswordEncoder();
    }

    //多个Http Security可以共享
    @Autowired
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.inMemoryAuthentication()
//                .withUser("xuxx").password("123").roles("admin")
                .withUser("xuxx").password("$2a$10$gqUyIaadTdNQYVq7M1iRFO4Wl/sdvCPBvrBUwlX7u8qjbRFU7EoRK").roles("admin")
                .and()
//                .withUser("test").password("123").roles("users");
                .withUser("test").password("$2a$10$tKe91qK4VcLRfS0rQ2THaeF/beXZKq283HaYJdogaOIVbiB7HaQ0u").roles("users");
    }

    @Configuration
    @Order(1)//存在多个相同的bean时就存在优先级的问题
    public static class AdminSecurity extends WebSecurityConfigurerAdapter {
        @Override
        protected void configure(HttpSecurity http) throws Exception {
            //只会拦截符合/admin/**的所有请求
            http.antMatcher("/admin/**").authorizeRequests().anyRequest().hasRole("admin");
        }
    }

    @Configuration
    //@Order//不配置order时是优先级最低的,2的31次方-1
    public static class OtherSecurity extends WebSecurityConfigurerAdapter {
        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http.authorizeRequests().anyRequest().authenticated()
                    .and()
                    .formLogin()
                    .loginProcessingUrl("/doLogin")
                    .permitAll()
                    .and()
                    .csrf()
                    .disable();
        }
    }
}
```

测试：此时密码还是使用`123`依旧可以登录，但是如果此时要存储的密码的话，那么要存储的密码已经加密了。

![](..\static\笔记图片\2020-05-18-Spring Boot整合Security_14.png)