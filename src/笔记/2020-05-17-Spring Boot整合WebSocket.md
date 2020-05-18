---
layout: post
title: Spring Boot整合WebSocket
slug: bj20
date: 2020-05-17 23:20
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - java
  - spring
excerpt: 笔记
---

# Spring Boot整合WebSocket

## 1.什么是WebSocket?

WebSocket 是 HTML5 开始提供的一种在单个 TCP 连接上进行全双工通讯的协议。

WebSocket 使得客户端和服务器之间的数据交换变得更加简单，允许服务端主动向客户端推送数据。在 WebSocket API 中，浏览器和服务器只需要完成一次握手，两者之间就直接可以创建持久性的连接，并进行双向数据传输。

在 WebSocket API 中，浏览器和服务器只需要做一个握手的动作，然后，浏览器和服务器之间就形成了一条快速通道。两者之间就直接可以数据互相传送。

![img](..\static\笔记图片\2020-05-17-Spring Boot整合WebSocket_01.png)

```
Upgrade: websocket
Connection: Upgrade
```

补充：

**SockJs**

SockJS是一个JavaScript库，为了应对许多浏览器不支持WebSocket协议的问题，设计了备选SockJs。SockJS 是 WebSocket 技术的一种模拟。SockJS会尽可能对应 WebSocket API，但如果WebSocket 技术不可用的话，会自动降为轮询的方式。

**Stompjs**

STOMP—— Simple Text Oriented Message Protocol——面向消息的简单文本协议。
SockJS 为 WebSocket 提供了 备选方案。但无论哪种场景，对于实际应用来说，这种通信形式层级过低。 STOMP协议，来为浏览器 和 server 间的 通信增加适当的消息语义。

**WebSocket、SockJs、STOMP三者关系**

简而言之，WebSocket 是底层协议，SockJS 是WebSocket 的备选方案，也是底层协议，而 STOMP 是基于 WebSocket（SockJS）的上层协议。

1、HTTP协议解决了 web 浏览器发起请求以及 web 服务器响应请求的细节，假设 HTTP 协议 并不存在，只能使用 TCP 套接字来 编写 web 应用。

2、直接使用 WebSocket（SockJS） 就很类似于 使用 TCP 套接字来编写 web 应用，因为没有高层协议，就需要我们定义应用间所发送消息的语义，还需要确保连接的两端都能遵循这些语义；

3、同HTTP在TCP 套接字上添加请求-响应模型层一样，STOMP在WebSocket 之上提供了一个基于帧的线路格式层，用来定义消息语义；

## 2.WebSocket实现在线群聊

1. 依赖

   ```xml
   <dependency>
   	<groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-web</artifactId>
   </dependency>
   
   <dependency>
   	<groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-websocket</artifactId>
   </dependency>
   
   <!-- https://mvnrepository.com/artifact/org.webjars/sockjs-client -->
   <dependency>
   	<groupId>org.webjars</groupId>
       <artifactId>sockjs-client</artifactId>
       <version>1.1.2</version>
   </dependency>
   
   <!-- https://mvnrepository.com/artifact/org.webjars/stomp-websocket -->
   <dependency>
   	<groupId>org.webjars</groupId>
       <artifactId>stomp-websocket</artifactId>
       <version>2.3.3</version>
   </dependency>
   
   <!-- https://mvnrepository.com/artifact/org.webjars.bower/jquery -->
   <dependency>
   	<groupId>org.webjars</groupId>
       <artifactId>jquery</artifactId>
       <version>3.4.1</version>
   </dependency>
   
   <!--WebJars是将客户端（浏览器）资源（JS，Css等）打成jar包文件，以对资源进行统一依赖管理。-->
   <!-- https://mvnrepository.com/artifact/org.webjars/webjars-locator-core -->
   <dependency>
   	<groupId>org.webjars</groupId>
       <artifactId>webjars-locator-core</artifactId>
   </dependency>
   <dependency>
       <groupId>org.projectlombok</groupId>
   	<artifactId>lombok</artifactId>
   </dependency>
   ```

   2. 配置类

      ```java
      @Configuration
      @EnableWebSocketMessageBroker//开启消息代理
      public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
      
          @Override
          public void configureMessageBroker(MessageBrokerRegistry registry) {
             //消息代理前缀（发送消息到外部 的前缀）
              registry.enableSimpleBroker("/topic");
              //接收外部消息 的前缀
              registry.setApplicationDestinationPrefixes("/app");
          }
      
          @Override
          public void registerStompEndpoints(StompEndpointRegistry registry) {
              //建立连接点
              registry.addEndpoint("/chat").withSockJS();
          }
      }
      ```

   3. bean

      ```
      @Data
      public class Message {
          private String name;
          private String content;
      }
      ```

   4. Controller

      ```
      @Controller
      public class GreetingController {
      
          //消息映射路径
          @MessageMapping("/hello")
          //转发到"/topic/greetings",此时便由配置的消息代理进行广播
          @SendTo("/topic/greetings")
          public Message greeting(Message message) {
              return message;
          }
          
          /*@Autowired
          SimpMessagingTemplate simpMessagingTemplate;//消息发送模板
      
          @MessageMapping("/hello")
          public void greeting(Message message) {
              simpMessagingTemplate.convertAndSend("/topic/greetings", message);//此时与上面的是一样的效果
          }*/
      }
      ```

   5. 聊天页面`chat.html`

      ```html
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>群聊</title>
          <script src="/webjars/jquery/jquery.min.js"></script>
          <script src="/webjars/sockjs-client/sockjs.min.js"></script>
          <script src="/webjars/stomp-websocket/stomp.min.js"></script>
      </head>
      <body>
      <table>
          <tr>
              <td>请输入用户名</td>
              <td><input type="text" id="name"></td>
          </tr>
          <tr>
              <td><input type="button" id="connect" value="连接"></td>
              <td><input type="button" id="disconnect" value="断开连接" disabled="disabled"></td>
          </tr>
      </table>
      <div id="chat" style="display: none">
          <table>
              <tr>
                  <td>请输入聊天内容</td>
                  <td><input type="text" id="content"></td>
                  <td><input type="button" id="send" value="发送"></td>
              </tr>
          </table>
          <div id="conversation">群聊进行中...</div>
      </div>
      
      <script>
          $(function () {
              $("#connect").click(function () {
                  connect();
              })
      
              $("#disconnect").click(function () {
                  if (stompClient != null) {
                      stompClient.disconnect();
                  }
                  setConnected(false);
              });
      
              $("#send").click(function () {
                  stompClient.send('/app/hello', {},
                      JSON.stringify({'name': $("#name").val(), 'content': $("#content").val()}))
              });
      
              var stompClient = null;
      
              function connect() {
                  if (!$("#name").val()) {
                      return;
                  }
                  var socket = new SockJS("/chat");
                  stompClient = Stomp.over(socket);
                  stompClient.connect({}, function (success) {
                      setConnected(true);//设置按钮状态
                      stompClient.subscribe('/topic/greetings', function (msg) {
                          showGreeting(JSON.parse(msg.body));
                      })
                  });
              }
      
              function setConnected(flag) {
                  $("#connect").prop("disabled", flag);
                  $("#disconnect").prop("disabled", !flag);
                  if (flag) {
                      $("#chat").show();
                  } else {
                      $("#chat").hide();
                  }
              }
      
              function showGreeting(msg) {
                  $("#conversation").append('<div>' + msg.name + ':' + msg.content + '</div>');
              }
          })
      </script>
      </body>
      </html>
      ```
      
   6. 测试结果
   
      ![](..\static\笔记图片\2020-05-17-Spring Boot整合WebSocket_02.png)

## 3.WebSocket实现在线私聊

1. 依赖

   ```xml
   <dependency>
   	<groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-web</artifactId>
   </dependency>
   
   <dependency>
   	<groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-websocket</artifactId>
   </dependency>
   
   <!-- https://mvnrepository.com/artifact/org.webjars/sockjs-client -->
   <dependency>
   	<groupId>org.webjars</groupId>
       <artifactId>sockjs-client</artifactId>
       <version>1.1.2</version>
   </dependency>
   
   <!-- https://mvnrepository.com/artifact/org.webjars/stomp-websocket -->
   <dependency>
   	<groupId>org.webjars</groupId>
       <artifactId>stomp-websocket</artifactId>
       <version>2.3.3</version>
   </dependency>
   
   <!-- https://mvnrepository.com/artifact/org.webjars.bower/jquery -->
   <dependency>
   	<groupId>org.webjars</groupId>
       <artifactId>jquery</artifactId>
       <version>3.4.1</version>
   </dependency>
   
   <!--WebJars是将客户端（浏览器）资源（JS，Css等）打成jar包文件，以对资源进行统一依赖管理。-->
   <!-- https://mvnrepository.com/artifact/org.webjars/webjars-locator-core -->
   <dependency>
   	<groupId>org.webjars</groupId>
       <artifactId>webjars-locator-core</artifactId>
   </dependency>
   <dependency>
       <groupId>org.projectlombok</groupId>
   	<artifactId>lombok</artifactId>
   </dependency>
   <dependency>
   	<groupId>org.springframework.boot</groupId>
   	<artifactId>spring-boot-starter-security</artifactId>
   </dependency>
   ```

2. 配置类

   ```java
   /*Security配置类*/
   @Configuration
   public class SecurityConfig extends WebSecurityConfigurerAdapter {
       @Bean
       PasswordEncoder passwordEncoder() {
           return NoOpPasswordEncoder.getInstance();
       }
   
       @Override
       protected void configure(AuthenticationManagerBuilder auth) throws Exception {
           auth.inMemoryAuthentication()
                   .withUser("xuxx")
                   .password("123")
                   .roles("admin")
                   .and()
                   .withUser("xu")
                   .password("123")
                   .roles("user");
       }
   
       @Override
       protected void configure(HttpSecurity http) throws Exception {
           http.authorizeRequests()
                   .anyRequest()
                   .authenticated()
                   .and()
                   .formLogin()
                   .permitAll();
       }
   }
   ```

   ```java
   /*WebSocket配置类*/
   @Configuration
   @EnableWebSocketMessageBroker//开启消息代理
   public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
   
       @Override
       public void configureMessageBroker(MessageBrokerRegistry registry) {
           //发到/topic认为是群聊消息，发到/queue认为是单聊消息
           registry.enableSimpleBroker("/topic", "/queue");//发送消息到外部 的前缀
           registry.setApplicationDestinationPrefixes("/app");//接收外部消息 的前缀
       }
   
       @Override
       public void registerStompEndpoints(StompEndpointRegistry registry) {
           registry.addEndpoint("/chat").withSockJS();
       }
   }
   ```

3. bean

   ```java
   @Data
   public class Chat {
       private String from;
       private String to;
       private String content;
   }
   ```

4. Controller

   ```
   @Controller
   public class GreetingController {
   
       @MessageMapping("/chat")
       //principal为用户信息
       public void chat(Principal principal, Chat chat) {
           chat.setFrom(principal.getName());
           simpMessagingTemplate.convertAndSendToUser(chat.getTo(), "/queue/chat", chat);
       }
   
   }
   ```

5. 聊天页面`onlinechat.html`

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <title>私聊</title>
       <script src="/webjars/jquery/jquery.min.js"></script>
       <script src="/webjars/sockjs-client/sockjs.min.js"></script>
       <script src="/webjars/stomp-websocket/stomp.min.js"></script>
   </head>
   <body>
   <input type="button" id="connect" value="连接">
   <input type="button" id="disconnect" value="断开连接" disabled="disabled">
   <hr/>
   消息内容：<input type="text" id="content">
   <hr/>
   目标用户：<input type="text" id="to">
   <hr/>
   <input type="button" value="发送" id="send">
   <div id="conversation"></div>
   <script>
       $(function () {
           $("#connect").click(function () {
               connect();
           })
   
           $("#disconnect").click(function () {
               if (stompClient != null) {
                   stompClient.disconnect();
               }
               setConnected(false);
           });
   
           $("#send").click(function () {
               stompClient.send('/app/chat', {},
                   JSON.stringify({'to': $("#to").val(), 'content': $("#content").val()}))
           });
   
           var stompClient = null;
   
           function connect() {
               var socket = new SockJS("/chat");
               stompClient = Stomp.over(socket);
               stompClient.connect({}, function (success) {
                   setConnected(true);//设置按钮状态
                   stompClient.subscribe('/user/queue/chat', function (msg) {//点对点需要加前缀
                       showGreeting(JSON.parse(msg.body));
                   })
               });
           }
   
           function setConnected(flag) {
               $("#connect").prop("disabled", flag);
               $("#disconnect").prop("disabled", !flag);
               if (flag) {
                   $("#chat").show();
               } else {
                   $("#chat").hide();
               }
           }
   
           function showGreeting(msg) {
               $("#conversation").append('<div>' + msg.from + ':' + msg.content + '</div>');
           }
       })
   </script>
   </body>
   </html>
   ```

6. 测试结果

   ![](..\static\笔记图片\2020-05-17-Spring Boot整合WebSocket_03.png)

