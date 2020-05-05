```
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
```

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

即==Spring Boot会根据状态码去寻找对应的页面来替换其默认的错误页。==

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