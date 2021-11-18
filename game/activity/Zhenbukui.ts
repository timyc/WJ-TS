import ActivityBase from "./ActivityBase";
import ActivityDefine from "./ActivityDefine";
import PlayerMgr from "../object/PlayerMgr";
import NpcMgr from "../../game/core/NpcMgr";
import Global from "../../game/core/Global";
import ZhenbukuiMgr from "./ZhenbukuiMgr";
import MapMgr from "../core/MapMgr";

//NPC每日限购
export default class Zhenbukui extends ActivityBase{
    name:string;
    zbkMapName:string;
    in_notice:string;
    out_notice:string;
    zhenbukui_id:number;
    zhenbukui_timer:any;
    rand_timer:any;
    close_timer:any;
    intervalTime:number;
    onZhenbukui:boolean;
    constructor() {
        super();
        this.name = '甄不亏';
        this.zbkMapName = '';
        this.in_notice = `想淘好货吗？ 听说甄不亏出现在`;
        this.out_notice = `做完生意，甄不亏跑了，想买东西就等下次吧`;
        this.activity_id = ActivityDefine.activityKindID.Zhenbukui;
        this.open_type = ActivityDefine.openType.EveryDay;
        this.is_ready_notice = false;
        this.open_type_list = [1100, 2300];

        this.zhenbukui_id = -1;
        this.zhenbukui_timer = 0;
        this.rand_timer = 0;
        this.close_timer = 0;
        this.init();
        this.intervalTime = 30;
        this.onZhenbukui = false;        //当前甄不亏是否出场
    }

    open() {
        super.open();
        this.checkZhenbukui();
        this.rand_timer = setInterval(() => {
            this.randTimerFunc();
        }, 10 * 1000);
    }

    randTimerFunc() {
        if(!this.onZhenbukui){
            if (this.zhenbukui_timer != 0){
                clearTimeout(this.zhenbukui_timer);
                this.zhenbukui_timer = 0;
            }
            this.onZhenbukui = true;
            //甄不亏的出场时间在1-2小时内随机
            var randT = Math.floor(Math.random() * (120 - 60 + 1) + 60);                

            this.zhenbukui_timer = setTimeout(() => {
                this.checkZhenbukui();
            }, randT * 60 * 1000);
        }
    }


    checkZhenbukui() {
        this.clearZhenbukui();
        if(this.activity_state == ActivityDefine.activityState.Close){
            return;
        }
        this.createZhenbukui();
        
        if (this.close_timer != 0){
            clearTimeout(this.close_timer);
            this.close_timer = 0;
        }
        
        //设置关闭计时器
        var rand_close_time = Math.floor(Math.random() * (40 - 10 + 1) + 10); 
        
        this.close_timer = setTimeout(() => {
            this.closeTimerFunc();
        }, rand_close_time * 60 * 1000);
        
        console.log('甄不亏进场.........');
    }

    closeTimerFunc(){
        PlayerMgr.shared.broadcast('s2c_game_chat', {
            scale: 3,
            msg: this.out_notice,
            name: '',
            resid: 0,
            teamid: 0,
        });
        this.clearZhenbukui();
        
        if (this.close_timer != 0){
            clearTimeout(this.close_timer);
            this.close_timer = 0;
        }
        
        this.onZhenbukui = false;
        console.log('甄不亏离场.........');
    }

    gmState(state:any){
        if(state == 1){
            let t1 = this.getActTime();
            let t2 = this.getActTime(60 * 60 * 1000);
            this.open_type_list = [t1, t2];
            this.init()
            this.open();
        }else if(state = 2){
            this.open_type_list = [1100, 2300];
            this.close();
        }
    }


    createZhenbukui() {
        let maps = Global.zhenbukuiMap;
        let r = Global.random(0, maps.length - 1);
        //r = 0;
        let pos = maps[r];
        this.zhenbukui_id = NpcMgr.shared.CreateNpc(60002, pos.mapid, pos.x, pos.y);

        this.zbkMapName = MapMgr.shared.getMapById(pos.mapid).map_name;
        console.log(`甄不亏出现的地点：${pos.mapid}`);
        PlayerMgr.shared.broadcast('s2c_game_chat', {
            scale: 3,
            msg: this.in_notice + this.zbkMapName,
            name: '',
            resid: 0,
            teamid: 0,
        });

    }

    clearZhenbukui() {
        if (this.zhenbukui_id != -1) {
            NpcMgr.shared.DeleteNpc(this.zhenbukui_id);
        }
        ZhenbukuiMgr.shared.clearShopItem();
        this.zhenbukui_id = -1;
    }

    close() {
        super.close();

        this.open_type_list = [1100, 2300];

        if (this.zhenbukui_timer != 0) {
            clearTimeout(this.zhenbukui_timer);
            this.zhenbukui_timer = 0;
        }
        if (this.rand_timer != 0){
            clearInterval(this.rand_timer);
            this.rand_timer = 0;
        }

        if (this.close_timer != 0){
            clearTimeout(this.close_timer);
            this.close_timer = 0;
        }

        PlayerMgr.shared.broadcast('s2c_game_chat', {
            scale: 3,
            msg: '做完生意的甄不亏走了，想买东西就等下次吧',
            name: '',
            resid: 0,
            teamid: 0,
        });

        this.clearZhenbukui();
    }
}