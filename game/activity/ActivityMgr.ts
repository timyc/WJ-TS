import Global from "../../game/core/Global";
import ShuiLuDaHui from "./shuiludahui";
import LingHou from "./linghou";
import Zhenbukui from "./Zhenbukui";

export default class ActivityMgr {
    static shared=new ActivityMgr();
    log_time:any;
    activity_list:any;

    constructor() {
        this.log_time = {}; // curhour curday
        this.activity_list = {}
    }

    init() {
        let nDay = Math.floor((Global.gTime / 1000) / 86400);
        let nHour = Math.floor((Global.gTime / 1000) / 3600);

        this.log_time = {
            curDay: nDay,
            curHour: nHour,
        };

        // let hongbao = require('./hongbao');
        // let ActHongBao = new hongbao();
        // this.addActivity(ActHongBao);

        let ActShuiLu = new ShuiLuDaHui();
        this.addActivity(ActShuiLu);

        let ActLingHou = new LingHou();
        this.addActivity(ActLingHou);

        let ActZhenbukui = new Zhenbukui();
        this.addActivity(ActZhenbukui);
    }

    addActivity(activity:any) {
        this.activity_list[activity.activity_id] = activity;
    }

    delActivity(activityid:any) {
        delete this.activity_list[activityid];
    }

    getActivity(actid:any) {
        return this.activity_list[actid];
    }

    checkActivity(dt?:number) {
        for (const activity_id in this.activity_list) {
            this.activity_list[activity_id].update();
        }
    }

    update(dt:number) {
        if (dt % (10 * 1000) == 0) {
            this.checkActivity(dt);

            let nDay = Math.floor((Global.gTime / 1000) / 86400);
            let nHour = Math.floor((Global.gTime / 1000) / 3600);
            
            
            if (this.log_time.curDay != nDay) {
                for (const activity_id in this.activity_list) {
                    this.activity_list[activity_id].onNewDay();
                }
            }

            if (this.log_time.curHour != nHour) {
                for (const activity_id in this.activity_list) {
                    this.activity_list[activity_id].onNewHour();
                }
            }

            this.log_time.curDay = nDay;
            this.log_time.curHour = nHour;
        }
    }
}