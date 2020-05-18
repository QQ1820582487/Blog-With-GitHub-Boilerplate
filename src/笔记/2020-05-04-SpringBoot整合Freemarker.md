---
layout: post
title: SpringBoot整合Freemarker
slug: bj04
date: 2020-05-04 00:50
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
  - Spring
excerpt: 笔记
---

### 一.基本步骤

- 添加`pom`依赖
- 在`application.yml`中添加相关配置
- 创建`freemarker`模板
- 创建控制层
- 测试访问

### 1. 添加`pom`依赖

```xml
<!-- springboot整合freemarker -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-freemarker</artifactId>
</dependency>

```

### 2. 在`application.yml`中添加相关配置

```
# 配置freemarker
spring:
  freemarker:
    # 设置模板后缀名 默认.ftl (现已改为ftlh)
    #suffix: .ftlh
    # 设置文档类型  默认 text/html
    #content-type: text/html
    # 设置页面编码格式  默认 UTF-8
    #charset: UTF-8
    # 设置页面缓存  默认false
    #cache: false
    # 设置ftl文件路径 默认classpath:/templates
    #template-loader-path:
    # - classpath:/templates
      
  # 设置静态文件路径，js,css等
  mvc:
    static-path-pattern: /static/**
```

### 3. 创建`freemarker`模板

目录：src/main/resources 创建templates文件夹，文件夹里新建`freemarker.ftlh`文件
```html
<!DOCTYPE>
<html>
    <head>
        <title>freemark</title>
    </head>
    <body>
        <h1>Hello ${name} from resource freemark!</h1>
    </body>
</html>
```

### 4. 创建控制层

```java
@Controller
@RequestMapping(value = "/freemarker")
public class FreemarkerAction {
    /**
     * 跳转freemarker页面
     */
    @RequestMapping(value = "/toDemo")
    public String toDemo(Model model) {
        model.addAttribute("name", "Xuxx");
        return "freemarker";
    }
}
```

### 5. 测试访问

启动项目，输入http://localhost:8080/freemarker/toDemo

### 二.FreeMarker常用指令

#### 1.if, else, elseif

语法

```html
<#if 条件>...
    <#elseif 条件>...
    <#elseif 条件>...
    <#else>...
</#if>
```

用例

```html
<#if user.gender==1>男
	<#elseif user.gender==0>女
	<#else>未知
</#if>
```

#### 2.switch, case, default, break

语法

```html
<#switch value>
  <#case refValue1>
    ...
    <#break>
  <#case refValue2>
    ...
    <#break>
  <#case refValueN>
    ...
    <#break>
  <#default>
    ...
</#switch>
```

用例

```HTML
<#switch user.gender>
	<#case 1>男<#break>
	<#case 0>女<#break>
	<#default>未知
</#switch>
```

#### 3.list, break

语法

```html
<#list sequence as item>
	...
	<#if item = "spring"><#break></#if>
	...
</#list>
```

关键字

1. item_index:是list当前值的下标
2. item_has_next:判断list是否还有值

用例

```
<#assign seq = ["winter", "spring", "summer", "autumn"]>
<#list seq as x>
  ${x_index + 1}. ${x}<#if x_has_next>,</#if>
</#list>
```

输出

1. winter,

2. spring,

3. summer,

  4. autumn  

#### 4.include

语法

```html
<#include filename>
or
<#include filename options>
```

options包含两个属性

2. encoding=”GBK” 编码格式
3. parse=true 是否作为ftl语法解析,默认是true，false就是以文本方式引入.注意在ftl文件里布尔值都是直接赋值的如parse=true,而不是parse=”true”

用例

/common/copyright.ftl包含内容

```html
Copyright 2001-2002 ${me}<br>
All rights reserved.
```

模板文件

```html
<#assign me = "Juila Smith">
<h1>Some test</h1>
<p>Yeah.
<hr>
<#include "/common/copyright.ftl" encoding=”GBK”>
```

输出结果

```html
<h1>Some test</h1>
<p>Yeah.
<hr>
Copyright 2001-2002 Juila Smith
All rights reserved.
```

#### 5.Import

语法

```html
<#import path as hash>
```

类似于java里的import,它导入文件，然后就可以在当前文件里使用被导入文件里的宏组件

用例

假设mylib.ftl里定义了宏copyright那么我们在其他模板页面里可以这样使用

```
<#import "/libs/mylib.ftl" as my>
<@my.copyright date="1999-2002"/>
```

"my"在freemarker里被称作namespace

#### 6.compress

语法

```html
<#compress>
  ...
</#compress>
```

用来压缩空白空间和空白的行

用例

```html
<#assign x = "    moo  \n\n   ">
(<#compress>
  1 2  3   4    5
  ${moo}
  test only
  I said, test only
</#compress>)
```

输出

```html
(1 2 3 4 5
moo
test only
I said, test only)
```

#### 7.escape, noescape

语法

```html
<#escape identifier as expression>
  ...
  <#noescape>...</#noescape>
  ...
</#escape>
```

用例

主要使用在相似的字符串变量输出，比如某一个模块的所有字符串输出都必须是html安全的，这个时候就可以使用该表达式

```html
<#escape x as x?html>
  First name: ${firstName}
  <#noescape>Last name: ${lastName}</#noescape>
  Maiden name: ${maidenName}
</#escape>
```

相同表达式  

```html
  First name: ${firstName?html}
  Last name: ${lastName }
  Maiden name: ${maidenName?html}
```

#### 8.assign

语法

```html
<#assign name=value>
or
<#assign name1=value1 name2=value2 ... nameN=valueN>
or
<#assign same as above... in namespacehash>
or
<#assign name>
  capture this
</#assign>
or
<#assign name in namespacehash>
  capture this
</#assign>
```

用例

生成变量,并且给变量赋值

给seasons赋予序列值

```html
<#assign seasons = ["winter", "spring", "summer", "autumn"]>
```

给变量test加1

```html
<#assign test = test + 1>
```

给my namespage 赋予一个变量bgColor,下面可以通过my.bgColor来访问这个变量

```html
<#import "/mylib.ftl" as my>
<#assign bgColor="red" in my>
```

将一段输出的文本作为变量保存在x里

下面的阴影部分输出的文本将被赋值给x

```html
<#assign x>
<#list ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期天"] as n>
${n}
</#list>
</#assign>
${x}
```

上面的代码将产生如下输出:星期一 星期二 星期三 星期四 星期五 星期六 星期天

```html
<#assign x>Hello ${user}!</#assign>     error
<#assign x=” Hello ${user}!”>         true
```

同时也支持中文赋值，如：

```html
<#assign 语法>
  java
</#assign>
${语法}
```

打印输出:

java

#### 9.global

语法

```html
<#global name=value>
or
<#global name1=value1 name2=value2 ... nameN=valueN>
or
<#global name>
  capture this
</#global>
```

全局赋值语法，利用这个语法给变量赋值，那么这个变量在所有的namespace中是可见的,如果这个变量被当前的assign语法覆盖 如<#global x=2> <#assign x=1> 在当前页面里x=2将被隐藏，或者通过${.global.x}来访问

#### 10.setting

语法

```html
<#setting name=value>
```

用来设置整个系统的一个环境

1. locale
2. number_format
3. boolean_format
4. date_format, time_format, datetime_format
5. time_zone
6. classic_compatible

用例

假如当前是匈牙利的设置，然后修改成美国

```html
${1.2}
<#setting locale="en_US">
${1.2}
```

输出

1,2

1.2

因为匈牙利是采用“,”作为十进制的分隔符，美国是用“.”

#### 11.macro, nested, return

语法

```html
<#macro name param1 param2 ... paramN>
  ...
  <#nested loopvar1, loopvar2, ..., loopvarN>
  ...
  <#return>
  ...
</#macro>
```

用例

```
<#macro test foo bar="Bar" baaz=-1>
  Test text, and the params: ${foo}, ${bar}, ${baaz}
</#macro>
<@test foo="a" bar="b" baaz=5*5-2/>
<@test foo="a" bar="b"/>
<@test foo="a" baaz=5*5-2/>
<@test foo="a"/>
```

输出

```
  Test text, and the params: a, b, 23
  Test text, and the params: a, b, -1
  Test text, and the params: a, Bar, 23
  Test text, and the params: a, Bar, -1
```

定义循环输出的宏

```
<#macro list title items>
  <p>${title?cap_first}:
  <ul>
    <#list items as x>
      <li>${x?cap_first}
    </#list>
  </ul>
</#macro>
<@list items=["mouse", "elephant", "python"] title="Animals"/>
```

输出结果  

```
<p>Animals:
  <ul>
      <li>Mouse
      <li>Elephant
      <li>Python
  </ul>
```

包含body的宏

```
<#macro repeat count>
  <#list 1..count as x>
    <#nested x, x/2, x==count>
  </#list>
</#macro>
<@repeat count=4 ; c halfc last>
  ${c}. ${halfc}<#if last> Last!</#if>
</@repeat >
```

输出

1. 0.5

2. 1

3. 1.5

4. 2 Last!

#### 12.t, lt, rt

语法

```
<#t> 去掉左右空白和回车换行
<#lt>去掉左边空白和回车换行
<#rt>去掉右边空白和回车换行
<#nt>取消上面的效果
```

当然 ([指令还有很多](http://freemarker.foofun.cn/ref_directives.html))。

### 三、常用内建函数

内建函数很像子变量(如果了解Java术语的话，也可以说像方法)， 它们并不是数据模型中的东西，是 FreeMarker 在数值上添加的。 为了清晰子变量是哪部分，使用 ?(问号)代替 .(点)来访问它们。常用内建函数的示例：



- user?html 给出 user 的HTML转义版本， 比如 & 会由 &amp; 来代替。

  

- user?upper_case 给出 user 值的大写版本 (比如 "JOHN DOE" 来替代 "John Doe")

  

- animal.name?cap_first 给出 animal.name 的首字母大写版本(比如 "Mouse" 来替代 "mouse")

  

- user?length 给出 user 值中 字符的数量(对于 "John Doe" 来说就是8)

  

- animals?size 给出 animals 序列中 项目 的个数(我们示例数据模型中是3个)



如果在 <#list animals as animal> 和对应的 </#list> 标签中：



- animal?index 给出了在 animals 中基于0开始的 animal的索引值

  

- animal?counter 也像 index， 但是给出的是基于1的索引值

  

- animal?item_parity 基于当前计数的奇偶性，给出字符串 "odd" 或 "even"。在给不同行着色时非常有用，比如在 <td class="${animal?item_parity}Row">中。



一些内建函数需要参数来指定行为，比如：



- animal.protected?string("Y", "N") 基于 animal.protected 的布尔值来返回字符串 "Y" 或 "N"。

  

- animal?item_cycle('lightRow','darkRow') 是之前介绍的 item_parity 更为常用的变体形式。

  

- fruits?join(", ") 通过连接所有项，将列表转换为字符串， 在每个项之间插入参数分隔符(比如 "orange,banana")

  

- user?starts_with("J") 根据 user 的首字母是否是 "J" 返回布尔值true或false。



内建函数应用可以链式操作，比如user?upper_case?html 会先转换用户名到大写形式，之后再进行HTML转义。(这就像可以链式使用 .(点)一样)

可以阅读 [全部内建函数参考](http://freemarker.foofun.cn/ref_builtins.html)。



### 四、快速浏览(备忘单)

这里给已经了解 FreeMarker 的人或有经验的程序员的提个醒：

直接指定值

- 字符串： "Foo" 或者 'Foo' 或者 "It's \"quoted\"" 或者 'It\'s "quoted"' 或者 r"C:\raw\string"
- 数字： 123.45
- 布尔值： true， false
- 序列： ["foo", "bar", 123.45]； 值域： 0..9, 0..<10 (或 0..!10), 0..
- 哈希表： {"name":"green mouse", "price":150}



检索变量

- 顶层变量： user
- 从哈希表中检索数据： user.name， user["name"]
- 从序列中检索数据： products[5]
- 特殊变量： .main



字符串操作

- 插值(或连接)： "Hello ${user}!" (或 "Hello " + user + "!")
- 获取一个字符： name[0]
- 字符串切分： 包含结尾： name[0..4]，不包含结尾： name[0..<5]，基于长度(宽容处理)： name[0..*5]，去除开头： name[5..]



序列操作

- 连接： users + ["guest"]
- 序列切分：包含结尾： products[20..29]， 不包含结尾： products[20..<30]，基于长度(宽容处理)： products[20..*10]，去除开头： products[20..]



哈希表操作

- 连接： passwords + { "joe": "secret42" }



算术运算： (x * 1.5 + 10) / 2 - y % 100

比较运算： x == y， x != y， x < y， x > y， x >= y， x <= y， x lt y， x lte y， x gt y， x gte y， 等等。。。。。。

逻辑操作： !registered && (firstVisit || fromEurope)

内建函数： name?upper_case, path?ensure_starts_with('/')

方法调用： repeat("What", 3)



处理不存在的值：

- 默认值： name!"unknown" 或者 (user.name)!"unknown" 或者 name! 或者 (user.name)!
- 检测不存在的值： name?? 或者 (user.name)??



赋值操作： =, +=, -=, *=, /=, %=, ++, --