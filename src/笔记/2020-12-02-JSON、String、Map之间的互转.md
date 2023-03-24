---
layout: post
title: JSON、String、Map之间的互转
slug: bj38
date: 2020-12-02 12:48
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - JSON
excerpt: 笔记
---
## 1.使用前置

本次演示使用三个常用的工具类,每个工具类对应的依赖如下

- FastJson

  ```xml
<dependency>
      <groupId>com.alibaba</groupId>
      <artifactId>fastjson</artifactId>
      <version>1.2.58</version>
  </dependency>
  ```
  
- Gson

  ```xml
<dependency>
  	<groupId>com.google.code.gson</groupId>
  	<artifactId>gson</artifactId>
  	<version>2.2.4</version>
  </dependency>
  ```
  
- Jackson

  ```xml
<!-- https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind -->
  <dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.10.0</version>
  </dependency>
  
  <dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-annotations</artifactId>
    <version>2.10.0</version>
  </dependency>
  
  <dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-core</artifactId>
    <version>2.10.0</version>
  </dependency>
  ```
  
- 类定义

  ```java
public class User {
      private String userid;
      private String username;
      private String usersex;
      ...
  }
  
  //对象User
  User user = new User("001","张三","男");
  
  //Json对象
  String jsonData = "{\"userid\":\"001\",\"username\":\"张三\",\"usersex\":\"男\"}";
  
  
  //Json对象(集合)
  String strList = "{ \"data$\":" +
      "[{\"userid\":\"001\",\"username\":\"张三\",\"usersex\":\"男\"}," +
      "{\"userid\":\"002\",\"username\":\"李四\",\"usersex\":\"女\"}," +
      "{\"userid\":\"003\",\"username\":\"王五\",\"usersex\":\"男\"}]" +
      			"}";
          
  //list对象
  User user1 = new User("001","张三","男");
  User user2 = new User("002","李四","女");
  User user3 = new User("003","王五","男");
  List<User> userList = new ArrayList<>();
  userList.add(user1);
  userList.add(user2);
  userList.add(user3);
  
  //map对象
  Map map = new HashMap();
  map.put("data$",userList);
  ```

## 2.对象与字符串之间的互转

- FastJson

  ```java
//对象-->字符串
  String str = JSON.toJSONString(user);
  //字符串-->对象
  User user_2 = JSON.parseObject(jsonData, User.class);
  ```
  
- Gson

  ```java
//对象 --> 字符串
  Gson gson = new Gson();
  String str = gson.toJson(user);
  //字符串 --> 对象
  Gson gson = new Gson();
  User user_2 = gson.fromJson(jsonData, User.class);
  ```
  
- Jackson

  ```java
//对象-->String
  ObjectMapper objectMapper = new ObjectMapper();
  String str_3 = objectMapper.writeValueAsString(user);
  //String-->对象
  User user_3 = objectMapper.readValue(jsonData, User.class);
  ```

## 3.对象集合与字符串之间的互转

- FastJson

  ```java
//对象集合-->字符串
  String users = JSON.toJSONString(userList);
  //字符串-->对象集合
  List<User> userList = JSON.parseArray(userList, User.class);  
  ```
  
- Gson

  ```java
//对象集合 --> 字符串
  Gson gson=new Gson();
  String users=gson.toJson(list);
  //字符串 --> 对象集合
  Gson gson = new Gson();
  List<User> list = gson1.fromJson(userList, 
                                   new TypeToken<List<User>>(){}.getType());
  ```
  
- Jackson

  ```java
//对象集合 --> 字符串
  ObjectMapper objectMapper = new ObjectMapper();
  String users_3 = objectMapper.writeValueAsString(userList);
  //字符串 --> 对象集合
  List<User> userList_3 = objectMapper.readValue(strList, new TypeReference<List<User>>() {});
  ```

## 4.字符串互转JSON对象

- Fastjson

  ```java
//String --> Json对象
  JSONObject jsonObject = JSONObject.parseObject(jsonData);
  //Json --> String
  String jsonString = jsonObject.toJSONString();
  ```
  
- Gson

  ```java
//String --> Json对象
  JsonObject jsonObject = new JsonParser().parse(jsonData).getAsJsonObject();
  //JsonObject jsonObject_2 = gson.fromJson(jsonString_2, JsonObject.class); 错误方法 返回为空(非null)
  //Json对象 --> String
  Gson gson = new Gson();
  String jsonString = gson.toJson(jsonObject);
  ```
  
- Jackson

  ```java
//jackson
  //String --> Json对象
  //暂未知,有知道的大佬请告知
  
  //Json对象 --> String
  //用到fastJson格式的JSONObject
  ObjectMapper objectMapper = new ObjectMapper();
  String jsonString_3 = objectMapper.writeValueAsString(jsonObject_1);
  ```

## 5.Map与字符串之间互转

- Fastjson

  ```java
//字符串 --> map
  Map map = JSONObject.parseObject(strList, Map.class);
  //map --> 字符串
  String jsonString = JSON.toJSONString(map);
  ```
  
- Gson

  ```java
//字符串-->map
  Gson gson = new Gson();
  Map map_2 = gson.fromJson(strList, Map.class);
  //map-->字符串
  Gson gson = new Gson();
  String jsonString_2 = gson.toJson(map);
  ```
  
- Jackson

  ```java
//字符串 --> map
  ObjectMapper objectMapper = new ObjectMapper();
  Map map_3 = objectMapper.readValue(strList, Map.class);
  //map --> 字符串
  String jsonString_3 = objectMapper.writeValueAsString(map);
  ```

## 6.Map 转 JSON对象

- Fastjson

  ```java
//map转json对象
  JSONObject json = new JSONObject(map);
  //json对象转Map 
  Map map_1 = JSONObject.parseObject(strList, Map.class);
  //Map<String,Object> map_1 = (Map<String,Object>)jsonObject_1; 此方法也行
  ```
  
- Gson

  ```java
//map转json对象
  Gson gson = new Gson();
  String jsonString_2 = gson.toJson(map);
  //JsonObject jsonObject_2 = gson.fromJson(jsonString_2, JsonObject.class); 错误方法 返回为空(非null)
  JsonObject jsonObject_2 = new JsonParser().parse(jsonString_2).getAsJsonObject();
  //json对象转Map
  Map map_2 = gson.fromJson(strList, Map.class);
  System.out.println("断点");
  ```
  
- Jackson

  ```java
//map转json对象
  //暂未知,有知道的大佬请告知
  
  //json对象转Map
  ObjectMapper objectMapper = new ObjectMapper();
  Map map_3 = objectMapper.readValue(strList, Map.class);
  ```

7.测试代码

> User.class

```java
public class User {
    private String userid;
    private String username;
    private String usersex;

    public User() {
    }

    @Override
    public String toString() {
        return "User{" +
                "userid='" + userid + '\'' +
                ", username='" + username + '\'' +
                ", usersex='" + usersex + '\'' +
                '}';
    }

    public User(String userid, String username, String usersex) {
        this.userid = userid;
        this.username = username;
        this.usersex = usersex;
    }

    public String getUserid() {
        return userid;
    }

    public void setUserid(String userid) {
        this.userid = userid;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUsersex() {
        return usersex;
    }

    public void setUsersex(String usersex) {
        this.usersex = usersex;
    }
}
```

> Test.class

```java
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;
import com.rosellete.iescp.cshop.entity.User;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.junit.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertTrue;

/**
 * Unit test for simple App.
 */
public class AppTest 
{

    @Test
    public void StringAndJson() throws IOException {
        String jsonData = "{\"userid\":\"001\",\"username\":\"张三\",\"usersex\":\"男\"}";
        //fastJson
            //String --> Json对象
        JSONObject jsonObject_1 = JSONObject.parseObject(jsonData);
            //Json对象 --> String
        String jsonString_1 = jsonObject_1.toJSONString();

        //Gson
            //String --> Json对象
        JsonObject jsonObject_2 = new JsonParser().parse(jsonData).getAsJsonObject();
            //Json对象 --> String
        Gson gson = new Gson();
        String jsonString_2 = gson.toJson(jsonObject_2);

        //jackson
            //String --> Json对象
            //暂未知,有知道的大佬请告知

        //Json对象 --> String
            //用到fastJson格式的JSONObject
        ObjectMapper objectMapper = new ObjectMapper();
        String jsonString_3 = objectMapper.writeValueAsString(jsonObject_1);

        System.out.println("断点");
    }

    @Test
    public void StringAndBean() throws IOException {
        User user = new User("001","张三","男");
        String jsonData = "{\"userid\":\"001\",\"username\":\"张三\",\"usersex\":\"男\"}";

        //fastjson
            //对象-->String
        String str_1 = JSON.toJSONString(user);
            //String --> 对象
        User user_1 = JSON.parseObject(jsonData, User.class);

        //Gson
            //对象-->String
        Gson gson = new Gson();
        String str_2 = gson.toJson(user);
            //String -->对象
        User user_2 = gson.fromJson(jsonData, User.class);

        //jackson
            //对象-->String
        ObjectMapper objectMapper = new ObjectMapper();
        String str_3 = objectMapper.writeValueAsString(user);
            //String-->对象
        User user_3 = objectMapper.readValue(jsonData, User.class);

        System.out.println("断点");
    }

    @Test
    public void StringAndBeanlist() throws IOException {
        User user1 = new User("001","张三","男");
        User user2 = new User("002","李四","女");
        User user3 = new User("003","王五","男");
        List<User> userList = new ArrayList<>();
        userList.add(user1);
        userList.add(user2);
        userList.add(user3);
        String strList = "[{\"userid\":\"001\",\"username\":\"张三\",\"usersex\":\"男\"}," +
                         "{\"userid\":\"002\",\"username\":\"李四\",\"usersex\":\"女\"}," +
                         "{\"userid\":\"003\",\"username\":\"王五\",\"usersex\":\"男\"}]";
        //fastjson
            //对象集合-->String
        String users_1 = JSON.toJSONString(userList);
            //String-->对象集合
        List<User> userList_1 = JSON.parseArray(strList, User.class);

        //Gson
            //对象集合 --> 字符串
        Gson gson=new Gson();
        String users_2 =gson.toJson(userList);
            //字符串 --> 对象集合
        List<User> userList_2 = gson.fromJson(strList,
                new TypeToken<List<User>>(){}.getType());

        //jackson
            //对象集合 --> 字符串
        ObjectMapper objectMapper = new ObjectMapper();
        String users_3 = objectMapper.writeValueAsString(userList);
            //字符串 --> 对象集合
        List<User> userList_3 = objectMapper.readValue(strList, new TypeReference<List<User>>() {});

        System.out.println("断点");
    }

    @Test
    public void MapAndString() throws IOException {
        String strList = "{ \"data$\":" +
                "[{\"userid\":\"001\",\"username\":\"张三\",\"usersex\":\"男\"}," +
                "{\"userid\":\"002\",\"username\":\"李四\",\"usersex\":\"女\"}," +
                "{\"userid\":\"003\",\"username\":\"王五\",\"usersex\":\"男\"}]" +
                "}";
        User user1 = new User("001","张三","男");
        User user2 = new User("002","李四","女");
        User user3 = new User("003","王五","男");
        List<User> userList = new ArrayList<>();
        userList.add(user1);
        userList.add(user2);
        userList.add(user3);

        Map map = new HashMap();
        map.put("data$",userList);

        //fastjson
            //字符串-->map
        Map map_1 = JSONObject.parseObject(strList, Map.class);
            //map-->字符串
        String jsonString_1 = JSON.toJSONString(map);

        //Gson
            //字符串-->map
        Gson gson = new Gson();
        Map map_2 = gson.fromJson(strList, Map.class);
            //map-->字符串
        String jsonString_2 = gson.toJson(map);

        //jackson
            //字符串 --> map
        ObjectMapper objectMapper = new ObjectMapper();
        Map map_3 = objectMapper.readValue(strList, Map.class);
            //map --> 字符串
        String jsonString_3 = objectMapper.writeValueAsString(map);

        System.out.println("断点");
    }

    @Test
    public void MapAndJson() throws IOException {
        User user1 = new User("001","张三","男");
        User user2 = new User("002","李四","女");
        User user3 = new User("003","王五","男");
        List<User> userList = new ArrayList<>();
        userList.add(user1);
        userList.add(user2);
        userList.add(user3);
        Map map = new HashMap();
        map.put("data$",userList);

        String strList = "{ \"data$\":" +
                "[{\"userid\":\"001\",\"username\":\"张三\",\"usersex\":\"男\"}," +
                "{\"userid\":\"002\",\"username\":\"李四\",\"usersex\":\"女\"}," +
                "{\"userid\":\"003\",\"username\":\"王五\",\"usersex\":\"男\"}]" +
                "}";

        //fastjson
            //map转json对象
        JSONObject jsonObject_1 = new JSONObject(map);
            //json对象转Map
        Map map_1 = JSONObject.parseObject(strList, Map.class);
        //Map<String,Object> map_1 = (Map<String,Object>)jsonObject_1; 此方法也行

        //Gson
            //map转json对象
        Gson gson = new Gson();
        String jsonString_2 = gson.toJson(map);
        //JsonObject jsonObject_2 = gson.fromJson(jsonString_2, JsonObject.class); 是错误方法 返回为空(非null)
        JsonObject jsonObject_2 = new JsonParser().parse(jsonString_2).getAsJsonObject();
            //json对象转Map
        Map map_2 = gson.fromJson(strList, Map.class);

        //jackson
            //map转json对象
            //暂未知,有知道的大佬请告知

            //json对象转Map
        ObjectMapper objectMapper = new ObjectMapper();
        Map map_3 = objectMapper.readValue(strList, Map.class);

        System.out.println("断点");

    }
}
```

