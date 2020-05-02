## Spring  Boot 记录日志

### 1.基本操作

#### 1.在类中添加Logger

```java
private static final Logger log = LoggerFactory.getLogger(SpringbootJpaApplication.class);
```

#### 2.使用log记录日志

例：

```java
@SpringBootApplication
public class SpringbootApplication {
    private static final Logger log = LoggerFactory.getLogger(SpringbootApplication.class);

    public static void main(String[] args) {
        log.debug("日志记录");
        log.info("日志记录");
        log.error("日志记录");
        SpringApplication.run(SpringbootApplication.class, args);
    }
}
```

![1588446986097](C:\Users\Xuxx3309\AppData\Roaming\Typora\typora-user-images\1588446986097.png)

### 2.便捷操作

#### 1.在类上添加@Slf4j注解

#### 2.使用log记录日志

例：

```java
@Slf4j
@SpringBootApplication
public class SpringbootApplication {
    public static void main(String[] args) {
        log.debug("日志记录");
        log.info("日志记录");
        log.error("日志记录");
        SpringApplication.run(SpringbootApplication.class, args);
    }
}
```

![1588446986097](C:\Users\Xuxx3309\AppData\Roaming\Typora\typora-user-images\1588446986097.png)