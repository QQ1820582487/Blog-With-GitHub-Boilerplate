## Spring  Boot 记录日志

#### 1.在类中添加Logger

```java
private static final Logger LOGGER = LoggerFactory.getLogger(SpringbootJpaApplication.class);
```

#### 2.使用Logger记录日志

例：

```java
@SpringBootApplication
public class SpringbootApplication {
    private static final Logger LOGGER = LoggerFactory.getLogger(SpringbootApplication.class);

    public static void main(String[] args) {
        LOGGER.debug("日志记录");
        LOGGER.info("日志记录");
        LOGGER.error("日志记录");
        SpringApplication.run(SpringbootApplication.class, args);
    }
}
```

![1588446658966](C:\Users\Xuxx3309\AppData\Roaming\Typora\typora-user-images\1588446658966.png)

