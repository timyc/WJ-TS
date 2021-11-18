import path from "path";
import os from "os";

export default class Global {
    static serverType: string;
    static localIP: string;
    static serverConfig: any;
    static gFunc: any;
    static clientVersion:string;
    static frameTime:number;

    static raceType: any = {
        Unknow: 0,
        Humen: 1,
        Sky: 2,
        Demon: 3,
        Ghost: 4,
    }

    static sexType: any = {
        Unknow: 0,
        Male: 1,
        Female: 2,
    }

    static limitPartnerLevel = 35;

    static attrTypeL1:any = {
        DHUNLUAN: 0, // 抗混乱
        DFENGYIN: 1, // 抗封印
        DHUNSHUI: 2, // 抗昏睡
        DDU: 3, // 抗毒
        DFENG: 4, // 抗风
        DHUO: 5, // 抗火
        DSHUI: 6, // 抗水
        DLEI: 7, // 抗雷
        DGUIHUO: 8, // 抗鬼火
        DYIWANG: 9, // 抗遗忘
        DSANSHI: 10, // 抗三尸
        DZHENSHE: 11, // 抗震慑
        DWULI: 12, // 抗物理

        PXISHOU: 13, // 物理吸收
        PMINGZHONG: 14, // 命中
        PSHANBI: 15, // 闪避

        HDHUNLUAN: 16, // 忽视抗混乱
        HDFENGYIN: 17, // 忽视抗封印
        HDHUNSHUI: 18, // 忽视抗昏睡
        HDDU: 19, // 忽视抗毒
        HDFENG: 20, // 忽视抗风
        HDHUO: 21, // 忽视抗火
        HDSHUI: 22, // 忽视抗水
        HDLEI: 23, // 忽视抗雷
        HDGUIHUO: 24, // 忽视抗鬼火
        HDYIWANG: 25, // 忽视抗遗忘
        HDSANSHI: 26, // 忽视抗三尸
        HDZHENSHE: 27, // 忽视抗震慑
        HDWULI: 28, // 忽视抗物理

        HP: 30,
        MAXHP: 31,
        MP: 32,
        MAXMP: 33,
        ATK: 34,
        SPD: 35,

        PLIANJI: 36, //连击
        PLIANJILV: 37, //连击率
        PKUANGBAO: 38, //狂暴
        PPOFANG: 39, //破防
        PPOFANGLV: 40, //破防率
        PFANZHEN: 41, //反震
        PFANZHENLV: 42, //反震率

        ADEFEND: 43, //加防
        ASPD: 44, //加速
        AATK: 45, //加攻
        AHP: 46, //加血
        AMP: 47, //加蓝
        AMEIHUO: 48, //加强魅惑

        PHP: 49, // 整体 百分比 血量
        PMP: 50, // 整体 百分比 法力
        PATK: 51, // 整体 百分比 攻击
        PSPD: 52, // 整体 百分比 速度

        FENGKBPRE: 53, // 风狂暴率
        HUOKBPRE: 54, // 火狂暴率
        SHUIKBPRE: 55, // 水狂暴率
        LEIKBPRE: 56, // 雷狂暴率
        SANSHIKBPRE: 57, // 三尸狂暴率
        GUIHUOKBPRE: 58, // 鬼火狂暴率
        FENGKB: 59, // 风狂暴
        HUOKB: 60, // 火狂暴
        SHUIKB: 61, // 水狂暴
        LEIKB: 62, // 雷狂暴
        SANSHIKB: 63, //三尸狂暴
        GUIHUOKB: 64, //鬼火狂暴

        GOLD: 70, //金
        WOOD: 71, //木
        WATER: 72, //水
        FIRE: 73, //火
        EARTH: 74, //土

        KGOLD: 75, //强力克金
        KWOOD: 76, //强力克木
        KWATER: 77, //强力克水
        KFIRE: 78, //强力克火
        KEARTH: 79, //强力克土


        GENGU: 100,
        LINGXING: 101,
        LILIANG: 102,
        MINJIE: 103,

        BFSWSHANGXIAN: 1000, //抗冰封睡忘上限
    }

    static attrCalType = {
        ADD_NUM: 1,
        ADD_PERCENT: 2,
        PERCENT: 3
    }

    static attrToBaseAttr = {
        [Global.attrTypeL1.AHP]: {
            cal: Global.attrCalType.ADD_PERCENT,
            target: Global.attrTypeL1.HP,
        },
        [Global.attrTypeL1.ASPD]: {
            cal: Global.attrCalType.ADD_PERCENT,
            target: Global.attrTypeL1.SPD,
        },
        [Global.attrTypeL1.AMP]: {
            cal: Global.attrCalType.ADD_PERCENT,
            target: Global.attrTypeL1.MP,
        },
        [Global.attrTypeL1.AATK]: {
            cal: Global.attrCalType.ADD_PERCENT,
            target: Global.attrTypeL1.ATK,
        },
        [Global.attrTypeL1.PHP]: {
            cal: Global.attrCalType.PERCENT,
            target: Global.attrTypeL1.HP,
        },
        [Global.attrTypeL1.PMP]: {
            cal: Global.attrCalType.PERCENT,
            target: Global.attrTypeL1.MP,
        },
        [Global.attrTypeL1.PATK]: {
            cal: Global.attrCalType.PERCENT,
            target: Global.attrTypeL1.ATK,
        },
        [Global.attrTypeL1.PSPD]: {
            cal: Global.attrCalType.PERCENT,
            target: Global.attrTypeL1.SPD,
        },
    }

    static effectType = {
        HURT: 1,
        DEF: 2,
        HUNLUAN: 1,
        HUNSHUI: 2,
        FENGYIN: 3,
    }

    static attrTypeL1Str = {
        'DHUNLUAN': Global.attrTypeL1.DHUNLUAN, // 抗混乱
        'DFENGYIN': Global.attrTypeL1.DFENGYIN, // 抗封印
        'DHUNSHUI': Global.attrTypeL1.DHUNSHUI, // 抗昏睡
        'DDU': Global.attrTypeL1.DDU, // 抗毒
        'DFENG': Global.attrTypeL1.DFENG, // 抗风
        'DHUO': Global.attrTypeL1.DHUO, // 抗火
        'DSHUI': Global.attrTypeL1.DSHUI, // 抗水
        'DLEI': Global.attrTypeL1.DLEI, // 抗雷
        'DGUIHUO': Global.attrTypeL1.DGUIHUO, // 抗鬼火
        'DYIWANG': Global.attrTypeL1.DYIWANG, // 抗遗忘
        'DSANSHI': Global.attrTypeL1.DSANSHI, // 抗三尸
        'DZHENSHE': Global.attrTypeL1.DZHENSHE, // 抗震慑
        'DWULI': Global.attrTypeL1.DWULI, // 抗物理
        'PXISHOU': Global.attrTypeL1.PXISHOU, // 物理吸收
        'PMINGZHONG': Global.attrTypeL1.PMINGZHONG, // 命中
        'PSHANBI': Global.attrTypeL1.PSHANBI, // 闪避
        'PLIANJI': Global.attrTypeL1.PLIANJI, //连击
        'PLIANJILV': Global.attrTypeL1.PLIANJILV, //连击率
        'PKUANGBAO': Global.attrTypeL1.PKUANGBAO, //狂暴
        'PPOFANG': Global.attrTypeL1.PPOFANG, //破防
        'PPOFANGLV': Global.attrTypeL1.PPOFANGLV, //破防率
        'PFANZHEN': Global.attrTypeL1.PFANZHEN, //反震
        'PFANZHENLV': Global.attrTypeL1.PFANZHENLV, //反震率
        'ADEFEND': Global.attrTypeL1.ADEFEND, //加防
        'ASPD': Global.attrTypeL1.ASPD, //加速
        'AATK': Global.attrTypeL1.AATK, //加攻
        'AHP': Global.attrTypeL1.AHP, //加血
        'AMP': Global.attrTypeL1.AMP, //加蓝
        'AMEIHUO': Global.attrTypeL1.AMEIHUO, //加强魅惑
        'HDHUNLUAN': Global.attrTypeL1.HDHUNLUAN, // 忽视抗混乱
        'HDFENGYIN': Global.attrTypeL1.HDFENGYIN, // 忽视抗封印
        'HDHUNSHUI': Global.attrTypeL1.HDHUNSHUI, // 忽视抗昏睡
        'HDDU': Global.attrTypeL1.HDDU, // 忽视抗毒
        'HDFENG': Global.attrTypeL1.HDFENG, // 忽视抗风
        'HDHUO': Global.attrTypeL1.HDHUO, // 忽视抗火
        'HDSHUI': Global.attrTypeL1.HDSHUI, // 忽视抗水
        'HDLEI': Global.attrTypeL1.HDLEI, // 忽视抗雷
        'HDGUIHUO': Global.attrTypeL1.HDGUIHUO, // 忽视抗鬼火
        'HDYIWANG': Global.attrTypeL1.HDYIWANG, // 忽视抗遗忘
        'HDSANSHI': Global.attrTypeL1.HDSANSHI, // 忽视抗三尸
        'HDZHENSHE': Global.attrTypeL1.HDZHENSHE, // 忽视抗震慑
        'HDWULI': Global.attrTypeL1.HDWULI, // 忽视抗物理
        /////////////////////////////////////////
        'HP': Global.attrTypeL1.HP,
        'MAXHP': Global.attrTypeL1.MAXHP,
        'MP': Global.attrTypeL1.MP,
        'MAXMP': Global.attrTypeL1.MAXMP,
        'ATK': Global.attrTypeL1.ATK,
        'SPD': Global.attrTypeL1.SPD,
        'PHP': Global.attrTypeL1.PHP,
        'PMP': Global.attrTypeL1.PMP,
        'PATK': Global.attrTypeL1.PATK,
        'PSPD': Global.attrTypeL1.PSPD,

        'SHUIKBPRE': Global.attrTypeL1.SHUIKBPRE,
        'LEIKBPRE': Global.attrTypeL1.LEIKBPRE,
        'HUOKBPRE': Global.attrTypeL1.HUOKBPRE,
        'FENGKBPRE': Global.attrTypeL1.FENGKBPRE,
        'SANSHIKBPRE': Global.attrTypeL1.SANSHIKBPRE,
        'GUIHUOKBPRE': Global.attrTypeL1.GUIHUOKBPRE,
        'SHUIKB': Global.attrTypeL1.SHUIKB,
        'LEIKB': Global.attrTypeL1.LEIKB,
        'HUOKB': Global.attrTypeL1.HUOKB,
        'FENGKB': Global.attrTypeL1.FENGKB,
        'SANSHIKB': Global.attrTypeL1.SANSHIKB,
        'GUIHUOKB': Global.attrTypeL1.GUIHUOKB,
    }

    static attrTypeStrL1 = {
        [Global.attrTypeL1.DHUNLUAN]: 'DHUNLUAN', // 抗混乱
        [Global.attrTypeL1.DFENGYIN]: 'DFENGYIN', // 抗封印
        [Global.attrTypeL1.DHUNSHUI]: 'DHUNSHUI', // 抗昏睡
        [Global.attrTypeL1.DDU]: 'DDU', // 抗毒
        [Global.attrTypeL1.DFENG]: 'DFENG', // 抗风
        [Global.attrTypeL1.DHUO]: 'DHUO', // 抗火
        [Global.attrTypeL1.DSHUI]: 'DSHUI', // 抗水
        [Global.attrTypeL1.DLEI]: 'DLEI', // 抗雷
        [Global.attrTypeL1.DGUIHUO]: 'DGUIHUO', // 抗鬼火
        [Global.attrTypeL1.DYIWANG]: 'DYIWANG', // 抗遗忘
        [Global.attrTypeL1.DSANSHI]: 'DSANSHI', // 抗三尸
        [Global.attrTypeL1.DZHENSHE]: 'DZHENSHE', // 抗震慑
        [Global.attrTypeL1.DWULI]: 'DWULI', // 抗物理
        [Global.attrTypeL1.PXISHOU]: 'PXISHOU', // 物理吸收
        [Global.attrTypeL1.PMINGZHONG]: 'PMINGZHONG', // 命中
        [Global.attrTypeL1.PSHANBI]: 'PSHANBI', // 闪避

        [Global.attrTypeL1.PLIANJI]: 'PLIANJI', //连击
        [Global.attrTypeL1.PLIANJILV]: 'PLIANJILV', //连击率
        [Global.attrTypeL1.PKUANGBAO]: 'PKUANGBAO', //狂暴
        [Global.attrTypeL1.PPOFANG]: 'PPOFANG', //破防
        [Global.attrTypeL1.PPOFANGLV]: 'PPOFANGLV', //破防率
        [Global.attrTypeL1.PFANZHEN]: 'PFANZHEN', //反震
        [Global.attrTypeL1.PFANZHENLV]: 'PFANZHENLV', //反震率
        [Global.attrTypeL1.ADEFEND]: 'ADEFEND', //加防
        [Global.attrTypeL1.ASPD]: 'ASPD', //加速
        [Global.attrTypeL1.AATK]: 'AATK', //加攻
        [Global.attrTypeL1.AHP]: 'AHP', //加血
        [Global.attrTypeL1.AMP]: 'AMP', //加蓝
        [Global.attrTypeL1.AMEIHUO]: 'AMEIHUO', //加强魅惑

        [Global.attrTypeL1.HDHUNLUAN]: 'HDHUNLUAN', // 忽视抗混乱
        [Global.attrTypeL1.HDFENGYIN]: 'HDFENGYIN', // 忽视抗封印
        [Global.attrTypeL1.HDHUNSHUI]: 'HDHUNSHUI', // 忽视抗昏睡
        [Global.attrTypeL1.HDDU]: 'HDDU', // 忽视抗毒
        [Global.attrTypeL1.HDFENG]: 'HDFENG', // 忽视抗风
        [Global.attrTypeL1.HDHUO]: 'HDHUO', // 忽视抗火
        [Global.attrTypeL1.HDSHUI]: 'HDSHUI', // 忽视抗水
        [Global.attrTypeL1.HDLEI]: 'HDLEI', // 忽视抗雷
        [Global.attrTypeL1.HDGUIHUO]: 'HDGUIHUO', // 忽视抗鬼火
        [Global.attrTypeL1.HDYIWANG]: 'HDYIWANG', // 忽视抗遗忘
        [Global.attrTypeL1.HDSANSHI]: 'HDSANSHI', // 忽视抗三尸
        [Global.attrTypeL1.HDZHENSHE]: 'HDZHENSHE', // 忽视抗震慑
        [Global.attrTypeL1.HDWULI]: 'HDWULI', // 忽视抗物理
        /////////////////////////////////////////
        [Global.attrTypeL1.HP]: 'HP',
        [Global.attrTypeL1.MAXHP]: 'MAXHP',
        [Global.attrTypeL1.MP]: 'MP',
        [Global.attrTypeL1.MAXMP]: 'MAXMP',
        [Global.attrTypeL1.ATK]: 'ATK',
        [Global.attrTypeL1.SPD]: 'SPD',

        [Global.attrTypeL1.PHP]: 'PHP',
        [Global.attrTypeL1.PMP]: 'PMP',
        [Global.attrTypeL1.PATK]: 'PATK',
        [Global.attrTypeL1.PSPD]: 'PSPD',

        [Global.attrTypeL1.SHUIKBPRE]: 'SHUIKBPRE',
        [Global.attrTypeL1.LEIKBPRE]: 'LEIKBPRE',
        [Global.attrTypeL1.HUOKBPRE]: 'HUOKBPRE',
        [Global.attrTypeL1.FENGKBPRE]: 'FENGKBPRE',
        [Global.attrTypeL1.SANSHIKBPRE]: 'SANSHIKBPRE',
        [Global.attrTypeL1.GUIHUOKBPRE]: 'GUIHUOKBPRE',
        [Global.attrTypeL1.SHUIKB]: 'SHUIKB',
        [Global.attrTypeL1.LEIKB]: 'LEIKB',
        [Global.attrTypeL1.HUOKB]: 'HUOKB',
        [Global.attrTypeL1.FENGKB]: 'FENGKB',
        [Global.attrTypeL1.SANSHIKB]: 'SANSHIKB',
        [Global.attrTypeL1.GUIHUOKB]: 'GUIHUOKB',
    }

    static normalAtkSkill = 1001;
    static normalDefSkill = 1002;
    static normalDefEffect = 2;

    static mapType: any = {
        Unknow: 0,
        Map: 1,
        Instance: 2,
    }

    static livingType: any = {
        Unknow: 0,
        Player: 1,
        NPC: 2,
        Monster: 3,
        Pet: 4,
        Partner: 5,
    }

    static attrTypeL2:any= {
        GENGU: 100, // 根骨
        LINGXING: 101, // 灵性
        LILIANG: 102, // 力量
        MINJIE: 103, // 敏捷
    }

    static attrEquipTypeStr:any = {
        'FatalRate': Global.attrTypeL1.PKUANGBAO, // 致命（狂暴）%       
        'HitRate': Global.attrTypeL1.PMINGZHONG, // 命中%       
        'PhyDefNef': Global.attrTypeL1.PPOFANG, // 破防程度%     
        'PhyDefNefRate': Global.attrTypeL1.PPOFANGLV, // 破防概率%     
        'AdAtkEhan': Global.attrTypeL1.AATK, // 加强攻击%     
        'Atk': Global.attrTypeL1.ATK, //攻击（原数增加）
        'AdSpdEhan': Global.attrTypeL1.ASPD, // 加强速度%     
        'HpMax': Global.attrTypeL1.MAXHP, // 增加气血上限        
        'MpMax': Global.attrTypeL1.MAXMP, // 增加法力上限        
        'HpPercent': Global.attrTypeL1.AHP, // 气血%       
        'MpPercent': Global.attrTypeL1.AMP, // 法力%       
        'AtkPercent': Global.attrTypeL1.PATK, //攻击变为%
        'Speed': Global.attrTypeL1.SPD, // 速度 （原数增加）     
        'RainDef': Global.attrTypeL1.DSHUI, // 抗水法%      
        'ThunderDef': Global.attrTypeL1.DLEI, // 抗雷法%      
        'FireDef': Global.attrTypeL1.DHUO, // 抗火法%      
        'WindDef': Global.attrTypeL1.DFENG, // 抗风法%      
        'RainDefNeg': Global.attrTypeL1.HDSHUI, // 忽视水%      
        'ThunderDefNeg': Global.attrTypeL1.HDLEI, // 忽视雷%      
        'FireDefNeg': Global.attrTypeL1.HDHUO, // 忽视火%      
        'WindDefNeg': Global.attrTypeL1.HDFENG, // 忽视风%      
        'SealDef': Global.attrTypeL1.DFENGYIN, // 抗封印%      
        'DisorderDef': Global.attrTypeL1.DHUNLUAN, // 抗混乱%      
        'SleepDef': Global.attrTypeL1.DHUNSHUI, // 抗昏睡%      
        'PoisonDef': Global.attrTypeL1.DDU, // 抗中毒%      
        'SealDefNeg': Global.attrTypeL1.HDFENGYIN, // 忽视封印%     
        'DisorderDefNeg': Global.attrTypeL1.HDHUNLUAN, // 忽视混乱%     
        'SleepDefNeg': Global.attrTypeL1.HDHUNSHUI, // 忽视昏睡%     
        'PoisonDefNeg': Global.attrTypeL1.HDDU, // 忽视毒%      
        'ForgetDef': Global.attrTypeL1.DYIWANG, // 抗遗忘%      
        'GfireDef': Global.attrTypeL1.DGUIHUO, // 抗鬼火%      
        'SanshiDef': Global.attrTypeL1.DSANSHI, // 抗三尸%      
        'ForgetDefNeg': Global.attrTypeL1.HDYIWANG, // 忽视遗忘%     
        'GfireDefNeg': Global.attrTypeL1.HDGUIHUO, // 忽视鬼火%     
        'SanshiDefNeg': Global.attrTypeL1.HDSANSHI, // 忽视三尸%     
        'ShockDefNeg': Global.attrTypeL1.HDZHENSHE, // 忽视抗震慑%        
        'CharmEhan': Global.attrTypeL1.AMEIHUO, // 加强魅惑%     
        'PhyDef': Global.attrTypeL1.PXISHOU, // 物理吸收%     
        'AdDefEhan': Global.attrTypeL1.ADEFEND, //加强加防%
        'ShockDef': Global.attrTypeL1.DZHENSHE, //抗震慑%
        'HitCombo': Global.attrTypeL1.PLIANJI, //连击次数
        'VoidRate': Global.attrTypeL1.PSHANBI, //躲闪%

        'Basecon': Global.attrTypeL2.GENGU, // 根骨
        'Wakan': Global.attrTypeL2.LINGXING, // 灵性
        'Power': Global.attrTypeL2.LILIANG, // 力量
        'Agility': Global.attrTypeL2.MINJIE, // 敏捷

        'RainFatalRate': Global.attrTypeL1.SHUIKBPRE,
        'ThunderFatalRate': Global.attrTypeL1.LEIKBPRE,
        'FireFatalRate': Global.attrTypeL1.HUOKBPRE,
        'WindFatalRate': Global.attrTypeL1.FENGKBPRE,
        'SanshiFatalRate': Global.attrTypeL1.SANSHIKBPRE,
        'GfireFatalRate': Global.attrTypeL1.GUIHUOKBPRE,
        'RainFatalHurt': Global.attrTypeL1.SHUIKB,
        'ThunderFatalHurt': Global.attrTypeL1.LEIKB,
        'FireFatalHurt': Global.attrTypeL1.HUOKB,
        'WindFatalHurt': Global.attrTypeL1.FENGKB,
        'SanshiFatalHurt': Global.attrTypeL1.SANSHIKB,
        'GfireFatalHurt': Global.attrTypeL1.GUIHUOKB,
        'Kgold': Global.attrTypeL1.KGOLD,
        'Kwood': Global.attrTypeL1.KWOOD,
        'Kwater': Global.attrTypeL1.KWATER,
        'Kfire': Global.attrTypeL1.KFIRE,
        'Kearth': Global.attrTypeL1.KEARTH,
    }
    static equipTypeNumerical = [
        Global.attrTypeL1.ATK,
        Global.attrTypeL1.SPD,
        // Global.attrTypeL1.ADEFEND,
        Global.attrTypeL1.PLIANJI,
        Global.attrTypeL1.MAXHP,
        Global.attrTypeL1.MAXMP,
        Global.attrTypeL1.GENGU,
        Global.attrTypeL1.LINGXING,
        Global.attrTypeL1.LILIANG,
        Global.attrTypeL1.MINJIE,
        // Global.attrTypeL1.GOLD,
        // Global.attrTypeL1.WOOD,
        // Global.attrTypeL1.WATER,
        // Global.attrTypeL1.FIRE,
        // Global.attrTypeL1.EARTH,
    ];

    //技能
    static skillIds:any = {
        NormalAtkSkill: 1001, //普通攻击
        NormalDefSkill: 1002, //防御
        HeDingHongFen: 1003, //鹤顶红粉
        JieDaoShaRen: 1004, //借刀杀人
        MiHunZui: 1005, //迷魂醉
        ZuoBiShangGuan: 1006, //作壁上观
        WanDuGongXin: 1007, //万毒攻心
        ShiXinKuangLuan: 1008, //失心狂乱
        BaiRiMian: 1009, //百日眠
        SiMianChuGe: 1010, //四面楚歌
        LieHuoJiaoYang: 1011, //烈火骄阳
        FengLeiYongDong: 1012, //风雷涌动
        DianShanLeiMing: 1013, //电闪雷鸣
        JiaoLongChuHai: 1014, //蛟龙出海
        JiuYinChunHuo: 1015, //九阴纯火
        XiuLiQianKun: 1016, //袖里乾坤
        TianZhuDiMie: 1017, //天诛地灭
        JiuLongBingFeng: 1018, //九龙冰封
        MoShenHuTi: 1019, //魔神护体
        TianWaiFeiMo: 1020, //天外飞魔
        ShouWangShenLi: 1021, //兽王神力
        XiaoHunShiGu: 1022, //销魂蚀骨
        HanQingMoMo: 1023, //含情脉脉
        QianKunJieSu: 1024, //乾坤借速
        MoShenFuShen: 1025, //魔神附身
        YanLuoZhuiMing: 1026, //阎罗追命
        QinSiBingWu: 1027, //秦思冰雾
        XueShaZhiGu: 1028, //血煞之蛊
        LuoRiRongJin: 1029, //落日熔金
        ShiXinFeng: 1030, //失心疯
        QianNvYouHun: 1031, //倩女幽魂
        XiXingDaFa: 1032, //吸星大法
        XueHaiShenChou: 1033, //血海深仇
        MengPoTang: 1034, //孟婆汤


        ZhangYinDongDu: 2001, //帐饮东都
        YuanQuanWanHu: 2002, //源泉万斛
        ShenGongGuiLi: 2003, //神工鬼力
        BeiDaoJianXing: 2004, //倍道兼行
        PanShan: 2005, //蹒跚
        GongXingTianFa: 2006, // 恭行天罚
        TianGangZhanQi: 2007, // 天罡战气
        XuanRen: 2008, //悬刃
        YiHuan: 2009, //遗患
        ShanXian: 2010, // 闪现
        FeiLongZaiTian: 2011,// 飞龙在天
        FeiLongZaiTian_Feng: 2012, // 飞龙在天 风
        FeiLongZaiTian_Huo: 2013, // 飞龙在天 火
        FeiLongZaiTian_Shui: 2014, // 飞龙在天 水
        FeiLongZaiTian_Lei: 2015, // 飞龙在天 雷

        YouFengLaiYi: 2016,// 有凤来仪
        LiSheDaChuan: 2017, // 利涉大川

        YouFengLaiYi_Jin: 2017,// 有凤来仪 金
        YouFengLaiYi_Mu: 2018,// 有凤来仪 木
        YouFengLaiYi_Shui: 2019,// 有凤来仪 水
        YouFengLaiYi_Huo: 2020,// 有凤来仪 火
        YouFengLaiYi_Tu: 2021,// 有凤来仪 土

        FenLieGongJi: 2030, // 分裂攻击
        TianMoJieTi: 2031,// 天魔解体
        FenGuangHuaYing: 2032, // 分光化影
        QingMianLiaoYa: 2033, // 青面獠牙
        XiaoLouYeKu: 2034, // 小楼夜哭
        GeShanDaNiu: 2035, // 隔山打牛

        HunLuan: 2036, // 混乱
        FengYin: 2037, // 封印



        HighZhangYinDongDu: 2101, //高级帐饮东都
        HighYuanQuanWanHu: 2102, //高级源泉万斛
        HighShenGongGuiLi: 2103, //高级神工鬼力
        HighBeiDaoJianXing: 2104, //高级倍道兼行
        HighPanShan: 2105, //高级蹒跚
        HighShanXian: 2110, // 高级闪现
        YinShen: 2111, // 隐身
        MiaoShouHuiChun: 2112,//妙手回春

        FenHuaFuLiu: 2113,// 分花拂柳


        WuXingXiangKe: 2120, // 五行相克 -- 用来标记五行技能
        ChuiJinZhuanYu: 2121, //炊金馔玉
        KuMuFengChun: 2122, //枯木逢春
        RuRenYinShui: 2123, //如人饮水
        FengHuoLiaoYuan: 2124, //烽火燎原
        XiTianJingTu: 2125, //西天净土

        HighFenLieGongJi: 2130, // 高级分裂攻击
        HighTianMoJieTi: 2131,// 高级天魔解体
        HighFenGuangHuaYing: 2132, // 高级分光化影
        HighQingMianLiaoYa: 2133, // 高级青面獠牙
        HighXiaoLouYeKu: 2134, // 高级小楼夜哭
        HighGeShanDaNiu: 2135, // 高级隔山打牛

        JiQiBuYi: 2136, // 击其不意

        ZiXuWuYou: 2700, // 子虚乌有
        HuaWu: 2701, // 化无
        JueJingFengSheng: 2702, // 绝境逢生
        DangTouBangHe: 2703, //当头棒喝
        JiangSi: 2704, //将死
        ZuoNiaoShouSan: 2705, // 作鸟兽散
        ChunHuiDaDi: 2706, // 春回大地
        ShuangGuanQiXia: 2707, // 双管齐下
        MingChaQiuHao: 2708, // 明察秋毫


        BingLinChengXia: 3001, //兵临城下
        NiePan: 3002, //涅槃
        QiangHuaXuanRen: 3003, //强化悬刃
        QiangHuaYiHuan: 3004, //强化遗患
        ChaoMingDianChe: 3005, //潮鸣电掣
        RuHuTianYi: 3006, //如虎添翼
        StealMoney: 8000, // 偷钱，天降灵猴
    }

    static defineSkill = {
        [Global.raceType.Humen]: {
            [Global.sexType.Male]: {
                [Global.skillIds.JieDaoShaRen]: 0,
                [Global.skillIds.MiHunZui]: 0,
                [Global.skillIds.ZuoBiShangGuan]: 0,
                [Global.skillIds.ShiXinKuangLuan]: 0,
                [Global.skillIds.BaiRiMian]: 0,
                [Global.skillIds.SiMianChuGe]: 0,
            },
            [Global.sexType.Female]: {
                [Global.skillIds.HeDingHongFen]: 0,
                [Global.skillIds.MiHunZui]: 0,
                [Global.skillIds.ZuoBiShangGuan]: 0,
                [Global.skillIds.WanDuGongXin]: 0,
                [Global.skillIds.BaiRiMian]: 0,
                [Global.skillIds.SiMianChuGe]: 0,
            }
        },
        [Global.raceType.Demon]: {
            [Global.sexType.Male]: {
                [Global.skillIds.TianWaiFeiMo]: 0,
                [Global.skillIds.ShouWangShenLi]: 0,
                [Global.skillIds.XiaoHunShiGu]: 0,
                [Global.skillIds.QianKunJieSu]: 0,
                [Global.skillIds.MoShenFuShen]: 0,
                [Global.skillIds.YanLuoZhuiMing]: 0,
            },
            [Global.sexType.Female]: {
                [Global.skillIds.MoShenHuTi]: 0,
                [Global.skillIds.ShouWangShenLi]: 0,
                [Global.skillIds.XiaoHunShiGu]: 0,
                [Global.skillIds.HanQingMoMo]: 0,
                [Global.skillIds.MoShenFuShen]: 0,
                [Global.skillIds.YanLuoZhuiMing]: 0,
            }
        },
        [Global.raceType.Ghost]: {
            [Global.sexType.Male]: {
                [Global.skillIds.XueShaZhiGu]: 0,
                [Global.skillIds.LuoRiRongJin]: 0,
                [Global.skillIds.ShiXinFeng]: 0,
                [Global.skillIds.XiXingDaFa]: 0,
                [Global.skillIds.XueHaiShenChou]: 0,
                [Global.skillIds.MengPoTang]: 0,
            },
            [Global.sexType.Female]: {
                [Global.skillIds.QinSiBingWu]: 0,
                [Global.skillIds.LuoRiRongJin]: 0,
                [Global.skillIds.ShiXinFeng]: 0,
                [Global.skillIds.QianNvYouHun]: 0,
                [Global.skillIds.XueHaiShenChou]: 0,
                [Global.skillIds.MengPoTang]: 0,
            }
        },
        [Global.raceType.Sky]: {
            [Global.sexType.Male]: {
                [Global.skillIds.FengLeiYongDong]: 0,
                [Global.skillIds.DianShanLeiMing]: 0,
                [Global.skillIds.JiaoLongChuHai]: 0,
                [Global.skillIds.XiuLiQianKun]: 0,
                [Global.skillIds.TianZhuDiMie]: 0,
                [Global.skillIds.JiuLongBingFeng]: 0,
            },
            [Global.sexType.Female]: {
                [Global.skillIds.LieHuoJiaoYang]: 0,
                [Global.skillIds.DianShanLeiMing]: 0,
                [Global.skillIds.JiaoLongChuHai]: 0,
                [Global.skillIds.JiuYinChunHuo]: 0,
                [Global.skillIds.TianZhuDiMie]: 0,
                [Global.skillIds.JiuLongBingFeng]: 0,
            }
        }
    }

    // 成长值
    static growPre = {
        [Global.raceType.Humen]: {
            [Global.attrTypeL2.GENGU]: 1.2,
            [Global.attrTypeL2.LINGXING]: 1,
            [Global.attrTypeL2.LILIANG]: 1,
            [Global.attrTypeL2.MINJIE]: 0.8,
        },
        [Global.raceType.Demon]: {
            [Global.attrTypeL2.GENGU]: 1.1,
            [Global.attrTypeL2.LINGXING]: 0.6,
            [Global.attrTypeL2.LILIANG]: 1.3,
            [Global.attrTypeL2.MINJIE]: 1,
        },
        [Global.raceType.Sky]: {
            [Global.attrTypeL2.GENGU]: 1,
            [Global.attrTypeL2.LINGXING]: 1.3,
            [Global.attrTypeL2.LILIANG]: 0.7,
            [Global.attrTypeL2.MINJIE]: 1,
        },
        [Global.raceType.Ghost]: {
            [Global.attrTypeL2.GENGU]: 1.2,
            [Global.attrTypeL2.LINGXING]: 1,
            [Global.attrTypeL2.LILIANG]: 0.95,
            [Global.attrTypeL2.MINJIE]: 0.85,
        },
    }

    // 基础一级属性
    static baseAttr = {
        [Global.raceType.Humen]: {
            [Global.attrTypeL1.HP]: 360,
            [Global.attrTypeL1.MP]: 300,
            [Global.attrTypeL1.ATK]: 70,
            [Global.attrTypeL1.SPD]: 8,
        },
        [Global.raceType.Demon]: {
            [Global.attrTypeL1.HP]: 330,
            [Global.attrTypeL1.MP]: 210,
            [Global.attrTypeL1.ATK]: 80,
            [Global.attrTypeL1.SPD]: 10,
        },
        [Global.raceType.Ghost]: {
            [Global.attrTypeL1.HP]: 300,
            [Global.attrTypeL1.MP]: 390,
            [Global.attrTypeL1.ATK]: 60,
            [Global.attrTypeL1.SPD]: 10,
        },
        [Global.raceType.Sky]: {
            [Global.attrTypeL1.HP]: 270,
            [Global.attrTypeL1.MP]: 350,
            [Global.attrTypeL1.ATK]: 80,
            [Global.attrTypeL1.SPD]: 9,
        },
    }

    // 转生修正
    static reliveFixAttr1 = {
        [Global.raceType.Humen]: {
            [Global.sexType.Male]: {
                [Global.attrTypeL1.DHUNLUAN]: 10,
                [Global.attrTypeL1.DFENGYIN]: 10,
                [Global.attrTypeL1.DHUNSHUI]: 10,
            },
            [Global.sexType.Female]: {
                [Global.attrTypeL1.DDU]: 10,
                [Global.attrTypeL1.DFENGYIN]: 10,
                [Global.attrTypeL1.DHUNSHUI]: 10,
            },
        },
        [Global.raceType.Demon]: {
            [Global.sexType.Male]: {
                [Global.attrTypeL1.HP]: 8.2,
                [Global.attrTypeL1.MP]: 8.2,
                [Global.attrTypeL1.SPD]: 6.15,
            },
            [Global.sexType.Female]: {
                [Global.attrTypeL1.HP]: 8.2,
                [Global.attrTypeL1.MP]: 8.2,
                [Global.attrTypeL1.DZHENSHE]: 9.2,
            },
        },
        [Global.raceType.Ghost]: {
            [Global.sexType.Male]: {
                [Global.attrTypeL1.DGUIHUO]: 10,
                [Global.attrTypeL1.DYIWANG]: 10,
                [Global.attrTypeL1.DSANSHI]: 10,
            },
            [Global.sexType.Female]: {
                [Global.attrTypeL1.DGUIHUO]: 10,
                [Global.attrTypeL1.DYIWANG]: 10,
                [Global.attrTypeL1.DWULI]: 15.3,
            },
        },
        [Global.raceType.Sky]: {
            [Global.sexType.Male]: {
                [Global.attrTypeL1.DLEI]: 10,
                [Global.attrTypeL1.DSHUI]: 10,
                [Global.attrTypeL1.DFENG]: 10,
            },
            [Global.sexType.Female]: {
                [Global.attrTypeL1.DLEI]: 10, // 抗混乱
                [Global.attrTypeL1.DSHUI]: 10, // 抗封印
                [Global.attrTypeL1.DHUO]: 10, // 抗昏睡
            },
        },
    }

    static attrToBtlAttr = {
        [Global.attrTypeL1.ATK]: [Global.attrTypeL1.AATK],
        [Global.attrTypeL1.DWULI]: [Global.attrTypeL1.ADEFEND, Global.attrTypeL1.PXISHOU],
        [Global.attrTypeL1.SPD]: [Global.attrTypeL1.ASPD],
    }

    // 转生修正
    static reliveFixAttr2 = {
        [Global.raceType.Humen]: {
            [Global.sexType.Male]: {
                [Global.attrTypeL1.DHUNLUAN]: 15,
                [Global.attrTypeL1.DFENGYIN]: 15,
                [Global.attrTypeL1.DHUNSHUI]: 15,
            },
            [Global.sexType.Female]: {
                [Global.attrTypeL1.DDU]: 15,
                [Global.attrTypeL1.DFENGYIN]: 15,
                [Global.attrTypeL1.DHUNSHUI]: 15,
            },
        },
        [Global.raceType.Demon]: {
            [Global.sexType.Male]: {
                [Global.attrTypeL1.HP]: 12.3,
                [Global.attrTypeL1.MP]: 12.3,
                [Global.attrTypeL1.SPD]: 9.23,
            },
            [Global.sexType.Female]: {
                [Global.attrTypeL1.HP]: 12.3,
                [Global.attrTypeL1.MP]: 12.3,
                [Global.attrTypeL1.DZHENSHE]: 13.8,
            },
        },
        [Global.raceType.Ghost]: {
            [Global.sexType.Male]: {
                [Global.attrTypeL1.DGUIHUO]: 15,
                [Global.attrTypeL1.DYIWANG]: 15,
                [Global.attrTypeL1.DSANSHI]: 15,
            },
            [Global.sexType.Female]: {
                [Global.attrTypeL1.DGUIHUO]: 15,
                [Global.attrTypeL1.DYIWANG]: 15,
                [Global.attrTypeL1.DWULI]: 23,
            },
        },
        [Global.raceType.Sky]: {
            [Global.sexType.Male]: {
                [Global.attrTypeL1.DLEI]: 15,
                [Global.attrTypeL1.DSHUI]: 15,
                [Global.attrTypeL1.DFENG]: 15,
            },
            [Global.sexType.Female]: {
                [Global.attrTypeL1.DLEI]: 15, // 抗混乱
                [Global.attrTypeL1.DSHUI]: 15, // 抗封印
                [Global.attrTypeL1.DHUO]: 15, // 抗昏睡
            },
        },
    }

    // 转生修正
    static reliveFixAttr3 = {
        [Global.raceType.Humen]: {
            [Global.sexType.Male]: {
                [Global.attrTypeL1.DHUNLUAN]: 20,
                [Global.attrTypeL1.DFENGYIN]: 20,
                [Global.attrTypeL1.DHUNSHUI]: 20,
            },
            [Global.sexType.Female]: {
                [Global.attrTypeL1.DDU]: 20,
                [Global.attrTypeL1.DFENGYIN]: 20,
                [Global.attrTypeL1.DHUNSHUI]: 20,
            },
        },
        [Global.raceType.Demon]: {
            [Global.sexType.Male]: {
                [Global.attrTypeL1.HP]: 16.4,
                [Global.attrTypeL1.MP]: 16.4,
                [Global.attrTypeL1.SPD]: 12.3,
            },
            [Global.sexType.Female]: {
                [Global.attrTypeL1.HP]: 16.4,
                [Global.attrTypeL1.MP]: 16.4,
                [Global.attrTypeL1.DZHENSHE]: 18.5,
            },
        },
        [Global.raceType.Ghost]: {
            [Global.sexType.Male]: {
                [Global.attrTypeL1.DGUIHUO]: 20,
                [Global.attrTypeL1.DYIWANG]: 20,
                [Global.attrTypeL1.DSANSHI]: 20,
            },
            [Global.sexType.Female]: {
                [Global.attrTypeL1.DGUIHUO]: 20,
                [Global.attrTypeL1.DYIWANG]: 20,
                [Global.attrTypeL1.DWULI]: 30.6,
            },
        },
        [Global.raceType.Sky]: {
            [Global.sexType.Male]: {
                [Global.attrTypeL1.DLEI]: 20,
                [Global.attrTypeL1.DSHUI]: 20,
                [Global.attrTypeL1.DFENG]: 20,
            },
            [Global.sexType.Female]: {
                [Global.attrTypeL1.DLEI]: 20, // 抗混乱
                [Global.attrTypeL1.DSHUI]: 20, // 抗封印
                [Global.attrTypeL1.DHUO]: 20, // 抗昏睡
            },
        },
    }

    static EMagicType = { //法系id
        Physics: 0, //物理
        Chaos: 1, //混乱
        Toxin: 2, //毒
        Sleep: 3, //昏睡
        Seal: 4, //封印
        Wind: 5, //风法
        Fire: 6, //火法
        Thunder: 7, //雷法
        Water: 8, //水法
        AtkSkillMax: 9, // 攻击类法术最大值
        Speed: 10, //加速
        Defense: 11, //加防
        Attack: 12, //加攻
        Frighten: 13, //震慑
        ThreeCorpse: 14, //三尸
        Charm: 15, //魅惑
        GhostFire: 16, //鬼火
        Forget: 17, //遗忘
        SubDefense: 18, // 减防
        YinShen: 19, // 隐身
        Rrsume: 20, // 回血技能
        StealMoney:21, // 飞龙探云手
    }

    static atkSkills = [
        Global.EMagicType.Physics, //物理
        Global.EMagicType.Chaos, //混乱
        Global.EMagicType.Toxin, //毒
        Global.EMagicType.Sleep, //昏睡
        Global.EMagicType.Seal, //封印
        Global.EMagicType.Wind, //风法
        Global.EMagicType.Fire, //火法
        Global.EMagicType.Thunder, //雷法
        Global.EMagicType.Water, //水法
        Global.EMagicType.Frighten, //震慑
        Global.EMagicType.ThreeCorpse, //三尸
        Global.EMagicType.Charm, //魅惑
        Global.EMagicType.GhostFire, //鬼火
        Global.EMagicType.Forget, //遗忘
        Global.EMagicType.SubDefense, // 减防
    ]

    static skillActOn:any = {
        All: 0,
        Enemy: 1,
        Self: 2,
    }

    static defSkills:any = [
        Global.EMagicType.Speed, //加速
        Global.EMagicType.Defense, //加防
        Global.EMagicType.Attack, //加攻
        Global.EMagicType.YinShen, //隐身
    ]

    static debuffSkills:any = [
        Global.EMagicType.Chaos, //混乱
        Global.EMagicType.Toxin, //毒
        Global.EMagicType.Sleep, //昏睡
        Global.EMagicType.Seal, //封印
        Global.EMagicType.Charm, //魅惑
        Global.EMagicType.Forget, //遗忘
        Global.EMagicType.SubDefense, // 减防
    ]

    static buffSkillType:any = { //法系id
        [Global.EMagicType.Physics]: 0, //物理
        [Global.EMagicType.Chaos]: 2, //混乱
        [Global.EMagicType.Toxin]: 0, //毒
        [Global.EMagicType.Sleep]: 0, //昏睡
        [Global.EMagicType.Seal]: 0, //封印
        [Global.EMagicType.Wind]: 0, //风法
        [Global.EMagicType.Fire]: 0, //火法
        [Global.EMagicType.Thunder]: 0, //雷法
        [Global.EMagicType.Water]: 0, //水法
        [Global.EMagicType.Speed]: 1, //加速
        [Global.EMagicType.Defense]: 1, //加防
        [Global.EMagicType.Attack]: 1, //加攻
        [Global.EMagicType.Frighten]: 0, //震慑
        [Global.EMagicType.ThreeCorpse]: 0, //三尸
        [Global.EMagicType.Charm]: 2, //魅惑
        [Global.EMagicType.GhostFire]: 0, //鬼火
        [Global.EMagicType.Forget]: 2, //遗忘
        [Global.EMagicType.SubDefense]: 2, // 减防
    }

    static SKillTypeKangXing:any= {
        [Global.EMagicType.Chaos]: Global.attrTypeL1.DHUNLUAN,
        [Global.EMagicType.Seal]: Global.attrTypeL1.DFENGYIN,
        [Global.EMagicType.Sleep]: Global.attrTypeL1.DHUNSHUI,
        [Global.EMagicType.Toxin]: Global.attrTypeL1.DDU,
        [Global.EMagicType.Wind]: Global.attrTypeL1.DFENG,
        [Global.EMagicType.Fire]: Global.attrTypeL1.DHUO,
        [Global.EMagicType.Water]: Global.attrTypeL1.DSHUI,
        [Global.EMagicType.Thunder]: Global.attrTypeL1.DLEI,
        [Global.EMagicType.GhostFire]: Global.attrTypeL1.DGUIHUO,
        [Global.EMagicType.Forget]: Global.attrTypeL1.DYIWANG,
        [Global.EMagicType.ThreeCorpse]: Global.attrTypeL1.DSANSHI,
        [Global.EMagicType.Frighten]: Global.attrTypeL1.DZHENSHE,
        [Global.EMagicType.Physics]: Global.attrTypeL1.DWULI,
    }

    static skillTypeStrengthen:any= {
        [Global.EMagicType.Chaos]: Global.attrTypeL1.HDHUNLUAN, //混乱
        [Global.EMagicType.Toxin]: Global.attrTypeL1.HDDU, //毒
        [Global.EMagicType.Sleep]: Global.attrTypeL1.HDHUNSHUI, //昏睡
        [Global.EMagicType.Seal]: Global.attrTypeL1.HDFENGYIN, //封印
        [Global.EMagicType.Wind]: Global.attrTypeL1.HDFENG, //风法
        [Global.EMagicType.Fire]: Global.attrTypeL1.HDHUO, //火法
        [Global.EMagicType.Thunder]: Global.attrTypeL1.HDLEI, //雷法
        [Global.EMagicType.Water]: Global.attrTypeL1.HDSHUI, //水法

        [Global.EMagicType.GhostFire]: Global.attrTypeL1.HDGUIHUO,
        [Global.EMagicType.Forget]: Global.attrTypeL1.HDYIWANG,
        [Global.EMagicType.ThreeCorpse]: Global.attrTypeL1.HDSANSHI,
        [Global.EMagicType.Frighten]: Global.attrTypeL1.HDZHENSHE,
        [Global.EMagicType.Physics]: Global.attrTypeL1.HDWULI,
    }

    static wuXingStrengthen:any = {
        [Global.attrTypeL1.GOLD]: Global.attrTypeL1.WOOD, // 金
        [Global.attrTypeL1.WOOD]: Global.attrTypeL1.EARTH, // 木
        [Global.attrTypeL1.WATER]: Global.attrTypeL1.FIRE, // 水
        [Global.attrTypeL1.FIRE]: Global.attrTypeL1.GOLD, // 火
        [Global.attrTypeL1.EARTH]: Global.attrTypeL1.WATER, // 土
    }
    static WuXingKeStrengthen:any = {
        [Global.attrTypeL1.KGOLD]: Global.attrTypeL1.GOLD, //强力克金
        [Global.attrTypeL1.KWOOD]: Global.attrTypeL1.WOOD, //强力克木
        [Global.attrTypeL1.KWATER]: Global.attrTypeL1.WATER, //强力克水
        [Global.attrTypeL1.KFIRE]: Global.attrTypeL1.FIRE, //强力克火
        [Global.attrTypeL1.KEARTH]: Global.attrTypeL1.EARTH, //强力克土
    }

    // 战斗回合类型
    static BtlActionType:any= {
        Initiative: 1, // 主动
        Passive: 2, // 被动
    }

    static skillQuality:any= {
        Low: 1, // 普通技能
        High: 2, // 高级技能
        Shen: 3, // 神兽技能
        Final: 4, // 终极技能
    }

    static buffType = {
        None: 0, //无buff
        Loop: 1, //循环伤害
        Once: 2, // 一次计算
    }

    // 战斗回合内 响应
    static btlRespone:any = {
        NoThing: 0, // 无响应
        Defense: 1, // 防御
        Dodge: 2, // 闪避
        CriticalHit: 3, // 暴击
        Catched: 4, // 被抓
        NoCatch: 5, // 不能被抓
        CatchFail: 6, // 捕捉失败
        Protect: 7,
        BeProtected: 8, //被保护
        SummonBack: 9,
        Summon: 10,
        SummonFaild: 11,
        PoFang: 12,
    }

    static skillEffect = {
        cnt: 1, // 人数
        round: 0, // 回合
        hurt: 0, //伤害
        hurtpre: 0, //伤害百分比
        hppre: 0, // 加血百分比
        mppre: 0, // 加蓝百分比
        smppre: 0, // 法力减少-
        hit: 0, // 命中增加+
        spd: 0, // 速度增加+
        atk: 0, // 攻击增加+
        kongzhi: 0, // 控制抗性+
        fashang: 0, // 法伤抗性+
        fangyu: 0, // 防御+
        hp: 0, // 增加血量
        aihp: 0, // 智能回血（用于吸血类技能）
        skongzhi: 0, // 减少控制抗性
        yinshen: 0, // 隐身
        attrtype: 0, //五行
        attrnum: 0, //五行数值
    }

    static wuXing = {
        Gold: 1,
        Wood: 2,
        Water: 3,
        Fire: 4,
        Earth: 5,
    }

    static actType = {
        Skill: 1,
        Item: 2,
        Summon: 3, // 召唤
        RunAway: 4, // 逃跑
        Protect: 5, // 保护
        Catch: 6, //捕捉
        SummonBack: 7, //召还
    }

    static actNumType = {
        Hurt: 1, // 伤害
        HP: 2, // 加血
        MP: 3, // 扣蓝
        Suck: 4, // 吸血
        HurtMP: 5, //掉血 扣蓝
        HPMP: 6,
    }

    static ENpcKind = {
        ERole: 1,
        EThing: 2,
        EBomb: 3
    }

    static reliveLimit:any={
        [1]: {
            level: 100,
            tolevel: 80,
            price: 100,
        },
        [2]: {
            level: 120,
            tolevel: 100,
            price: 100,
        },
        [3]: {
            level: 140,
            tolevel: 120,
            price: 100,
        },
    }

    static cantPKMaps = [
        1011, // 长安
        1201, // 监狱
        1002, // 天宫
        1000, // 皇宫
        1206, // 金銮殿
        1012, // 地府
        1202, // 白骨洞
        1203, // 斜月三星洞
        1208, // 兜率宫
        1013, // 兰若寺
        1014, // 灵兽村
        3002, // 帮派
        4001, // 家
    ];


    static limitWorldChatLevel = 120;
    static limitWorldChatChargeCount = 30;
    static limitPetNum = 20;

    static limitBroadcastList:string[] = [
        'qq',
        'QQ',
        '微信',
        '君羊',
        '君.羊',
        '龙马服',
        '残端',
        '私服'
    ]

    static battleType:any = {
        Normal: 0, // 未定义
        Force: 1, // 强制
        PK: 2, // 切磋
        ShuiLu: 3, // 水路大会
        LingHou: 4, // 天降灵猴
        PALACE: 5, // 皇城pk
    }

    static limitBagKindNum = 100;
    static limitLockerKindNum = 100;

    static shenBingBroke:number[]=[
        5000,
        2500,
        1000,
        500,
    ]

    static equipPos:any={
        UNKNOW: 1,
        USE: 2,
        BAG: 3,
        BANK: 4,
    }

    static PKLevelLimit = 140;

    // 装备类型，0:新手装备，1:高级装备，2:神兵，3:仙器
    static EquipType:any={
        XinShou: 0,
        High: 1,
        ShenBing: 2,
        XianQi: 3,
    }

    static petGrade:any = {
        Normal: 0,
        High: 1,
        Special: 2,
        Shen: 3,
        SSR: 4,
    }

    static goldKind:any= {
        Money: 0,
        Jade: 1,
        BindJade: 2,
        SLDH_Score: 3,
    }

    static titleType:any = {
        IMGTitle: 0, //图片类称谓
        CommonTitle: 1, //普通文字称谓，如帮派类称谓
        BroTitle: 2, //结拜类称谓
        CoupleTitle: 3, //夫妻类称谓
    }

    static titleBangType:any = {
        NoTitle: 0,
        ShuiLuZhanShen: 86,
        Shancaitongzi: 43,
        Couple: 200,
        Brother: 201,
        BangZhu: 227, // 帮主
        FuBangZhu: 226, // 副帮主
        ZuoHuFa: 225, // 左护法
        YouHuFa: 224, // 右护法
        ZhangLao: 223, // 长老
        TangZhu: 222, // 堂主
        BangZhong: 221, // 帮众
    }

    static bangPost = {
        Unknow: 0, // 未知
        BangZhu: 1, // 帮主
        FuBangZhu: 2, // 副帮主
        ZuoHuFa: 3, // 左护法
        YouHuFa: 4, // 右护法
        ZhangLao: 5, // 长老
        TangZhu: 6, // 堂主
        BangZhong: 7, // 帮众
    }

    static relationType = {
        Brother: 0, // 结拜
        Couple: 1, // 结婚
    }

    static relationTypeMembersCount = {
        [Global.relationType.Brother]: 5,
        [Global.relationType.Couple]: 2,
    }

    static lingHouMinMoney = 2000;
    static LingHouRetMoney = 10000;
    static brotherMoney = 1000000;
    static schemeUseMoney = 10000000;
    static prop_data: any = {};
    static catch_data: any = {};

    static starList = [
        10051,
        10052,
        10053,
        10054,
        10055,
        10056,
        10057,
        10058,
        10059,
        10060,
        10061,
        10062,
    ];

    static limitWordList: string[] = [
        '系统',
        '官方',
        '测试',
        'gm',
        'Gm',
        'GM',
        '管理',
        '内测',
        '内部',
        '技术',
        '公告',
        '公测',
        '垃圾',
        '毛泽东',
        '周恩来',
        '刘少奇',
        '习近平',
        '李克强',
        '朱德',
        '丁磊',
        '你妈',
        '共产党'
    ]

    static numchar: string[] = [
        'q', 'Q', 'O',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
        '１', '２', '３', '４', '５', '６', '７', '８', '９', '０',
        '一', '二', '三', '四', '五', '六', '七', '八', '九', '零', '〇',
        '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨',
        '⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹',
        '₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉',
        '⑴', '⑵', '⑶', '⑷', '⑸', '⑹', '⑺', '⑻', '⑼',
        '⒈', '⒉', '⒊', '⒋', '⒌', '⒍', '⒎', '⒏', '⒐',
        'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ',
        '❶', '❷', '❸', '❹', '❺', '❻', '❼', '❽', '❾',
        '➊', '➋', '➌', '➍', '➎', '➏', '➐', '➑', '➒', '➓',
        '⓵', '⓶', '⓷', '⓸', '⓹', '⓺', '⓻', '⓼', '⓽',
        '㈠', '㈡', '㈢', '㈣', '㈤', '㈥', '㈦', '㈧', '㈨',
        '壹', '贰', '叁', '叄', '肆', '伍', '陆', '柒', '捌', '扒', '玖',
        '伞', '溜', '君', '羊', '久', '巴',
        '玉', '仙', '裙', '群', '西', '游',
    ]

    static fdump(obj: any) {
        let t = 0;
        let repeat = (str: any, n: any) => {
            return new Array(n).join(str);
        }
        let adump = (object: any) => {
            t++;
            if (object && typeof object === "object") {
                for (const key in object) {
                    if (object.hasOwnProperty(key)) {
                        const value = object[key];
                        if (value && typeof value === "object") {
                            let isa = Array.isArray(value);
                            console.log(repeat('\t', t), key + ':' + (isa ? '[' : '{'));
                            adump(value);
                            t--;
                            console.log(repeat('\t', t), isa ? ']' : '}');
                        } else {
                            console.log(repeat('\t', t), key + ':' + value);
                        }
                    }
                }
            } else {
                console.log(repeat('\t', t), object);
            }
        }
        adump(obj);
    }

    static dump(...args: any[]) {
        for (const arg of args) {
            this.fdump(arg);
        }
    }

    static deepClone(obj: any): any {
        let objClone: any = Array.isArray(obj) ? [] : {};
        if (obj && typeof obj === "object" && obj.hasOwnProperty) {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    //判断ojb子元素是否为对象，如果是，递归复制
                    if (obj[key] && typeof obj[key] === "object") {
                        objClone[key] = this.deepClone(obj[key]);
                    } else {
                        //如果不是，简单复制
                        objClone[key] = obj[key];
                    }
                }
            }
        }
        return objClone;
    }

    static safeJson(str: string): string {
        let ret = null;
        if (str == null || str == '' || (str[0] != '{' && str[0] != '[')) {
            return ret;
        }
        try {
            ret = JSON.parse(str);
        } catch (error) {
            console.error(`safeJson error, string: ${str}`);
            ret = null;
        }
        return ret;
    }

    static seed_index: number = 10000;
    static buff_index: number = 10000;

    static getAutoAddId(): number {
        Global.seed_index++;
        return Global.seed_index;
    }

    static getAutoBuffId(): number {
        Global.buff_index++;
        return Global.buff_index;
    }

    static random(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    static getFlag(nNum: number, nIndex: number): number {
        if (nIndex < 0 || nIndex > 31)
            return 0;
        let nRet = (nNum >> nIndex) & 1;
        return nRet;
    }

    static setFlag(nNum:any, nIndex: number, bValue: number): number {
        if (nIndex < 0 || nIndex > 31)
            return null;
        if (bValue != 0 && bValue != 1)
            return null;

        let bFlag = Global.getFlag(nNum, nIndex);
        if (bFlag > bValue) {
            nNum -= (1 << nIndex);
        }
        if (bFlag < bValue) {
            nNum += (1 << nIndex);
        }
        return nNum;
    }


    static EPlayerFlag = {
        EBanSpeak: 1,
    }


    static ENpcCreater = {
        ESystem: 0,
        EPlayer: 1,
        ETeam: 2
    }

    static checkLimitWord = function (msg: any): boolean {
        let numcount = 0;
        for (let k = 0; k < msg.length; k++) {
            let msgchar: any = msg[k];
            if (Global.numchar.indexOf(msgchar) != -1) {
                numcount++
                if (numcount >= 6) {
                    return false;
                }
            }
        }
        for (let i = 0; i < Global.limitBroadcastList.length; i++) {
            const fword = Global.limitBroadcastList[i];
            if (msg.indexOf(fword) != -1) {
                return false;
            }
        }
        return true;
    }

    static netType: string;
    static serverID: number;
    static serverName: string;
    // 世界时间控制
    static gTime: number = 0;

    static serverState:any = {
        lower: 1,   // 流畅
        high: 2,     // 拥堵
        close: 3,    // 关闭
    }

    static MonkeyPos:any = [
            // 1007 大唐边境
            { mapid: 1007, x: 133, y: 27 },
            { mapid: 1007, x: 21, y: 111 },
            { mapid: 1007, x: 76, y: 97 },
            { mapid: 1007, x: 5, y: 65 },
            { mapid: 1007, x: 165, y: 95 },
            // 1011 长安 
            { mapid: 1011, x: 256, y: 51 },
            { mapid: 1011, x: 71, y: 5 },
            { mapid: 1011, x: 253, y: 74 },
            { mapid: 1011, x: 176, y: 130 },
            { mapid: 1011, x: 73, y: 138 },
            { mapid: 1011, x: 106, y: 125 },
            { mapid: 1011, x: 7, y: 67 },
            { mapid: 1011, x: 32, y: 69 },
            { mapid: 1011, x: 2, y: 107 },
            { mapid: 1011, x: 28, y: 138 },
            // 1004 大唐境内
            { mapid: 1004, x: 137, y: 90 },
            { mapid: 1004, x: 141, y: 22 },
            { mapid: 1004, x: 88, y: 6 },
            { mapid: 1004, x: 4, y: 74 },
            // 1010 东海渔村
            { mapid: 1010, x: 115, y: 63 },
            { mapid: 1010, x: 52, y: 45 },
            { mapid: 1010, x: 113, y: 97 },
            { mapid: 1010, x: 75, y: 108 },
            { mapid: 1010, x: 24, y: 103 },
            { mapid: 1010, x: 94, y: 133 },
            // 1006 万寿山
            { mapid: 1006, x: 80, y: 149 },
            { mapid: 1006, x: 84, y: 149 },
            { mapid: 1006, x: 88, y: 149 },
            { mapid: 1006, x: 92, y: 149 },
            { mapid: 1006, x: 96, y: 148 },
            { mapid: 1006, x: 96, y: 144 },
            { mapid: 1006, x: 91, y: 144 },
            { mapid: 1006, x: 84, y: 144 },
            { mapid: 1006, x: 78, y: 144 },
            { mapid: 1006, x: 66, y: 139 },
            { mapid: 1006, x: 72, y: 139 },
            { mapid: 1006, x: 76, y: 139 },
            { mapid: 1006, x: 82, y: 139 },
            { mapid: 1006, x: 66, y: 134 },
            { mapid: 1006, x: 75, y: 134 },
            { mapid: 1006, x: 86, y: 134 },
            { mapid: 1006, x: 92, y: 134 },
            { mapid: 1006, x: 15, y: 131 },
            { mapid: 1006, x: 9, y: 35 },
            // 1015 蟠桃园
            { mapid: 1015, x: 41, y: 12 },
            { mapid: 1015, x: 5, y: 19 },
            { mapid: 1015, x: 76, y: 56 },
            { mapid: 1015, x: 102, y: 66 },
            { mapid: 1015, x: 43, y: 67 },
            { mapid: 1015, x: 9, y: 125 },
            { mapid: 1015, x: 4, y: 48 },
            // 1016 御马监
            { mapid: 1016, x: 9, y: 16 },
            { mapid: 1016, x: 137, y: 40 },
            { mapid: 1016, x: 141, y: 65 },
            { mapid: 1016, x: 78, y: 90 },
            { mapid: 1016, x: 86, y: 34 },
            // 1014 灵兽村
            { mapid: 1014, x: 8, y: 97 },
            { mapid: 1014, x: 2, y: 60 },
            { mapid: 1014, x: 148, y: 16 },
            { mapid: 1014, x: 140, y: 6 },
            { mapid: 1014, x: 88, y: 99 },
            // 1017 傲来国
            { mapid: 1017, x: 8, y: 28 },
            { mapid: 1017, x: 8, y: 77 },
            { mapid: 1017, x: 10, y: 75 },
            { mapid: 1017, x: 1, y: 72 },
            { mapid: 1017, x: 34, y: 112 },
            { mapid: 1017, x: 32, y: 97 },
            { mapid: 1017, x: 100, y: 80 },
            { mapid: 1017, x: 56, y: 63 },
            { mapid: 1017, x: 68, y: 33 },
            { mapid: 1017, x: 9, y: 8 },
            { mapid: 1017, x: 27, y: 6 },
            { mapid: 1017, x: 43, y: 6 },
            { mapid: 1017, x: 59, y: 6 },
            { mapid: 1017, x: 113, y: 6 },
            { mapid: 1017, x: 142, y: 20 },
            { mapid: 1017, x: 97, y: 37 },
            { mapid: 1017, x: 137, y: 54 },
            // 1008 白骨山
            { mapid: 1008, x: 105, y: 64 },
            { mapid: 1008, x: 10, y: 40 },
            { mapid: 1008, x: 48, y: 13 },
            // 1005 方寸山
            { mapid: 1005, x: 14, y: 20 },
            { mapid: 1005, x: 49, y: 55 },
            { mapid: 1005, x: 59, y: 70 },
            // 1019 平顶山
            { mapid: 1019, x: 182, y: 7 },
            { mapid: 1019, x: 121, y: 2 },
            { mapid: 1019, x: 147, y: 19 },
            { mapid: 1019, x: 178, y: 9 },
            { mapid: 1019, x: 15, y: 82 },
            { mapid: 1019, x: 2, y: 62 },
            { mapid: 1019, x: 2, y: 29 },
            { mapid: 1019, x: 29, y: 3 },
            { mapid: 1019, x: 47, y: 124 },
            { mapid: 1019, x: 191, y: 97 },
            { mapid: 1019, x: 191, y: 40 },
            { mapid: 1019, x: 175, y: 58 },
            { mapid: 1019, x: 177, y: 77 },
            { mapid: 1019, x: 146, y: 64 },
            // 1003 北俱芦洲
            { mapid: 1003, x: 23, y: 69 },
            { mapid: 1003, x: 51, y: 74 },
            { mapid: 1003, x: 84, y: 6 },
            { mapid: 1003, x: 135, y: 22 },
            { mapid: 1003, x: 139, y: 5 },
            { mapid: 1003, x: 139, y: 45 },
            { mapid: 1003, x: 139, y: 62 },
            { mapid: 1003, x: 138, y: 80 },
        ];

    static require_ex(file:string):any{
        if (Global.prop_data[file]) {
            return Global.prop_data[file];
        }
        let pdata = Global.reloadfile(file);
        Global.prop_data[file] = pdata;
        return pdata;
    }

    static reloadPropData() {
        let errorlist = [];
        for (const filename in Global.prop_data) {
            // const filedata = prop_data[filename];
            let filedata = Global.reloadfile(filename);
            if (filedata) {
                if (Global.prop_data[filename]) {
                    let data = Global.prop_data[filename];
                    for (const datakey in data) {
                        if (data.hasOwnProperty(datakey)) {
                            data[datakey] = filedata[datakey];
                        }
                    }
                } else {
                    Global.prop_data[filename] = filedata;
                }
            } else {
                errorlist.push(filename);
            }
        }

        console.log('热更新完成');
        if (errorlist.length > 0) {
            for (const filename of errorlist) {
                console.log(`file reload error, [${filename}]`);
            }
        }
        return errorlist;
    }

    static reloadfile(filename:any): any {
        let full_path = path.join(__dirname, filename);
        let old = require.cache[require.resolve(full_path)];
        if (old != null || old != undefined) {
            Global.catch_data[full_path] = old;
        }
        require.cache[require.resolve(full_path)] = undefined;

        let ret_data = null;
        try {
            let data = require(require.resolve(full_path));
            if (data) {
                ret_data = data;
            } else {
                require.cache[full_path] = Global.catch_data[full_path];
                ret_data = null;
            }
        } catch (error) {
            console.error('load json ERROR, filename:' + full_path);
            console.error(error.message);
            require.cache[full_path] = Global.catch_data[full_path];
            ret_data = null;
        }
        delete Global.catch_data[full_path];
        return ret_data;
    }

    static serviceType = {
        Gate: 1,
        Game: 2,
        IM: 3,
    }

    static getPartnerJson(pPartner:any):string{
        if (null == pPartner)
            return '{}';

        let pPartnerConfigMgr = require('../object/partner_power_config');
        if (null == pPartnerConfigMgr)
            return '{}';

        let stLevelInfo = pPartnerConfigMgr.GetPower(pPartner.id, pPartner.relive, pPartner.level);
        if (null == stLevelInfo)
            return '{}';

        let stData:any = {
            id: pPartner.id, level: pPartner.level, exp: pPartner.exp, resid: pPartner.resid, name: pPartner.name, race: pPartner.race,
            dingwei: pPartner.dingwei, relive: pPartner.relive, mapZiZhi: pPartner.mapZiZhi, skill_list: pPartner.skill_list, livingtype: pPartner.living_type
        };

        for (var it2 in stLevelInfo.Attribute) {
            stData[it2] = stLevelInfo.Attribute[it2];
        }

        let strJson = JSON.stringify(stData);
        return strJson;
    }

    static getMapLen(mapTmp:any):number{
        let nCnt = 0;
        for (const it in mapTmp)
            nCnt++;
        return nCnt;
    }

    static numToString(nNum:number, nLen:number):string{
        return (Array(nLen).join('0') + nNum).slice(-nLen);
    }

    static getTime() {
        let nTime = Math.floor(Date.now() / 1000);
        let nLocalTime = nTime + 28800;
        return nLocalTime;
    }

    static changeNumToRange(fData:number, fMin:number, fMax:number):number{
        fData = Math.max(fData, fMin);
        fData = Math.min(fData, fMax);
        return fData;
    }

    static isVectorEqual(vec1:any, vec2:any):boolean{
        if (vec1.length != vec2.length)
            return false;

        for (var it in vec1) {
            if (vec1[it] != vec2[it])
                return false;
        }
        return true;
    }

    static isDataInVecter(stData:any, vecData:any):boolean{
        for (let it in vecData) {
            if (stData == vecData[it])
                return true;
        }
        return false;
    }

    static getAttribute(stData:any, strKey:any, stDefault:any):any{
        if (stData.hasOwnProperty(strKey) == false)
            return stDefault;

        return stData[strKey];
    }

    static getDistance(stPosA:any, stPosB:any):number{
        let nXDis = Math.abs(stPosA.x - stPosB.x);
        let nYDis = Math.abs(stPosA.y - stPosB.y);
        let nDis = Math.pow(nXDis * nXDis + nYDis * nYDis, 0.5);
        return nDis;
    }

    static getDefault(stData:any, stDefault?:any):any{
        if (typeof (stData) == "undefined")
            return stDefault;

        return stData;
    }

    static atribKey_IntToString(nKey:any):any{
        for (let it in Global.attrEquipTypeStr) {
            if (Global.attrEquipTypeStr[it] == nKey)
                return it;
        }
        return '';
    }

    static getMapDataByIndex(mapData:any, nIndex:number):any{
        if (nIndex < 0 || nIndex >= this.getMapLen(mapData))
            return null;

        let nCnt = -1;
        for (let it in mapData) {
            nCnt++;
            if (nCnt == nIndex)
                return mapData[it];
        }

        return null;
    }

    static givePlayerPrize(pPlayer:any, strItem:string, nNum:number) {
        if (pPlayer == null)
            return;

        if (strItem == 'exp') {
            pPlayer.addExp(nNum);
        }
        else if (strItem == 'petexp') {
            if (pPlayer.curPet) {
                pPlayer.curPet.addExp(nNum);
            }
        }
        else if (strItem == 'money') {
            pPlayer.AddMoney(0, nNum, '高级藏宝图');
        }
        else {
            pPlayer.AddItem(parseInt(strItem), nNum, true, '高级藏宝图');
        }
    }

    static zhenbukuiMap:any = [ 
        // 1007 大唐边境
        //{ mapid: 1016, x: 75, y: 49 }, //测试用地点，在御马监小马仙附近
        { mapid: 1007, x: 148, y: 44 },
        { mapid: 1007, x: 100, y: 24 },
        { mapid: 1007, x: 109, y: 5 },
        { mapid: 1007, x: 44, y: 14 },
        { mapid: 1007, x: 84, y: 104 },
        { mapid: 1007, x: 29, y: 83 },
        // 1011 长安 
        { mapid: 1011, x: 49, y: 36 },
        { mapid: 1011, x: 143, y: 66 },
        { mapid: 1011, x: 122, y: 34 },
        { mapid: 1011, x: 223, y: 34 },
        { mapid: 1011, x: 239, y: 113 },
        { mapid: 1011, x: 143, y: 84 },
        { mapid: 1011, x: 40, y: 9 },
        // 1004 大唐境内
        { mapid: 1004, x: 124, y: 74 },
        { mapid: 1004, x: 120, y: 49 },
        { mapid: 1004, x: 119, y: 37 },
        { mapid: 1004, x: 38, y: 47 },
        { mapid: 1004, x: 70, y: 14 },
        // 1010 东海渔村
        { mapid: 1010, x: 129, y: 47 },
        { mapid: 1010, x: 141, y: 34 },
        { mapid: 1010, x: 60, y: 22 },
        { mapid: 1010, x: 24, y: 9 },
        { mapid: 1010, x: 41, y: 53 },
        { mapid: 1010, x: 82, y: 89 },
        { mapid: 1010, x: 42, y: 103 },
        { mapid: 1010, x: 114, y: 114 },
        // 1006 万寿山
        { mapid: 1006, x: 56, y: 73 },
        { mapid: 1006, x: 98, y: 48 },
        { mapid: 1006, x: 93, y: 8 },
        { mapid: 1006, x: 18, y: 30 },
        { mapid: 1006, x: 109, y: 94 },
        { mapid: 1006, x: 74, y: 136 },
        // 1015 蟠桃园
        { mapid: 1015, x: 70, y: 30 },
        { mapid: 1015, x: 37, y: 26 },
        { mapid: 1015, x: 14, y: 57 },
        { mapid: 1015, x: 39, y: 76 },
        { mapid: 1015, x: 53, y: 103 },
        { mapid: 1015, x: 14, y: 120 },
        { mapid: 1015, x: 90, y: 58 },
        // 1016 御马监
        { mapid: 1016, x: 34, y: 63 },
        { mapid: 1016, x: 112, y: 63 },
        { mapid: 1016, x: 96, y: 23 },
        { mapid: 1016, x: 68, y: 23 },
        { mapid: 1016, x: 37, y: 26 },
        // 1014 灵兽村
        { mapid: 1014, x: 50, y: 36 },
        { mapid: 1014, x: 14, y: 55 },
        { mapid: 1014, x: 64, y: 58 },
        { mapid: 1014, x: 113, y: 64 },
        { mapid: 1014, x: 117, y: 42 },
        { mapid: 1014, x: 138, y: 12 },
        // 1017 傲来国
        { mapid: 1017, x: 57, y: 11 },
        { mapid: 1017, x: 20, y: 10 },
        { mapid: 1017, x: 33, y: 42 },
        { mapid: 1017, x: 56, y: 64 },
        { mapid: 1017, x: 80, y: 71 },
        { mapid: 1017, x: 93, y: 90 },
        { mapid: 1017, x: 44, y: 103 },
        { mapid: 1017, x: 12, y: 74 },
        { mapid: 1017, x: 98, y: 29 },
        { mapid: 1017, x: 133, y: 51 },
        // 1008 白骨山
        { mapid: 1008, x: 80, y: 13 },
        { mapid: 1008, x: 79, y: 52 },
        { mapid: 1008, x: 57, y: 70 },
        { mapid: 1008, x: 36, y: 70 },
        { mapid: 1008, x: 30, y: 10 },
        // 1005 方寸山
        { mapid: 1005, x: 34, y: 22 },
        { mapid: 1005, x: 24, y: 65 },
        { mapid: 1005, x: 48, y: 48 },
        { mapid: 1005, x: 68, y: 78 },
        { mapid: 1005, x: 94, y: 89 },
        { mapid: 1005, x: 101, y: 28 },
        // 1019 平顶山
        { mapid: 1019, x: 154, y: 91 },
        { mapid: 1019, x: 112, y: 104 },
        { mapid: 1019, x: 101, y: 60 },
        { mapid: 1019, x: 78, y: 39 },
        { mapid: 1019, x: 28, y: 22 },
        { mapid: 1019, x: 32, y: 55 },
        { mapid: 1019, x: 110, y: 17 },
        // 1003 北俱芦洲
        { mapid: 1003, x: 24, y: 37 },
        { mapid: 1003, x: 61, y: 42 },
        { mapid: 1003, x: 102, y: 48 },
        { mapid: 1003, x: 120, y: 17 },
        { mapid: 1003, x: 87, y: 23 },
    ]

    static EEventType:any = {
        PlayerTalkNpc: 1,
        PlayerKillNpc: 2,
        PlayerGatherNpc: 3,
        PlayerDoAction: 4,
        PlayerArriveArea: 5,
        PlayerGiveNpcItem: 6,
    
        FailEventPlayerDead: 11,
        FailEventTimeOut: 12,
    
    };
    
    static ETaskKind:any = {
        EStory: 1,
        EDaily: 2,
        EFuBen: 3,
    };
    
    static EState:any = {
        ELock: 0,
        EDoing: 1,
        EDone: 2,
        EFaild: 3,
    };

    static msgCode:any = {
        SUCCESS: 0,
        FAILED: 1,
        SERVICE_HAS_REPEAT: 90000,
        REGISTER_ACCOUNT_REPEAT: 100001, // 帐号重复
        REGISTER_DATABASE_ERROR: 100002, // 数据库插入错误
        LOGIN_ACCOUNT_PWD_ERROR: 100003, // 帐号或密码错误
        SERVICE_NOT_FOUND:100004, //
        ACCOUNT_FREEZE: 100005, // 帐号被封，请联系客服查询
        NETWORK_ERROR: 100006, //
        NETWORK_DISCONNECT: 100007, // 网络断开连接
        CREATE_NAME_INVALID: 100008,//名字不合法
        INVITE_CODE_ERR: 100009, //邀请码错误
        VERSION_ERROR: 100010,//版本不正确
        
        OPERATION_ERROR: 200001,//操作失败
        ROLE_NAME_EXIST: 200010,//角色名已存在
        ITEM_OPERATION_ERROR: 200011,//物品操作失败
    
        RELIVE_LEVEL_TOO_HIGH: 200012, // 更高转生等级暂未开放
        RELIVE_LEVEL_NOT_ENOUGH: 200013, // 转生等级不足
    
        BAG_ITEM_IS_FULL: 200014, // 背包已满
        GIFT_HAS_GOT : 300001,// 没有礼包或者已经领过了
    
        NO_TITLE:300010, // 没有这个称谓
    
    
        HONGBAO_GET_YET: 900001,//红包已经领过了
        SLDH_NOT_OPEN:900002, // 水陆大会没有开启
        SLDH_NOT_SIGN_TIME: 900003, // 不在水陆大会报名时间
        SLDH_SIGN_ALREADY:900004,// 已经报名过了。
        SLDH_SIGN_TEAM: 900005,// 水路大会必须3人以上组队参加
        SLDH_SIGN_TEAM_LEADER: 900006,// 只能队长报名
        SLDH_NOT_SIGN:900007,//水路大会 没有报名
        SLDH_SIGN_LEVEL_80: 900008,
    
        LINGHOU_NOT_TEAM:900100,// 不能组队 灵猴大吼一句，欺人太甚，还想以多欺少！
        LINGHOU_MONEY_ENOUGH:900101,// 银两不足 灵猴轻蔑的看了你一眼，便不再搭理你了！
        LINGHOU_FIGHT_TOO_MACH:900102, // 灵猴攻击次数太多 小猴子大喊一声，少侠饶命，小的再也不敢了！
        LINGHOU_TODAY_TOO_MACH:900103, // 今天攻击猴子次数太多 小猴子大喊一声，少侠饶命，小的再也不敢了！
    };

    static libao:any=[
        { itemid: 90004, num: 20000000 },  // 仙玉
        { itemid: 50004, num: 888 }, // 高级藏宝图
        { itemid: 90066, num: 1 },//年
        { itemid: 60029, num: 3 },//分花拂柳
        { itemid: 9070, num: 1 },//玄武
        { itemid: 90067, num: 1 },//白虎
        { itemid: 90068, num: 1 },//青龙
        { itemid: 90069, num: 1 },//朱雀
        { itemid: 60024, num: 2 },//化无
        { itemid: 90061, num: 1 },//浪淘沙
    ];

    static getIPAdress(): string {
        var interfaces = os.networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
        return "127.0.0.1";
    }
}