---
layout: post
title: Spring Boot整合Swagger
slug: bj23
date: 2020-05-27 23:50
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
  - Spring
  - Swagger
excerpt: 笔记
---

## 1. Swagger简介

**前后端分离**

- 前端 -> 前端控制层、视图层
- 后端 -> 后端控制层、服务层、数据访问层
- 前后端通过API进行交互
- 前后端相对独立且松耦合

**产生的问题**

- 前后端集成，前端或者后端无法做到“及时协商，尽早解决”，最终导致问题集中爆发

**解决方案**

- 首先定义schema [ 计划的提纲 ]，并实时跟踪最新的API，降低集成风险

**Swagger**

- 号称世界上最流行的API框架
- Restful Api 文档在线自动生成器 => **API 文档 与API 定义同步更新**
- 直接运行，在线测试API
- 支持多种语言 （如：Java，PHP等）
- 官网：https://swagger.io/



## 2. Spring Boot集成Swagger

**Spring Boot集成Swagger** -> **springfox**，两个jar包

- **Springfox-swagger2**
- **swagger-springmvc**

**使用Swagger**

要求：jdk 1.8 + 否则swagger2无法运行

步骤：

1、新建一个Spring Boot-web项目

2、添加Maven依赖

```xml
<!-- https://mvnrepository.com/artifact/io.springfox/springfox-swagger2 -->
<dependency>
	<groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>2.9.2</version>
</dependency>
<!-- https://mvnrepository.com/artifact/io.springfox/springfox-swagger-ui -->
<dependency>
	<groupId>io.springfox</groupId>
	<artifactId>springfox-swagger-ui</artifactId>
	<version>2.9.2</version>
</dependency>
```

3、编写HelloController，测试确保运行成功！

4、要使用Swagger，需要编写一个配置类-SwaggerConfig来配置 Swagger

```java
@Configuration
@EnableSwagger2// 开启Swagger2
public class SwaggerConfig {  }
```

5、访问测试 ：http://localhost:8080/swagger-ui.html ，可以看到swagger的界面；

![](..\static\笔记图片\2020-05-27-Spring Boot整合Swagger_01.png)



## 3. 配置Swagger

1、Swagger实例Bean是Docket，所以通过配置Docket实例来配置Swaggger。

```java
@Bean //配置docket以配置Swagger具体参数
public Docket docket() {   
	return new Docket(DocumentationType.SWAGGER_2);
}
```

2、可以通过apiInfo()属性配置文档信息

```java
    //配置API描述信息>>>ApiInfo
    private ApiInfo apiInfo() {
        //作者信息
        Contact contact = new Contact("Xuxx", "暂无", "xuxx3319@gmail.com");
        return new ApiInfo(
                "API信息",
                "ApI描述",
                "v1.0",
                "服务条款网址",
                contact,
                "Apache 2.0",
                "http://www.apache.org/licenses/LICENSE-2.0",
                new ArrayList<VendorExtension>());
    }
```

3、Docket 实例关联上 apiInfo()

```java
//配置Swagger的Docket
@Bean
public Docket docket() {
	return new Docket(DocumentationType.SWAGGER_2)
    	.apiInfo(apiInfo());
}
```

4、重启项目，访问测试 http://localhost:8080/swagger-ui.html  看下效果；

![](..\static\笔记图片\2020-05-27-Spring Boot整合Swagger_02.png)

## 4. 配置扫描接口

1、构建Docket时通过select()方法配置怎么扫描接口。

```java
    //配置Swagger的Docket
    @Bean
    public Docket docket() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                //RequestHandlerSelectors 配置要扫描的接口
                .apis(RequestHandlerSelectors.basePackage("com.xuxx.swagger.controller"))
                .build();
    }
```

2、重启项目测试，由于配置根据包的路径扫描接口，所以只能看到一个类

3、除了通过包路径配置扫描接口外，还可以通过配置其他方式扫描接口，这里注释一下所有的配置方式：

```java
//any:扫描全部
//none:全部不扫描
//basePackage:指定要扫描的包 
//withMethodAnnotation:扫描带注解的方法,例:withMethodAnnotation(GetMapping.class)
//withClassAnnotation:扫描带注解的类,例:withClassAnnotation(RestController.class)
```

4、除此之外，还可以配置接口扫描过滤：

```java
@Bean
public Docket docket() {   
return new Docket(DocumentationType.SWAGGER_2)
	.apiInfo(apiInfo())
	.select()// select():配置扫描接口, RequestHandlerSelectors:配置如何扫描接口
    .apis(RequestHandlerSelectors.basePackage("com.xuxx.swagger.controller"))
	//配置如何通过path过滤,即这里只扫描请求以'/api/'为前缀的接口
	.paths(PathSelectors.ant("/api/**"))
	.build();
}
```

5、这里的可选值还有

```java
any() //任何请求都扫描
none() //任何请求都不扫描
regex(final String pathRegex) //通过正则表达式控制
ant(final String antPattern) //通过ant()匹配
```

## 5. 配置Swagger开关

1、通过enable()方法配置是否启用swagger，如果为false，则不能访问swagger

```java
@Bean
public Docket docket() {
   return new Docket(DocumentationType.SWAGGER_2)
      .apiInfo(apiInfo())
      .enable(false) //配置是否启用swagger，如果是false，则不能访问swagger
      .select()// select():配置扫描接口, RequestHandlerSelectors:配置如何扫描接口
      .apis(RequestHandlerSelectors.basePackage("com.xuxx.swagger.controller"))
      //配置如何通过path过滤,即这里只扫描请求以'/api/'为前缀的接口
	.paths(PathSelectors.ant("/api/**"))
      .build();
}
```

2、如何动态配置当项目处于dev、test环境时使用swagger，处于prod时不显示？

```java
@Bean
//environment:表示当前应用程序运行的环境的接口。
public Docket docket(Environment environment) {
    
   	//配置要使用swagger的环境
	Profiles profiles = Profiles.of("dev", "test");
    //判断当前是否处于该环境
    //通过enable()接收此参数判断是否使用swagger
    boolean flag = environment.acceptsProfiles(profiles);
   
   return new Docket(DocumentationType.SWAGGER_2)
      .apiInfo(apiInfo())
      .enable(flag) //配置是否启用swagger，如果是false，在浏览器将无法访问
      .select()// 通过.select()方法，去配置扫描接口,RequestHandlerSelectors配置如何扫描接口
      .apis(RequestHandlerSelectors.basePackage("com.xuxx.swagger.controller"))
       //配置如何通过path过滤,即这里只扫描请求以'/api/'为前缀的接口
      .paths(PathSelectors.ant("/api/**"))
      .build();
}
```

3、可以在项目中增加一个dev的配置文件查看效果！

application.properties

```properties
spring.profiles.active=dev
```

application-dev.properties

```properties
server.port=8081
```

![](..\static\笔记图片\2020-05-27-Spring Boot整合Swagger_03.png)

如果环境不是`dev`或者`test`,swagger便关闭。

## 6. 配置API分组

1、如果没有配置分组，默认是default。通过groupName()方法即可配置分组：

```java
@Bean
public Docket docket(Environment environment) {
   return new Docket(DocumentationType.SWAGGER_2)
       .apiInfo(apiInfo())
      .groupName("A") // 配置分组
       // 省略....
}
```

2、重启项目查看分组

3、如何配置多个分组？配置多个分组只需要配置多个docket即可：

```java
@Bean
public Docket docket1(){
   return new Docket(DocumentationType.SWAGGER_2).groupName("A");
}
@Bean
public Docket docket2(){
   return new Docket(DocumentationType.SWAGGER_2).groupName("B");
}
```

4、重启项目查看即可

![](..\static\笔记图片\2020-05-27-Spring Boot整合Swagger_04.png)


## 7. 实体配置

1、新建一个实体类

```java
@ApiModel("用户实体类-user")
public class User {
    @ApiModelProperty("用户名")
    public String username;
    @ApiModelProperty("密码")
    public String password;
}
```

2、只要这个实体在**请求接口**的返回值上（即使是泛型），都能映射到实体项中：

```java
@GetMapping("/getUser")
public User getUser(){
   return new User();
}
```

3、重启查看测试

![](..\static\笔记图片\2020-05-27-Spring Boot整合Swagger_05.png)

注：并不是因为@ApiModel这个注解让实体显示在这里了，而是只要出现在接口方法的返回值上的实体都会显示在这里，而@ApiModel和@ApiModelProperty这两个注解只是为实体添加注释的。

- @ApiModel为类添加注释


- @ApiModelProperty为类属性添加注释



## 8. 常用注解

Swagger的所有注解定义在io.swagger.annotations包下

下面列一些经常用到的，未列举出来的可以另行查阅说明：

| Swagger注解                                            | 简单说明                                             |
| ------------------------------------------------------ | ---------------------------------------------------- |
| @Api(tags = "xxx模块说明")                             | 作用在模块类上,为接口添加标签                        |
| @ApiOperation(vale="xxx接口说明"，tags="xxx")          | 作用在接口方法上,vale:添加说明,tage:添加标签         |
| @ApiModel("xxxPOJO说明")                               | 作用在模型类上：如VO、BO                             |
| @ApiModelProperty(value = "xxx属性说明",hidden = true) | 作用在类方法和属性上，hidden设置为true可以隐藏该属性 |
| @ApiParam("xxx参数说明")                               | 作用在参数、方法和字段上，类似@ApiModelProperty      |

也可以给请求的接口配置一些注释

```java
@ApiOperation(value = "api接口-getUsername",tags ="xxx的接口" )
@PostMapping("/getUsername")
@ResponseBody
public String getUsername(@ApiParam("这个username会被返回")String username){
   return username;
}
```

这样的话，可以给一些比较难理解的属性或者接口，增加一些配置信息，让人更容易阅读！

相较于传统的Postman或Curl方式测试接口，使用swagger简直就是傻瓜式操作，不需要额外说明文档(写得好本身就是文档)而且更不容易出错，只需要录入数据然后点击Execute，如果再配合自动化框架，可以说基本就不需要人为操作了。

Swagger是个优秀的工具，现在国内已经有很多的中小型互联网公司都在使用它，相较于传统的要先出Word接口文档再测试的方式，显然这样也更符合现在的快速迭代开发行情。当然了，提醒下大家在正式环境要记得关闭Swagger，一来出于安全考虑，二来也可以节省运行时内存。

## 拓展：其他皮肤

可以导入不同的包实现不同的皮肤定义：

1、默认的   **访问 http://localhost:8080/swagger-ui.html**

```xml
<dependency>   
	<groupId>io.springfox</groupId>   
	<artifactId>springfox-swagger-ui</artifactId>   
	<version>2.9.2</version>
</dependency>
```

![](..\static\笔记图片\2020-05-27-Spring Boot整合Swagger_06.png)

2、bootstrap-ui  **访问 http://localhost:8080/doc.html**

```xml
<!-- 引入swagger-bootstrap-ui包 /doc.html-->
<dependency>   
	<groupId>com.github.xiaoymin</groupId>   
	<artifactId>swagger-bootstrap-ui</artifactId>   
	<version>1.9.1</version>
</dependency>
```

![](..\static\笔记图片\2020-05-27-Spring Boot整合Swagger_07.png)

3、Layui-ui   **访问 http://localhost:8080/docs.html**

```xml
<!-- 引入swagger-ui-layer包 /docs.html-->
<dependency>   
	<groupId>com.github.caspar-chen</groupId>   
	<artifactId>swagger-ui-layer</artifactId>   
	<version>1.1.3</version>
</dependency>
```

![](..\static\笔记图片\2020-05-27-Spring Boot整合Swagger_08.png)

4、mg-ui   **访问 http://localhost:8080/document.html**

```xml
<!-- 引入swagger-ui-layer包 /document.html-->
<dependency>   
	<groupId>com.zyplayer</groupId>   
	<artifactId>swagger-mg-ui</artifactId>   
	<version>1.0.6</version>
</dependency>
```

![](..\static\笔记图片\2020-05-27-Spring Boot整合Swagger_09.png)
