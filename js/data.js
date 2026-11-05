/* ============================================================
 * 由 editor.html 导出 · 2026/11/5 15:49:13
 * 全站内容数据。字段说明见项目 README.md，或看原版 data.js 顶部注释。
 * 覆盖本文件后刷新 index.html 即生效。
 * ============================================================ */

window.SITE = {
  "meta": {
    "title": "阿猫宝藏库",
    "heading": "",
    "subtitle": "",
    "description": "",
    "ribbon": {
      "text": "获取公众号自动回复资源",
      "url": "reply.html"
    },
    "topButtons": [
      {
        "text": "搜索本站",
        "icon": "tree",
        "action": "search"
      },
      {
        "text": "搜索公众号",
        "icon": "weixin",
        "url": "https://weixin.sogou.com/"
      }
    ],
    "footer": "",
    "recentDays": 10,
    "showSidebar": false,
    "showRibbon": false
  },
  "categories": [
    {
      "title": "01　影视／动漫／直播／纪录片",
      "note": "示例栏目，替换成你自己的内容",
      "children": [
        {
          "title": "01.综合影视",
          "note": "提供在线观看，部分站点同时提供下载",
          "items": [
            {
              "title": "🥇示例·公共视频平台",
              "url": "https://www.bilibili.com/",
              "icon": "web",
              "note": "这里写站点补充说明，鼠标移到 ⓘ 上可以看到",
              "date": "2026-11-03"
            }
          ]
        },
        {
          "title": "02.影视下载",
          "items": [
            {
              "title": "🥇示例·开源媒体库",
              "url": "https://archive.org/",
              "icon": "web",
              "note": "公共领域影像资料"
            },
            {
              "title": "🥈示例·字幕资源",
              "url": "https://www.opensubtitles.org/zh",
              "icon": "doc"
            },
            {
              "type": "popup",
              "title": "📃点我查看使用方法",
              "icon": "doc",
              "html": "<p>原站的「解析接口」就是这种点击弹窗条目。</p><p>你可以在 <code>data.js</code> 里直接写 HTML，例如链接列表、步骤说明。</p>"
            }
          ]
        },
        {
          "title": "03.在线动漫",
          "items": [
            {
              "title": "🥇示例·动漫资讯",
              "url": "https://bangumi.tv/",
              "icon": "web"
            },
            {
              "title": "🥈示例·番组表",
              "url": "https://bgmlist.com/",
              "icon": "doc"
            }
          ]
        },
        {
          "title": "04.电视直播",
          "items": [
            {
              "title": "示例·央视网",
              "url": "https://www.cctv.com/",
              "icon": "youtube"
            },
            {
              "title": "示例·央视频",
              "url": "https://www.yangshipin.cn/",
              "icon": "web"
            }
          ]
        }
      ]
    },
    {
      "title": "02　电子书／漫画／音乐／听书",
      "children": [
        {
          "title": "01.电子书",
          "note": "免费正版电子书与公共领域图书",
          "children": [
            {
              "title": "01.公共领域书库",
              "items": [
                {
                  "title": "🥇Project Gutenberg",
                  "url": "https://www.gutenberg.org/",
                  "icon": "book",
                  "note": "6 万+ 免费公版电子书"
                },
                {
                  "title": "🥇中国哲学书电子书计划",
                  "url": "https://ctext.org/zhs",
                  "icon": "book"
                },
                {
                  "title": "🥈书格",
                  "url": "https://new.shuge.org/",
                  "icon": "book"
                }
              ]
            },
            {
              "title": "02.古籍",
              "items": [
                {
                  "title": "🥇识典古籍",
                  "url": "https://www.shidianguji.com/",
                  "icon": "book"
                },
                {
                  "title": "🥈中华古籍资源库",
                  "url": "http://read.nlc.cn/thematDataSearch/toGujiIndex",
                  "icon": "book"
                }
              ]
            }
          ]
        },
        {
          "title": "02.音乐",
          "items": [
            {
              "title": "🥇示例·免费音效库",
              "url": "https://freesound.org/",
              "icon": "music"
            },
            {
              "title": "🥈示例·古典音乐档案",
              "url": "https://musopen.org/",
              "icon": "music"
            }
          ]
        },
        {
          "title": "03.听书与广播",
          "items": [
            {
              "title": "示例·有声书平台",
              "url": "https://www.ximalaya.com/",
              "icon": "music"
            }
          ]
        }
      ]
    },
    {
      "title": "03　资源搜索与下载",
      "children": [
        {
          "title": "01.搜索引擎",
          "items": [
            {
              "title": "🥇Google",
              "url": "https://www.google.com/",
              "icon": "search"
            },
            {
              "title": "🥇Bing",
              "url": "https://www.bing.com/",
              "icon": "search"
            },
            {
              "title": "🥈DuckDuckGo",
              "url": "https://duckduckgo.com/",
              "icon": "search"
            },
            {
              "type": "split"
            },
            {
              "title": "📃搜索引擎的正确用法🔥",
              "url": "https://example.com/search-tips",
              "icon": "doc"
            }
          ]
        },
        {
          "title": "02.素材与模板",
          "children": [
            {
              "title": "01.图片素材",
              "items": [
                {
                  "title": "🥇Unsplash",
                  "url": "https://unsplash.com/",
                  "icon": "image"
                },
                {
                  "title": "🥇Pexels",
                  "url": "https://www.pexels.com/",
                  "icon": "image"
                },
                {
                  "title": "🥈Pixabay",
                  "url": "https://pixabay.com/",
                  "icon": "image"
                }
              ]
            },
            {
              "title": "02.PPT／简历模板",
              "items": [
                {
                  "title": "🥇Canva 可画",
                  "url": "https://www.canva.cn/",
                  "icon": "doc"
                },
                {
                  "title": "🥈OfficePLUS",
                  "url": "https://www.officeplus.cn/",
                  "icon": "doc"
                }
              ]
            }
          ]
        },
        {
          "title": "03.网盘与传输",
          "items": [
            {
              "title": "示例·临时文件分享",
              "url": "https://wormhole.app/",
              "icon": "cloud",
              "note": "端到端加密，到期自动删除"
            }
          ]
        }
      ]
    },
    {
      "title": "04　常用在线工具",
      "note": "无需安装、打开即用的小工具",
      "children": [
        {
          "title": "01.图片处理",
          "items": [
            {
              "title": "🥇TinyPNG 图片压缩",
              "url": "https://tinypng.com/",
              "icon": "image"
            },
            {
              "title": "🥇removebg 抠图",
              "url": "https://www.remove.bg/",
              "icon": "image"
            },
            {
              "title": "🥈Photopea 在线 PS",
              "url": "https://www.photopea.com/",
              "icon": "image",
              "note": "浏览器里就能跑的 Photoshop 替代品"
            },
            {
              "type": "split"
            },
            {
              "type": "note",
              "text": "下面这些是设计类工具，收藏夹里常备"
            },
            {
              "title": "示例·二维码生成",
              "url": "https://www.qrcode-monkey.com/",
              "icon": "web"
            }
          ]
        },
        {
          "title": "02.PDF 与文档",
          "items": [
            {
              "title": "🥇Smallpdf",
              "url": "https://smallpdf.com/",
              "icon": "doc"
            },
            {
              "title": "🥈iLovePDF",
              "url": "https://www.ilovepdf.com/",
              "icon": "doc"
            },
            {
              "title": "示例·在线翻译",
              "url": "https://www.deepl.com/translator",
              "icon": "doc"
            }
          ]
        },
        {
          "title": "03.效率工具",
          "items": [
            {
              "title": "🥇Excalidraw 流程图",
              "url": "https://excalidraw.com/",
              "icon": "star"
            },
            {
              "title": "🥈临时邮箱",
              "url": "https://temp-mail.org/",
              "icon": "web"
            },
            {
              "title": "示例·在线测速",
              "url": "https://www.speedtest.net/",
              "icon": "web"
            }
          ]
        }
      ]
    },
    {
      "title": "05　热门 AI 工具",
      "children": [
        {
          "title": "01.通用对话",
          "items": [
            {
              "title": "🥇ChatGPT",
              "url": "https://chat.openai.com/",
              "icon": "ai"
            },
            {
              "title": "🥇DeepSeek",
              "url": "https://chat.deepseek.com/",
              "icon": "ai"
            },
            {
              "title": "🥇通义千问",
              "url": "https://tongyi.aliyun.com/",
              "icon": "ai"
            },
            {
              "title": "🥈Kimi",
              "url": "https://kimi.moonshot.cn/",
              "icon": "ai"
            }
          ]
        },
        {
          "title": "02.AI 搜索",
          "items": [
            {
              "title": "🥇Perplexity",
              "url": "https://www.perplexity.ai/",
              "icon": "search"
            },
            {
              "title": "🥈秘塔 AI 搜索",
              "url": "https://metaso.cn/",
              "icon": "search"
            }
          ]
        },
        {
          "title": "03.AI 编程",
          "items": [
            {
              "title": "🥇GitHub Copilot",
              "url": "https://github.com/features/copilot",
              "icon": "code"
            },
            {
              "title": "🥈Cursor",
              "url": "https://cursor.com/",
              "icon": "code"
            }
          ]
        },
        {
          "title": "04.AI 图片",
          "items": [
            {
              "title": "🥇Midjourney",
              "url": "https://www.midjourney.com/",
              "icon": "image"
            },
            {
              "title": "🥈Stable Diffusion",
              "url": "https://stability.ai/",
              "icon": "image"
            }
          ]
        }
      ]
    },
    {
      "title": "06　电脑手机常用",
      "items": [
        {
          "title": "示例·在线系统测试",
          "url": "https://www.example.com/",
          "icon": "web"
        },
        {
          "type": "note",
          "text": "这一栏直接挂条目、不设子分类，演示扁平结构怎么写"
        }
      ]
    },
    {
      "title": "07　电脑常用软件",
      "children": [
        {
          "title": "01.办公与效率",
          "items": [
            {
              "title": "🥇VS Code",
              "url": "https://code.visualstudio.com/",
              "icon": "code",
              "platform": "Win,Mac,Linux,Web"
            },
            {
              "title": "🥇Obsidian",
              "url": "https://obsidian.md/",
              "icon": "doc",
              "platform": "Win,Mac,Linux,Android,iOS"
            },
            {
              "title": "🥈7-Zip",
              "url": "https://www.7-zip.org/",
              "icon": "folder",
              "platform": "Win"
            }
          ]
        },
        {
          "title": "02.浏览器",
          "items": [
            {
              "title": "🥇Chrome",
              "url": "https://www.google.com/chrome/",
              "icon": "web"
            },
            {
              "title": "🥈Firefox",
              "url": "https://www.mozilla.org/firefox/",
              "icon": "web"
            }
          ]
        }
      ]
    },
    {
      "title": "08　手机常用APP",
      "items": [
        {
          "title": "示例·应用商店",
          "url": "https://apps.apple.com/",
          "icon": "apple"
        },
        {
          "title": "示例·开源应用市场",
          "url": "https://f-droid.org/",
          "icon": "android"
        }
      ]
    },
    {
      "title": "09　电脑手机游戏",
      "items": [
        {
          "title": "🥇Steam",
          "url": "https://store.steampowered.com/",
          "icon": "star"
        },
        {
          "title": "🥈GOG",
          "url": "https://www.gog.com/",
          "icon": "star"
        },
        {
          "title": "示例·开源游戏列表",
          "url": "https://github.com/leereilly/games",
          "icon": "code"
        }
      ]
    },
    {
      "title": "10　省钱优惠福利",
      "items": [
        {
          "title": "示例·比价工具",
          "url": "https://www.example.com/",
          "icon": "cart"
        },
        {
          "title": "示例·优惠券聚合",
          "url": "https://www.example.com/",
          "icon": "gift",
          "badge": "pay",
          "note": "带 badge:pay 会显示付费标记，演示用"
        }
      ]
    },
    {
      "title": "11　更多实用网站",
      "children": [
        {
          "title": "01.开发者资源",
          "items": [
            {
              "title": "🥇MDN Web Docs",
              "url": "https://developer.mozilla.org/zh-CN/",
              "icon": "code"
            },
            {
              "title": "🥇GitHub",
              "url": "https://github.com/",
              "icon": "code"
            },
            {
              "title": "🥈Stack Overflow",
              "url": "https://stackoverflow.com/",
              "icon": "code"
            }
          ]
        },
        {
          "title": "02.查询与百科",
          "items": [
            {
              "title": "🥇维基百科",
              "url": "https://zh.wikipedia.org/",
              "icon": "book"
            },
            {
              "title": "🥈 Wolfram Alpha",
              "url": "https://www.wolframalpha.com/",
              "icon": "search"
            }
          ]
        }
      ]
    },
    {
      "title": "12　热门学习资源",
      "note": "最后一栏，演示带备注的分类标题",
      "items": [
        {
          "title": "🥇中国大学 MOOC",
          "url": "https://www.icourse163.org/",
          "icon": "book"
        },
        {
          "title": "🥇Coursera",
          "url": "https://www.coursera.org/",
          "icon": "book"
        },
        {
          "title": "🥈 Khan Academy",
          "url": "https://www.khanacademy.org/",
          "icon": "book"
        },
        {
          "type": "split"
        },
        {
          "title": "📃自学计算机科学指南",
          "url": "https://github.com/keithnull/TeachYourselfCS-CN",
          "icon": "doc",
          "note": "经典开源学习路线"
        }
      ]
    }
  ]
};
