

import Global from "../../game/core/Global";
import PlayerMgr from "../object/PlayerMgr";
import Signal from "./signal";
import NoticeMgr from "./NoticeMgr";
import AgentMgr from "../network/AgentMgr";
import LotteryMgr from "./LotteryMgr";
import ActivityMgr from "../activity/ActivityMgr";
import BangMgr from "../bang/BangMgr";
import ChargeSum from "./ChargeSum";
import RelationMgr from "../object/RelationMgr";
import PalaceFight from "../activity/PalaceFight";
import MapMgr from "./MapMgr";
import SkillMgr from "../skill/core/SkillMgr";
import LevelMgr from "../object/LevelMgr";
import GoodsMgr from "../item/GoodsMgr";
import EquipMgr from "../object/EquipMgr";
import EffectMgr from "../skill/EffectMgr";
import Shop from "../object/Shop";
import World from "../object/World";
import NpcMgr from "./NpcMgr";
import MonsterMgr from "./MonsterMgr";
import MallMgr from "./MallMgr";
import ZhenbukuiMgr from "../activity/ZhenbukuiMgr";
import PaiHangMgr from "./PaiHangMgr";
import PetMgr from "./PetMgr";
import PartnerConfigMgr from "../object/PartnerConfigMgr";
import TaskConfigMgr from "../task/TaskConfigMgr";
import NpcConfigMgr from "./NpcConfigMgr";

export default class Launch {
    static shared = new Launch();

    completeList: any = {
        ['bangmgr']: false,
        ['petmgr']: false,
        ['equipmgr']: false,
        ['paihangmgr']: false,
        ['chargemgr']: false,
    };

    saveList:any = [
        Shop,
        PlayerMgr,
        // require('./bang/bang_mgr'),
    ];

    saved:number = 0;
    dt:number;

    constructor() {
        // 每秒4帧
        Global.frameTime = 1000 / 4;
        // 主逻辑循环
        this.dt = 0;
    }

    mainloop(){
        this.dt += Global.frameTime;
        // 内部通信循环
        Signal.shared.update(this.dt);
        AgentMgr.shared.update(this.dt);
        NoticeMgr.shared.update(Global.frameTime);
        PlayerMgr.shared.update(this.dt);
        LotteryMgr.shared.update(this.dt);
        ActivityMgr.shared.update(this.dt);
        PalaceFight.shared.update(Global.frameTime);
        RelationMgr.shared.update(this.dt);
        Global.gTime += Global.frameTime;
        // 1分钟校正
        if (this.dt % (1 * 60 * 1000) == 0) {
            Global.gTime = Date.now();
        }
    };

    start(){
        Global.gTime = Date.now();
        setInterval(this.mainloop,Global.frameTime);
        // 通知模块
        NoticeMgr.shared.init();
        console.log('通知模块初始化完毕!');
        // 地图模块
        MapMgr.shared.init();
        console.log('地图模块加载完毕!');
        // 任务配置
        TaskConfigMgr.shared.init();
        console.log('任务配置模块加载完毕!');
        // 世界模块
        World.shared.init();
        console.log('世界模块加载完毕！');
        // NPC配置
        NpcConfigMgr.shared.init();
        console.log('Npc配置模块加载完毕！');
        // NPC
        NpcMgr.shared.init();
        console.log('Npc模块加载完毕！');
        
        // 玩家模块
        PlayerMgr.shared.init();
        console.log('角色属性模块加载完毕！');
    
        GoodsMgr.shared.init();
        console.log('物品模块加载完毕！');
        // 经验模块
        LevelMgr.shared.init();
        console.log('经验模块加载完毕！');
        // 技能模块
        SkillMgr.shared.init();
        console.log('技能模块加载完毕！');
        // 技能效果模块
        EffectMgr.shared.init();
        console.log('技能效果模块加载完毕！');
        // 装备模块
        EquipMgr.shared.init();
    
        // 帮派模块
        BangMgr.shared.init();
    
        // 怪物模块
        MonsterMgr.shared.init();
        console.log('怪物模块加载完毕！');
    
        // 商城模块
        MallMgr.shared.init();
        console.log('商城模块加载完毕!');
        
        //甄不亏模块
        ZhenbukuiMgr.shared.init();
        console.log('甄不亏模块加载完毕!');
    
        // 摆摊模块
        Shop.shared.init();
        console.log('摆摊模块加载完毕!');
    
        // 排行榜模块
        PaiHangMgr.shared.init();
        console.log('排行榜模块加载完毕!');
    
        // 宠物模块
        PetMgr.shared.init();
    
        // 充值总额模块
        ChargeSum.shared.init();
    
        PartnerConfigMgr.shared.init();
        console.log('伙伴管理模块加载完毕！');
    
        ActivityMgr.shared.init();
        console.log('活动模块加载完毕!');
        
        LotteryMgr.shared.init();
        console.log('彩票模块加载完毕!');

        //关系模块
        RelationMgr.shared.init();
        console.log(`关系模块加载完毕`);
    };
    
    checkAllComplete() {
        for (let key in this.completeList) {
            if (this.completeList[key] == false) {
                return false;
            }
        }
        return true;
    }
    
    complete(mod: any) {
        this.completeList[mod] = true;
        if (this.checkAllComplete()) {
            // 网关代理模块
            AgentMgr.shared.start();
            // 向Gate服注册
            Signal.shared.ServerRegister();
            console.log('游戏服务器启动完毕，等待命令');
        }
    }
    
    close(callback: any){
        this.saved = 0;
        PlayerMgr.shared.readyToCloseServer();
        setTimeout(() => {
            AgentMgr.shared.close();
            for (const key in this.saveList) {
                let mClass = this.saveList[key];
                mClass.exitSave(() => {
                    this.saved++;
                    if (this.saved == this.saveList.length) {
                        callback();
                    }
                });
            }
        }, 11 * 1000);
    };
}