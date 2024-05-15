# IK分词器

### 模式

1. ik_smart : 粗粒度
2. ik_max_word : 细粒度

### 扩展及停用词条

es的plugins/elasticsearch-analysis-ik-7.16.3/config/IKAnalyzer.cfg.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
	<comment>IK Analyzer 扩展配置</comment>
	<!--用户可以在这里配置自己的扩展字典 -->
	<entry key="ext_dict">(如)ext_dict.dic</entry>
	 <!--用户可以在这里配置自己的扩展停止词字典-->
	<entry key="ext_stopwords">(如)ext_stopwords.dic</entry>
	<!--用户可以在这里配置远程扩展字典 -->
	<!-- <entry key="remote_ext_dict">words_location</entry> -->
	<!--用户可以在这里配置远程扩展停止词字典-->
	<!-- <entry key="remote_ext_stopwords">words_location</entry> -->
</properties>
```

# ES基础

- 文档：一条数据就是一个文档

- 词条：对文档中的内容进行分词，得到的词语就是词条

- 正向索引：基于文档ID创建索引。查询词条时必须先找到文档，而后判断是否包含词条。

- 倒排索引：对呀文档内容分词，对词条创建索引，并记录词条所在文档信息。查询时先根据词条查询到文档Id，而后获取到文档信息。

### 概念对比

| MySQL  | ElasticSearch | 说明                                                         |
| ------ | ------------- | ------------------------------------------------------------ |
| Table  | Index         | 索引(index)，就是文档的集合，类似数据库的表(table)           |
| Row    | Document      | 文档(Document)，就是一条条的数据，类似数据库中的行(Row)，文档都是JS0N格式 |
| Column | Field         | 字段(Field)，就是JS0N文档中的字段，类似数据库中的列(Column)  |
| Schema | Mapping       | Mapping(映射)是索引中文档的约束，例如字段类型约束，类似数据库的表结构(Schema) |
| SQL    | DSL           | DSL是elasticsearch提供的JS0N风格的请求语句，用来操作elasticsearch，实现CRUD |

# ES索引库操作

mapping是对索引库中文档的约束，常见的mapping属性包括:

- type:字段数据类型，常见的简单类型有:(没有数组，但是每个类型都可以是多个)
  - 字符串: text(可分词的文本)、keyword(精确值，例如:品牌、国家、ip地址)
  - 数值: long、integer、short、byte、double、 float
  - 布尔：boolean
  - 日期: date
  - 对象: object
- index: 是否创建索引，默认为true
- analyzer: 使用哪种分词器(只有 text 需要)
- properties: 该字段的子字段(object下的字段)

## 创建索引库

ES中通过Restful请求操作索引库、文档。请求内容用DSL语句来表示。创建索引库和mapping的DSL语法如下:

```json
# 创建索引
PUT /索引名称
{
    "mappings": {
        "properties": {
            "字段名1": {
                "type": "text",
                "analyzer": "ik_smart"
            },
            "字段名2": {
                "type": "keyword",
                "index": "false"
            },
            "字段名3": {
                "type": "object",
                "properties": {
                    "子字段名": {
                        "type": "keyword"
                    }
                }
            }
          // 略
        }
    }
}
```

示例：

```json
PUT /index1
{
    "mappings": {
        "properties": {
            "info": {
                "type": "text",
                "analyzer": "ik_smart"
            },
            "email": {
                "type": "keyword",
                "index": "false"
            },
            "name": {
                "type": "object",
                "properties": {
                    "fristName": {
                        "type": "keyword"
                    },
                    "lastName": {
                        "type": "keyword",
                        "index": "false"
                    }
                }
            }
        }
    }
}
```

![创建索引](/Users/xxxu/Documents/Xuxx_Blogs/src/static/笔记图片/2024-05-08-ElasticSearch笔记_01.png)

## 查询索引库

语法：

```
GET /索引库名称
```

## 删除索引库

语法：

```
DELETE /索引库名称
```

## 修改索引库

禁止修改字段(名称及类型)，只能添加新字段(不能和原有的字段名重复)

```json
PUT /索引名/_mapping
{
    "properties": {
        "新字段名": {
            "type": "integer"
        }
    }
}
```

# RESTClient 操作索引库（java）

案例

![](/Users/xxxu/Documents/Xuxx_Blogs/src/static/笔记图片/2024-05-08-ElasticSearch笔记_02.png)

- 提示

![](/Users/xxxu/Documents/Xuxx_Blogs/src/static/笔记图片/2024-05-08-ElasticSearch笔记_03.png)

![](/Users/xxxu/Documents/Xuxx_Blogs/src/static/笔记图片/2024-05-08-ElasticSearch笔记_04.png)

- 表示地理位置就是

```json
"location": {
    "type": "geo_point"
}
```

- 字段拷贝可以使用**copy_to**属性将当前字段拷贝到指定字段

 在你需要添加的合并字段添加一个copy_to 为all （这样可以同时搜索多个字段）