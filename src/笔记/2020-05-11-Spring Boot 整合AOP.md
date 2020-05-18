---
layout: post
title: Spring Boot整合AOP
slug: bj16
date: 2020-05-11 02:10
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
  - Spring
excerpt: 笔记
---

### 一、前言

众所周知，spring最核心的两个功能是aop和ioc，即面向切面和控制反转。本文会讲一讲SpringBoot如何使用AOP实现面向切面的过程原理。

### 二、何为aop

 aop全称`Aspect Oriented Programming`，面向切面，AOP主要实现的目的是针对业务处理过程中的切面进行提取，它所面对的是处理过程中的某个步骤或阶段，以获得逻辑过程中各部分之间低耦合性的隔离效果。其与设计模式完成的任务差不多，是提供另一种角度来思考程序的结构，来弥补面向对象编程的不足。

　　通俗点讲就是提供一个为一个业务实现提供切面注入的机制，通过这种方式，在业务运行中将定义好的切面通过切入点绑定到业务中，以实现将一些特殊的逻辑绑定到此业务中。

　　举个栗子，项目中有记录操作日志的需求、或者流程变更是记录变更履历，无非就是插表操作，很简单的一个save操作，都是一些记录日志或者其他辅助性的代码。一遍又一遍的重写和调用。不仅浪费了时间，又将项目变得更加的冗余，实在得不偿失。

　　所以就需要面向切面aop就出场了。

### 三、aop相关名词

 要理解SpringBoot整合aop的实现，就必须先对面向切面实现的一些aop的名称有所了解，不然也是云里雾里。

- **切面（Aspect）**：一个关注点的模块化。以注解@Aspect的形式放在类上方，声明一个切面。

- **连接点（Joinpoint）**：在程序执行过程中某个特定的点，比如某方法调用的时候或者处理异常的时候都可以是连接点。

- **通知（Advice）**：通知增强，需要完成的工作叫做通知，就是你写的业务逻辑中需要比如事务、日志等先定义好，然后需要的地方再去用。

  主要包括5个注解：Before，After，AfterReturning，AfterThrowing，Around。

  @Before：在切点方法之前执行。

  @After：在切点方法之后执行

  @AfterReturning：切点方法返回后执行

  @AfterThrowing：切点方法抛异常执行

  @Around：属于环绕增强，能控制切点执行前，执行后，用这个注解后，程序抛异常，会影响@AfterThrowing这个注解

- **切点（Pointcut）**：其实就是**筛选出的连接点**，匹配连接点的断言，一个类中的所有方法都是连接点，但又不全需要，**会筛选出某些作为连接点做为切点**。如果说通知定义了切面的动作或者执行时机的话，切点则定义了执行的地点。切入点表达式如何和连接点匹配是AOP的核心：Spring缺省使用AspectJ切入点语法。

- **引入（Introduction）**：在不改变一个现有类代码的情况下，为该类添加属性和方法,可以在无需修改现有类的前提下，让它们具有新的行为和状态。其实就是把切面（也就是新方法属性：通知定义的）用到目标类中去。

- **目标对象（Target Object）**：被一个或者多个切面所通知的对象。也被称做被通知（adviced）对象。既然Spring AOP是通过运行时代理实现的，这个对象永远是一个被代理（proxied）对象。

- **AOP代理（AOP Proxy）**：AOP框架创建的对象，用来实现切面契约（例如通知方法执行等等）。在Spring中，AOP代理可以是JDK动态代理或者CGLIB代理。

- **织入（Weaving）**：把切面连接到其它的应用程序类型或者对象上，并创建一个被通知的对象。这些可以在编译时（例如使用AspectJ编译器），类加载时和运行时完成。Spring和其他纯Java AOP框架一样，在运行时完成织入。

 其中重要的名词有：**切面（Aspect）**，**切入点（Pointcut）**

### 四、代码实现

```xml
<!--引入AOP依赖-->
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-aop</artifactId>
	<version>2.1.6.RELEASE</version>
</dependency>
```

```java
//模拟一下service
@Service
public class UserService {
    public String getUsernameById(Integer id) {
        System.out.println("被增强方法>>>   getUsernameById");
//        int i = 1 / 0;
        return "xuxx - " + id;
    }

    public void deleteUserById(Integer id) {
        System.out.println("deleteUserById  " + id);
    }
}
```

```java
@RestController
public class UserController {
    @Autowired
    UserService service;

    @GetMapping("/getuser")
    public String getUsernameById(Integer id) {
        return service.getUsernameById(1);
    }

    @DeleteMapping("/deluser")
    public void deleteUserById(Integer id) {
        service.deleteUserById(1);
    }
}
```

```java
//切面类
@Component
@Aspect//切面
public class LogComponent {
    /**
     * 定义切入点
     * 此处是com.xuxx.aop.service包下的任意参数、任意返回值的任意方法
     */
    @Pointcut("execution(* com.xuxx.aop.service.*.*(..))")
    public void pc1() {
    }

    /**
     * 前置通知，在方法执行之前执行
     */
    @Before("pc1()")
    public void before(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("Before>>>   " + methodName);
    }

    /**
     * 后置通知，在方法执行之后执行（无论是否发生异常）还不能访问目标方法执行的结果
     */
    @After("pc1()")
    public void after(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("After>>>   " + methodName);
    }

    /**
     * 返回通知，在方法正常结束后 返回结果之后执行 可以访问方法的返回值
     */
    @AfterReturning(value = "pc1()", returning = "result")
    public void afterReturning(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("AfterReturning>>>   " + methodName + "-----result>>>" + result);
    }

    /**
     * 异常通知，在方法抛出异常之后执行
     * 可以访问到异常对象，而且可以指定在出现特定异常时再通知代码。
     */
    @AfterThrowing(value = "pc1()", throwing = "t")
    public void afterThrowing(JoinPoint joinPoint, Throwable t) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("AfterThrowing>>>   " + methodName + " -----Throwable>>>   " + t.getMessage());
    }

    /**
     * 环绕通知，围绕着方法执行
     * 其实就相当于动态代理，包含了整个通知的过程。
     * proceed方法类似于使用动态代理时的invoke方法
     * 环绕通知和其他通知一起使用时要考虑顺序问题
     */
    @Around(value = "pc1()")
    public Object around(ProceedingJoinPoint pjp) {
        Object result = null;
        String methodName = pjp.getSignature().getName();
        try {
            System.out.println("Around>>>  前置通知返回执行的方法:" + methodName + " --- 方法参数:" + Arrays.asList(pjp.getArgs()));
            result = pjp.proceed();
            System.out.println("Around>>>  返回通知的结果是:" + result);
        } catch (Throwable throwable) {
            throwable.printStackTrace();
            System.out.println("Around>>>  异常返回");
        }
        System.out.println("Around>>>  后置通知:" + methodName);
        result = "Around>>>  如果要改变返回值，注意类型转换异常";
        return result;
    }
}
```

**Spring 基于注解的AOP配置注意事项**
**通知类方法的执行顺序**

1. 基于XML:
   前置通知(Before) → 返回通知(AfterRunning)/异常通知(AfterThrowing) → 后置通知(After)
2. 基于注解
   前置通知(Before) → 后置通知(After) → 返回通知(AfterRunning)/异常通知(AfterThrowing)

所以,基于注解的AOP配置通知类的方法**最好单独使用环绕通知(Around)**

补充：基于注解的执行顺序
1.进入环绕通知(Around)

2.前置通知(Before) 

3.退出环绕通知(Around)

4.后置通知(After)

5.返回通知(AfterRunning)/异常通知(AfterThrowing)