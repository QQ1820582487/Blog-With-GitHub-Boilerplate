---
layout: post
title: Spring+Spring MVC环境（Java配置）搭建
slug: bj02
date: 2019-12-29 05:58
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
  - Spring
excerpt: 笔记
---

### 1.创建工程

添加spring-webmvc依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.xuxx</groupId>
    <artifactId>java_ssm</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>war</packaging>

    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>5.2.2.RELEASE</version>
        </dependency>
    </dependencies>

</project>
```

### 2.创建java配置类

##### 1. Spring配置类

```java
package com.xuxx.controller;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.stereotype.Controller;

@Configuration
@ComponentScan(basePackages = "com.xuxx",useDefaultFilters = true,
        excludeFilters = {@ComponentScan.Filter(type = FilterType.ANNOTATION,classes = Controller.class)})
public class SpringConfig {

}

```
##### 2.SpringMvc配置类

```java
package com.xuxx.controller;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.stereotype.Controller;

@Configuration
@ComponentScan(basePackages = "com.xuxx",useDefaultFilters = false,
        includeFilters = {@ComponentScan.Filter(type = FilterType.ANNOTATION,classes = Controller.class)})
public class SpringMvcConfig {
}
```

##### 3.web.xml 配置类

```java
package com.xuxx.controller;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;

/**
 * web.xml 配置类
 */
public class WebInit implements WebApplicationInitializer {
    @Override
    public void onStartup(javax.servlet.ServletContext servletContext) throws ServletException {
        AnnotationConfigWebApplicationContext context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(servletContext);
        context.register(SpringMvcConfig.class);

        ServletRegistration.Dynamic springmvc = servletContext.addServlet("springmvc", new DispatcherServlet(context));
        springmvc.addMapping("/");
        springmvc.setLoadOnStartup(1);
    }
}
```

### 3.测试

##### 1.未注入service

1.controller

```java
package com.xuxx.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping(value = "/hello", produces = "text/html;charset=utf-8")
    public String hello() {
        return "hello 期末考试";
    }
}
```

此时没问题

但是

##### 2.注入service

```java
@RestController
public class HelloController {
    @Autowired
    HelloService helloService;
    @GetMapping(value = "/hello", produces = "text/html;charset=utf-8")
    public String hello() {
        //        return "hello 期末考试";
        return helloService.sayHello();
    }
}
```

```java
@Service
public class HelloService {
    public String sayHello() {
        return "Hello 期末考试";
    }
}
```

执行报错

```java
29-Dec-2019 05:01:12.457 严重 [RMI TCP Connection(3)-127.0.0.1] org.springframework.web.servlet.FrameworkServlet.initServletBean Context initialization failed
	org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'helloController': Unsatisfied dependency expressed through field 'helloService'; nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'com.xuxx.service.HelloService' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
```

原因是service没有注入进来，此时只加载了springmvc的配置类，还需要加载spring的配置类

```java
/**
 * spring mvc配置类
 */
@Configuration
@ComponentScan(basePackages = "com.xuxx",useDefaultFilters = false,
        includeFilters = {@ComponentScan.Filter(type = FilterType.ANNOTATION,classes = Controller.class),
                @ComponentScan.Filter(type = FilterType.ANNOTATION,classes = Configuration.class)})
public class SpringMvcConfig {
}
```

此时在运行就没问题了（注：**开发中直接全部注入就行，不用再单独配置@ComponentScan.Filter**）

### 4.扩展    WebMvcConfigurationSupport

**注：WebMvcConfigurationSupport中可以配置springmvc.xml中所有的方法**

![](..\images\笔记\3.png)

#### 1.配置静态资源解析器

###### 1.1.在resources目录下创建static目录，创建hello.HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
	<h1>Hello world</h1>
</body>
</html>
```

###### 1.2修改SpringMvc配置类,继承WebMvcConfigurationSupport

```java
@Configuration
@ComponentScan(basePackages = "com.xuxx", useDefaultFilters = false,
        includeFilters = {@ComponentScan.Filter(type = FilterType.ANNOTATION, classes = Controller.class),@ComponentScan.Filter(type = FilterType.ANNOTATION, classes = Configuration.class)})
public class SpringMvcConfig extends WebMvcConfigurationSupport {
    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {    
        registry.addResourceHandler("/static/**").addResourceLocations("classpath:/static/");
        
    }
}
```

1.3访问静态资源,成功

![](..\images\笔记\4.png)

#### 2.配置拦截器

###### 2.1自定义拦截器，继承`HandlerInterceptor`，重新其方法

```java
package com.xuxx.interceptor;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class MyInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("preHandle方法执行了");
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        System.out.println("postHandle方法执行了");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        System.out.println("afterCompletion方法执行了");
    }
}
```

###### 2.2配置

```java
/**
 * spring mvc配置类
 */
....
    @Bean
    MyInterceptor myInterceptor() {
        return new MyInterceptor();
    }

    @Override
    protected void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(myInterceptor()).addPathPatterns("/**");
    }
```

###### 2.3访问任意路径

![](..\images\笔记\5.png)

#### 3.配置fastjson

##### 3.1添加fastjson 依赖

```xml
<dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>1.2.62</version>
</dependency>
```

##### 3.2编写controller

```java
package com.xuxx.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
public class JsonController {
    @GetMapping(value = "/data", produces = "text/html;charset=utf-8")
    public List<String> getData() {
        ArrayList<String> list = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            list.add("xuxx >> " + i);
        }
        return list;
    }
}
```

###### 3.3配置

```java
/**
 * spring mvc配置类
 */
....
	@Override
    protected void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        FastJsonHttpMessageConverter converter = new FastJsonHttpMessageConverter();
        converters.add(converter);
    }
```

###### 3.4测试

