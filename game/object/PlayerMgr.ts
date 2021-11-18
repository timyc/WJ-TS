import Global from "../../game/core/Global";
import Player from "./Player";

export default class PlayerMgr {
    static shared=new PlayerMgr();
    propRoleData:any;
    player_num:number;
    player_num_peak:number;
    player_only_list:any;
    player_role_list:any;
    player_list: {[key:number]:Player};
    player_offline_list:any;
    constructor() {
        this.propRoleData = null;
        this.player_num = 0;
        this.player_num_peak = 0;

        this.player_only_list = {};
        this.player_role_list = {};
        this.player_list = {};

        this.player_offline_list = {};
    }

    init() {
        let propRoleData = Global.require_ex('../prop_data/prop_role_data');
        if (propRoleData) {
            this.propRoleData = {};
            for (const id in propRoleData) {
                if (propRoleData.hasOwnProperty(id)) {
                    const data = propRoleData[id];
                    if (this.propRoleData[data.race] == null) {
                        this.propRoleData[data.race] = {};
                    }
                    if (this.propRoleData[data.race][data.relive] == null) {
                        this.propRoleData[data.race][data.relive] = {};
                    }
                    this.propRoleData[data.race][data.relive][data.level] = data;
                }
            }
        } else {
            console.log('prop_role_data 角色属性表加载失败');
        }
    }

    update(dt:number) {
        for (let key in this.player_list) {
            if (this.player_list.hasOwnProperty(key)) {
                let p = this.player_list[key];
                p.update(dt);
            }
        }
    }

    addPlayer(player:any){
        this.player_list[player.accountid] = player;
        this.player_only_list[player.onlyid] = player.accountid;
        this.player_role_list[player.roleid] = player.accountid;
        this.updatePlayerNum();
    }

    getPlayerByOnlyId(onlyid:any):any{
        return this.getPlayer(this.player_only_list[onlyid]);
    }

    getPlayerByRoleId(roleid:any):any{
        return this.getPlayer(this.player_role_list[roleid]);
    }

    getLikePlayer(info:any):any{
        let list = [];
        for (const accountid in this.player_list) {
            const p = this.player_list[accountid];
            if (p.roleid == info || p.name.indexOf(info) != -1) {
                list.push(p);
            }
        }
        return list;
    }

    isOnline(accountid:any) {
        if (this.getPlayer(accountid)) return 1;
        return 0;
    }

    getPlayer(accountid:number):Player{
        return this.player_list[accountid];
    }

    delPlayer(accountid:number) {
        if (this.player_list[accountid]) {
            let p = this.player_list[accountid];
            delete this.player_only_list[p.onlyid];
            delete this.player_role_list[p.roleid];
            delete this.player_list[accountid];
            this.updatePlayerNum();
        }
    }

    updatePlayerNum() {
        let n = 0;
        for (const accountid in this.player_list) {
            if (this.player_list.hasOwnProperty(accountid)) {
                n++;
            }
        }
        this.player_num = n;
        if (n > this.player_num_peak) {
            this.player_num_peak = n;
        }
    }

    getPlayerNum():any{
        return this.player_num;
    }

    getPlayerNumPeak():any{
        return this.player_num_peak;
    }

    getPropRoleData(race:any, relive:any, level:any) {
        if (race == null || relive == null || level == null) {
            return null;
        }
        if (this.propRoleData[race] && this.propRoleData[race][relive] && this.propRoleData[race][relive][level]) {
            return this.propRoleData[race][relive][level];
        }
        return null;
    }

    sendToPlayer(onlyid:any, event:any, obj:any) {
        let accountid = this.player_only_list[onlyid];
        let player = this.player_list[accountid];
        if (player) {
            player.send(event, obj);
        }
    }

    readyToCloseServer() {
        let t = 10;
        let t_timer = setInterval(() => {
            this.broadcast('s2c_game_chat', {
                onlyid: 0,
                roleid: 0,
                scale: 3,
                msg: `请注意：服务器在 ${t}秒 后关闭`,
                name: '',
                resid: 0,
                teamid: 0,
            });
            t--;
            if (t <= 0) {
                clearInterval(t_timer);
            }
        }, 1000);
    }

    broadcast(event:any, obj?:any) {
        for (const accountid in this.player_list) {
            if (this.player_list.hasOwnProperty(accountid)) {
                const player = this.player_list[accountid];
                player.send(event, obj);
            }
        }
    }

    exitSave(callback:any) {
        this.saveAllPlayer(callback);
    }

    saveAllPlayer(callback:any) {
        // let n = self.player_num;
        let n = Object.keys(this.player_list).length;
        if (n == 0) {
            if (callback) callback();
            return;
        }
        for (const accountid in this.player_list) {
            n--;
            if (this.player_list.hasOwnProperty(accountid)) {
                let player = this.player_list[accountid];
                if (player && !player.offline) {
                    let scallback = null;
                    if (n == 0) {
                        scallback = () => {
                            console.log('已保存所有玩家数据！');
                            if (callback) callback();
                        }
                    }
                    player.save(scallback);
                }
            }
        }
    }

    OnNewDay() {
        for (let it in this.player_list) {
            this.player_list[it].OnNewDay();
        }
    }

    OnNewHour() {
        for (let accountid in this.player_list) {
            this.player_list[accountid].OnNewHour();
        }
    }

    clearRobot(){
        for (let accountid in this.player_list) {
            if (this.player_list.hasOwnProperty(accountid)) {
                let pinfo = this.player_list[accountid];
                if(Number(accountid)>= 90000000){
                    pinfo.destroy();
                    this.delPlayer(Number(accountid));
                }
            }
        }
    }

    clearPlayerCache(roleid:any) {
        let accountid = this.player_role_list[roleid];
        if (accountid != null) {
            let pPlayer = this.getPlayer(accountid);
            if (pPlayer) {
                if (pPlayer.agent) {
                    pPlayer.agent.destroy();
                }
            }
            this.delPlayer(accountid);
        }
    }
    //踢下线
    kickedOutPlayer(roleids:any) {
        for (const roleid of roleids) {
            if(roleid == 0){
                break;
            }
            let pPlayer = this.getPlayerByRoleId(roleid);
            if (pPlayer) {
                pPlayer.destroy();
            }
        }
    }
}
