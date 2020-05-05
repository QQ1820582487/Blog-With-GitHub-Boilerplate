---
layout: post
title: Spring Boot文件上传
slug: bj09
date: 2020-05-05 00:20
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - java
  - spring
excerpt: 笔记
---

## Spring Boot文件上传

在Spring Boot中进行文件上传只需要额外引入web依赖，不再需要像Spring MVC那样额外引入commons-fileupload和commons-io依赖。

在Spring Boot中,默认使用`StandardServletMultipartResolver(支持servlet3.0以后的版本)`代替`CommonsMultipartResolver(兼容早期的servlet)`解析Multipart请求，如果必须使用`CommonsMultipartResolver`则需要自己添加commons-fileupload和commons-io依赖。

### 回顾

```java
@Controller
@RequestMapping("/user")
public class FileUploadControll {
    /**
     * 传统文件上传
     *
     * @return
     */
    @RequestMapping("/fileupload01")
    public String fileupload01(HttpServletRequest request) throws Exception {
        System.out.println("fileupload01方法执行了---传统文件上传");
        //使用fileupload组件完成文件上传
        //指定上传位置（路径）
        String path = request.getSession().getServletContext().getRealPath("/uploads/");
        //判断该路径是否存在
        File file = new File(path);
        //如果不存在
        if (!file.exists()) {
            //创建该文件夹
            file.mkdirs();
        }
        //解析request对象，获取上传的文件项            磁盘文件项目工厂
        DiskFileItemFactory fileItemFactory = new DiskFileItemFactory();
        ServletFileUpload upload = new ServletFileUpload(fileItemFactory);
        //解析request
        List<FileItem> fileItems = upload.parseRequest(request);
        //遍历
        for (FileItem fileItem : fileItems) {
            //进行判断，当前的fileItem对象是否是上传文件项
            if (fileItem.isFormField()) {
                //是普通表单项
            } else {
                //是上传文件项
                //获取文件上传名称
                String fileName = fileItem.getName();
                //把文件名称设置为唯一的
                String uuid = UUID.randomUUID().toString().replace("-", "");
                fileName = uuid + "_" + fileName;
                //完成上传
                fileItem.write(new File(path, fileName));
                //删除临时文件
                fileItem.delete();
            }
        }
        return "success";
    }


    /**
     * springmvc文件上传
     * 需要commons-fileupload和commons-io依赖
     * @param request
     * @return
     */
    @RequestMapping("/fileupload02")
    public String fileupload02(HttpServletRequest request, MultipartFile upload) throws IOException {
        System.out.println("fileupload02方法执行了---springmvc文件上传");
        //指定上传位置（路径）
        String path = request.getSession().getServletContext().getRealPath("/uploads/");
        //判断该路径是否存在
        File file = new File(path);
        //如果不存在
        if (!file.exists()) {
            //创建该文件夹
            file.mkdirs();
        }

        //获取文件上传名称
        String filename = upload.getOriginalFilename();
        //把文件名称设置为唯一的
        String uuid = UUID.randomUUID().toString().replace("-", "");
        filename = uuid + "_" + filename;
        //完成上传
        upload.transferTo(new File(path, filename));
        return "success";
    }

    /**
     * springmvc跨服务器上传
     * 需要额外的两个依赖:jersey-core和jersey-client
     */
    @RequestMapping("/fileupload03")
    public String fileupload03(MultipartFile upload) throws Exception {
        System.out.println("fileupload03方法执行了---springmvc跨服务器上传");
        //设置要上传的文件服务器的路径
        String path = "http://localhost:8081/fileupload/uploads/";
        //获取上传的文件名称
        String filename = upload.getOriginalFilename();
        //把文件名称设置为唯一
        String uuid = UUID.randomUUID().toString().replace("-", "");
        filename = uuid + "_" + filename;
        // 创建客户端的对象
        Client client = Client.create();
        // 和图片服务器进行连接
        WebResource webResource = client.resource(path + filename);
        // 上传文件
        webResource.put(upload.getBytes());
        return "success";
    }
}
```



### 1. 使用form表单上传单个文件

#### 1.1 编写HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>fileupload_form</title>
</head>
<body>
<form action="/upload" method="post" enctype="multipart/form-data">
    <input type="file" name="file">
    <input type="submit" value="提交">
</form>
</body>
</html>
```

#### 1.2 编写Controller

```java
@RestController
public class FileUploadController {

    //按日期分类
    SimpleDateFormat sdf = new SimpleDateFormat("/yyyy/MM/dd/");

    /**
     * 上传单个文件，返回上传文件的URL
     */
    @PostMapping("/upload")
    public String upload(MultipartFile file, HttpServletRequest request) {
        String format = sdf.format(new Date());
        String realpath = request.getServletContext().getRealPath("/img") + format;
        File folder = new File(realpath);
        if (!folder.exists()) {
            folder.mkdirs();
        }
        //防止文件重名
        String oldName = file.getOriginalFilename();
        String newName = UUID.randomUUID().toString() + oldName.substring(oldName.lastIndexOf("."));
        try {
            //保存上传的文件到指定位置
            file.transferTo(new File(folder, newName));
            String url = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + "/img" + format + newName;
            //  http://localhost:8080/img/2020/01/05/d0a64514-b990-4bf6-8297-563f66ca3530.jpg
            return url;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return "error";
    }
}
```

### 2. 使用ajax上传单个文件

#### 2.1 编写HTML

为方便操作，使用JQuery.js

```
补充：XMLHttpRequest Level2添加了一个新的接口FormData. 利用FormData对象,我们可以通过JavaScript用一些键值对来模拟一系列表单控件,我们还可以使用XMLHttpRequest的send()方法来异步的提交这个"表单".
比起普通的ajax,使用FormData的最大优点就是我们可以异步上传一个二进制文件.
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>fileupload_ajax</title>
    <script src="jquery-3.3.1.min.js"></script>
</head>
<body>
<div id="result"></div>
<input type="file" id="file">
<input type="button" value="上传" onclick="uploadFile()">
<script>
    function uploadFile() {
        var file = $("#file")[0].files[0];//files是文件数组
        var formData = new FormData();//html5
        formData.append("file", file);
        $.ajax({
            type: "post",
            url: "/upload",
            processData: false,//是否要上传的数据处理为对象
            contentType: false,//可能破坏分隔符，不让jquery设置请求头
            data: formData,
            success: function (msg) {
                $("#result").html(msg);
            }
        });
    }
</script>
</body>
</html>
```

#### 2.2 编写Controller

```java
@RestController
public class FileUploadController {

    //按日期分类
    SimpleDateFormat sdf = new SimpleDateFormat("/yyyy/MM/dd/");

    /**
     * 上传单个文件，返回上传文件的URL
     */
    @PostMapping("/upload")
    public String upload(MultipartFile file, HttpServletRequest request) {
        String format = sdf.format(new Date());
        String realpath = request.getServletContext().getRealPath("/img") + format;
        File folder = new File(realpath);
        if (!folder.exists()) {
            folder.mkdirs();
        }
        //防止文件重名
        String oldName = file.getOriginalFilename();
        String newName = UUID.randomUUID().toString() + oldName.substring(oldName.lastIndexOf("."));
        try {
            //保存上传的文件到指定位置
            file.transferTo(new File(folder, newName));
            String url = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + "/img" + format + newName;
            //  http://localhost:8080/img/2020/01/05/d0a64514-b990-4bf6-8297-563f66ca3530.jpg
            return url;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return "error";
    }
}
```

### 3. 多文件上传

相较于单个文件上传，多文件上传上传时，后端可以用多个MultipartFile来接收，或者直接用MultipartFile数组来接收。

#### 3.1 编写HTML

```HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>fileupload_form_02</title>
</head>
<body>
<form action="/uploads" method="post" enctype="multipart/form-data">
    <input type="file" name="file" multiple><!--multiple表示可以选择多个文件-->
    <input type="submit" value="提交">
</form>
</body>
</html>
```

如果使用ajax,可以向FormData多append几个文件（name属性不要相同），然后在Controller中使用多个MultipartFile来接收。

#### 3.2 编写Controller

```java
@RestController
public class FileUploadController {

    SimpleDateFormat sdf = new SimpleDateFormat("/yyyy/MM/dd/");
    
    /**
     * 上传多个文件
     * @param files
     * @param request
     * @return
     */
    @PostMapping("/uploads")
    public String uploads(MultipartFile[] files, HttpServletRequest request) {
        String format = sdf.format(new Date());
        String realpath = request.getServletContext().getRealPath("/img") + format;
        File folder = new File(realpath);
        if (!folder.exists()) {
            folder.mkdirs();
        }
        String url = null;
        for (MultipartFile file : files) {
            String oldName = file.getOriginalFilename();
            String newName = UUID.randomUUID().toString() + oldName.substring(oldName.lastIndexOf("."));
            try {
                file.transferTo(new File(folder, newName));
                url = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + "/img" + format + newName;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        System.out.println(url);
        return "success";
    }
}
```

