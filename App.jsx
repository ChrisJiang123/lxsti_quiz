import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { RefreshCw, Share2, Sparkles, ArrowRight, Heart, Skull } from 'lucide-react';
import { calculateResult as scoreQuiz } from './scoring.js';

/* ============================================================
   LXSTI · 留学生 TI — 16 人格生存图鉴
   - 4 dimensions: E/I, C/W, H/F, A/S
   - 16 archetypes, scored from 12 scenario questions
   ============================================================ */

const PERSONALITIES = {
  ECHA: {
    code: 'CCSA',
    title: '学联卷王',
    emoji: '📣',
    tagline: '你的日历没有空白，因为你记得一个人在异国有多孤单。',
    desc:
      '活动组织、中秋晚会、新生接机，哪儿都有你的名字。别人说你爱凑热闹，其实你只是记得自己第一年有多不容易。你让很多人的留学生活没有那么孤单——这份被需要的感觉，你值得。',
    match: 'ECHS',
    avoid: 'ICFS',
  },
  ECHS: {
    code: 'PLUG',
    title: '人脉大亨',
    emoji: '🤝',
    tagline: '认识你两小时，就欠了你三个人情。',
    desc:
      '找房、找工、找饭搭子，你的微信随时在线。你帮过的人可能比你自己记得的多。别人说你是万事通，其实你只是不忍心看新朋友一个人摸黑。你的从容不是天生的，是你扛出来的——这份稳，是很多人的安全感。',
    match: 'ECHA',
    avoid: 'IWFA',
  },
  ECFA: {
    code: 'TANG',
    title: '群聊怨种',
    emoji: '💬',
    tagline: '你吐的槽，是很多人没说出口的话。',
    desc:
      '群聊活跃 TOP 3，吐完房东吐教授，吐完天气吐人生。你吐的那些槽，其实是很多人没说出口的心声。你把焦虑变成了段子，让整个群都笑了出来——这份苦中作乐的能力，比你以为的珍贵。',
    match: 'ECFS',
    avoid: 'IWHS',
  },
  ECFS: {
    code: 'YUMY',
    title: '饭搭子本命',
    emoji: '🍜',
    tagline: '你的快乐很便宜，也很真实。',
    desc:
      '一顿好吃的麻辣烫、一个能一起排队两小时火锅的朋友，你的幸福门槛比大多数人都低。这不是没追求，是你早就想明白什么对自己重要。情绪稳、胃口好、交朋友容易——很多人留学四年都活不出你这份自在。',
    match: 'ICFS',
    avoid: 'EWHA',
  },
  EWHA: {
    code: 'GRND',
    title: '领英刺客',
    emoji: '💼',
    tagline: '你不是没累过，只是没允许自己停下来。',
    desc:
      '简历改了 47 版，cold email 发了 300 封，LinkedIn 是你的第二个朋友圈。你扛着比别人多一层的压力——身份、签证、家里的期望，这些看不见的重量你每天都在背着走。等 offer 到的那天，先允许自己哭一场，再允许自己歇一会。你值得的。',
    match: 'EWHS',
    avoid: 'ICFS',
  },
  EWHS: {
    code: 'FLEX',
    title: '六边形战士',
    emoji: '⚡',
    tagline: '你看起来什么都有，只有你知道花了多少力气。',
    desc:
      'GPA、实习、Brunch 局、健身卡、旅游计划，你一样都没落下。别人说你是六边形战士，只有你知道每一个角是怎么撑起来的。完美不是没代价的——偶尔放自己一马，松一个角不会坍塌。你已经做得比大多数人都好了。',
    match: 'EWHA',
    avoid: 'ICFA',
  },
  EWFA: {
    code: 'FOMO',
    title: '硬凑派对咖',
    emoji: '🥂',
    tagline: '怕被落下，是因为你还在乎——这其实很勇敢。',
    desc:
      '每个 party 你都去，每次也都有点累。想融入又觉得自己是局外人——这种感觉，留学生中有这种体验的比你想象得多得多。你不是真的喜欢喧闹，你只是不想放弃在异国交到朋友的可能。这份一次次出门的勇气，本身就很了不起。',
    match: 'EWFS',
    avoid: 'IWHS',
  },
  EWFS: {
    code: 'RICH',
    title: '精致生活家',
    emoji: '🥐',
    tagline: '你明白一件事：留学不是比谁过得苦。',
    desc:
      'Brunch、看展、Pilates、探店，你的日常比很多人的毕业旅行还精彩。有人觉得你不够认真，但你只是比他们早想明白——这四年的每一天都是真实的人生，不是等待未来的过渡期。好好过今天，是一种很成熟的选择。',
    match: 'EWFA',
    avoid: 'ICHA',
  },
  ICHA: {
    code: 'EMOO',
    title: '深夜破防家',
    emoji: '🌙',
    tagline: '你白天那句"我还好"，是世界上最累的一句话。',
    desc:
      '想卷又卷不动，想躺又躺不安——这种拉扯你一个人扛了太久。白天对所有人说"还好"，晚上给自己写长长的备忘录。你不是矫情，你只是感受比别人深一点点。3 点破防没关系，天会亮的。你比你以为的更坚韧。',
    match: 'IWFA',
    avoid: 'EWHS',
  },
  ICHS: {
    code: 'GOAT',
    title: '图书馆常驻',
    emoji: '📚',
    tagline: '你不是孤僻，你只是喜欢专心做一件事。',
    desc:
      '图书馆 12 点关门你都舍不得走，GPA 悄悄 4.0。你不需要热闹来定义自己，一个人啃教材这件事本身就让你踏实。别人说你独，其实你只是很早就知道自己想要什么——这种定力，在一个到处让人分心的年纪，是稀缺品。',
    match: 'IWHS',
    avoid: 'EWFA',
  },
  ICFA: {
    code: 'BEDD',
    title: '被窝难民',
    emoji: '🛏️',
    tagline: '起不来不是懒，是真的累了。',
    desc:
      '床是你的整个宇宙，翘课、赶 due、emo、刷手机都在那一平米里完成。你不是不想好起来，你只是累到身体比大脑先投降了。允许自己躺一会，世界不会塌。留学本来就很重，能坚持到今天，你已经做得很好了。明天不行的话，后天也可以。',
    match: 'ICFS',
    avoid: 'EWHA',
  },
  ICFS: {
    code: 'CHLL',
    title: '宿舍大佛',
    emoji: '🧘',
    tagline: '你才是留学生里最懂"放过自己"的那一个。',
    desc:
      '别人卷你不卷，别人 emo 你不 emo。游戏、追剧、泡面、外卖，你的快乐朴素又稳定。不是没追求，是你早就知道心态比成绩更难得。那些嘴上骂你摆烂的焦虑党，心里其实都在偷偷羡慕你。',
    match: 'ECFS',
    avoid: 'ECHA',
  },
  IWHA: {
    code: 'DDUE',
    title: 'DDL 忍者',
    emoji: '⏰',
    tagline: '你总是踩点，但你从来没真的迟到过。',
    desc:
      '提神饮料的空瓶能堆成金字塔，每次都发誓下次早点开始，但从来没有下次。可关键是——你每次都交上了。在巨大压力下还能稳定交付，这本身就是一种别人没有的能力。交完这篇就睡一觉，你配得上一个长长的觉。',
    match: 'ICHA',
    avoid: 'EWHS',
  },
  IWHS: {
    code: 'NERD',
    title: '闷声学霸',
    emoji: '🎓',
    tagline: '你不说话，不是因为没东西说，是因为不用说。',
    desc:
      '群里从不冒泡，朋友圈三天可见，但你的实习履历 3 段起步，GPA 3.95，PhD offer 已经在手里。你用结果说话，不用声音。这种静水流深的狠劲，比喧哗的胜利更值得敬佩。也记得偶尔让身边的人知道你有多厉害。',
    match: 'ICHS',
    avoid: 'ECFA',
  },
  IWFA: {
    code: 'INDI',
    title: '文艺 emo 咖',
    emoji: '🎧',
    tagline: '一个人不是孤独，是你的默认状态。',
    desc:
      '你的歌单没有一首 Billboard Top 100，你去的咖啡厅是 Google 评分 4.9 那种。一个人逛展、听 indie、写长长的 notes——这些不是 emo，是你跟自己相处的方式。能在异国把一个人的生活过出美感，是一件非常稀有的天赋。',
    match: 'ICHA',
    avoid: 'ECHA',
  },
  IWFS: {
    code: 'LOFI',
    title: '独行本命',
    emoji: '🌿',
    tagline: '你是自己最好的朋友——这不是妥协，是本事。',
    desc:
      '一个人做饭、一个人徒步、一个人看书，情绪稳得让人怀疑你是 AI。其实你只是比大多数人早想通了一件事：热闹没有那么重要。这份与自己和解的能力，很多人一辈子都学不会。你不是孤独，你是自由。',
    match: 'IWHS',
    avoid: 'EWFA',
  },
};

const QUIZ_LENGTH = 24; // pick 24 out of the pool each run

const QUESTIONS_POOL = [
  {
    q: '小组作业遇到不靠谱的老外队友,你会:',
    options: [
      { text: '直接接管当 Leader,自己 carry 全场', tags: ["H", "A", "W", "E"] },
      { text: '能在 due 前拼凑交上去就行,不挂科万岁', tags: ["F", "S"] },
      { text: '在跟朋友的小群里疯狂吐槽抱团取暖', tags: ["C", "E", "A"] },
      { text: '默默做好自己的部分,剩下的不是我的事', tags: ["I", "S"] },
    ],
  },
  {
    q: '深夜 11 点赶 due 到一半突然极度饿,你会:',
    options: [
      { text: '外卖搜麻辣烫 / 烧烤,不管多贵', tags: ["C", "E", "F"] },
      { text: '宿舍煮一碗加蛋加肠的辛拉面', tags: ["I", "C", "S"] },
      { text: '忍住,明天早 Brunch 出片', tags: ["W", "H", "A"] },
      { text: '等等,什么 due?', tags: ["F", "S", "I"] },
    ],
  },
  {
    q: 'Career Fair 现场,你的状态是:',
    options: [
      { text: '20 份精修简历 + 正装,精准狙击目标公司', tags: ["H", "A", "W"] },
      { text: '拿了免费贴纸和笔就溜去买奶茶', tags: ["F", "S", "C"] },
      { text: '看到密密麻麻的人群瞬间社恐想回宿舍', tags: ["I", "A"] },
      { text: 'Career Fair?没听过,新开的餐厅吗', tags: ["F", "S", "C", "I"] },
    ],
  },
  {
    q: '朋友圈看到有人晒大厂 offer,你的第一反应:',
    options: [
      { text: '默默打开 LeetCode 刷两道题', tags: ["H", "A", "I"] },
      { text: '立刻私聊对方"恭喜大佬!求内推!"', tags: ["E", "C", "H", "S"] },
      { text: '毫无波澜,裁员危机见分晓', tags: ["F", "S"] },
      { text: '我才不担心,我回家继承家业', tags: ["F", "S", "C"] },
    ],
  },
  {
    q: '周五晚上最理想的安排是:',
    options: [
      { text: '华人朋友火锅局 + KTV', tags: ["E", "C", "S"] },
      { text: 'House party 喝到断片', tags: ["E", "W", "F"] },
      { text: '一个人窝宿舍看剧吃泡面', tags: ["I", "C", "F", "S"] },
      { text: '今天星期几来着', tags: ["F", "S", "W"] },
    ],
  },
  {
    q: '你手机截图文件夹里最多的是:',
    options: [
      { text: 'LinkedIn 帖子 + 求内推话术模板', tags: ["H", "A", "W"] },
      { text: '小红书 Brunch、OOTD、看展灵感', tags: ["W", "F", "E"] },
      { text: '跟朋友小群里的搞笑梗图', tags: ["C", "E", "F"] },
      { text: '游戏截图和追剧的名场面', tags: ["I", "F", "S"] },
    ],
  },
  {
    q: '对"融入本地文化"这件事,你的态度:',
    options: [
      { text: '必须融入,这是我来留学的意义', tags: ["W", "H", "E"] },
      { text: '能融入当然好,但我也有自己的圈子', tags: ["C", "S", "F"] },
      { text: '不想假装,做自己最重要', tags: ["I", "F", "S"] },
      { text: '我来一年还没跟当地人说过一句完整的话', tags: ["C", "A", "I"] },
    ],
  },
  {
    q: '上课小组讨论时,你通常:',
    options: [
      { text: '主动发言带动节奏,抢 participation 分', tags: ["E", "W", "H"] },
      { text: '等老师点名才开口', tags: ["I", "A"] },
      { text: '跟旁边的中国同学偷偷用中文吐槽', tags: ["C", "E", "F"] },
      { text: '假装在认真听,其实在淘宝', tags: ["I", "F", "C"] },
    ],
  },
  {
    q: '你的朋友圈 / IG 画风是:',
    options: [
      { text: '简历级别 —— offer、活动、奖项', tags: ["H", "A", "W"] },
      { text: '岁月静好 —— 咖啡、花、夕阳', tags: ["W", "F", "S"] },
      { text: '三天可见或者干脆不发', tags: ["I", "S"] },
      { text: '吐槽日常 + 搞笑 meme', tags: ["C", "E", "F"] },
    ],
  },
  {
    q: '生病了你会怎么办:',
    options: [
      { text: '硬扛,due 比命重要', tags: ["H", "A", "I"] },
      { text: '微信让妈妈远程指挥,翻出行李箱里的中药', tags: ["C", "I", "F"] },
      { text: '预约学校 Health Center', tags: ["W", "S", "H"] },
      { text: '多喝热水,我爸教的', tags: ["C", "F", "S"] },
    ],
  },
  {
    q: '最让你焦虑的一件事是:',
    options: [
      { text: 'GPA、实习、未来就业', tags: ["H", "A", "W"] },
      { text: 'OPT / 签证 / 身份问题', tags: ["A", "W", "I"] },
      { text: '没朋友,孤独感', tags: ["E", "A", "C"] },
      { text: '我已经失去焦虑的能力了', tags: ["F", "S"] },
    ],
  },
  {
    q: '如果明天突然放假一天,你会:',
    options: [
      { text: '改简历 + 刷题 + 投 10 封申请', tags: ["H", "A", "I"] },
      { text: '约朋友进城探店 / 看展', tags: ["E", "W", "F"] },
      { text: '在家躺着打游戏追剧', tags: ["I", "F", "S", "C"] },
      { text: '假期?今天不就是假期吗', tags: ["F", "S", "I"] },
    ],
  },
  {
    q: '你的宿舍 / apt 现状:',
    options: [
      { text: '极简风,像样板间随时可以拍照', tags: ["W", "S", "H"] },
      { text: '塞满老干妈、螺蛳粉和中式调料', tags: ["C", "F", "S"] },
      { text: '像被抢劫过,三个月没收拾', tags: ["F", "I", "A"] },
      { text: '永远在搬家,东西一半在箱子里', tags: ["W", "A", "F"] },
    ],
  },
  {
    q: '别人说"我妈从国内寄了一箱东西",你最羡慕的是:',
    options: [
      { text: '老干妈 + 螺蛳粉 + 小龙虾料包', tags: ["C", "F", "S"] },
      { text: '中药 + 暖宝宝 + 感冒灵', tags: ["C", "A", "I"] },
      { text: '不羡慕,我靠 Amazon Prime 活着', tags: ["W", "S", "F"] },
      { text: '我妈可能都不知道我现在住哪个城市', tags: ["F", "I", "A", "W"] },
    ],
  },
  {
    q: '教授 Office Hour 上,你的真实状态:',
    options: [
      { text: '掏出准备好的 3 页问题清单,聊满半小时', tags: ["H", "A", "W"] },
      { text: '一时语塞,硬憋出一个假问题', tags: ["I", "A"] },
      { text: '"No I am good, thank you" 然后溜', tags: ["I", "F", "S"] },
      { text: '什么 Office Hour?压根没去过', tags: ["F", "S", "I", "C"] },
    ],
  },
  {
    q: '最近一次"我为什么要来留学"的瞬间是:',
    options: [
      { text: '凌晨 3 点改论文改到崩溃', tags: ["H", "A", "I"] },
      { text: '收到房租账单的那一刻', tags: ["A", "W"] },
      { text: '想家,想我妈做的番茄炒蛋', tags: ["C", "A", "I"] },
      { text: '没有,我过得比国内爽多了', tags: ["F", "S", "E"] },
    ],
  },
  {
    q: '你英语的真实水平:',
    options: [
      { text: '能跟教授聊论文,reading heavy 的课也拿 A', tags: ["W", "H", "S"] },
      { text: '日常够用,但 presentation 前一晚失眠', tags: ["A", "I"] },
      { text: '点餐和超市 OK,其他看缘分', tags: ["C", "F", "I"] },
      { text: 'Sorry? Pardon? Could you repeat that?', tags: ["C", "A", "I"] },
    ],
  },
  {
    q: '你跟室友的关系:',
    options: [
      { text: '最好的朋友,一起吃饭学习出门', tags: ["E", "S", "C"] },
      { text: '礼貌点头就行,各过各的', tags: ["I", "S", "W"] },
      { text: '已经成为死对头,在冷战中', tags: ["A", "I", "C"] },
      { text: '我独居,顶楼 penthouse', tags: ["W", "F", "S", "I"] },
    ],
  },
  {
    q: '你对健身的态度:',
    options: [
      { text: '每周 5 次雷打不动,身材是人设的一部分', tags: ["W", "H", "S"] },
      { text: '办了卡,去了三次', tags: ["F", "W", "A"] },
      { text: '从超市走回宿舍算运动', tags: ["F", "C", "I"] },
      { text: '健身是富人的游戏,我在省钱', tags: ["F", "C", "A"] },
    ],
  },
  {
    q: '期末季你的作息是:',
    options: [
      { text: '凌晨 3 点睡,早 8 起,全靠咖啡续命', tags: ["H", "A", "I"] },
      { text: '通宵写完 paper 当场崩溃大哭', tags: ["H", "A", "C"] },
      { text: '该睡睡该吃吃,该挂挂', tags: ["F", "S", "C"] },
      { text: '期末?我的期末是 next week 吗', tags: ["F", "S", "I", "W"] },
    ],
  },
  {
    q: '你的外卖历史画风:',
    options: [
      { text: '沙拉、poke bowl、Sweetgreen 忠实粉', tags: ["W", "H", "S"] },
      { text: '麻辣烫、烤串、米粉、火锅外卖轮着来', tags: ["C", "F", "E"] },
      { text: 'McDonalds、Taco Bell、Wendys 三巨头', tags: ["W", "F", "I"] },
      { text: '不点外卖,我已经吃了一个月速冻饺子', tags: ["C", "F", "I"] },
    ],
  },
  {
    q: '别人问 "what are you up to this weekend":',
    options: [
      { text: '列出 3-4 个计划,显得很充实', tags: ["E", "W", "F", "A"] },
      { text: '"Just studying lol" —— 真的只是学习', tags: ["H", "I", "A"] },
      { text: '"Nothing much" —— 真的没人约', tags: ["I", "F", "A"] },
      { text: '微笑点头,然后假装没听懂', tags: ["I", "C", "A"] },
    ],
  },
  {
    q: '你上次跟爸妈视频是:',
    options: [
      { text: '昨天,我们几乎每天视频', tags: ["C", "E", "S"] },
      { text: '上周,有事就聊', tags: ["C", "S", "W"] },
      { text: '想不起来了,一个月前?', tags: ["F", "I", "W"] },
      { text: '他们不知道我 emo 得多严重', tags: ["A", "I", "C"] },
    ],
  },
  {
    q: '毕业后你的计划:',
    options: [
      { text: '留在国外,死磕工签 / 身份 / PR', tags: ["H", "W", "A"] },
      { text: '回国进大厂,或者考公', tags: ["H", "C", "A"] },
      { text: '先 Gap 一年看看,给自己喘口气', tags: ["F", "S", "W"] },
      { text: '毕业?我还没想那么远', tags: ["F", "S", "I"] },
    ],
  },
  {
    q: '你最近一次哭是因为:',
    options: [
      { text: '看了一个很催泪的短视频', tags: ["F", "S", "W", "E"] },
      { text: 'due 太多,写论文写到崩溃大哭', tags: ["H", "A", "I", "C"] },
      { text: '跟家人视频,挂完电话就哭了', tags: ["C", "A", "I"] },
      { text: '不记得上次哭是什么时候了', tags: ["F", "S", "I"] },
    ],
  },
  {
    q: '你冰箱里的真实情况:',
    options: [
      { text: '鸡胸肉 + 蓝莓 + 希腊酸奶,健身餐配置', tags: ["W", "H", "S"] },
      { text: '老干妈、榨菜、豆瓣酱,中国超市搬空', tags: ["C", "F", "S"] },
      { text: '只有一瓶过期的酱油和半个柠檬', tags: ["F", "I", "A"] },
      { text: '我有冰箱吗', tags: ["F", "S", "I", "W"] },
    ],
  },
  {
    q: '点外卖时你选餐厅的标准:',
    options: [
      { text: '好吃又健康,Yelp 4.5 星以上', tags: ["W", "H", "S"] },
      { text: '中餐优先,越接近国内味道越好', tags: ["C", "F", "E"] },
      { text: '便宜!越便宜越好!有 coupon 更好!', tags: ["F", "C", "A"] },
      { text: '闭眼点,能吃就行', tags: ["F", "S", "I"] },
    ],
  },
  {
    q: '出行这件事,你的真实状态:',
    options: [
      { text: '第一周就考了驾照,自己开车到处跑', tags: ["W", "H", "S"] },
      { text: '有驾照但车技吓到自己,能不开就不开', tags: ["C", "A", "I"] },
      { text: '靠 Uber / 地铁 / 公交,不会开车', tags: ["F", "I", "C"] },
      { text: '走路就行,或者等朋友载', tags: ["F", "S", "I"] },
    ],
  },
  {
    q: '你跟国内朋友的联系频率:',
    options: [
      { text: '每天都在聊,时差也拦不住', tags: ["E", "C", "S"] },
      { text: '重大事件时联系一下', tags: ["S", "I", "W"] },
      { text: '已经聊不到一起了,话题断层', tags: ["A", "I", "F"] },
      { text: '他们可能以为我死了', tags: ["F", "I", "A"] },
    ],
  },
  {
    q: '你最常待的学习地点是:',
    options: [
      { text: '图书馆固定位置,每天打卡', tags: ["I", "C", "H", "S"] },
      { text: 'Starbucks / 街角咖啡馆,要氛围', tags: ["I", "W", "F", "A"] },
      { text: '宿舍床上 / 沙发,能躺着绝不坐着', tags: ["I", "F", "C"] },
      { text: '这个问题假设了我在学习', tags: ["F", "I", "S"] },
    ],
  },
  {
    q: '参加 networking event 的真实感受:',
    options: [
      { text: '游刃有余,一晚上换了 20 张名片', tags: ["W", "H", "S"] },
      { text: '硬着头皮聊,回宿舍要躺三天回血', tags: ["W", "A", "F", "E"] },
      { text: '躲在自己人的小圈子里讲中文', tags: ["C", "E", "F"] },
      { text: 'Networking 是什么,能吃吗', tags: ["F", "S", "I"] },
    ],
  },
  {
    q: '你的衣柜里最多的是:',
    options: [
      { text: '面试正装和 business casual', tags: ["H", "W", "A"] },
      { text: '小红书风精致穿搭,每一件都能出片', tags: ["W", "F", "E"] },
      { text: '学校卫衣 + 优衣库基础款', tags: ["I", "F", "S"] },
      { text: '三件睡衣 + 一件羽绒服,就这些', tags: ["F", "I", "C"] },
    ],
  },
  {
    q: '你对"做饭"这件事的真实水平:',
    options: [
      { text: '米其林预备役,周末必做大餐请朋友', tags: ["C", "H", "S", "E"] },
      { text: '会做几个拿手菜,够养活自己', tags: ["C", "S", "I"] },
      { text: '只会煮泡面、煎蛋、下水饺', tags: ["F", "C", "I"] },
      { text: '外卖才是做饭的最终形态', tags: ["F", "W", "I"] },
    ],
  },
  {
    q: '朋友说"来我家玩",你的真实反应:',
    options: [
      { text: '带两瓶酒 + 一盒甜品,绝不空手', tags: ["W", "S", "H"] },
      { text: '买点水果就行,不讲究', tags: ["C", "F", "S"] },
      { text: '紧张好几天,担心说错话', tags: ["A", "I", "W"] },
      { text: '我已经忘了上次出门是什么时候', tags: ["I", "F", "A"] },
    ],
  },
  {
    q: '你上次买机票回国是:',
    options: [
      { text: '一年两次,寒暑假雷打不动', tags: ["C", "S", "H"] },
      { text: '看心情,想家就买', tags: ["C", "F", "S"] },
      { text: '太贵了,我在等打折', tags: ["F", "C", "A"] },
      { text: '机票钱够我吃三个月,我不回', tags: ["F", "I", "S"] },
    ],
  },
  {
    q: '你的社交软件使用情况:',
    options: [
      { text: '微信、IG、LinkedIn、小红书、Discord 全在线', tags: ["E", "W", "H"] },
      { text: '主力微信,其他都是摆设', tags: ["C", "I", "S"] },
      { text: '已经卸载 IG / 微信,眼不见心不烦', tags: ["I", "A", "F"] },
      { text: '我的微信步数每天不超过 200', tags: ["I", "F", "C"] },
    ],
  },
];

function pickQuestions() {
  const arr = [...QUESTIONS_POOL];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, QUIZ_LENGTH);
}

function computeRadar(result) {
  const { pct } = result;
  return [
    { stat: 'GPA 保护力', value: pct('H', 'F') },
    { stat: '社交牛逼症', value: pct('E', 'I') },
    { stat: '华人圈浓度', value: pct('C', 'W') },
    { stat: '情绪稳定', value: pct('S', 'A') },
    { stat: '躺平指数', value: pct('F', 'H') },
  ];
}

/* ---------------- UI ---------------- */

const CREAM = '#FFF4E6';
const INK = '#1A1A1A';
const RED = '#E63946';
const MUSTARD = '#F4A261';
const TEAL = '#2A9D8F';

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [slideKey, setSlideKey] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState(() => pickQuestions());
  const [showPoster, setShowPoster] = useState(false);

  // Inject Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;700;800&family=Noto+Sans+SC:wght@400;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const result = useMemo(() => {
    if (screen !== 'result') return null;
    const scored = scoreQuiz(answers, quizQuestions);
    return { ...scored, personality: PERSONALITIES[scored.code] };
  }, [screen, answers, quizQuestions]);

  const radarData = result ? computeRadar(result) : [];

  const handleAnswer = (tags) => {
    const next = [...answers, tags];
    setAnswers(next);
    if (qIdx + 1 >= quizQuestions.length) {
      setScreen('result');
    } else {
      setQIdx(qIdx + 1);
      setSlideKey((k) => k + 1);
    }
  };

  const reset = () => {
    setScreen('landing');
    setQIdx(0);
    setAnswers([]);
    setShowPoster(false);
    setQuizQuestions(pickQuestions()); // new random draw
    setSlideKey(0);
  };

  const startQuiz = () => {
    setAnswers([]);
    setQIdx(0);
    setQuizQuestions(pickQuestions()); // fresh shuffle each run
    setScreen('quiz');
    setSlideKey((k) => k + 1);
  };

  const serifStyle = { fontFamily: "'Instrument Serif', Georgia, serif" };
  const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };
  const sansStyle = {
    fontFamily: "'Noto Sans SC', system-ui, sans-serif",
  };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        backgroundColor: CREAM,
        color: INK,
        ...sansStyle,
      }}
    >
      <div
        className="relative w-full max-w-2xl mx-auto py-6 sm:py-10 md:py-12 box-border"
        style={{
          /* 左右用同一套 padding，避免安全区不对称时整块内容视觉偏一边 */
          paddingLeft:
            'max(1rem, env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px))',
          paddingRight:
            'max(1rem, env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px))',
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))',
        }}
      >
        {screen === 'landing' && (
          <Landing onStart={startQuiz} serifStyle={serifStyle} monoStyle={monoStyle} />
        )}

        {screen === 'quiz' && (
          <Quiz
            key={slideKey}
            qIdx={qIdx}
            total={quizQuestions.length}
            question={quizQuestions[qIdx]}
            onAnswer={handleAnswer}
            serifStyle={serifStyle}
            monoStyle={monoStyle}
          />
        )}

        {screen === 'result' && result && (
          <Result
            result={result}
            radarData={radarData}
            onReset={reset}
            onOpenPoster={() => setShowPoster(true)}
            serifStyle={serifStyle}
            monoStyle={monoStyle}
          />
        )}
      </div>

      {showPoster && result && (
        <PosterModal
          result={result}
          radarData={radarData}
          onClose={() => setShowPoster(false)}
          serifStyle={serifStyle}
          monoStyle={monoStyle}
        />
      )}
    </div>
  );
}

/* ---------------- Landing ---------------- */

function Landing({ onStart, serifStyle, monoStyle }) {
  const heroTitleSize = {
    fontSize: 'clamp(3rem, 12.5vw, 6.75rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    ...serifStyle,
  };

  return (
    <div
      className="w-full max-w-full flex flex-col items-stretch text-center box-border min-h-[calc(100dvh-2.5rem)] sm:min-h-0 justify-center pt-4 pb-10 sm:pt-12 sm:pb-12 sm:justify-start"
    >
      <div
        className="mb-6 sm:mb-8 w-full text-center text-xs sm:text-sm font-bold opacity-60"
        style={{ ...monoStyle, letterSpacing: '0.12em' }}
      >
        LXSTI · 留学生 TI
      </div>

      <h1 className="mb-7 sm:mb-8 font-normal w-full m-0 p-0">
        <span className="block w-full text-center" style={heroTitleSize}>
          留学生
        </span>
        <span
          className="block w-full text-center"
          style={{ ...heroTitleSize, fontStyle: 'italic', color: RED }}
        >
          16 人格
        </span>
        <span className="block w-full text-center" style={heroTitleSize}>
          生存图鉴
        </span>
      </h1>

      <p className="text-[17px] sm:text-xl leading-relaxed mb-8 sm:mb-10 w-full max-w-md mx-auto px-1">
        我们会尽量让你不破防。
        <br />
        <span className="opacity-50 text-[15px] sm:text-base">(不保证成功)</span>
      </p>

      <button
        onClick={onStart}
        className="start-btn self-center inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-[1.1rem] sm:py-5 text-lg sm:text-xl font-black border-[3px] w-[min(100%,300px)] sm:w-auto max-w-full"
        style={{
          borderColor: INK,
          backgroundColor: RED,
          color: CREAM,
        }}
      >
        开始测试
        <ArrowRight size={24} strokeWidth={3} />
      </button>

      <div className="mt-6 w-full text-center text-xs sm:text-sm opacity-50" style={monoStyle}>
        24 题 · 约 5 分钟
      </div>

      <style>{`
        .start-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 5px 5px 0 ${INK};
          transform: translate(0, 0);
        }
        @media (min-width: 640px) {
          .start-btn { box-shadow: 6px 6px 0 ${INK}; }
        }
        @media (hover: hover) {
          .start-btn:hover {
            box-shadow: 8px 8px 0 ${INK};
            transform: translate(-1px, -1px);
          }
        }
        .start-btn:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 ${INK};
        }
      `}</style>
    </div>
  );
}

/* ---------------- Quiz ---------------- */

function Quiz({ qIdx, total, question, onAnswer, serifStyle, monoStyle }) {
  const [picked, setPicked] = useState(null);
  const progress = ((qIdx + 1) / total) * 100;

  const handleClick = (opt, i) => {
    setPicked(i);
    setTimeout(() => onAnswer(opt.tags), 220);
  };

  return (
    <div
      className="pt-6 pb-10"
      style={{ animation: 'slidein 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.1)' }}
    >
      <style>{`
        @keyframes slidein {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .quiz-opt {
          transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
          box-shadow: 4px 4px 0 ${INK};
          transform: translate(0, 0);
        }
        @media (min-width: 640px) {
          .quiz-opt { box-shadow: 5px 5px 0 ${INK}; }
        }
        @media (hover: hover) {
          .quiz-opt:not(:disabled):hover {
            background-color: #FFF4CC !important;
            box-shadow: 7px 7px 0 ${INK};
            transform: translate(-1px, -1px);
          }
        }
        .quiz-opt:not(:disabled):active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 ${INK};
        }
        .quiz-opt-picked {
          box-shadow: 2px 2px 0 ${INK} !important;
          transform: translate(2px, 2px) !important;
        }
      `}</style>

      {/* progress */}
      <div className="mb-8">
        <div
          className="flex justify-between items-end mb-2"
          style={{ ...monoStyle }}
        >
          <span className="text-xs tracking-[0.2em] uppercase">
            Question {String(qIdx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span className="text-xs opacity-60">{Math.round(progress)}%</span>
        </div>
        <div
          className="h-2 border-2 relative overflow-hidden"
          style={{ borderColor: INK, backgroundColor: CREAM }}
        >
          <div
            className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: RED,
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.15) 6px, rgba(0,0,0,0.15) 12px)',
            }}
          />
        </div>
      </div>

      {/* question */}
      <h2
        className="leading-tight mb-8"
        style={{ ...serifStyle, fontSize: 'clamp(1.7rem, 4.5vw, 2.6rem)' }}
      >
        {question.q}
      </h2>

      {/* options */}
      <div className="space-y-3">
        {question.options.map((opt, i) => {
          const isPicked = picked === i;
          return (
            <button
              key={i}
              disabled={picked !== null}
              onClick={() => handleClick(opt, i)}
              className={`quiz-opt w-full text-left border-[3px] p-4 flex items-start gap-3 sm:gap-4 disabled:cursor-default ${
                isPicked ? 'quiz-opt-picked' : ''
              }`}
              style={{
                borderColor: INK,
                backgroundColor: isPicked ? RED : '#FFFFFF',
                color: isPicked ? CREAM : INK,
                minHeight: '68px',
              }}
            >
              <div
                className="flex-shrink-0 w-8 h-8 border-2 flex items-center justify-center font-black text-sm"
                style={{
                  borderColor: isPicked ? CREAM : INK,
                  backgroundColor: isPicked ? INK : MUSTARD,
                  color: isPicked ? CREAM : INK,
                  ...monoStyle,
                }}
              >
                {String.fromCharCode(65 + i)}
              </div>
              <span className="text-[15px] sm:text-base md:text-lg leading-snug pt-1">
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Result ---------------- */

function Result({ result, radarData, onReset, onOpenPoster, serifStyle, monoStyle }) {
  const p = result.personality;
  const match = PERSONALITIES[p.match];
  const avoid = PERSONALITIES[p.avoid];

  return (
    <div className="pt-4 pb-12" style={{ animation: 'fadein 0.5s ease-out' }}>
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* 顶栏：称号 + 梗词（四维码仅用于内部计分，不在结果页展示） */}
      <div
        className="mb-4 inline-block max-w-full px-3 py-1.5 border-2"
        style={{
          borderColor: INK,
          backgroundColor: INK,
          color: CREAM,
          ...monoStyle,
        }}
      >
        <span className="text-[11px] sm:text-xs leading-snug break-words">
          <span style={{ fontFamily: "'Noto Sans SC', system-ui, sans-serif", fontWeight: 700 }}>
            {p.title}
          </span>
          <span className="opacity-55 mx-1">·</span>
          <span className="font-black">{p.code}</span>
        </span>
      </div>

      {/* main card */}
      <div
        className="border-[3px] p-5 sm:p-6 md:p-8 mb-6 relative result-card"
        style={{
          borderColor: INK,
          backgroundColor: CREAM,
        }}
      >
        <style>{`
          .result-card { box-shadow: 6px 6px 0 ${INK}; }
          @media (min-width: 640px) { .result-card { box-shadow: 10px 10px 0 ${INK}; } }
        `}</style>
        <div
          className="absolute -top-3 -right-3 w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-xl sm:text-2xl"
          style={{
            borderColor: INK,
            backgroundColor: MUSTARD,
            boxShadow: `3px 3px 0 ${INK}`,
          }}
        >
          {p.emoji}
        </div>

        <div className="text-xs sm:text-sm tracking-widest opacity-60 mb-2" style={monoStyle}>
          你的留学生人格是
        </div>

        <div
          className="mb-1 leading-none"
          style={{ ...serifStyle, fontSize: 'clamp(2rem, 7vw, 3.5rem)' }}
        >
          {p.title}
        </div>

        <div
          className="mb-5 font-black leading-none break-all"
          style={{
            ...monoStyle,
            fontSize: 'clamp(3rem, 16vw, 6rem)',
            color: RED,
            letterSpacing: '-0.02em',
          }}
        >
          {p.code}
        </div>

        <div
          className="border-l-[5px] pl-3 sm:pl-4 mb-5 italic text-base sm:text-lg md:text-xl leading-snug"
          style={{ ...serifStyle, borderColor: RED }}
        >
          "{p.tagline}"
        </div>

        <p className="text-sm sm:text-[15px] md:text-base leading-relaxed opacity-85">{p.desc}</p>
      </div>

      {/* radar */}
      <div
        className="border-[3px] p-4 sm:p-5 md:p-6 mb-6"
        style={{
          borderColor: INK,
          backgroundColor: '#FFE4C4',
          boxShadow: `5px 5px 0 ${INK}`,
        }}
      >
        <div
          className="flex items-center gap-2 mb-2 text-[11px] sm:text-xs tracking-[0.2em] uppercase"
          style={monoStyle}
        >
          <Sparkles size={14} strokeWidth={2.5} />
          生存雷达
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 12, right: 24, bottom: 12, left: 24 }}>
              <PolarGrid stroke={INK} strokeWidth={1} />
              <PolarAngleAxis
                dataKey="stat"
                tick={{ fill: INK, fontSize: 11, fontWeight: 700 }}
              />
              <Radar
                name="你"
                dataKey="value"
                stroke={RED}
                strokeWidth={3}
                fill={RED}
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* match / avoid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <PairCard
          icon={<Heart size={18} strokeWidth={2.5} />}
          label="天选搭子"
          person={match}
          bg={TEAL}
          monoStyle={monoStyle}
          serifStyle={serifStyle}
        />
        <PairCard
          icon={<Skull size={18} strokeWidth={2.5} />}
          label="遇到快跑"
          person={avoid}
          bg={RED}
          monoStyle={monoStyle}
          serifStyle={serifStyle}
        />
      </div>

      {/* actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onOpenPoster}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 font-black border-[3px] action-btn action-btn-primary"
          style={{
            borderColor: INK,
            backgroundColor: INK,
            color: CREAM,
          }}
        >
          <Share2 size={18} strokeWidth={3} />
          生成分享图
        </button>
        <button
          onClick={onReset}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 font-black border-[3px] action-btn"
          style={{
            borderColor: INK,
            backgroundColor: CREAM,
            color: INK,
          }}
        >
          <RefreshCw size={18} strokeWidth={3} />
          再测一次
        </button>
      </div>

      <style>{`
        .action-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 5px 5px 0 ${INK};
        }
        .action-btn-primary { box-shadow: 5px 5px 0 ${RED}; }
        @media (hover: hover) {
          .action-btn:hover { transform: translate(-1px, -1px); box-shadow: 7px 7px 0 ${INK}; }
          .action-btn-primary:hover { box-shadow: 7px 7px 0 ${RED}; }
        }
        .action-btn:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 ${INK}; }
        .action-btn-primary:active { box-shadow: 2px 2px 0 ${RED}; }
      `}</style>

      <div className="mt-10 text-center text-xs opacity-50" style={monoStyle}>
        LXSTI · 留学生 TI
      </div>
    </div>
  );
}

function PairCard({ icon, label, person, bg, monoStyle, serifStyle }) {
  return (
    <div
      className="border-[3px] p-4"
      style={{
        borderColor: INK,
        backgroundColor: CREAM,
        boxShadow: `5px 5px 0 ${INK}`,
      }}
    >
      <div
        className="inline-flex items-center gap-1.5 px-2 py-1 mb-3 border-2 text-xs font-bold"
        style={{
          borderColor: INK,
          backgroundColor: bg,
          color: CREAM,
          ...monoStyle,
        }}
      >
        {icon}
        {label}
      </div>
      <div className="flex items-baseline gap-3">
        <div className="text-3xl">{person.emoji}</div>
        <div>
          <div style={{ ...serifStyle, fontSize: '1.4rem', lineHeight: 1 }}>
            {person.title}
          </div>
          <div
            className="font-black mt-1"
            style={{ ...monoStyle, color: bg, fontSize: '1.5rem' }}
          >
            {person.code}
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs opacity-70 italic" style={serifStyle}>
        {person.tagline}
      </div>
    </div>
  );
}

/* ---------------- Poster Modal ---------------- */

let html2canvasPromise = null;
function loadHtml2Canvas() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.html2canvas) return Promise.resolve(window.html2canvas);
  if (html2canvasPromise) return html2canvasPromise;
  html2canvasPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = () => resolve(window.html2canvas);
    s.onerror = () => reject(new Error('html2canvas load failed'));
    document.head.appendChild(s);
  });
  return html2canvasPromise;
}

const POSTER_W = 540;
const POSTER_H = 960;

function PosterModal({ result, radarData, onClose, serifStyle, monoStyle }) {
  /** 必须挂在「无 transform 的 1:1 节点」上：html2canvas 对 scale 父级会算错坐标，导致导出文字错位 */
  const posterCaptureRef = useRef(null);
  const [scale, setScale] = useState(0.7);
  const [downloading, setDownloading] = useState(false);
  const [err, setErr] = useState(null);
  const p = result.personality;

  // Compute scale from viewport, once on mount + on resize
  useEffect(() => {
    const calc = () => {
      const maxW = Math.min(window.innerWidth - 32, 380);
      const maxH = window.innerHeight - 200; // leave room for buttons
      const byW = maxW / POSTER_W;
      const byH = maxH / POSTER_H;
      setScale(Math.min(1, byW, byH));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const handleDownload = async () => {
    setErr(null);
    setDownloading(true);
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      const h2c = await loadHtml2Canvas();
      const node = posterCaptureRef.current;
      if (!node) throw new Error('no poster node');
      await new Promise((r) => setTimeout(r, 160));
      const canvas = await h2c(node, {
        backgroundColor: CREAM,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      canvas.toBlob((blob) => {
        if (!blob) {
          setErr('导出失败,请截图保存');
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lxsti-${p.code}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/png');
    } catch (e) {
      console.error(e);
      setErr('下载失败,请直接截图保存');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto"
      style={{
        backgroundColor: 'rgba(26,26,26,0.9)',
        paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(16px, env(safe-area-inset-right, 0px))',
        paddingTop: 'max(20px, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))',
      }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-4 py-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 屏外 1:1 副本，仅用于导出（预览层带 scale，不能给 html2canvas 用） */}
        <div
          aria-hidden
          style={{
            position: 'fixed',
            left: -10000,
            top: 0,
            width: POSTER_W,
            height: POSTER_H,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <Poster
            ref={posterCaptureRef}
            result={result}
            personality={p}
            radarData={radarData}
            serifStyle={serifStyle}
            monoStyle={monoStyle}
          />
        </div>

        {/* Scaled container — outer sized to scaled dims, inner rendered at full size */}
        <div
          style={{
            width: POSTER_W * scale,
            height: POSTER_H * scale,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: POSTER_W,
              height: POSTER_H,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <Poster
              result={result}
              personality={p}
              radarData={radarData}
              serifStyle={serifStyle}
              monoStyle={monoStyle}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full max-w-sm" style={{ flexShrink: 0 }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 px-4 py-3 font-black border-[3px] text-sm"
            style={{
              borderColor: CREAM,
              backgroundColor: RED,
              color: CREAM,
              boxShadow: `4px 4px 0 ${CREAM}`,
              opacity: downloading ? 0.6 : 1,
            }}
          >
            {downloading ? '生成中...' : '下载 PNG'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 font-black border-[3px] text-sm"
            style={{
              borderColor: CREAM,
              backgroundColor: 'transparent',
              color: CREAM,
              boxShadow: `4px 4px 0 ${CREAM}`,
            }}
          >
            关闭
          </button>
        </div>
        {err && (
          <div className="text-xs px-2 text-center" style={{ color: MUSTARD, ...monoStyle }}>
            {err}
          </div>
        )}
        <div
          className="text-[10px] opacity-60 text-center max-w-xs px-4"
          style={{ color: CREAM, ...monoStyle }}
        >
          小红书 / 朋友圈 9:16 尺寸 · 直接截图也行
        </div>
      </div>
    </div>
  );
}

// Poster — uses flexbox vertical layout, NOT absolute positioning, so sections
// can't overlap regardless of font fallback or text wrapping.
const Poster = React.forwardRef(function Poster(
  { result, personality: p, radarData, serifStyle, monoStyle },
  ref
) {
  return (
    <div
      ref={ref}
      style={{
        width: POSTER_W,
        height: POSTER_H,
        backgroundColor: CREAM,
        border: `5px solid ${INK}`,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Noto Sans SC', system-ui, sans-serif",
        color: INK,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Dot grid background */}
      <DotGrid w={POSTER_W} h={POSTER_H} />

      {/* ===== HEADER (fixed 44px) ===== */}
      <div
        style={{
          flex: '0 0 44px',
          backgroundColor: INK,
          color: CREAM,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          ...monoStyle,
          fontSize: 11,
          letterSpacing: '0.2em',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <span>LXSTI</span>
        <span>留学生 TI</span>
      </div>

      {/* ===== TOP SECTION (auto height, content flows) ===== */}
      <div
        style={{
          flex: '0 0 auto',
          padding: '30px 36px 22px 36px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            ...monoStyle,
            fontSize: 11,
            opacity: 0.55,
            letterSpacing: '0.22em',
            marginBottom: 14,
          }}
        >
          你的留学生人格是
        </div>

        {/* Emoji badge */}
        <div
          style={{
            width: 72,
            height: 72,
            border: `3px solid ${INK}`,
            backgroundColor: MUSTARD,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            lineHeight: 1,
            marginBottom: 18,
            boxShadow: `5px 5px 0 ${INK}`,
            fontFamily:
              '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
          }}
        >
          {p.emoji}
        </div>

        {/* Chinese title */}
        <div
          style={{
            ...serifStyle,
            fontSize: 54,
            lineHeight: 1,
            fontWeight: 400,
            whiteSpace: 'nowrap',
          }}
        >
          {p.title}
        </div>
      </div>

      {/* ===== MUSTARD BAND with big code (fixed 168px) ===== */}
      <div
        style={{
          flex: '0 0 168px',
          backgroundColor: MUSTARD,
          borderTop: `4px solid ${INK}`,
          borderBottom: `4px solid ${INK}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 2,
        }}
      >
        {/* Diagonal stripe texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(-45deg, transparent 0 12px, rgba(26,26,26,0.08) 12px 14px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            ...monoStyle,
            fontSize: 128,
            fontWeight: 900,
            lineHeight: 1,
            color: RED,
            letterSpacing: '-0.04em',
            WebkitTextStroke: `3px ${INK}`,
            textShadow: `6px 6px 0 ${INK}`,
            position: 'relative',
            zIndex: 2,
            whiteSpace: 'nowrap',
          }}
        >
          {p.code}
        </div>
      </div>

      {/* ===== BOTTOM SECTION (flex: 1, content stacked top-down) ===== */}
      <div
        style={{
          flex: '1 1 auto',
          padding: '24px 36px 18px 36px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 2,
          minHeight: 0,
        }}
      >
        {/* Tagline */}
        <div
          style={{
            ...serifStyle,
            fontStyle: 'italic',
            fontSize: 21,
            lineHeight: 1.35,
            borderLeft: `5px solid ${RED}`,
            paddingLeft: 14,
            marginBottom: 22,
          }}
        >
          "{p.tagline}"
        </div>

        {/* Stats label */}
        <div
          style={{
            ...monoStyle,
            fontSize: 10,
            letterSpacing: '0.22em',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <span>● 生存雷达</span>
          <div style={{ flex: 1, height: 2, backgroundColor: INK, opacity: 0.4 }} />
        </div>

        {/* 5 stat bars */}
        <div style={{ flexShrink: 0 }}>
          {radarData.map((d) => (
            <div key={d.stat} style={{ marginBottom: 10 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  ...monoStyle,
                  fontSize: 11,
                  marginBottom: 4,
                  letterSpacing: '0.04em',
                  fontWeight: 700,
                }}
              >
                <span>{d.stat}</span>
                <span style={{ fontWeight: 900 }}>{d.value}</span>
              </div>
              <div
                style={{
                  height: 10,
                  border: `2px solid ${INK}`,
                  backgroundColor: CREAM,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${d.value}%`,
                    backgroundColor: RED,
                    backgroundImage:
                      'repeating-linear-gradient(45deg, transparent 0 4px, rgba(26,26,26,0.25) 4px 6px)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== FOOTER (fixed 44px) ===== */}
      <div
        style={{
          flex: '0 0 44px',
          borderTop: `3px solid ${INK}`,
          backgroundColor: CREAM,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 28px',
          ...monoStyle,
          fontSize: 10,
          letterSpacing: '0.15em',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <span>LXSTI · 16 人格生存图鉴</span>
      </div>
    </div>
  );
});

// Dot grid background as DOM elements (html2canvas-reliable)
function DotGrid({ w, h }) {
  const dots = [];
  const spacing = 24;
  for (let y = spacing; y < h; y += spacing) {
    for (let x = spacing; x < w; x += spacing) {
      dots.push(
        <div
          key={`${x}-${y}`}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: 2,
            height: 2,
            backgroundColor: INK,
            opacity: 0.1,
            borderRadius: '50%',
          }}
        />
      );
    }
  }
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {dots}
    </div>
  );
}
