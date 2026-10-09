'use strict';
// The eastern approach needs time for arrival, tea and a complete snack.
const TOWN_CHILD_TEA_RETURN_PHASE = .4;
// Public spending is bounded and cannot take the money needed for the next round of planting.
const TOWN_MERCHANT_MIN_COINS = 5000;
const TOWN_WEALTH_LEVELS = [5000, 20000, 100000, 500000];
const TOWN_WEALTH_NAMES = ['初有积蓄', '日子宽裕', '富足农场', '繁荣小镇'];
const TOWN_RESIDENT_NAMES = ['阿满','小禾','阿青','阿麦','阿栀','阿牧','阿运','阿宁','阿蓼','阿葵','阿森','阿芽','阿矿'];
const TOWN_STORIES = [
  {season:0,title:'山外的燕子',text:'阿棠说，山外的小镇把旧屋檐留给燕子。第一对燕子回来时，大家就知道春耕该开始了。阿宁听着，抬头找了找苔谷的屋檐。'},
  {season:0,title:'交换一包花种',text:'春天赶集时，一位老奶奶用一包花种换了阿棠的木纽扣。他一路把花种分给路过的村庄，说每一片花园都记得一位远方朋友。'},
  {season:1,title:'河边的凉茶',text:'南边的河岸有一张很长的茶桌。路过的人可以坐一会儿，帮忙把空杯洗净就好。阿棠说，一路最舒服的地方往往没有招牌。'},
  {season:1,title:'会认路的猫',text:'阿棠曾在一个村口迷了路，一只橘白猫走走停停，把他带到卖鱼的小摊。后来每次路过，他都先去那条小巷打个招呼。'},
  {season:2,title:'木桥下的丰收灯',text:'秋收后，远方的村民把小灯挂在桥头，给晚归的运货人照路。阿棠带回来一种暖色纸灯，想让苔谷的夜路也有这样的温度。'},
  {season:2,title:'刺猬的落叶窝',text:'一位园丁从不把所有落叶扫走。他说，叶堆是刺猬的被子。阿棠便学会在收拾花园时，给那些小小邻居留一块安静角落。'},
  {season:3,title:'雪地里的脚印',text:'下雪的清晨，阿棠沿着细小脚印找到了一个谷粒盘。屋主每天只放一点点，知更鸟却整个冬天都记得回来。小小的照料也能被记住。'},
  {season:3,title:'修好一只音乐盒',text:'山口的旅店有一只很旧的音乐盒。阿棠帮它换好发条，屋里的人就围着火炉听完一首曲子。那天路很冷，离开时心里却暖和了。'}
];
const TOWN_BUDGET_MODES = {
  off: { name: '手动安排', rate: 0 }, quiet: { name: '节制发展', rate: .03 },
  balanced: { name: '稳步发展', rate: .06 }, generous: { name: '热闹发展', rate: .10 }
};
const TOWN_GOODS = {
  henGrain:{name:'鸡群谷粒',price:55,tier:0,stock:8,quantity:4,kind:'supplies',description:'四份谷粒，鸡群每天最多取一份，走到小盘旁慢慢啄食。'},
  birdFeed: { name: '野鸟谷粒', price: 45, tier: 0, stock: 8, kind: 'care', description: '四份谷粒，留给驿屋浅盘上的小鸟，每天最多一份。' },
  fodder:{name:'小驴干牧草',price:85,tier:1,stock:8,kind:'supplies',description:'四份干牧草，小驴会轮流到架旁慢慢嚼草。'},
  firewood:{name:'暖炉木柴',price:95,tier:0,stock:8,kind:'supplies',description:'四份干燥木柴，冷夜里让驿屋窗边亮起炉光。'},
  teaBlend: { name: '山谷花茶', price: 80, tier: 0, stock: 8, kind: 'supplies', description: '补充四份花茶；驿屋招待村民，阿棠去南谷茶亭修缮时也会带一些过去。' },
  snackBox:{name:'四季茶点盒',price:160,tier:1,stock:8,quantity:4,kind:'supplies',description:'四份当季茶点，阿宁喝茶时会尝一尝；阿棠也会带到南谷茶亭，留给送矿后的阿矿。'},
  flowerPot: { name: '四季花种', price: 120, tier: 0, stock: 3, kind: 'decoration', description: '让旅人驿屋门前的花盆逐步开满，每个季节有不同颜色。' },
  petToy: { name: '猫咪绒球', price: 180, tier: 0, stock: 3, kind: 'care', description: '橘子和墨点会在猫屋附近发现新的玩具。' },
  windchime: { name: '手作风铃', price: 320, tier: 1, stock: 3, kind: 'decoration', description: '陶铃、铜铃和竹铃依次挂在驿屋、阿栀与阿芽家檐下，点击可轻拨。' },
  rainGear:{name:'旅人共用布伞',price:260,tier:1,stock:1,kind:'decoration',description:'一大一小两把布伞，阿棠和阿宁雨中出行时共用，配色可免费更换。'},
  sketchbook:{name:'旅人写生册',price:1680,tier:2,stock:1,kind:'decoration',description:'永久保存十六页四季风景；阿棠只画自己走过的地方，晴好午后坐下时慢慢落笔，不另收纸笔费。'},
  lantern: { name: '暖光纸灯', price: 460, tier: 1, stock: 3, kind: 'decoration', description: '依次为驿屋、阿森和阿矿家门边添灯，入夜渐亮，点击可调柔光。' },
  butterflySeed: { name: '蜜源花籽', price: 720, tier: 2, stock: 3, kind: 'ecology', description: '为西南草甸增添错落的花簇，暖季吸引蝴蝶。' },
  birdNest: { name: '溪畔巢箱', price: 980, tier: 2, stock: 3, kind: 'ecology', description: '在西南小湖与湿地之间添一处落脚点，水鸟会来歇脚。' },
  musicBox: { name: '木制音乐盒', price: 1450, tier: 3, stock: 1, kind: 'decoration', description: '驿屋茶桌上出现小音乐盒，村民相聚时跟着节奏轻轻摇摆。' },
  riverPlate:{name:'溪鱼陶盘',price:780,tier:1,stock:1,kind:'curio',description:'青瓷盘上画着溪鱼，永久陈列在驿屋屋旁；提醒旅人去西湖看波纹。'},
  forestCarving:{name:'林间木雕',price:2300,tier:2,stock:1,kind:'curio',description:'一只抱着橡果的小松鼠木雕，永久陈列在驿屋屋旁；连着东部森林的故事。'},
  pressedLeaves:{name:'四季压叶框',price:690,tier:1,stock:1,kind:'curio',description:'苔色木框保存栎叶与山楂叶，收在驿屋的收藏柜里；点击可去东缘林地看看。'},
  pheasantClay:{name:'山雉陶像',price:1850,tier:2,stock:1,kind:'curio',description:'暖棕陶土捏出长尾山雉，收在驿屋的收藏柜里；点击可去看看东缘山雉。'},
  seedJar:{name:'花园种子瓶',price:4300,tier:3,stock:1,kind:'curio',description:'玻璃瓶里留着花种与压花；点击可去旅人花园看看。'},
  crystalCase:{name:'彩晶标本',price:5200,tier:3,stock:1,kind:'curio',description:'暖色矿石与小晶簇收在木盒中，永久陈列在驿屋屋旁；可以从收藏卡片定位河东矿坡。'}
};
const TOWN_PROJECTS = {
  catComfort: { name: '猫屋舒适角', price: 380, minimum: 5000, workload: 1.4, description: '添上遮雨小棚与柔软垫子，猫咪多一个歇脚处。' },
  wetlandNest: { name: '溪畔鸟类驿站', price: 620, minimum: 7000, workload: 1.8, description: '巢箱与浅水盘成为水鸟的落脚点。' },
  meadowFlowers: { name: '西南蜜源花园', price: 750, minimum: 10000, workload: 2, description: '在草甸种下分季开放的蜜源花，吸引不同蝴蝶。' },
  teaChimes: { name: '茶亭风铃与花架', price: 1100, minimum: 18000, workload: 2.2, description: '茶亭檐下添风铃，旁边的花架逐渐开花。' },
  travellerGarden: { name: '东岸旅人花园', price: 1500, minimum: 25000, workload: 2.5, description: '在驿屋旁添一片四季开花的小花园。' },
  donkeyInn:{name:'东岸小驴驿',price:2200,minimum:50000,workload:2.4,
    description:'山脊东边逐步建起驴棚、遮雨水槽与同伴住处；麦穗和豆包在草地上自在生活。'}
};
