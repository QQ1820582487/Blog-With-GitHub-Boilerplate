---
layout: post
title: Docker Compose部署GitLab
slug: bj34
date: 2020-09-22 00:05
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Docker
  - Docker Compose
excerpt: 笔记
---

## 什么是GitLab

GitLab是利用 Ruby on Rails 的一个开源的版本管理系统，实现一个自托管的Git项目仓库，可通过Web界面进行访问公开的或者私人项目。它拥有与 Github 类似的功能，能够浏览源代码，管理缺陷和注释。可以管理团队对仓库的访问，它非常易于浏览提交过的版本并提供一个文件历史库。团队成员可以利用内置的简单聊天程序(Wall)进行交流。它还提供一个代码片段收集功能可以轻松实现代码复用，便于日后有需要的时候进行查找。

## 部署GitLab

使用Docker来安装和运行GitLab中文版，`docker-compose.yml`配置如下:

```yaml
version: '3'
services:
    web:
        image: 'twang2218/gitlab-ce-zh'
        restart: always
        hostname: '192.168.123.128'
        environment:
            TZ: 'Asia/Shanghai'
            GITLAB_OMNIBUS_CONFIG: |
                external_url = 'http://192.168.123.128'
                gitlab_rails['gitlab_shell_ssh_port'] = 2222
                unicorn['port'] = 8888
                nginx['listen_port'] = 80
        ports:
            - '80:80'
            - '443:443'
            - '2222:22'
        volumes:
        - ./config:/etc/gitlab
        - ./data:/var/opt/gitlab
        - ./logs:/var/log/gitlab
```

