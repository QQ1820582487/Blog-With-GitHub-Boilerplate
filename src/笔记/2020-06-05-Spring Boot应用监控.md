---
layout: post
title: Spring Boot应用监控
slug: bj26
date: 2020-06-05 00:50
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
  - Spring Boot
excerpt: 笔记
---

## 1.Actuator入门

[官方文档](https://docs.spring.io/spring-boot/docs/2.3.0.RELEASE/reference/html/production-ready-features.html#production-ready-endpoints)

Actuator是Spring Boot提供的一个服务，可以通过暴露端点路由，用来输出应用中的诸多端点信息。

每个单独的端点都可以[通过HTTP或JMX ](https://docs.spring.io/spring-boot/docs/2.3.0.RELEASE/reference/html/production-ready-features.html#production-ready-endpoints-exposing-endpoints)[启用或禁用](https://docs.spring.io/spring-boot/docs/2.3.0.RELEASE/reference/html/production-ready-features.html#production-ready-endpoints-enabling-endpoints)和[公开（可远程访问）](https://docs.spring.io/spring-boot/docs/2.3.0.RELEASE/reference/html/production-ready-features.html#production-ready-endpoints-exposing-endpoints)。启用和公开端点均被视为可用。内置端点只有在可用时才会被自动配置。大多数应用程序选择通过HTTP公开，其中端点的ID和前缀`/actuator`映射到URL。例如，默认情况下，`health`端点映射到`/actuator/health`。

依赖如下

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

启动Spring Boot应用程序之后，只要在浏览器中输入端点信息就能获得应用的一些状态信息。

| ID                 | 描述                                                         |
| :----------------- | :----------------------------------------------------------- |
| `auditevents`      | 公开当前应用程序的审核事件信息。需要一个`AuditEventRepository`Bean。 |
| `beans`            | 显示应用程序中所有Spring Bean的完整列表。                    |
| `caches`           | 公开可用的缓存。                                             |
| `conditions`       | 显示在配置和自动配置类上评估的条件以及它们匹配或不匹配的原因。 |
| `configprops`      | 显示所有的整理列表`@ConfigurationProperties`。               |
| `env`              | 公开Spring的属性`ConfigurableEnvironment`。                  |
| `flyway`           | 显示已应用的所有Flyway数据库迁移。需要一个或多个`Flyway`Bean。 |
| `health`           | 显示应用程序运行状况信息。                                   |
| `httptrace`        | 显示HTTP跟踪信息（默认情况下，最近100个HTTP请求-响应交换）。需要一个`HttpTraceRepository`Bean。 |
| `info`             | 显示任意应用程序信息。                                       |
| `integrationgraph` | 显示Spring Integration图。需要对的依赖`spring-integration-core`。 |
| `loggers`          | 显示和修改应用程序中记录器的配置。                           |
| `liquibase`        | 显示已应用的所有Liquibase数据库迁移。需要一个或多个`Liquibase`Bean。 |
| `metrics`          | 显示当前应用程序的“指标”信息。                               |
| `mappings`         | 显示所有`@RequestMapping`路径的整理列表。                    |
| `scheduledtasks`   | 显示应用程序中的计划任务。                                   |
| `sessions`         | 允许从Spring Session支持的会话存储中检索和删除用户会话。需要使用Spring Session的基于Servlet的Web应用程序。 |
| `shutdown`         | 使应用程序正常关闭。**默认禁用。**                           |
| `threaddump`       | 执行线程转储。                                               |

如果您的应用程序是Web应用程序（Spring MVC，Spring WebFlux或Jersey），则可以使用以下附加端点：

| ID           | 描述                                                         |
| :----------- | :----------------------------------------------------------- |
| `heapdump`   | 返回`hprof`堆转储文件。                                      |
| `jolokia`    | 通过HTTP公开JMX bean（当Jolokia在类路径上时，不适用于WebFlux）。需要对的依赖`jolokia-core`。 |
| `logfile`    | 返回日志文件的内容（如果已设置`logging.file.name`或`logging.file.path`属性）。支持使用HTTP `Range`标头来检索部分日志文件的内容。 |
| `prometheus` | 以Prometheus服务器可以抓取的格式公开指标。需要对的依赖`micrometer-registry-prometheus`。 |

常用端点列举如下，可以一个个详细试一下：

- /info           　　　　　   应用基本信息
- /health       　　　　　   健康度信息
- /metrics     　　　　　   运行指标
- /env           　　　　　   环境变量信息
- /loggers    　　　　　    日志相关
- /dump       　　　　　　线程相关信息
- /trace      　　　　　　   请求调用轨迹

### 1.1.启用端点

默认情况下，所有端点`shutdown`均处于启用状态。要配置端点的启用，请使用其`management.endpoint.<id>.enabled`属性。以下示例启用`shutdown`端点：

```properties
management.endpoint.shutdown.enabled=true
```

如果您希望启用端点启用而不是退出启用，请将该`management.endpoints.enabled-by-default`属性设置为，`false`并使用各个端点`enabled`属性重新启用。以下示例启用该`info`端点并禁用所有其他端点：

```properties
management.endpoints.enabled-by-default=false
management.endpoint.info.enabled=true
```

默认只有`shutdown`端点是禁用的，但是默认情况下也只能使用`/health`和`/info`端点，因为端口不仅要开启，还需要暴露。

### 1.2.暴露端点

由于端点可能包含敏感信息，因此应谨慎考虑何时公开它们。下表显示了内置端点的默认暴露：

| ID                 | JMX    | 网页 |
| :----------------- | :----- | :--- |
| `auditevents`      | 是     | 没有 |
| `beans`            | 是     | 没有 |
| `caches`           | 是     | 没有 |
| `conditions`       | 是     | 没有 |
| `configprops`      | 是     | 没有 |
| `env`              | 是     | 没有 |
| `flyway`           | 是     | 没有 |
| `health`           | 是     | 是   |
| `heapdump`         | 不适用 | 没有 |
| `httptrace`        | 是     | 没有 |
| `info`             | 是     | 是   |
| `integrationgraph` | 是     | 没有 |
| `jolokia`          | 不适用 | 没有 |
| `logfile`          | 不适用 | 没有 |
| `loggers`          | 是     | 没有 |
| `liquibase`        | 是     | 没有 |
| `metrics`          | 是     | 没有 |
| `mappings`         | 是     | 没有 |
| `prometheus`       | 不适用 | 没有 |
| `scheduledtasks`   | 是     | 没有 |
| `sessions`         | 是     | 没有 |
| `shutdown`         | 是     | 没有 |
| `threaddump`       | 是     | 没有 |

下表是默认的端点暴露情况:

| 属性                                        | 默认           |
| :------------------------------------------ | :------------- |
| `management.endpoints.jmx.exposure.exclude` |                |
| `management.endpoints.jmx.exposure.include` | `*`            |
| `management.endpoints.web.exposure.exclude` |                |
| `management.endpoints.web.exposure.include` | `info, health` |

例如，要通过HTTP暴露除`env`和`beans`端点之外的所有内容，使用以下配置：

```properties
management.endpoints.web.exposure.include=*
management.endpoints.web.exposure.exclude=env,beans
```

注意：在YAML中有特殊含义，因此，如果要包括（或排除）所有端点，请确保添加引号，如以下示例所示：

```
management:
  endpoints:
    web:
      exposure:
        include: "*"
```

### 1.3.保护HTTP端点

应该像对待其他任何敏感URL一样，小心保护HTTP端点的安全。如果存在Spring Security，则默认情况下使用Spring Security的内容协商策略来保护端点安全。例如，如果希望为HTTP端点配置自定义安全性，只允许具有特定角色的用户访问它们，Spring Boot提供了一些方便的`RequestMatcher`对象，这些对象可以与Spring Security结合使用。

引入Spring Security

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

添加配置

```properties
spring.security.user.name=xuxx
spring.security.user.password=123
spring.security.user.roles=ENDPOINT_ADMIN
```

典型的Spring Security配置可能类似于以下示例：

```java
@Configuration(proxyBeanMethods = false)
public class ActuatorSecurity extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.requestMatcher(EndpointRequest.toAnyEndpoint())
                .authorizeRequests()
                .anyRequest()
                .hasRole("ENDPOINT_ADMIN")
                .and()
                .httpBasic();
    }

}
```

### 1.4.CORS支持

默认情况下，CORS支持是禁用的，并且仅`management.endpoints.web.cors.allowed-origins`在设置属性后才启用。以下配置允许`GET`和`POST`从`example.com`域调用：

```properties
management.endpoints.web.cors.allowed-origins=https://xuxx.com
management.endpoints.web.cors.allowed-methods=GET,POST
```

## 2.通过HTTP进行监视和管理

### 2.1.自定义管理端点路径

有时，自定义管理端点的前缀很有用。例如，`/actuator`已经用于其他用途。可以使用该`management.endpoints.web.base-path`属性来更改管理端点的前缀，如以下示例所示：

```properties
management.endpoints.web.base-path=/manage
```

设置完重启后，再次访问地址就会变成`/manage/*`



如果要将端点映射到其他路径，则可以使用该`management.endpoints.web.path-mapping`属性。

以下示例重新映射`/actuator/health`到`/healthcheck`：

application.properties

```properties
management.endpoints.web.base-path=/
management.endpoints.web.path-mapping.health=healthcheck
```

### 2.2禁用HTTP端点

如果不想通过HTTP公开端点，则可以将管理端口设置为`-1`，如以下示例所示：

```properties
management.server.port=-1
```

也可以使用该`management.endpoints.web.exposure.exclude`属性来实现，如以下示例所示：

```properties
management.endpoints.web.exposure.exclude=*
```

### 2.3.自定义管理服务器端口和地址

对于基于云的部署，使用默认的HTTP端口公开管理端点是明智的选择。但是，如果应用程序在自己的数据中心内运行，则可能更倾向于使用其他HTTP端口公开端点。

如以下示例所示：

```properties
management.server.port=8081
management.server.address=127.0.0.1
```

## 3.常用端点

### 3.1.health端点

health 主要用来检查应用的运行状态，这是我们使用最高频的一个监控点。通常使用此接口提醒我们应用实例的运行状态，以及应用不”健康“的原因，比如数据库连接、磁盘空间不够等。

默认情况下 health 的状态是开放的，添加依赖后启动项目，访问：`http://localhost:8080/actuator/health`即可看到应用的状态。

```json
{
    "status" : "UP"
}
```

默认情况下，最终的 Spring Boot 应用的状态是由 HealthAggregator(健康聚合器) 汇总而成的，汇总的算法是：

- 1 设置状态码顺序：`setStatusOrder(Status.DOWN, Status.OUT_OF_SERVICE, Status.UP, Status.UNKNOWN);`。
- 2 过滤掉不能识别的状态码。
- 3 如果无任何状态码，整个 Spring Boot 应用的状态是 UNKNOWN。
- 4 将所有收集到的状态码按照 1 中的顺序排序。
- 5 返回有序状态码序列中的第一个状态码，作为整个 Spring Boot 应用的状态。

health 通过合并几个健康指数检查应用的健康情况。Spring Boot Actuator 有几个预定义的健康指标比如`DataSourceHealthIndicator`, `DiskSpaceHealthIndicator`, `MongoHealthIndicator`, `RedisHealthIndicator`等，它使用这些健康指标作为健康检查的一部分。

举个例子，如果你的应用使用了Redis，`RedisHealthindicator` 将被当作检查的一部分；如果使用了MongoDB，那么`MongoHealthIndicator` 将被当作检查的一部分。

可以在配置文件中关闭特定的健康检查指标，比如关闭 redis 的健康检查：

```properties
management.health.redise.enabled=false
```

默认情况下，所有的这些健康指标都被当作健康检查的一部分。

### 3.2.info端点

#### 1.自定义信息

info 就是我们自己配置在配置文件中以 info 开头的配置信息（也可以使用java代码配置，懒得写），例如：

```properties
info.app.encoding=@project.build.sourceEncoding@
info.app.java.source=@java.version@
info.author.name=xuxx
info.author.phone=10086
```

启动项目，访问：`http://localhost:8080/actuator/info`返回信息如下：

```json
{
  "author": {
    "phone": "10086",
    "name": "xuxx"
  },
  "app": {
    "encoding": "UTF-8",
    "java": {
      "source": "1.8.0_221"
    }
  }
}
```

#### 2.git信息

引入插件，该插件用来产生git的版本信息

```xml
<plugin>
    <groupId>pl.project13.maven</groupId>
    <artifactId>git-commit-id-plugin</artifactId>
</plugin>
```

执行插件（未使用git的话会报错：缺少.git文件）

![](..\static\笔记图片\2020-06-05-Spring Boot应用监控_01.png)

执行完成后，在`target/classes`目录下，产生了一个`git.properties`配置信息：

![](D:\UserData\Desktop\杂物\Xuxx_Blogs\src\static\笔记图片\2020-06-05-Spring Boot应用监控_02.png)

这个文件就是当前项目的git信息，它的内容如下：

```properties
#Generated by Git-Commit-Id-Plugin
#Fri Jun 05 04:07:54 CST 2020
git.branch=master
git.build.host=Xuxx3309
git.build.time=2020-06-05T04\:07\:54+0800
git.build.user.email=1820502487@qq.com
git.build.user.name=Xuxx
git.build.version=0.0.1-SNAPSHOT
git.closest.tag.commit.count=
git.closest.tag.name=
git.commit.id=35f45d9378511195e5ce3501278c5efa315a5070
git.commit.id.abbrev=35f45d9
git.commit.id.describe=35f45d9
git.commit.id.describe-short=35f45d9
git.commit.message.full=初始化
git.commit.message.short=初始化
git.commit.time=2020-06-05T04\:07\:48+0800
git.commit.user.email=1820502487@qq.com
git.commit.user.name=Xuxx
git.dirty=false
git.local.branch.ahead=NO_REMOTE
git.local.branch.behind=NO_REMOTE
git.remote.origin.url=Unknown
git.tags=
git.total.commit.count=1
```

启动测试(没有配置git信息的展示策略)，访问：`http://localhost:8080/actuator/info`返回信息如下：

```json
{
  "author": {
    "phone": "10086",
    "name": "xuxx"
  },
  "app": {
    "encoding": "UTF-8",
    "java": {
      "source": "1.8.0_221"
    }
  },
  "git": {
    "commit": {
      "time": "2020-06-04T20:07:48Z",
      "id": "35f45d9"
    },
    "branch": "master"
  }
}
```

其中包含了关于branch和commit的基础信息。而这个信息格式是最简模式，我们也可以配置一下git信息的展示策略，默认为simple

```properties
management.info.git.mode=full
```

重启应用后再访问`/info`端点，可以获得更为详细的版本信息了。

#### 3.build信息

和git信息类似，引入插件

```xml
<plugin>
    <groupId>pl.project13.maven</groupId>
    <artifactId>git-commit-id-plugin</artifactId>
</plugin>
```

执行插件:

![](D:\UserData\Desktop\杂物\Xuxx_Blogs\src\static\笔记图片\2020-06-05-Spring Boot应用监控_04.png)

执行完成后，在`target/classes`目录下，产生了一个`build-info.properties`配置信息：

![](..\static\笔记图片\2020-06-05-Spring Boot应用监控_06.png)

这个文件就是当前项目的git信息，它的内容如下：

```properties
build.artifact=actuator
build.group=com.xuxx
build.name=actuator
build.time=2020-06-04T20\:39\:03.874Z
build.version=0.0.1-SNAPSHOT
```

启动测试,访问：`http://localhost:8080/actuator/info`返回信息如下：

```json
{
  "author": {
    "phone": "10086",
    "name": "xuxx"
  },
  "app": {
    "encoding": "UTF-8",
    "java": {
      "source": "1.8.0_221"
    }
  },
  "git": {
    "commit": {
      "time": "2020-06-04T20:07:48Z",
      "id": "35f45d9"
    },
    "branch": "master"
  },
  "build": {
    "version": "0.0.1-SNAPSHOT",
    "artifact": "actuator",
    "name": "actuator",
    "group": "com.xuxx",
    "time": "2020-06-04T20:39:03.874Z"
  }
}
```

