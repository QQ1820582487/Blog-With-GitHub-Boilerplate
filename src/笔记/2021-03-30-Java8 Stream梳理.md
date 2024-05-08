---
layout: post
title: Java8 Stream梳理
slug: bj45
date: 2021-03-30 11:25
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
excerpt: 笔记
---
## 1. Streams API 面面观

### 1.1 Streams API 能做什么

Streams API 是对 java 中集合对象功能的增强，他可以让集合的操作变得更加便利、高效

他会自动通过并发执行的方式优化大批量数据集合的聚合操作，同时，结合另一个 java8 的新特性 -- Lambda 表达式，可以极大地提升编程效率，增加代码可读性

基于 jvm 底层的硬件优化，streams api 可以十分方便的利用多核性能，达到并发编程的效果，传统的并发编程往往因为其复杂性十分容易出错，但使用 streams api 则无需担心这个问题

### 1.2 Stream 是什么

stream 顾名思义，就是“流”，这个名字突出了集合对象流式处理的含义

说到“流式处理”，读者朋友们肯定并不陌生，在 java 中，迭代器就是一种通用的流式处理手段，stream 可以看成是迭代器的高级版本，他不保存数据，他只负责执行预定的算法和计算过程，因此 stream 很像是迭代器的函数式编程版本

和迭代器一样，stream 也是对集合单向遍历一次，并且不可以回头往复，但不同的是，stream 支持了这个过程的自动并发执行，并且将遍历过程变得更加简洁易读

### 1.3 Stream 的构成

一个流的使用通常包括三个基本步骤：

1. 获取数据源
2. 数据转换 -- Intermediate
3. 执行操作 -- Terminal

其中，数据转换操作是以数据源为输入，进行一些操作后返回一个新的流进行接下来操作，数据转换操作可以多次进行，从而让整个流变成一个流管道：

![](..\static\笔记图片\2021-03-30-Java8 Stream梳理_01.png)

最终，一个流只能有一个 terminal 执行操作，作为流的终结，他生成一个结果或一个 side effect

事实上，真正触发流的遍历操作的就是 terminal 操作的执行

除此以外，如果流的输入是一个无限大的集合，那么还必须具有 `short-circuiting` 操作，他有两个作用：

1. 对于一个 intermediate 操作，如果它接受的是一个无限大（infinite/unbounded）的 Stream，但返回一个有限的新 Stream
2. 对于一个 terminal 操作，如果它接受的是一个无限大的 Stream，但能在有限的时间计算出结果 

## 2. 流的创建

流的创建方式有很多种：

### 2.1 从 Collection 和数组创建流

1. Collection.stream()
2. Collection.parallelStream()
3. Arrays.stream(T array)
4. Stream.of(T array)

- 额外一提，java8 除了通用的 Stream 外，还为基本数值类型提供了 IntStream、LongStream、DoubleStream 三种包装类型可供使用

### 2.2 通过 BufferedReader 读取

- java.io.BufferedReader.lines()

### 2.3 通过静态工厂生成流

1. java.util.stream.IntStream.range()
2. java.nio.file.Files.walk()

### 2.4 其他创建方式

1. 自定义构建 -- java.util.Spliterator
2. 随机数流 -- Random.ints()
3. 位操作流 -- BitSet.stream()
4. 字符流 -- Pattern.splitAsStream(java.lang.CharSequence)
5. jar 文件内容流 -- JarFile.stream()

## 3. 流的操作

上面已经提到，流共有三种操作：

1. Intermediate 操作
2. Short-Circuiting 操作
3. Terminal 操作

下面就来一一介绍一下这三大类操作中具体的那些操作

### 3.1 Intermediate 操作

Intermediate 操作的输入是已经创建好的流，输出是进行转换后的流，主要有以下操作：

- map -- 将输入流转换为另一个流

  ```java
  public class Map {
  
      /**
       * map，可以看到 map 操作符要求输入一个Function的函数是接口实例，功能是将T类型转换成R类型的。
       */
      public static void main(String[] args) {
          Stream.of("apple", "banana", "orange", "waltermaleon", "grape")
                  //转成单词的长度 int
                  .map(e -> e.length())
                  //输出
                  //.forEach(e -> System.out.println(e));
                  //方法引用
                  .forEach(System.out::println);
      }
  }
  ```

- mapToInt/mapToLong -- 将转换结果的原始数值自动包装，转换后生成一个 IntStream/LongStream

  ```java
  public class MapToInt {
  
      /**
       * mapToInt 将数据流中得元素转成Int，这限定了转换的类型Int，最终产生的流为IntStream，及结果只能转化成int。
       * mapToLong、mapToDouble与 mapToInt 类似
       */
      public static void main(String[] args) {
          Stream.of("apple", "banana", "orange", "waltermaleon", "grape")
                  //转成int
                  .mapToInt(String::length)
                  .forEach(System.out::println);
  
          Stream.of("apple", "banana", "orange", "waltermaleon", "grape")
                  //转成long ,本质上是int 但是存在类型自动转换
                  .mapToLong(String::length)
                  .forEach(System.out::println);
  
          Stream.of("apple", "banana", "orange", "waltermaleon", "grape")
                  //转成Double ，自动类型转换成Double
                  .mapToDouble(String::length)
                  .forEach(System.out::println);
      }
  }
  ```

- flatMap -- 转换后生成多于原集合数量的新元素流

  ```java
  public class FlatMap {
  
      /**
       * flatmap 作用就是将元素拍平拍扁 ，将拍扁的元素重新组成Stream，并将这些Stream 串行合并成一条Stream
       * flatmapToInt、flatmapToLong、flatmapToDouble 跟flatMap 都类似的，只是类型被限定了
       */
      public static void main(String[] args) {
          Stream.of("a-b-c-d", "e-f-i-g-h")
                  .flatMap(e -> Stream.of(e.split("-")))
                  .forEach(System.out::println);
  
      }
  }
  ```

- filter -- 过滤只保留符合条件的元素

  ```java
  public class Filter {
  
      /**
       * filter 对某些元素进行过滤，不符合筛选条件的将无法进入流的下游
       */
      public static void main(String[] args) {
          Stream.of(1, 2, 3, 1, 2, 5, 6, 7, 8, 0, 0, 1, 2, 3, 1)
                  //过滤小于5的
                  .filter(e -> e >= 5)
                  .forEach(System.out::println);
      }
  }
  ```

- distinct -- 去重

  ```java
  public class Distinct {
  
      /**
       * distinct 将根据equals 方法进行判断，如果要对自己自定义的bean去重，则需要重写equals方法，但是这不是唯一的方法。
       */
      public static void main(String[] args) {
          Stream.of(1, 1, 2, 3, 1, 2, 5, 6, 7, 8, 0, 0, 1, 2, 3, 1)
                  //去重
                  .distinct()
                  .forEach(System.out::println);
      }
  }
  ```

- sorted -- 排序

  ```java
  public class Sorted {
  
      /**
       * sorted 排序 底层依赖Comparable 实现，也可以提供自定义比较器
       */
      public static void main(String[] args) {
          Stream.of(2, 1, 3, 6, 4, 9, 6, 8, 0)
                  .sorted()
                  .forEach(System.out::println);
  
          //这里使用自定义比较，当然User可以实现Comparable 接口
          User x = new User("x", 11);
          User y = new User("y", 12);
          User w = new User("w", 10);
  
          Stream.of(w, x, y)
                  .sorted((e1, e2) -> e1.age > e2.age ? 1 : e1.age == e2.age ? 0 : -1)
                  .forEach(e -> System.out.println(e.toString()));
  
      }
  }
  ```

- peek -- 执行一个无返回的操作，不影响原来的流

  ```java
  public class Peek {
  
      /**
       * peek 挑选 ，将元素挑选出来，可以理解为提前消费
       */
      public static void main(String[] args) {
          User w = new User("w", 10);
          User x = new User("x", 11);
          User y = new User("y", 12);
  
          Stream.of(w, x, y)
                  //重新设置名字 变成 年龄+名字
                  .peek(e -> e.setName(e.getAge() + e.getName()))
                  .forEach(e -> System.out.println(e.toString()));
      }
  
  }
  ```

- limit -- 保留流的前 N 个元素，可以用于无限元素的流，作为 Short-circuiting 操作

  ```java
  public class Limit {
  
      /**
       * limit 限制元素的个数，只需传入 long 类型 表示限制的最大数
       */
      public static void main(String[] args) {
          Stream.of(1, 2, 3, 4, 5, 6)
                  //限制三个
                  .limit(3)
                  //将输出 前三个 1，2，3
                  .forEach(System.out::println);
      }
  }
  ```

- skip -- 跳过流的前 N 个元素

  ```java
  public class Skip {
  
      /**
       * skip 跳过 元素
       */
      public static void main(String[] args) {
          Stream.of(1, 2, 3, 4, 5, 6, 7, 8, 9)
                  //跳过前四个
                  .skip(4)
                  //输出的结果应该只有5，6，7，8，9
                  .forEach(System.out::println);
      }
  }
  ```

- parallel -- 让流并行化

- sequential -- 让流串行化

- unordered -- 删除流的有序标记，不强制让流有序

### 3.2 Terminal 操作

在一系列 Intermediate 操作之后，一定需要一个终极操作，来对流中的数据做最终的处理，这个“终极操作”就是 Terminal 操作，它包括：

- forEach -- 对流中每个元素执行相同的操作

  ```java
  public class ForEach {
  
      /**
       * forEach 对每个数据遍历迭代
       * forEachOrdered 适用用于并行流的情况下进行迭代，能保证迭代的有序性
       */
      public static void main(String[] args) {
          Stream.of(0, 2, 6, 5, 4, 9, 8, -1)
                  //让流并行化  || sequential -- 让流串行化 || unordered -- 删除流的有序标记，不强制让流有序
                  .parallel()
                  .forEachOrdered(e -> {
                      System.out.println(Thread.currentThread().getName() + ": " + e);
                  });
      }
  }
  ```

- forEachOrdered -- 对流中每个元素有序地执行相同的操作

- toArray -- 将流转换为数组返回

  ```java
  public class ToArray {
  
      /**
       * toArray 转成数组，可以提供自定义数组生成器
       */
      public static void main(String[] args) {
          Object[] objects = Stream.of(0, 2, 6, 5, 4, 9, 8, -1)
                  .toArray();
  
          for (Object object : objects) {
              System.out.println(object);
          }
      }
  }
  ```

- reduce -- 将流中所有数据汇总执行一个操作，返回一个值

  ```java
  public class Reduce {
  
      /**
       * reduce 是一个规约操作，所有的元素归约成一个，比如对所有元素求和，相乘等。
       */
      public static void main(String[] args) {
          int sum = Stream.of(0, 9, 8, 4, 5, 6, -1)
                  //.reduce(0, (e1, e2) -> e1 + e2);
                  .reduce(0, Integer::sum);
          System.out.println(sum);
      }
  }
  ```

- collect -- 将流中所有参数汇总为一个集合并返回

  ```java
  public class Collect {
  
      /**
       * collect 收集，使用系统提供的收集器可以将最终的数据流收集到List，Set，Map等容器中。
       */
      public static void main(String[] args) {
          Stream.of("apple", "banana", "orange", "waltermaleon", "grape")
                  //set 容器
                  .collect(Collectors.toSet())
                  //forEach不仅仅是是Stream中的操作符还是各种集合中得一个语法糖
                  .forEach(System.out::println);
  
          //收集的结果就是set
          Set<String> stringSet = Stream.of("apple", "banana", "orange", "waltermaleon", "grape")
                  .collect(Collectors.toSet());
          //set的语法糖forEach
          stringSet.forEach(System.out::println);
      }
  }
  ```

- min -- 求流中数据最小值

  ```java
  public class Min {
  
      /**
       * min 最小的一个，传入比较器，也可能没有(如果数据流为空)
       */
      public static void main(String[] args) {
          Optional<Integer> integerOptional = Stream.of(0, 9, 8, 4, 5, 6, -1)
                  //.min((e1, e2) -> e1.compareTo(e2));
                  .min(Integer::compareTo);
          integerOptional.ifPresent(System.out::println);
      }
  }
  ```

- max -- 求流中数据最大值

  ```java
  public class Max {
  
      /**
       * max 元素中最大的，需要传入比较器，也可能没有(如果数据流为空)
       */
      public static void main(String[] args) {
          Optional<Integer> integerOptional = Stream.of(0, 9, 8, 4, 5, 6, -1)
                  //.max((e1, e2) -> e1.compareTo(e2));
                  .max(Integer::compareTo);
          integerOptional.ifPresent(System.out::println);
      }
  }
  ```

- count -- 计算流中的数据量

  ```java
  public class Count {
  
      /**
       * count 统计数据流中的元素个数，返回的是long 类型
       */
      public static void main(String[] args) {
  
          long count = Stream.of("apple", "banana", "orange", "waltermaleon", "grape")
                  .count();
  
          System.out.println(count);
      }
  }
  ```

- anyMatch -- 有任何元素命中规则则返回 true，可以用于无限元素的流，作为 Short-circuiting 操作

- allMatch -- 全部元素均命中规则时返回 true，可以用于无限元素的流，作为 Short-circuiting 操作

- noneMatch -- 全部元素均未命中规则时返回 true，可以用于无限元素的流，作为 Short-circuiting 操作

  ```java
  public class NoneMatch {
  
      /**
       * noneMatch 数据流中得没有一个元素与条件匹配的
       * allMatch和anyMatch一个是全匹配，一个是任意匹配，和noneMatch类似
       */
      public static void main(String[] args) {
          boolean result = Stream.of("aa", "bb", "cc", "aa")
                  //这里的作用是是判断数据流中 一个都没有与 "aa" 相等元素 ，但是流中存在 "aa" ，所以最终结果应该是false
                  .noneMatch(e -> e.equals("aa"));
          System.out.println(result);
      }
  }
  ```

- findFirst -- 返回首个命中规则的元素，可以用于无限元素的流，作为 Short-circuiting 操作

  ```java
  public class FindFirst {
  
      /**
       * findFirst 获取流中的第一个元素
       */
      public static void main(String[] args) {
          Optional<String> stringOptional = Stream.of("apple", "banana", "orange", "waltermaleon", "grape")
                  .findFirst();
          stringOptional.ifPresent(System.out::println);
      }
  }
  ```

- findAny -- 返回所有命中规则的元素，可以用于无限元素的流，作为 Short-circuiting 操作

  ```java
  public class FindAny {
  
      /**
       * findAny 获取流中任意一个元素
       */
      public static void main(String[] args) {
          Optional<String> stringOptional = Stream.of("apple", "banana", "orange", "waltermaleon", "grape")
                  .parallel()
                  //在并行流下每次返回的结果可能一样也可能不一样
                  .findAny();
          stringOptional.ifPresent(System.out::println);
      }
  }
  ```

- iterator -- 返回由流数据构造的迭代器

### 3.3 Short-circuiting 操作

当你要处理无限数据的集合时，通过 short circuiting 操作让程序能够在有限的时间内返回显然是非常必要的

包括上述已经标记过可以用作 Short-circuiting 操作的：

- anyMatch
- allMatch
- noneMatch
- findFirst
- findAny
- limit