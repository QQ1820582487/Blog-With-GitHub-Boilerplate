---
layout: post
title: Spring Bean注入的Lite模式和Full模式
slug: bj43
date: 2020-12-23 11:36
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Linux
excerpt: 笔记
---


## Lite模式

当`@Bean`方法在没有使用`@Configuration`注释的类中声明时，它们被称为**在Lite模式下处理**。它包括：在`@Component`中声明的`@Bean`方法，甚至只是在一个非常普通的类中声明的Bean方法，都被认为是Lite版的配置类。`@Bean`方法是一种通用的工厂方法（`factory-method`）机制。

和Full模式的`@Configuration`不同，Lite模式的`@Bean`方法**不能声明Bean之间的依赖关系**。因此，这样的`@Bean`方法**不应该调用其他@Bean方法**。每个这样的方法实际上**只是一个特定Bean引用的工厂方法(factory-method)**，没有任何特殊的运行时语义。

 **Lite模式下，直接返回新实例对象。**

### 何时为Lite模式

官方定义为：在没有标注`@Configuration`的类里面有`@Bean`方法就称为Lite模式的配置。透过源码再看这个定义是不完全正确的，而应该是有如下case均认为是Lite模式的配置类：

1. 类上标注有`@Component`注解
2. 类上标注有`@ComponentScan`注解
3. 类上标注有`@Import`注解
4. 类上标注有`@ImportResource`注解
5. **若类上没有任何注解**，但类内存在@Bean方法

以上case的前提均是类上没有被标注`@Configuration`，在**Spring 5.2之后**新增了一种case也算作Lite模式：

6. 标注有`@Configuration(proxyBeanMethods = false)`，注意：此值默认是true哦，需要显示改为false才算是Lite模式

注：自Spring5.2（对应Spring Boot 2.2.0）开始，`内置的`几乎所有的`@Configuration`配置类都被修改为了`@Configuration(proxyBeanMethods = false)`，目的何为？答：以此来降低启动时间，为Cloud Native继续做准备。

### 优缺点

**优点**：

- 运行时不再需要给对应类生成CGLIB子类，提高了运行性能，降低了启动时间
- 可以该配置类当作一个普通类使用喽：也就是说@Bean方法 **可以是private、可以是final**

**缺点**：

- 不能声明@Bean之间的依赖，也就是说不能通过方法调用来依赖其它Bean
- （其实这个缺点还好，很容易用其它方式“弥补”，比如：把依赖Bean放进方法入参里即可）

### 代码示例

主配置类：

```java
@ComponentScan("com.yourbatman.fullliteconfig.liteconfig")
@Configuration
public class AppConfig {
}
```

准备一个Lite模式的配置：

```java
@Component
// @Configuration(proxyBeanMethods = false) // 这样也是Lite模式
public class LiteConfig {

    @Bean
    public User user() {
        User user = new User();
        user.setName("A哥-lite");
        user.setAge(18);
        return user;
    }


    @Bean
    private final User user2() {
        User user = new User();
        user.setName("A哥-lite2");
        user.setAge(18);

        // 模拟依赖于user实例 看看是否是同一实例
        System.out.println(System.identityHashCode(user()));
        System.out.println(System.identityHashCode(user()));

        return user;
    }

    public static class InnerConfig {

        @Bean
        // private final User userInner() { // 只在lite模式下才好使
        public User userInner() {
            User user = new User();
            user.setName("A哥-lite-inner");
            user.setAge(18);
            return user;
        }
    }
}
```

测试用例：

```java
public class Application {

    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

        // 配置类情况
        System.out.println(context.getBean(LiteConfig.class).getClass());
        System.out.println(context.getBean(LiteConfig.InnerConfig.class).getClass());

        String[] beanNames = context.getBeanNamesForType(User.class);
        for (String beanName : beanNames) {
            User user = context.getBean(beanName, User.class);
            System.out.println("beanName:" + beanName);
            System.out.println(user.getClass());
            System.out.println(user);
            System.out.println("------------------------");
        }
    }
}
```

结果输出：

```
1100767002
313540687
class com.yourbatman.fullliteconfig.liteconfig.LiteConfig
class com.yourbatman.fullliteconfig.liteconfig.LiteConfig$InnerConfig
beanName:userInner
class com.yourbatman.fullliteconfig.User
User{name='A哥-lite-inner', age=18}
------------------------
beanName:user
class com.yourbatman.fullliteconfig.User
User{name='A哥-lite', age=18}
------------------------
beanName:user2
class com.yourbatman.fullliteconfig.User
User{name='A哥-lite2', age=18}
------------------------
```

### 小总结

- 该模式下，配置类本身不会被CGLIB增强，放进IoC容器内的就是本尊
- 该模式下，对于内部类是没有限制的：可以是Full模式或者Lite模式
- 该模式下，配置类内部**不能通过方法调用**来处理依赖，否则每次生成的都是一个新实例而并非IoC容器内的单例
- 该模式下，配置类就是一普通类嘛，所以@Bean方法可以使用`private/final`等进行修饰（static自然也是阔仪的）

## Full模式

在常见的场景中，`@Bean`方法都会在标注有`@Configuration`的类中声明，以确保总是使用“Full模式”，这么一来，交叉方法引用会被重定向到容器的生命周期管理，所以就可以更方便的管理Bean依赖。

**Full模式下通过方法调用指向的仍旧是原来的Bean。（单例）**

### 何时为Full模式

标注有`@Configuration`注解的类被称为full模式的配置类。自Spring5.2后这句话改为下面这样我觉得更为精确些：

- 标注有`@Configuration`或者`@Configuration(proxyBeanMethods = true)`的类被称为Full模式的配置类
- （当然喽，proxyBeanMethods属性的默认值是true，所以一般需要Full模式我们只需要标个注解即可）

### 优缺点

**优点**：

- 可以支持通过常规Java调用相同类的@Bean方法而保证是容器内的Bean，这有效规避了在“Lite模式”下操作时难以跟踪的细微错误。特别对于萌新程序员，这个特点很有意义。

**缺点**：

- 运行时会给该类生成一个CGLIB子类放进容器，有一定的性能、时间开销（这个开销在Spring Boot这种拥有大量配置类的情况下是不容忽视的，这也是为何Spring 5.2新增了`proxyBeanMethods`属性的最直接原因）
- 正因为被代理了，所以@Bean方法 **不可以是private、不可以是final**。

### 代码示例

主配置：

```java
@ComponentScan("com.yourbatman.fullliteconfig.fullconfig")
@Configuration
public class AppConfig {
}
```

准备一个Full模式的配置：

```java
@Configuration
public class FullConfig {

    @Bean
    public User user() {
        User user = new User();
        user.setName("A哥-lite");
        user.setAge(18);
        return user;
    }


    @Bean
    protected User user2() {
        User user = new User();
        user.setName("A哥-lite2");
        user.setAge(18);

        // 模拟依赖于user实例 看看是否是同一实例
        System.out.println(System.identityHashCode(user()));
        System.out.println(System.identityHashCode(user()));

        return user;
    }

    public static class InnerConfig {

        @Bean
        // private final User userInner() { // 只在lite模式下才好使
        public User userInner() {
            User user = new User();
            user.setName("A哥-lite-inner");
            user.setAge(18);
            return user;
        }
    }
}
```

测试用例：

```java
public class Application {

    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

        // 配置类情况
        System.out.println(context.getBean(FullConfig.class).getClass());
        System.out.println(context.getBean(FullConfig.InnerConfig.class).getClass());

        String[] beanNames = context.getBeanNamesForType(User.class);
        for (String beanName : beanNames) {
            User user = context.getBean(beanName, User.class);
            System.out.println("beanName:" + beanName);
            System.out.println(user.getClass());
            System.out.println(user);
            System.out.println("------------------------");
        }
    }
}
```

结果输出：

```
550668305
550668305
class com.yourbatman.fullliteconfig.fullconfig.FullConfig$$EnhancerBySpringCGLIB$$70a94a63
class com.yourbatman.fullliteconfig.fullconfig.FullConfig$InnerConfig
beanName:userInner
class com.yourbatman.fullliteconfig.User
User{name='A哥-lite-inner', age=18}
------------------------
beanName:user
class com.yourbatman.fullliteconfig.User
User{name='A哥-lite', age=18}
------------------------
beanName:user2
class com.yourbatman.fullliteconfig.User
User{name='A哥-lite2', age=18}
------------------------
```

### 小总结

- 该模式下，配置类会被CGLIB增强(生成代理对象)，放进IoC容器内的是代理
- 该模式下，对于内部类是没有限制的：可以是Full模式或者Lite模式
- 该模式下，配置类内部**可以通过方法调用**来处理依赖，并且能够保证是同一个实例，都指向IoC内的那个单例
- 该模式下，@Bean方法不能被`private/final`等进行修饰（很简单，因为方法需要被重写嘛，所以不能私有和final。defualt/protected/public都可以哦），否则启动报错。

## 使用建议

了解了Spring配置类的Full模式和Lite模式，那么在工作中该如何使用呢？

这里A哥给出使用建议，仅供参考：

- 如果是在公司的业务功能/服务上做开发，使用Full模式

- 如果你是个容器开发者，或者你在开发中间件、通用组件等，那么使用Lite模式是一种更被推荐的方式，它对Cloud Native更为友好


[原文](https://mp.weixin.qq.com/s?__biz=MzI0MTUwOTgyOQ==&mid=2247484035&idx=1&sn=a3a1a3f88e93e448e1e86980f686fd2b&chksm=e90b3629de7cbf3faac46d433bf4f37f5f7057b5f9fd47fb80c1fbf6a7f8cf2479cdcfab46e4&scene=178&cur_album_id=1608175058340888581#rd)