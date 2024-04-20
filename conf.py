# -*- coding: utf-8 -*-
"""博客构建配置文件
"""

# For Maverick
site_prefix = "/Xuxx_Blogs/"
source_dir = "../src/"
build_dir = "../dist/"
index_page_size = 10
archives_page_size = 20
enable_jsdelivr = {
#   "enabled": False,
#    "repo": ""
    "enabled": True,
    "repo": "qq1820582487/Xuxx_Blogs@gh-pages"
}

# 站点设置
site_name = "个人博客。"
site_logo = "${static_prefix}logo.png"
site_build_date = "2019-12-26T02:30+08:00"
author = "Xuxx"
email = "xuxx3319@gmail.com"
author_homepage = "暂无"
description = "坚持有效行动，改变自然发生。"
key_words = ['Xuxx', 'Galileo', 'blog']
language = 'zh-CN'
external_links = [
    {
        "name": "瞎搞計劃",
        "url": "https://qq1820582487.github.io/Xuxx_Blogs/",
        "brief": "个人博客。"
    }
]
nav = [
    {
        "name": "首页",
        "url": "${site_prefix}",
        "target": "_self"
    },
    {
        "name": "归档",
        "url": "${site_prefix}archives/",
        "target": "_self"
    },
    {
        "name": "关于",
        "url": "${site_prefix}about/",
        "target": "_self"
    }
]

social_links = [
    {
        "name": "Twitter",
        "url": "https://twitter.com/xuxx3309",
        "icon": "gi gi-twitter"
    },
    {
        "name": "GitHub",
        "url": "https://github.com/QQ1820582487",
       "icon": "gi gi-github"
    }
]

head_addon = r'''
<meta http-equiv="x-dns-prefetch-control" content="on">
<link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
'''

footer_addon = ''

body_addon = ''
