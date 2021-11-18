
import PlayerMgr from "../object/PlayerMgr";
import Global from "../../game/core/Global";

export default class PalaceFight {
    static shared=new PalaceFight();
    pk_list:any;
    constructor () {
        this.pk_list = {};
    }
    
    addToList (data:any) {
        
        delete this.pk_list[data.sponsor.roleid];
        this.pk_list[data.sponsor.roleid] = data;
    }

    getPKInfo (roleid:any) {
        if (this.pk_list[roleid]) {
            return this.pk_list[roleid];
        }
        else {
            for (let key in this.pk_list) {
                if (this.pk_list[key].recipient.roleid == roleid) {
                    return this.pk_list[key];
                }
            }
        }
        return null;
    }

    delPKInfo (roleid:any, from:any) {
        let item = this.getPKInfo(roleid);
        if (!item) { return; }
        if (from == 'sponsor') {
            item.sponsor.state = 2;
            this.pkCancel(item);
        }
        else if(from == 'recipient') {
            item.recipient.state = 2;
            this.pkCancel(item);
        }
    }

    setCanPK (item:any) {
        item.tm = 10*1000;
    }

    update (dt:number) {
        for (let key in this.pk_list) {
            let item = this.pk_list[key];
            item.tm -= dt;
            if (item.tm <= 0) {
                if (item.sponsor.state != 1 || item.recipient.state != 1) {
                    item.sponsor.state = (item.sponsor.state == 1)? 1:2;
                    item.recipient.state = (item.recipient.state == 1)? 1:2;
                    this.pkCancel(item);
                }
                else {
                    this.startBattle(item);
                }
            }
        }
    }

    
    pkCancel (item:any) {
        let sponsor = PlayerMgr.shared.getPlayerByRoleId(item.sponsor.roleid);
        let recipient = PlayerMgr.shared.getPlayerByRoleId(item.recipient.roleid);

        if (item.type == 1) {
            PlayerMgr.shared.broadcast('s2c_palace_fight', item);
            if (item.sponsor.state == 1 && item.recipient.state == 2) {
                PlayerMgr.shared.broadcast('s2c_game_chat', {
                    roleid: recipient.roleid,
                    onlyid: recipient.onlyid,
                    scale: 0,
                    msg: `玩家[${item.recipient.name}]${item.recipient.roleid}放弃了玩家[${item.sponsor.name}]${item.sponsor.roleid}与玩家[${item.recipient.name}]${item.recipient.roleid}的皇城决斗！真是耸！`,
                    name: recipient.name,
                    resid: recipient.resid,
                });
            }
        }

        if (sponsor) {
            if (item.type == 0) {
                sponsor.send('s2c_palace_fight', item);
            }
            if (item.sponsor.state == 2) {
                sponsor.send('s2c_game_chat', {
                    scale: 3,
                    msg: `你取消了与玩家[${item.recipient.name}]${item.recipient.roleid}的皇城决斗!`,
                });
            }
            else {
                sponsor.send('s2c_game_chat', {
                    scale: 3,
                    msg: `玩家[${item.recipient.name}]${item.recipient.roleid}取消了与你的皇城决斗!`,
                });
            }
        }
        if (recipient) {
            if (item.type == 0) {
                recipient.send('s2c_palace_fight', item);
            }
            if (item.sponsor.state == 2) {
                recipient.send('s2c_game_chat', {
                    scale: 3,
                    msg: `玩家[${item.sponsor.name}]${item.sponsor.roleid}取消了与你的皇城决斗!`,
                });
            }
            else {
                recipient.send('s2c_game_chat', {
                    scale: 3,
                    msg: `你取消了与玩家[${item.sponsor.name}]${item.sponsor.roleid}的皇城决斗!`,
                });
            }
        }
        console.log(`${item.sponsor.roleid}与${item.recipient.roleid}的决斗被删除`);
        delete this.pk_list[item.sponsor.roleid];
    }

    pkWin (roleid:any) {
        let item = this.getPKInfo(roleid);
        if (!item) { return; }
        let sponsor:any= PlayerMgr.shared.getPlayerByRoleId(item.sponsor.roleid);
        let recipient:any = PlayerMgr.shared.getPlayerByRoleId(item.recipient.roleid);
        if (roleid == sponsor.roleid) {
            item.win = 1;
            recipient.addExp(-parseInt(String(recipient.maxexp*0.2)));
        }
        else if (roleid == recipient.roleid) {
            item.win = 2;
            sponsor.addExp(-parseInt(String(sponsor.exp*0.2)));
        }
        item.win = (roleid == sponsor.roleid)? 1:2;
        if (item.type == 1) { // 广播全服 
            PlayerMgr.shared.broadcast('s2c_palace_fight', item);
            let str = `玩家[${sponsor.name}]${sponsor.roleid}与玩家[${recipient.name}]${recipient.roleid}的皇城决斗，平局结束！`;
            if (item.win == 1) {
                str = `玩家[${sponsor.name}]${sponsor.roleid}与玩家[${recipient.name}]${recipient.roleid}的皇城决斗，玩家[${sponsor.name}]${sponsor.roleid}胜利！`;
            }
            else if(item.win == 2) {
                str = `玩家[${sponsor.name}]${sponsor.roleid}与玩家[${recipient.name}]${recipient.roleid}的皇城决斗，玩家[${recipient.name}]${recipient.roleid}胜利！`;
            }
            PlayerMgr.shared.broadcast('s2c_game_chat', {
                roleid: sponsor.roleid,
                onlyid: sponsor.onlyid,
                scale: 0,
                msg: str,
                name: sponsor.name,
                resid: sponsor.resid,
            });
        }
        else {
            if (sponsor) {
                sponsor.send('s2c_palace_fight', item);
            }
            if (recipient) {
                recipient.send('s2c_palace_fight', item);
            }
        }
        if (sponsor) {
            let str = `你与玩家[${recipient.name}]${recipient.roleid}的皇城决斗，获得平局！`;
            if (item.win == 1) {
                str = `你与玩家[${recipient.name}]${recipient.roleid}的皇城决斗，获得胜利！`;
            }
            else if (item.win == 2) {
                str = `你与玩家[${recipient.name}]${recipient.roleid}的皇城决斗，获得失败！`;
            }
            sponsor.send('s2c_game_chat', {
                scale: 3,
                msg: str,
            });
        }
        if (recipient) {
            let str = `你与玩家[${sponsor.name}]${sponsor.roleid}的皇城决斗，获得平局！`;
            if (item.win == 1) {
                str = `你与玩家[${sponsor.name}]${sponsor.roleid}的皇城决斗，获得失败！`;
            }
            else if (item.win == 2) {
                str = `你与玩家[${sponsor.name}]${sponsor.roleid}的皇城决斗，获得胜利！`;
            }
            recipient.send('s2c_game_chat', {
                scale: 3,
                msg: str,
            });
        }

        console.log(`${item.sponsor.roleid}与${item.recipient.roleid}的决斗被删除`);
        delete this.pk_list[item.sponsor.roleid];
    }

    getRoleMsg (item:any) {
        return {
            roleid: item.roleid,
            name: item.name,
            level: item.level,
            race: item.race,
            resid: item.resid,
        };
    }

    
    sendPalaceRoleList (roleid:any) {
        let item = this.getPKInfo(roleid);
        if (!item) { return; }
        let player_mgr = require('../object/player_mgr');
        let team_mgr = require('../object/team_mgr');
        let sponsor = PlayerMgr.shared.getPlayerByRoleId(item.sponsor.roleid);
        let recipient = PlayerMgr.shared.getPlayerByRoleId(item.recipient.roleid);
        if (!sponsor || !recipient) { return; }
        let listA = [];
        let listB = [];
        let sponsor_list = team_mgr.getTeamPlayer(sponsor.teamid);
        let recipient_list = team_mgr.getTeamPlayer(recipient.teamid);
        for (let item of sponsor_list) {
            listA.push(this.getRoleMsg(item));
        }
        if (listA.length == 0) {
            listA.push(this.getRoleMsg(sponsor));
        }

        for (let item of recipient_list) {
            listB.push(this.getRoleMsg(item));
        }
        if (listB.length == 0) {
            listB.push(this.getRoleMsg(recipient));
        }
        let senddata = {
            sponsorlist: listA,
            recipientlist: listB,
        };
        sponsor.send('s2c_palace_rolelist', senddata);
        recipient.send('s2c_palace_rolelist', senddata);
    }

    startBattle (item:any) {
        let player_mgr = require('../object/player_mgr');
        let sponsor = PlayerMgr.shared.getPlayerByRoleId(item.sponsor.roleid);
        let recipient = PlayerMgr.shared.getPlayerByRoleId(item.recipient.roleid);
        if (sponsor && recipient) {
            sponsor.playerBattle(recipient.onlyid, Global.battleType.PALACE);
        }
    }
}
