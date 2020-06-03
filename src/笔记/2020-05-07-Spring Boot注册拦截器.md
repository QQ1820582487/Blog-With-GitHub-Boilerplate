---
layout: post
title: Spring Boot注册拦截器
slug: bj13
date: 2020-05-07 01:50
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
  - Spring Boot
excerpt: 笔记
---

#### 1. 编写Controller

```java
@RestController
public class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello";
    }
}
```

#### 2.  编写拦截器

```java
/**
 * 定义自定义拦截器
 */
public class MyInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("preHandle方法");
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        System.out.println("postHandle方法");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        System.out.println("afterCompletion方法");
    }
}
```

#### 3.配置拦截器

```java
/**
 * 配置自定义拦截器
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    //注入自定义拦截器
    @Bean
    MyInterceptor myInterceptor() {
        return new MyInterceptor();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        //拦截所有路径 存在多个拦截器时要配置优先级
        registry.addInterceptor(myInterceptor()).addPathPatterns("/**");
    }
}
```

#### 4. 测试

![](..\static\笔记图片\2020-05-07-Spring Boot注册拦截器_01.png)

