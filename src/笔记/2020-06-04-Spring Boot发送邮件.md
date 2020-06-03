---
layout: post
title: Spring Boot发送邮件
slug: bj25
date: 2020-06-03 23:50
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
  - Spring
  - RibbitMQ
excerpt: 笔记
---

## 1.基础知识

1. 什么是SMTP？
    SMTP全称为Simple Mail Transfer Protocol（简单邮件传输协议），它是一组用于从源地址到目的地址传输邮件的规范，通过它来控制邮件的中转方式。SMTP认证要求必须提供账号和密码才能登陆服务器，其设计目的在于避免用户受到垃圾邮件的侵扰。
2. 什么是IMAP？
    IMAP全称为Internet Message Access Protocol（互联网邮件访问协议），IMAP允许从邮件服务器上获取邮件的信息、下载邮件等。IMAP与POP类似，都是一种邮件获取协议。
3. 什么是POP3？
    POP3全称为Post Office Protocol 3（邮局协议），POP3支持客户端远程管理服务器端的邮件。POP3常用于“离线”邮件处理，即允许客户端下载服务器邮件，然后服务器上的邮件将会被删除。目前很多POP3的邮件服务器只提供下载邮件功能，服务器本身并不删除邮件，这种属于改进版的POP3协议。
4. IMAP和POP3协议有什么不同呢？
    两者最大的区别在于，IMAP允许双向通信，即在客户端的操作会反馈到服务器上，例如在客户端收取邮件、标记已读等操作，服务器会跟着同步这些操作。而对于POP协议虽然也允许客户端下载服务器邮件，但是在客户端的操作并不会同步到服务器上面的，例如在客户端收取或标记已读邮件，服务器不会同步这些操作。

## 2.进阶知识

- 什么是`JavaMailSender`和`JavaMailSenderImpl`？
   `JavaMailSender`和`JavaMailSenderImpl` 是Spring官方提供的集成邮件服务的接口和实现类，以简单高效的设计著称，目前是Java后端发送邮件和集成邮件服务的主流工具。
- 如何通过`JavaMailSenderImpl`发送邮件？
   非常简单，直接在业务类注入`JavaMailSenderImpl`并调用`send`方法发送邮件。其中简单邮件可以通过`SimpleMailMessage`来发送邮件，而复杂的邮件（例如添加附件）可以借助`MimeMessageHelper`来构建`MimeMessage`发送邮件。

## 3.使用教程

### 1.开启邮件服务

登陆使用的邮箱，在设置中打开并勾选POP3/SMTP/IMAP服务，然后会得到一个授权码，这个邮箱和授权码将用作登陆认证。

### 2.创建Spring Boot项目，引入依赖

依赖

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-mail</artifactId>
</dependency>
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

配置

```properties
spring.mail.host=smtp.qq.com
spring.mail.port=465
spring.mail.username=1820502...@qq.com
#授权码
spring.mail.password=***...
spring.mail.default-encoding=UTF-8
#加密连接
spring.mail.properties.mail.smtp.socketFactory.class=javax.net.ssl.SSLSocketFactory
#日志
spring.mail.properties.mail.debug=true
```

### 3.发送邮件

#### 3.1 发送简单邮件

```java
@SpringBootTest
class MailApplicationTests {

    @Autowired
    JavaMailSender javaMailSender;

    @Test
    void contextLoads() {
        //写邮件
        SimpleMailMessage message = new SimpleMailMessage();
        message.setSubject("测试邮件-主题");
        message.setText("测试邮件-内容：Hello Word");
        message.setFrom("1820502...@qq.com");
        message.setSentDate(new Date());
        message.setTo("1913312...@qq.com");
	    //message.setCc();//抄送
	    //message.setBcc();//密抄
	    
        //发送邮件
        javaMailSender.send(message);
    }
}
```

#### 3.2 发送带附件的邮件

```java
@SpringBootTest
class MailApplicationTests {

    @Autowired
    JavaMailSender javaMailSender;
    
	@Test
    void test1() throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();

        MimeMessageHelper messageHelper = new MimeMessageHelper(message, true);

        //写邮件
        messageHelper.setSubject("测试邮件-主题");
        messageHelper.setText("测试邮件-内容：Hello Word (带附件)");
        //添加附件
        messageHelper.addAttachment("1.jpg", new File("D:\\UserData\\Pictures\\QQ\\1.jpg"));
        messageHelper.setFrom("1820502...@qq.com");
        messageHelper.setSentDate(new Date());
        messageHelper.setTo("1913312...@qq.com");

        //发送邮件
        javaMailSender.send(message);
    }
}
```

#### 3.3发送带图片的邮件

```java
@SpringBootTest
class MailApplicationTests {

    @Autowired
    JavaMailSender javaMailSender;
    
    @Test
    void test2() throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(message, true);

        //写邮件
        messageHelper.setSubject("测试邮件-主题");
        messageHelper.setText("测试邮件-内容：Hello Word(带图片)，这是图1：<img src='cid:p01'/>，这是图2：<img src='cid:p02'/>", true);
        messageHelper.addInline("p01", new FileSystemResource(new File("D:\\UserData\\Pictures\\QQ\\1.jpg")));
        messageHelper.addInline("p02", new FileSystemResource(new File("D:\\UserData\\Pictures\\QQ\\1.jpg")));
        messageHelper.setFrom("1820502...@qq.com");
        messageHelper.setSentDate(new Date());
        messageHelper.setTo("1913312...@qq.com");

        //发送邮件
        javaMailSender.send(message);
    }
}
```

### 4.使用模板

#### 4.1使用Thymeleaf

加入依赖

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

mail.html（放在templates目录下）

```html
<!DOCTYPE html>
<html lang="cn" xmlns:th="http://www.thymeleaf.org/">
<head>
    <meta charset="UTF-8">
    <title>邮件</title>
</head>
<body>
<div>
    Hello,<span th:text="${name}"/>,欢迎加入XXX大家庭
</div>
<div>
    您的入职信息如下:
</div>
<table border="1">
    <tr>
        <td>职位</td>
        <td><span th:text="${position}"/></td>
    </tr>
    <tr>
        <td>职称</td>
        <td><span th:text="${jobtitle}"/></td>
    </tr>
    <tr>
        <td>薪资</td>
        <td><span th:text="${salary}"/></td>
    </tr>
    <tr>
        <td>部门</td>
        <td><span th:text="${department}"/></td>
    </tr>
</table>
<div style="font-size: 24px">希望在未来的日子里，携手并进！</div>
</body>
</html>
```

```java
@SpringBootTest
class MailApplicationTests {

    @Autowired
	JavaMailSender javaMailSender;

	@Autowired
	TemplateEngine templateEngine;//thymeleaf模板引擎

	/*发送邮件模板 thymeleaf*/
	@Test
	void test3() throws MessagingException {
    	MimeMessage message = javaMailSender.createMimeMessage();
    	MimeMessageHelper messageHelper = new MimeMessageHelper(message,
    	//写邮件
    	messageHelper.setSubject("测试邮件-主题");
    	Context context = new Context();
    	context.setVariable("name", "xuxx");
    	context.setVariable("position", "Java开发");
    	context.setVariable("jobtitle", "Java开发初级工程师");
    	context.setVariable("salary", "13*6k");
    	context.setVariable("department", "产品开发部");
    	String process = templateEngine.process("mail.html", context);
    	messageHelper.setText(process, true);
    	messageHelper.setFrom("1820502...@qq.com");
    	messageHelper.setSentDate(new Date());
    	messageHelper.setTo("1913312...@qq.com");
    	//发送邮件
    	javaMailSender.send(message);
	}
}
```

#### 4.2使用Freemarker

加入依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-freemarker</artifactId>
</dependency>
```

mail.ftl（放在templates目录下）

```html
<!DOCTYPE html>
<html lang="cn">
<head>
    <meta charset="UTF-8">
    <title>邮件</title>
</head>
<body>
<div>
    Hello,${name},欢迎加入XXX大家庭
</div>
<div>
    您的入职信息如下:
</div>
<table border="1">
    <tr>
        <td>职位</td>
        <td>${position}</td>
    </tr>
    <tr>
        <td>职称</td>
        <td>${jobtitle}</td>
    </tr>
    <tr>
        <td>薪资</td>
        <td>${salary}</td>
    </tr>
    <tr>
        <td>部门</td>
        <td>${department}</td>
    </tr>
</table>
<div style="font-size: 24px">希望在未来的日子里，携手并进！</div>
</body>
</html>
```

```
@SpringBootTest
class MailApplicationTests {

    @Autowired
	JavaMailSender javaMailSender;

    /*发送邮件模板 freemarker*/
    @Test
    void test4() throws MessagingException, IOException, TemplateException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(message, true);

        //写邮件
        messageHelper.setSubject("测试邮件-主题");
        Configuration configuration = new Configuration(Configuration.VERSION_2_3_29);
        configuration.setClassLoaderForTemplateLoading(this.getClass().getClassLoader(), "templates");
        Template template = configuration.getTemplate("mail.ftl");
        Map<String, Object> map = new HashMap();
        map.put("name", "xuxx");
        map.put("position", "Java开发");
        map.put("jobtitle", "Java开发初级工程师");
        map.put("salary", "13*6k");
        map.put("department", "产品开发部");
        StringWriter out = new StringWriter();
        template.process(map, out);
        messageHelper.setText(out.toString(), true);
        messageHelper.setFrom("1820502...@qq.com");
        messageHelper.setSentDate(new Date());
        messageHelper.setTo("1913312...@qq.com");
        //发送邮件
        javaMailSender.send(message);
    }
}
```

