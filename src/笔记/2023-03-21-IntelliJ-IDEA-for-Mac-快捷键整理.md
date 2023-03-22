---
layout: post
title: IntelliJ IDEA for Mac 快捷键整理
slug: bj47
date: 2023-03-20 14:25
status: publish
author: Xuxx
categories: 
  - 笔记
tags: 
  - Java
excerpt: 笔记
---
### 1. Editing (编辑)

------

| No.  | 快捷键              | 描述                                    |
| :--- | :------------------ | :-------------------------------------- |
| 1    | Command+Shift+Enter | 自动结束代码，行末自动添加分号          |
| 2    | Command+P           | 显示方法的参数详情                      |
| 3    | Control+J           | 快速查看文档                            |
| 4    | Command+鼠标移上去  | 显示代码简要信息                        |
| 5    | Command+F1          | 在错误或警告处显示具体描述信息          |
| 6    | Command+N           | 声称代码                                |
| 7    | Control+O           | 覆盖方法(重写父类方法)                  |
| 8    | Control+I           | 实现方法(实现接口中的方法)              |
| 9    | Command+Option+T    | 包围代码(使用if...else等包围选中的代码) |
| 10   | Command+/           | 注释/取消注释与行注释                   |
| 11   | Command+Option+/    | 注释/取消注释与块注释                   |
| 12   | Option+向上箭头     | 连续选中代码块                          |
| 13   | Option+向下箭头     | 减少当前选中的代码块                    |
| 14   | Command+Option+L    | 格式化代码                              |
| 15   | Control+Option+O    | 优化import                              |
| 16   | Control+Option+I    | 自动缩进线                              |
| 17   | Tab                 | 缩进代码                                |
| 18   | Shift+Tab           | 反缩进代码                              |
| 19   | Command+X           | 剪切当前行或选中的块到剪贴板            |
| 20   | Command+C           | 复制当前行或选中的块到剪贴板            |
| 21   | Command+V           | 从剪贴板粘贴                            |
| 22   | Command+Shift+V     | 从最近的缓冲区粘贴                      |
| 23   | Command+D           | 复制当前行或选中的块                    |
| 24   | Command+Delete      | 删除当前行或选中的块的行                |
| 25   | Control+Shift+J     | 智能地将代码拼接成一行                  |
| 26   | Shift+Enter         | 开始新的一行                            |
| 27   | Command+Shift+U     | 大小写切换                              |
| 28   | Option+Fn+Delete    | 删除到单词末尾                          |
| 29   | Option+Delete       | 删除到单词开始                          |
| 30   | Command+‘+’/‘-’     | 展开/折叠代码块                         |
| 31   | Command+Shift+‘+’   | 展开所有代码块                          |
| 32   | Command+Shift+‘-’   | 折叠所有代码块                          |
| 33   | Command+W           | 关闭活动的编辑器选项卡                  |

### 2. Search/Replace (查询/替换)

------

| No.  | 快捷键          | 描述                 |
| :--- | :-------------- | :------------------- |
| 1    | Double Shift    | 查询任何东西         |
| 2    | Command+F       | 文件内查找           |
| 3    | Command+G       | 查找模式下，向下查找 |
| 4    | Command+Shift+G | 查找模式下，向上查找 |
| 5    | Command+R       | 文件内替换           |
| 6    | Command+Shift+F | 全局查找(根据路径)   |
| 7    | Command+Shift+R | 全局替换(根据路径)   |

### 3. Usage Search (使用查询)

------

| No.  | 快捷键           | 描述                   |
| :--- | :--------------- | :--------------------- |
| 1    | Option+F7        | 在文件中查找用法       |
| 2    | Command+F7       | 在类中查找用法         |
| 3    | Command+Shift+F7 | 在文件中突出显示的用法 |

### 4. Compile and Run (编译和运行)

------

| No.  | 快捷键           | 描述                       |
| :--- | :--------------- | :------------------------- |
| 1    | Command+F9       | 编译项目                   |
| 2    | Command+Shift+F9 | 编译选中的文件、包或模块   |
| 3    | Control+Option+R | 弹出Run的可选择菜单        |
| 4    | Control+Option+D | 弹出Debug的可选择菜单      |
| 5    | Control+R        | 运行                       |
| 6    | Control+D        | 调试                       |
| 7    | Control+Shift+R  | 从编辑器运行上下文环境配置 |
| 8    | Control+Shift+D  | 从编辑器运行上下文环境配置 |

### 5. Debugging (调试)

------

| No.  | 快捷键            | 描述                                                         |
| :--- | :---------------- | :----------------------------------------------------------- |
| 1    | F8                | 进入下一步，如果当前行断点是一个方法，则不进入当前方法体内   |
| 2    | F7                | 进入下一步，如果当前行断点是一个方法，则进入当前方法体内，如果该方法体还有方法，则不会进入该内嵌的方法中 |
| 3    | Shift+F7          | 智能步入，断点所在行上有多个方法调用，会弹出进入哪个方法     |
| 4    | Shift+F8          | 跳出                                                         |
| 5    | Control+F9        | 运行到光标处，如果光标前有其他断点会进入到该断点             |
| 6    | Control+F8        | 计算表达式(可以更改变量值使其生效)                           |
| 7    | Command+Control+R | 恢复程序运行，如果该断点下面代码还有断点则停在下一个断点上   |
| 8    | Command+F8        | 切换断点(若光标当前行有断点则取消断点，没有则加上断点)       |
| 9    | Command+Shift+F8  | 查看断点信息                                                 |

### 6. Navigation (导航)

------

| No.  | 快捷键                           | 描述                                                       |
| :--- | :------------------------------- | :--------------------------------------------------------- |
| 1    | Command+O                        | 查找类文件                                                 |
| 2    | Command+Shift+O                  | 查找所类型文件                                             |
| 3    | Command+Shift+[/]                | 切换标签页                                                 |
| 4    | Esc                              | 从工具窗口进入到代码窗口                                   |
| 5    | Command+L                        | 在当前文件跳转到某一行的指定处                             |
| 6    | Command+E                        | 显示最近打开的文件记录列表                                 |
| 7    | Command+Option+向左箭头/向右箭头 | 退回/前进到上一个操作的位置                                |
| 8    | Command+Shift+Delete             | 跳转到最后一个编辑的地方                                   |
| 9    | Option+F1                        | 显示当前文件选择目标弹出层，弹出层中有很多目标可以进行选择 |
| 10   | Command+B/鼠标点击               | 进入光标所在的方法/变量的接口或是定义处                    |
| 11   | Command+Option+B/鼠标点击        | 跳转到实现处                                               |
| 12   | Option+Space/Command+Y           | 快速打开光标所在方法、类的定义                             |
| 13   | Control+Shift+B                  | 跳转到类型声明处                                           |
| 14   | Command+U                        | 前往当前光标所在方法的父类的方法/接口定义                  |
| 15   | Command+F12                      | 弹出当前文件结构层                                         |
| 16   | Control+H                        | 显示当前类的层次结构                                       |
| 17   | Control+Option+H                 | 显示调用层次结构                                           |
| 18   | F2/Shift+F2                      | 跳转到上一个/下一个突出错误或者警告的位置                  |
| 19   | F4                               | 编辑查看代码源                                             |
| 20   | Option+F3                        | 选中文件/文件夹/代码行，使用助记符添加/取消书签            |
| 21   | Command+F3                       | 显示所有标签                                               |

### 7. Refactoring (重构)

------

| No.  | 快捷键           | 描述                               |
| :--- | :--------------- | :--------------------------------- |
| 1    | F5               | 复制文件到指定目录                 |
| 2    | F6               | 移动文件到指定目录                 |
| 3    | Command+Delete   | 在文件上为安全删除文件，弹出确认框 |
| 4    | Shift+F6         | 重命名文件                         |
| 5    | Command+F6       | 更改签名                           |
| 6    | Command+Option+M | 将选中的代码提取为方法             |
| 7    | Command+Option+V | 提取变量                           |
| 8    | Command+Option+F | 提取字段                           |
| 9    | Command+Option+C | 提取常量                           |
| 10   | Command+Option+P | 提取参数                           |

### 8. VCS/Local History (版本控制/本地历史记录)

------

| No.  | 快捷键         | 描述                 |
| :--- | :------------- | :------------------- |
| 1    | Command+K      | 提交代码到版本控制器 |
| 2    | Command+T      | 从版本控制器更新代码 |
| 3    | Option+Shift+C | 查看最近的变更记录   |

### 9. Live Templates (动态模板)

------

| No.  | 快捷键           | 描述                                           |
| :--- | :--------------- | :--------------------------------------------- |
| 1    | Command+Option+J | 弹出模板选择窗口，将选定的代码使用动态模板包住 |
| 2    | Command+J        | 插入自定义动态代码模板                         |

### 10. General (通用)

------

| No.  | 快捷键                | 描述                         |
| :--- | :-------------------- | :--------------------------- |
| 1    | Command+1...Command+9 | 打开相应编号的工具窗口       |
| 2    | Command+S             | 保存所有                     |
| 3    | Command+Control+F     | 切换全屏模式                 |
| 4    | Command+Shift+F12     | 切换最大化编辑器             |
| 5    | Option+Shift+F        | 添加到收藏夹                 |
| 6    | Option+Shift+I        | 检查当前文件与当前的配置文件 |
| 7    | Command+,             | 打开IDEA系统设置             |
| 8    | Command+;             | 打开项目结构对话框           |
| 9    | Command+Shift+A       | 查找动作                     |
| 10   | Control+Tab           | 编辑窗口和工具窗口之间切换   |

转载自：https://cloud.tencent.com/developer/article/1796448