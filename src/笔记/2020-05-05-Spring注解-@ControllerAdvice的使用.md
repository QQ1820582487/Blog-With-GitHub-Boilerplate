---
layout: post
title: Spring注解-@ControllerAdvice的使用
slug: bj10
date: 2020-05-05 02:20
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
  - Spring
excerpt: 笔记
---

## Spring注解-@ControllerAdvice的使用

根据源码中的介绍：

`@ControllerAdvice`是一个特殊的`@Component`，用于标识一个类，这个类中被以下三种注解标识的方法：`@ExceptionHandler`，`@InitBinder`，`@ModelAttribute`，将作用于所有的`@Controller`类的接口上。

@ControllerAdvice的功能:

- **处理全局异**
- **预设全局数据**
- **请求参数预处理**

### 1. @ControllerAdvice处理全局异常
使用Spring时，后端出现错误时，在前端的报错提示对用户来说相当不友好，所以应该对异常进行处理，当时对每一个Controller单独进行处理过于重复，所以可以使用@ControllerAdvice处理全局异常

例如：当上传文件大小超出限时，前端显示如下

![](..\static\笔记图片\2020-05-05-Spring注解-@ControllerAdvice的使用_01.png)
解决：

```java
@ControllerAdvice//@Controller的增强
public class MyCustomException {
    //配置要拦截的异常
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    //其中的参数与Controller的参数相似
    public void myexception(MaxUploadSizeExceededException exception, HttpServletResponse response) throws IOException {
        response.setContentType("text/html:charset=utf-8");
        PrintWriter out = response.getWriter();
        out.write("上传文件大小超出限制，请重试");
        out.flush();
        out.close();
    }
}
```

此时再出现上面的错误时，前端便会显示指定的内容

```
上传文件大小超出限制，请重试
```

**使用thymeleaf自定义错误页面**

1. 引入thymeleaf依赖

```xml
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

2. 创建错误页面

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>错误页</title>
</head>
<body>
<div th:text="${error}"></div>
</body>
</html>
```

3. 编写自定义异常处理类

```java
@ControllerAdvice
public class MyCustomException {
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ModelAndView myexception(MaxUploadSizeExceededException e) throws IOException {
        ModelAndView mv = new ModelAndView("myerror");
        mv.addObject("error", "上传文件大小超出限制");
        return mv;
    }
}

```

4. 效果

```html
上传文件大小超出限制，请重试
```

### 2. @ControllerAdvice预设全局数据

1. 编写预设全局数据类

   ```java
   @ControllerAdvice
   public class GlobalData {
       @ModelAttribute(value = "info")
       public Map<String, Object> mydata() {
           Map<String, Object> map = new HashMap<>();
           map.put("name", "xuxx");
           map.put("addr", "四川");
           return map;
       }
   }
   ```

   在这个类中，使用了@ModelAttribute注解，此注解将方法返回值添加到Model对象，要使用存入的数据时，可以从Model对象中取出。

2. 使用预设全局数据

   ```java
   @RestController
   public class HelloController {
       @GetMapping("/hello")
       public void hello(Model model) {
           Map<String, Object> map = model.asMap();
           Set<String> keySet = map.keySet();
           for (String kay : keySet) {
               System.out.println(kay + " : " + map.get(kay));
           }
           return;
       }
   }
   ```

   控制台输出

   ```java
   info : {name=xuxx, addr=四川}
   ```
   
   补充：
   
   @ModelAttribute注解
   
   作用：
   
   1. 出现在方法上:表示当前方法会在控制器方法执行前线执行。
   2. 出现在参数上:获取指定的数据给参数赋值。
   
   应用场景：
      当提交表单数据不是完整的实体数据时,保证没有提交的字段使用数据库原来的数据。
   
   

###    3.  @ControllerAdvice请求参数预处理

1. **问题演示**

   编写实体类
   
   ```java
   @Data
   public class Book {
       private String name;
       private Double price;
}
   ```
   
   ```java
   @Data
   public class Auther {
       private String name;
       private Integer age;
}
   ```
   
   编写Controller
   ```java
   @RestController
   public class BookController {
       @PostMapping("/book")
       public void addbook(Book book,Auther auther) {
           System.out.println(book);
           System.out.println(auther);
       }
}
   ```
   
    发送请求![](..\static\笔记图片\2020-05-05-Spring注解-@ControllerAdvice的使用_02.png)
   
   控制台：
   
   ```java
   Book{name='书名,作者名', price=100.0}
   Auther{name='书名,作者名', age=21}
   ```
   
   这是由于两个对象属性名相同**(此处只是为了演示问题，实际开发时要注意)**导致的。
   
2. **解决问题**

   改写Controller
   
   ```
   @RestController
   public class BookController {
       @PostMapping("/book")
       public void addbook(@ModelAttribute("b") Book book,
                           @ModelAttribute("a") Auther auther) {
           System.out.println(book);
           System.out.println(auther);
       }
   }
   ```
   
   编写ControllerAdvice类
   
   ```
   @ControllerAdvice
   public class GlobalData {
       @InitBinder("a")
       public void initA(WebDataBinder binder) {
           binder.setFieldDefaultPrefix("a.");
       }
   
       @InitBinder("b")
       public void initB(WebDataBinder binder) {
           binder.setFieldDefaultPrefix("b.");
       }
   }
   ```
   
   WebDataBinder对象它的作用就是从`web request `里（**注意：这里指的web请求，并不一定就是ServletRequest请求哟~**）把web请求的`parameters`绑定到`JavaBean`上。
   
   WebDataBinder对象还有许多方法~~
   
   `Controller`方法的参数类型可以是基本类型，也可以是封装后的普通Java类型。**若这个普通Java类型没有声明任何注解，则意味着它的每一个属性都需要到Request中去查找对应的请求参数。**
   
   
   
   发送请求
   
   ![](..\static\笔记图片\2020-05-05-Spring注解-@ControllerAdvice的使用_03.png)
   
   控制台：
   
   ```java
   Book{name='书名', price=100.0}
   Auther{name='作者名', age=21}
   ```
   
   