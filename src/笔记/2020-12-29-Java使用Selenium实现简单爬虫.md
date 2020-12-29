---
layout: post
title: Java使用Selenium实现简单爬虫
slug: bj44
date: 2020-12-29 21:25
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
  - 爬虫
excerpt: 笔记
---

## 序言

最近工作时接到一个处理数据的任务，给我的数据只有13项，但是项目中需要的数据有18项，所以缺少的数据需要手工去查询（别问我为什么？我也不知道，反正工作就是这样要求了，横竖都得干）。我需要处理接近5000条,一条一条查确实有点太枯燥了（自己手动查了200多条~），于是心一横，整个程序来帮我干活吧。但是我毕竟没有接触过爬虫，于是在一顿Google后，我选择了`Selenium`，别问，问就是简单好上手。

## 1.Selenium

因为对自动化测试卓越体验的追求，众多自动化测试工具应运而生，Selenium就是其中最出色的一款。

Selenium 是一个用于Web应用程序测试的工具。他是一款浏览器仿真程序 可以像真正的用户在操作一样操作浏览器。

Selenium支持全部主流的浏览器，支持主流的编程语言，包括：Java、Python、C#、PHP、Ruby、JavaScript等，基于标准的 WebDriver 语法规范，同时支持所有基于web 的管理任务自动化。

Selenium由多个软件工具组成。每个工具都有一个特定的角色。主要包含以下工具：

- Selenium IDE Selenium IDE（集成开发环境）是一个构建测试脚本的原型工具
- Selenium RC 是Selenium的远程控制(又称Selenium1.0)
- Selenium Grid 可以测试集分布在多个环境中并行运行测试用例。

## 2.Java中集成Selenium

Selenium支持主流的编程语言，包括：Java、Python、C#、PHP、Ruby、JavaScript；

### 2.1 maven添加依赖

在java中使用Selenium很简单，你只需要添加如下依赖：

```xml
<dependency>
    <groupId>org.Seleniumhq.Selenium</groupId>
    <artifactId>Selenium-java</artifactId>
    <version>3.141.59</version>
</dependency>
<!-- 以下非必要 -->
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>23.0</version>
</dependency>
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.8.2</version>
</dependency>
```

*注：[guava介绍](https://juejin.cn/post/6844903463537623048)*

### 2.2 添加浏览器驱动

当Selenium升级到3.0之后，对不同的浏览器驱动进行了规范。如果想使用Selenium驱动不同的浏览器，必须单独下载并设置不同的浏览器驱动。

*注：IE11，需要在IE浏览器中把保护模式取消掉，Internet、本地Internet、受信任的站点、受限制的站点中的启动保护模式勾选全部取消并保存设置（其余浏览器的设置请自行百度）。*

- Firefox浏览器驱动：[geckodriver](https://github.com/mozilla/geckodriver/releases)
- Chrome浏览器驱动：[chromedriver](https://npm.taobao.org/mirrors/chromedriver)
- IE浏览器驱动：[IEDriverServer](http://Selenium-release.storage.googleapis.com/index.html)
- Edge浏览器驱动：[MicrosoftWebDriver](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver)
- Opera浏览器驱动：[operadriver](https://github.com/operasoftware/operachromiumdriver/releases)
- PhantomJS浏览器驱动：[phantomjs](http://phantomjs.org/)

在java中使用不同浏览器：
首先配置驱动属性，指定驱动文件路径

```java
System.setProperty("webdriver.chrome.driver", "E:\\chromedriver.exe");
```

获取WebDriver并打开一个新的浏览器窗口

```
WebDriver driver = new ChromeDriver();    //Chrome浏览器
WebDriver driver = new FirefoxDriver();   //Firefox浏览器
WebDriver driver = new EdgeDriver();      //Edge浏览器
WebDriver driver = new InternetExplorerDriver();  // Internet Explorer浏览器
WebDriver driver = new OperaDriver();     //Opera浏览器
WebDriver driver = new PhantomJSDriver();   //PhantomJS
```

*注：可以在linux中使用无窗口模式，后续会讲到*

简单样例

```java
public class Itest {
    public static void main(String[] args) throws InterruptedException {
        System.setProperty("webdriver.chrome.driver", "E:\\chromedriver.exe");
        WebDriver driver = new ChromeDriver();
        driver.get("http://www.baidu.com");
        
        Thread.sleep(10000);
        driver.close();
    }
}
```

### 2.2 Selenium元素定位

#### 2.2.1 定位元素

- driver.findElement(By.id("元素id"))
- driver.findElement(By.name("元素name"))
- driver.findElement(By.className("元素className"))
- driver.findElement(By.tagName("元素tagName"))
- driver.findElement(By.linkText("文本"))
- driver.findElement(By.cssSelector("css选择器")) （注意空格）
- driver.findElement(By.xpath("xpath表达式"))
- ...

#### 2.2.2 获取元素列表

```java
driver.findElements(By.cssSelector(".for.list td"));
```

获取到的元素列表为 List<WebElement> 对象，不建议直接循环来获取 元素对象，而是从根中重新获取，以避免获取元素失败

```java
List<WebElement> heads = driver.findElements(By.cssSelector(".for.list td"));

for (int i = 0; i < heads.size(); i++) {
    String href = driver.findElements(By.cssSelector(".for.list td")).get(i).getText();
}
```

#### 2.2.3 下拉框选择

```java
WebElement el = driver.findElement(By.xpath("//select"));
Select sel = new Select(el);
sel.selectByValue("20");
```

### 2.3 设置元素等待

WebDriver提供了两种类型的等待：显式等待和隐式等待。

#### 2.3.1 显式等待

显式等待， 针对某个元素等待

```java
WebDriverWait wait = new WebDriverWait(driver,10,1);
wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".for.list")));
```

#### 2.3.1 显式等待

隐式等待， 针对某个元素等待

```java
driver.manage().timeouts().pageLoadTimeout(5, TimeUnit.SECONDS);
```

### 2.4 WebElement常用方法

-  clear() 清除文本

- sendKeys(*value) 模拟按键输入
- click() 单击元素

```java
driver.findElement(By.id("username")).sendKeys("用户名");
driver.findElement(By.id("password"))sendKeys("密码");
driver.findElement(By.id("commit")).click;
```

### 2.5 键鼠操作

#### 2.5.1 Actions 键鼠操作
- contextClick() 右击
- clickAndHold() 鼠标点击并控制
- doubleClick() 双击
- dragAndDrop() 拖动
- release() 释放鼠标
- perform() 执行所有Actions中存储的行为

```java
// 新建一个action   
Actions action = new Actions(driver);   
// 鼠标左键单击
action.click().perform();
// 鼠标左键双击
action.doubleClick(WebElement).perform();
// 鼠标左键按下
action.clickAndHold(WebElement).perform();
// 鼠标移动到元素
action.moveToElement(WebElement).perform();
// 元素右键点击
action.contextClick(WebElement).perform();
// 将目标元素拖拽到指定的元素上
action.dragAndDrop(webElement1,webElement2);
action.dragAndDrop(webElement, xOffset, yOffset);

Actions action = new Actions(driver);
action.keyDown(Keys.CONTROL);//按下control键
action.keyUp(Keys.CONTROL);//松开control键
action.keyDown(Keys.CONTROL).keyDown(Keys.ALT).keyDown("A").keyUp(Keys.CONTROL).keyUp(Keys.ALT).keyUp("A").perform();
action.sendKeys(Keys.CONTROL+"a").perform();
action.sendKeys(Keys.CONTROL, Keys.ALT, "A").perform();
```

### 2.5.2 元素sendKeys()

```java
sendKeys(Keys.BACK_SPACE) //回格键（BackSpace）
sendKeys(Keys.SPACE) //空格键(Space)
sendKeys(Keys.TAB) //制表键(Tab)
```

### 2.6 窗口控制

#### 2.6.1 窗口切换

- 使用 driver.getWindowHandles() 获取所有窗口

- 使用 driver.switchTo().window(hand) 切换窗口

```java
Set<String> handles = driver.getWindowHandles();
for (String hand : handles) {
    if (!StringUtils.equals(mainHand, hand)) {
        driver.switchTo().window(hand);
    }
}
```

## 3 linux无窗口模式

### 3.1 linux安装chrome浏览器

```shell
wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm 
yum install -y google-chrome-stable_current_x86_64.rpm
```

### 3.2 下载对应版本的driver

查询当前浏览器版本

```shell
google-chrome --version
```

### 3.3 设置Selenium无头模式

1. 设置无头模式

```java
options.setHeadless(Boolean.TRUE);
```

1. 配置头信息

```java
options.addArguments("--no-sandbox");
options.addArguments("--disable-dev-shm-usage");
```

1. 需要配置浏览器窗口大小，来确保元素可以检索

```java
WebDriverWait wait = new WebDriverWait(driver, 60);
Dimension dimension = new Dimension(1920, 1080);
driver.manage().window().setSize(dimension);
```

1. 若遇到如下提示

```
The driver is not executable: /opt/code/news/chromedriver
```

运行如下命令即可：

```shell
chmod 775 ./chromedriver
```

### 3.4 设置完成，启动运行

参考：

[Java使用Selenium实现自动化测试以及全功能爬虫](https://www.ytooo.top/e8a89aa3.html)

[Selenium教程](https://www.cnblogs.com/yogouo/category/1601782.html)