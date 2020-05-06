---
layout: post
title: Spring Boot中的自定义异常处理
slug: bj11
date: 2020-05-06 02:50
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - java
  - spring
excerpt: 笔记
---


## Spring Boot中的自定义异常处理

#### 1. Spring Boot实现自定义错误页

演示

```java
@RestController
public class HelloController {
    @GetMapping("/hello")
    public String hello() {
        int i = 1 / 0;
        return "hello";
    }
}
```

访问结果

![访问结果](..\static\笔记图片\2020-05-06-Spring Boot中的自定义异常处理_01.png)

**配置默认的error页面**

在`src\main\resources\static`目录下创建`error`目录,创建如：404.HTML,500.HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>404</title>
</head>
<body>
<h2>404错误页面</h2>
</body>
</html>

--------------------------------

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>500</title>
</head>
<body>
<h2>500错误页面</h2>
</body>
</html>
```

再次访问便会看到`500.HTML`中的内容（Controller中有int i = 1 / 0）;如果访问`http://localhost:8080/hello2`等会出现404错误的路径便会看到`404.HTML`的内容。

即**Spring Boot会根据状态码去寻找对应的页面来替换其默认的错误页。**

**错误页面查找顺序：精确>模糊，动态>静态**

Spring Boot还支持模糊的错误页匹配，例如只定义了`4xx.HTML`，出现4XX错误时，都会展示`4xx.HTML`的内容。

当然，如果定义了`404.HTML`和`4xx.HTML`页面，出现`404`错误时，Spring Boot会优先展示`404.HTML`的内容。

以上都是使用**静态页面(static目录下)**展示错误信息，但是Spring Boot还支持**动态页面(templates目录下)**,如：thymeleaf、freemarker。

测试一下，使用thymeleaf来自定义错误页面

1. 导入thymeleaf依赖

   ```xml
   <dependency>
   	<groupId>org.springframework.boot</groupId>
   	<artifactId>spring-boot-starter-thymeleaf</artifactId>
   </dependency>
   ```

2. 在`src\main\resources\templates`目录下创建`error`目录,并创建自定义错误页

   创建如下3个页面

   ```html
   <!--4xx.HTML-->
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <title>4xx</title>
   </head>
   <body>
   <h2>thymeleaf:4xx页面</h2>
   </body>
   </html>
   
   -------------------------------------
   <!--404.HTML-->
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <title>404</title>
   </head>
   <body>
   <h2>thymeleaf:404页面</h2>
   </body>
   </html>
   
   -------------------------------------
   <!--5xx.HTML-->
   <!DOCTYPE html>
   <html lang="en" xmlns:th="http://www.thymeleaf.org">
   <head>
       <meta charset="UTF-8">
       <title>5xx</title>
   </head>
   <body>
   <h2>thymeleaf: 5xx页面</h2>
   </body>
   </html>
   ```

   与静态错误页一样，动态错误页也是优先展示更为精确的状态码所对应的错误页内容。

   例：在存在以上3个动态错误页时，如果出现`404`错误，优先展示的也是`404.HTML`的内容。

   此时已经创建了静态错误页和动态错误页，那么此时会优先展示动态错误页。

#### 2. Spring Boot异常处理源码分析

打开Spring Boot异常处理的自动配置类`org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration`

其中配置了`DefaultErrorAttributes(默认错误属性)`、`DefaultErrorViewResolver(默认错误视图解析器)`等等

为什么在`error`目录下创建自定义错误页会被解析呢？

为什么**错误页面查找顺序：精确>模糊，动态>静态** 呢？

答案在`DefaultErrorViewResolver`类中。

```java
//DefaultErrorViewResolver类

@Override
	public ModelAndView resolveErrorView(HttpServletRequest request, HttpStatus status, Map<String, Object> model) {
        //status.value()返回的是int类型的状态码，model是异常数据
		ModelAndView modelAndView = resolve(String.valueOf(status.value()), model);
        //在静态资源路径下没有找到精确对应的错误页面时再判断是否存在模糊对应的错误页面
        //SERIES_VIEWS中只有"4xx"和"5xx"
		if (modelAndView == null && SERIES_VIEWS.containsKey(status.series())) {
            //存在模糊对应的错误页面时，再次使用模糊的状态码进行处理
			modelAndView = resolve(SERIES_VIEWS.get(status.series()), model);
		}
        //如果精确的和模糊的错误页都不存在，便使用自身默认的错误页面
		return modelAndView;
	}
...

private ModelAndView resolve(String viewName, Map<String, Object> model) {
		String errorViewName = "error/" + viewName;
    	//判断是否存在动态页面
		TemplateAvailabilityProvider provider = this.templateAvailabilityProviders.getProvider(errorViewName,
				this.applicationContext);
    	//存在动态页面就优先使用动态页面
		if (provider != null) {
			return new ModelAndView(errorViewName, model);
		}
		return resolveResource(errorViewName, model);
	}


    	private ModelAndView resolveResource(String viewName, Map<String, Object> model) {
		for (String location : this.resourceProperties.getStaticLocations()) {
			try {
                //查找静态资源路径 4个 
                /*{ "classpath:/META-INF/resources/",
                "classpath:/resources/", "classpath:/static/", "classpath:/public/" }*/
				Resource resource = this.applicationContext.getResource(location);
				resource = resource.createRelative(viewName + ".html");
				if (resource.exists()) {
					return new ModelAndView(new HtmlResourceView(resource), model);
				}
			}
			catch (Exception ex) {
			}
		}
        //在静态资源路径下没有找到对应的错误页面就返回null
		return null;
	}
```

#### 3. Spring Boot自定义异常数据

经过查看Spring Boot异常处理的自动配置类`org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration`可知`DefaultErrorAttributes`类中定义了默认的异常数据处理逻辑。

包含了以下异常数据:

```
timestamp - The time that the errors were extracted(出现错误的时间)
status - The status code（状态码）
error - The error reason（错误原因）
exception - The class name of the root exception (if configured)（根异常的类名（如果已配置））
message - The exception message（异常消息）
errors - Any ObjectErrors from a BindingResult exception（BindingResult异常中的任何ObjectError）
trace - The exception stack trace（异常堆栈跟踪）
path - The URL path when the exception was raised（引发异常时的URL路径）
```

编写自定义错误页`5xx.HTML`来查看

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>5xx</title>
</head>
<body>
<h2>thymeleaf: 5xx页面</h2>
<table>
    <tr>
        <td>path</td>
        <td th:text="${path}"></td>
    </tr>
    <tr>
        <td>timestamp</td>
        <td th:text="${timestamp}"></td>
    </tr>
    <tr>
        <td>message</td>
        <td th:text="${message}"></td>
    </tr>
    <tr>
        <td>error</td>
        <td th:text="${error}"></td>
    </tr>
    <tr>
        <td>status</td>
        <td th:text="${status}"></td>
    </tr>
    <tr>
        <td>exception</td>
        <td th:text="${exception}"></td>
    </tr>
</table>
</body>
</html>
```

访问结果:(访问的Controller中有by zero错误)

![访问结果](..\static\笔记图片\2020-05-06-Spring Boot中的自定义异常处理_02.png)

为了自定义异常数据，可以直接继承`DefaultErrorAttributes`类，然后新增或重写其方法。

```java
/* 注册到spring以替换DefaultErrorAttributes
ErrorMvcAutoConfiguration中有条件判断:当存在ErrorAttributes.class(DefaultErrorAttributes实现的接口)时，DefaultErrorAttributes不生效.
...
@ConditionalOnMissingBean(value = ErrorAttributes.class, search = SearchStrategy.CURRENT)
	public DefaultErrorAttributes errorAttributes() {
		return new DefaultErrorAttributes(this.serverProperties.getError().isIncludeException());
	}
*/
@Component
public class MyErrorAttribute extends DefaultErrorAttributes {
    @Override
    public Map<String, Object> getErrorAttributes(WebRequest webRequest, boolean includeStackTrace) {
        //拿到DefaultErrorAttributes类中收集好的异常信息
        Map<String, Object> map = super.getErrorAttributes(webRequest, includeStackTrace);
        //添加自定义异常信息
        map.put("myerror", "自定义异常信息");
        return map;
}
```

在`5xx.HTML`中添加一列

```html
...
<h2>thymeleaf: 500页面</h2>
...
    <tr>
        <td>myerror</td>
        <td th:text="${myerror}"></td>
    </tr>
...
```

访问结果:(访问的Controller中有by zero错误)

![访问结果](..\static\笔记图片\2020-05-06-Spring Boot中的自定义异常处理_03.png)

#### 4. Spring Boot自定义异常视图

与自定义异常数据类似，Spring Boot异常处理的自动配置类`org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration`中定义了`DefaultErrorViewResolver`类中用于异常视图处理。要自定义异常视图处理，继承`DefaultErrorViewResolver`类，然后新增或重写其方法就行了。

```java
@Component
public class MyErrorViewResolver extends DefaultErrorViewResolver {
    public MyErrorViewResolver(ApplicationContext applicationContext, ResourceProperties resourceProperties) {
        super(applicationContext, resourceProperties);
    }

    @Override
    public ModelAndView resolveErrorView(HttpServletRequest request, HttpStatus status, Map<String, Object> model) {
        //这里的model就是异常数据，但是它是一个不可修改的map，要在这修改可以new一个map，将model的数据复制进来再添加到mv返回
        ModelAndView mv = new ModelAndView();
        mv.setViewName("xuxx");
        mv.addAllObjects(model);
        return mv;
    }
}
```

新建`xuxx.HTML`直接放在`src\main\resources\templates`目录下即可（因为自定义的MyErrorViewResolver中设置的ViewName不带路径了，又因为是用thymeleaf）

```
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>xuxx页面</title>
</head>
<body>
<h2>xuxx: 5xx</h2>
<table>
    <tr>
        <td>path</td>
        <td th:text="${path}"></td>
    </tr>
    <tr>
        <td>timestamp</td>
        <td th:text="${timestamp}"></td>
    </tr>
    <tr>
        <td>message</td>
        <td th:text="${message}"></td>
    </tr>
    <tr>
        <td>error</td>
        <td th:text="${error}"></td>
    </tr>
    <tr>
        <td>status</td>
        <td th:text="${status}"></td>
    </tr>
    <tr>
        <td>myerror</td>
        <td th:text="${myerror}"></td>
    </tr>
</table>
</body>
</html>
```

访问结果：

![访问结果](..\static\笔记图片\2020-05-06-Spring Boot中的自定义异常处理_04.png)

