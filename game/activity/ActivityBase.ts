import PlayerMgr from "../../game/object/PlayerMgr";
import Global from "../../game/core/Global";
import ActivityMgr from "./ActivityMgr";
import ActivityDefine from "./ActivityDefine";

export default class ActivityBase{
    activity_id:number;
    name:string;
    open_notice:string;
    open_type:number;
    open_type_list:any[];
    open_time:number;
    close_time:number;
    activity_state:any;
    player_list:any;
    is_ready_notice:boolean;
    ready_open_time:number;
    ready_close_time:number;
    is_gm_open:boolean;

    constructor() {
        this.activity_id = 0;
        this.name = '';
        this.open_notice = `${this.name} 已经开启，请大家踊跃参加！`;
        // 1 每天开放 2 每周周几 3 每月定时 4 固定时段每天开放 5 固定时段全天开放
        this.open_type = 0;
        // 存储根据类型的 时间节点 
        // 1 无 2 存放（1~7） 3 存放日期 4 无
        this.open_type_list = [];

        this.open_time = -1; // 开放的时间 0即 0点0分 900 即上午9点，1545即 15点45分
        this.close_time = -1; // 关闭时间同开服时间
        this.activity_state = ActivityDefine.activityState.Close;

        this.player_list = {}; // onlyid -> player
        this.is_ready_notice = false; //是否准备公告
        this.ready_open_time = 0;
        this.ready_close_time = 0;

        this.is_gm_open = false;
    }

    init() {
        this.open_time = this.open_type_list[0];
        this.close_time = this.open_type_list[1];

        if (this.open_type != 4 && this.open_type != 5) {
            let curdate = new Date(Global.gTime);

            if (this.open_time != -1) {
                let openhour = Math.floor(this.open_time / 100);
                let openminute = Math.floor(this.open_time % 100);
                let date = new Date(curdate.getFullYear(), curdate.getMonth(), curdate.getDate(), openhour, openminute, 0, 0);
                let readyopenm = date.getTime() - 5 * 60 * 1000;
                let readyopend = new Date(readyopenm);
                this.ready_open_time = readyopend.getHours() * 100 + readyopend.getMinutes();
                date = null;
            }
            if (this.close_time != -1) {
                let closehour = Math.floor(this.close_time / 100);
                let closeminute = Math.floor(this.close_time % 100);
                let date = new Date(curdate.getFullYear(), curdate.getMonth(), curdate.getDate(), closehour, closeminute, 0, 0);
                let readyclosem = date.getTime() - 5 * 60 * 1000;
                let readyclosed = new Date(readyclosem);
                this.ready_close_time = readyclosed.getHours() * 100 + readyclosed.getMinutes();
                date = null;
            }
        }
    }

    readyOpen() {
        this.activity_state = ActivityDefine.activityState.ReadyOpen;
        if (this.is_ready_notice) {
            let times = 3;
            let broad = () => {
                times--;
                let brstr = `${this.name} 即将开启，请大家踊跃参加！`;
                PlayerMgr.shared.broadcast('s2c_notice', {
                    strRichText: brstr
                });

                PlayerMgr.shared.broadcast('s2c_game_chat', {
                    scale: 3,
                    msg: brstr,
                    name: '',
                    resid: 0,
                    teamid: 0,
                });
                if(times >= 0){
                    setTimeout(() => {
                        broad();
                    }, 10 * 1000);
                }
            }
            broad();
        }
    }

    open() {
        this.activity_state = ActivityDefine.activityState.Opening;
        if (this.is_ready_notice) {
            let brstr = this.open_notice;
            PlayerMgr.shared.broadcast('s2c_notice', {
                strRichText: brstr
            });

            PlayerMgr.shared.broadcast('s2c_game_chat', {
                scale: 3,
                msg: brstr,
                name: '',
                resid: 0,
                teamid: 0,
            });
            console.log(`活动(${this.name})已经开启！`)
        }
    }

    gmState(state:any){

    }

    readyClose() {
        this.activity_state = ActivityDefine.activityState.ReadyClose;
        if (this.is_ready_notice) {
            let brstr = `${this.name} 即将关闭，大家抓紧时间！`;
            PlayerMgr.shared.broadcast('s2c_notice', {
                strRichText: brstr
            });

            PlayerMgr.shared.broadcast('s2c_game_chat', {
                scale: 3,
                msg: brstr,
                name: '',
                resid: 0,
                teamid: 0,
            });
        }
    }

    close() {
        this.activity_state = ActivityDefine.activityState.Close;
        if (this.is_ready_notice) {
            let brstr = `本次 ${this.name} 已结束，请大家下次继续参加`;
            PlayerMgr.shared.broadcast('s2c_notice', {
                strRichText: brstr
            });
            PlayerMgr.shared.broadcast('s2c_game_chat', {
                scale: 3,
                msg: brstr,
                name: '',
                resid: 0,
                teamid: 0,
            });
        }
        console.log(`活动(${this.name})已经关闭！`)
    }

    onNewDay() {
    }

    onNewHour() {
    }

    checkReadyOpen() {
        if (this.activity_state == ActivityDefine.activityState.ReadyOpen) {
            return;
        }

        let curDate = new Date(Global.gTime);
        if (this.open_type == 2) {
            let weekday = curDate.getDay() + 1;
            if (this.open_type_list.indexOf(weekday) == -1) {
                return;
            }
        }

        if (this.open_type == 3) {
            let monthday = curDate.getDate();
            if (this.open_type_list.indexOf(monthday) == -1) {
                return;
            }
        }

        if (this.open_type == 4 || this.open_type == 5) {
            let curyear = curDate.getHours();
            let curmoth = curDate.getMonth() + 1;
            let curday = curDate.getDate();
            let curtime = curyear * 1000 + curmoth * 100 + curday;

            let activity_begin_time = this.open_type_list[0];
            let activity_end_time = this.open_type_list[1];
            if (curtime < activity_begin_time || curtime > activity_end_time) {
                return;
            }
        }

        let curhour = curDate.getHours();
        let curminute = curDate.getMinutes();
        let curtt = curhour * 100 + curminute;

        if (curtt >= this.ready_open_time && curtt < this.open_time) {
            this.readyOpen();
        }
    }

    // 以 千位数字 获取时间
    getActTime(offest = 0) {
        let curDate = new Date(Global.gTime + offest);
        let curhour = curDate.getHours();
        let curminute = curDate.getMinutes();
        let curtt = curhour * 100 + curminute;
        return curtt;
    }

    checkOpen() {
        if (this.activity_state != ActivityDefine.activityState.ReadyOpen) {
            return;
        }

        let curtime = this.getActTime();
        if (curtime >= this.open_time && curtime < this.close_time) {
            this.open();
        }
    }

    checkReadyClose() {
        if (this.activity_state != ActivityDefine.activityState.Opening) {
            return;
        }

        let curtime = this.getActTime();
        if (curtime > this.ready_close_time && curtime < this.close_time) {
            this.readyClose();
        }
    }

    checkClose() {
        if (this.activity_state == ActivityDefine.activityState.close) {
            return;
        }

        let curtime = this.getActTime();
        if (curtime >= this.close_time) {
            this.close();
        }
    }

    update(dt:number) {
        if (this.open_type == 0) {
            return;
        }
        if (this.open_type == 4 || this.open_type == 5) {
            let curDate = new Date(Global.gTime);

            let curyear = curDate.getFullYear();
            let curmoth = curDate.getMonth() + 1;
            let curday = curDate.getDate();
            let curtime = curyear * 10000 + curmoth * 100 + curday;

            let activity_begin_time = this.open_type_list[0];
            let activity_end_time = this.open_type_list[1];
            if (curtime >= activity_begin_time && curtime <= activity_end_time) {
                if (this.open_type == 5) {
                    this.open();
                }
            } else {
                this.close();
                ActivityMgr.shared.delActivity(this.activity_id);
            }
            return;
        }

        if (this.activity_state == ActivityDefine.activityState.Close) {
            this.checkReadyOpen();
            this.checkOpen();
        } else if (this.activity_state == ActivityDefine.activityState.ReadyOpen) {
            this.checkOpen();
        } else if (this.activity_state == ActivityDefine.activityState.Opening) {
            this.checkReadyClose();
            this.checkClose();
        } else if (this.activity_state == ActivityDefine.activityState.ReadyClose) {
            this.checkClose();
        }
    }
}
