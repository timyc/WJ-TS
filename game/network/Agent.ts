

import AgentBase from "./AgentBase";
import AgentMgr from "./AgentMgr";
import GMMgr from "../core/GMMgr";
import Signal from "../core/Signal";
import Global from "../core/Global";
import Player from "../object/Player";
import MapMgr from "../core/MapMgr";
import PlayerMgr from "../object/PlayerMgr";
import ChargeSum from "../core/ChargeSum";
import BangMgr from "../bang/BangMgr";
import World from "../object/World";
import PaiHangMgr from "../core/PaiHangMgr";
import Shop from "../object/Shop";
import GoodsMgr from "../item/GoodsMgr";
import ShopItem from "../object/ShopItem";
import MallMgr from "../core/MallMgr";
import ZhenbukuiMgr from "../activity/ZhenbukuiMgr";
import DB from "../../utils/DB";
import ComposMgr from "../object/ComposMgr";
import BattleMgr from "../battle/BattleMgr";
import ActivityMgr from "../activity/ActivityMgr";
import ActivityDefine from "../activity/ActivityDefine";
import RelationMgr from "../object/RelationMgr";
import TeamMgr from "../core/TeamMgr";
import NpcMgr from "../core/NpcMgr";
import TaskConfigMgr from "../task/TaskConfigMgr";
import NpcConfigMgr from "../core/NpcConfigMgr";
import LotteryMgr from "../core/LotteryMgr";
import EquipMgr from "../object/EquipMgr";

export default class Agent extends AgentBase 
{
    accountid:number;
    token:string;
    loginstep:number;
    
    constructor(socket:any) {
        super(socket);
        this.accountid = -1; // agent 绑定的玩家id
        this.token = ""; // agent 登录token
        this.loginstep = 0;
    }

    disconnect(data?:any) {
        // this.destroy();
        if (!this.connection) {
            return;
        }
        this.connection = false;
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            player.playerOffline();
        }
    }

    destroy() {
        super.destroy();
        this.disconnect();
        AgentMgr.shared.delAgent(this.id);
    }

    justDestroyAgent() {
        super.destroy();
        this.connection = false;
        AgentMgr.shared.delAgent(this.id);
    }

    close() {
        super.close();
        this.destroy();
    }

    error() {
        super.error();
        this.destroy();
    }

    gm_command(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        GMMgr.shared.exec(player, data.commands);
    }

    c2s_login(data:any) {
        let accountid = data.accountid;
        let roleid = data.roleid;
        let token = Signal.shared.getLoginToken(accountid);
        if (token != data.token) {
            // 登录失败，需重新登录
            this.close();
            return;
        }
        let oagent = AgentMgr.shared.getAgentByAccountid(accountid);
        if (oagent) {
            oagent.close();
        }
        this.accountid = accountid;
        // 处理掉线玩家
        let pPlayer = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (pPlayer) {
            if (pPlayer.offline == true) {
                pPlayer.setAgent(this);
                pPlayer.playerLogined();
                return;
            }
            // 他人登录
            pPlayer.send('s2c_otherlogin');
            pPlayer.agent.justDestroyAgent();
            pPlayer.setAgent(this);
            pPlayer.playerLogined();
            return;
        }
        let self = this;
        let playerLogin = () => {
            DB.loginByRoleid(roleid, (errorcode:any, dbdata:any) => {
                let selfagent = AgentMgr.shared.getAgent(this.id);
                if (selfagent == null) {
                    return;
                }
                if (errorcode == Global.msgCode.SUCCESS) {
                    let dologin = () => {
                        let pPlayer = new Player();
                        pPlayer.setAgent(self);
                        pPlayer.setDBdata(dbdata);
                        if (pPlayer.x == -1 || pPlayer.y == -1) {
                            pPlayer.x = MapMgr.shared.getMap(pPlayer).map_data.startPos.x;
                            pPlayer.y = MapMgr.shared.getMap(pPlayer).map_data.startPos.y;
                        }
                        pPlayer.playerLogined();
                    };

                    let preP = PlayerMgr.shared.getPlayer(accountid);
                    if (preP != null) {
                        preP.destroy(dologin);
                    } else {
                        dologin();
                    }
                } else {
                    this.close();
                }
            });
        };
        try {
			console.log('玩家登录...');
            setTimeout(playerLogin, 3000);
            //playerLogin();
        } catch (error) {
            console.error('Agent Login Error Catch!');
            console.error(error.stack);
            this.close();
        }
    }

    c2s_relogin(data:any) {
        let accountid = data.accountid;
        let otheragent = AgentMgr.shared.getAgentByAccountid(accountid);
        if (otheragent) {
            otheragent.close();
        }
        this.accountid = accountid;
        // 处理掉线玩家
        let pPlayer = PlayerMgr.shared.getPlayer(data.accountid);
        if (pPlayer) {
            if (pPlayer.offline == true) {
                pPlayer.setAgent(this);
                pPlayer.playerRelogin();
                return;
            }
            pPlayer.agent.justDestroyAgent();
            pPlayer.setAgent(this);
            pPlayer.playerRelogin();
            return;
        }
    }

    c2s_enter_game(data:any) {
        let player = PlayerMgr.shared.getPlayer(data.accountid);
        if (player) {
            player.onEnterGame();
        }
    }

    c2s_change_map(data:any) {
        let player = PlayerMgr.shared.getPlayer(data.accountid);
        if (player) {
            player.changeMap(data);
        }
    }

    c2s_create_team(data:any) {
        let player = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (player) {
            TeamMgr.shared.creatTeam(player, data);
        }
    }

    c2s_match_team(data:any) {
        let player = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (player) {
            TeamMgr.shared.matchTeam(player);
        }
    }
    c2s_requst_team(data:any) {
        let player = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (player) {
            if (player.inPrison) {
                player.send('s2c_notice', {
                    strRichText: '老实点，天王老子都不会收留你。'
                });
            }
            TeamMgr.shared.requestTeam(player, data.teamid);
        }
    }

    c2s_leave_team(data:any) {
        let player = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (player) {
            TeamMgr.shared.leaveTeam(player);
        }
    }

    c2s_transfer_team(data:any) {
        let toplayer = PlayerMgr.shared.getPlayer(this.accountid);
        let Player = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (Player && toplayer) {
            TeamMgr.shared.changeTeamLeader(Player, toplayer, Player.teamid);
        }
    }

    c2s_transfer_team_requst(data:any) {
        let toplayer = PlayerMgr.shared.getPlayerByRoleId(data.toid);
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (toplayer.teamid != player.teamid) {
            return;
        }
        if (toplayer.isleader) {
            return;
        }
        if (toplayer) {
            toplayer.send('s2c_transfer_team_requst', {
                roleid: player.roleid,
            });
        }
    }

    c2s_team_list(data:any) {
        let player = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (player) {
            TeamMgr.shared.getTeamList(player, data.type);
        }
    }

    c2s_team_requeslist(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player && player.isleader) {
            TeamMgr.shared.getRequestList(player, player.teamid);
        }
    }

    c2s_operteam(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        let dealp = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (player && dealp && player.teamid == data.teamid && player.isleader) {
            TeamMgr.shared.dealRequest(dealp, data);
            TeamMgr.shared.getRequestList(player, data.teamid);
        }
    }

    c2s_aoi_move(data:any) {
        let player = PlayerMgr.shared.getPlayer(data.accountid);
        if (player) {
            player.playerMove(data);
        }
    }
    c2s_aoi_stop(data:any) {
        let player = PlayerMgr.shared.getPlayer(data.accountid);
        if (player) {
            player.playerStop(data);
        }
    }

    c2s_player_upskill(data:any) {
        let player = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (player) {
            player.updateSkill(data);
        }
    }

    c2s_player_addpoint(data:any) {
        let player = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (player) {
            player.addCustomPoint(data);
        }
    }

    c2s_xiulian_point(data:any) {
        let player = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (player) {
            player.addXiulianPoint(data);
        }
    }

    c2s_xiulian_upgrade(data:any) {
        let player = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (player) {
            player.xiulianUpgrade(data);
        }
    }

    c2s_game_chat(data:any) {
        if (data.scale == 2) {
            // TODO：帮派扩展前 屏蔽帮派聊天
            return;
        }
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player == null) {
            return;
        }

        if (player.gmlevel <= 0) {
            if (player.GetFlag(Global.EPlayerFlag.EBanSpeak) == 1) {
                player.send('s2c_notice', {
                    strRichText: '你处于禁言状态'
                });
                return;
            }

            let t = Date.now();
            if (t - player.lastWorldChatTime < 10 * 1000) {
                player.send('s2c_notice', {
                    strRichText: '聊天间隔不足10秒'
                });
                return;
            }
            let chargecount = ChargeSum.shared.getPlayerChargeSum(player.roleid);
            if (player.level < Global.limitWorldChatLevel && chargecount < Global.limitWorldChatChargeCount) {
                player.send('s2c_notice', {
                    strRichText: '聊天需要' + Global.limitWorldChatLevel + '级'
                });
                return;
            }
            player.lastWorldChatTime = t;
        }

        let msg = data.msg;
        for (let i = 0; i < Global.limitWordList.length; i++) {
            const fword = Global.limitWordList[i];
            if (msg.indexOf(fword) != -1) {
                msg = msg.replace(new RegExp(fword, 'g'), '*');
            }
        }

        let canBroadcast = Global.checkLimitWord(msg);

        // // 两条信息相同 不广播
        // if (player.lastWorldChatStr == msg) {
        //     canBroadcast = false;
        // }

        if (!canBroadcast) {
            player.send('s2c_game_chat', data);
            return;
        }

        data.msg = msg;
        data.teamid = player.teamid;
        data.name = player.name;
        data.resid = player.resid;
        data.roleid = player.roleid;
        data.onlyid = player.onlyid;
        data.voice = new Uint8Array(data.voice);

        if (data.scale == 2) {
            if (player.bangid != null && player.bangid != 0) {
                let bang = BangMgr.shared.getBang(player.bangid);
                if (bang) {
                    bang.broadcast('s2c_game_chat', data);
                } else {
                    player.send('s2c_notice', {
                        strRichText: '请先加入帮派'
                    });
                }
            }
        } else if (data.scale == 1) {
            if (player.teamid == 0) {
                player.send('s2c_notice', {
                    strRichText: '请先加入队伍'
                });
                return;
            }
            let roleList = TeamMgr.shared.getTeamPlayer(player.teamid);
            for (const p of roleList) {
                p.send('s2c_game_chat', data);
            }
        } else {
            let rcost = player.CostFee(0, 3000, '世界聊天');
            if (rcost != '') {
                player.send('s2c_notice', {
                    strRichText: rcost + '，发送失败'
                });
                return;
            }
            // player.lastWorldChatStr = msg;
            PlayerMgr.shared.broadcast('s2c_game_chat', data);
        }
    }

    c2s_get_friends(data?:any) {
        let friendlist = [];
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            let list = player.friendList;
            for (const pid in list) {
                if (list.hasOwnProperty(pid)) {
                    const pitem = list[pid];
                    let friend = {
                        roleid: pid, //  info.roleid,
                        name: pitem.name, //  info.name,
                        resid: pitem.resid, //  info.resid,
                        relive: 0, //  info.relive,
                        level: -1, //  info.level,
                        race: 0, //  info.race,
                        sex: 0, //  info.sex,
                        state: 1,
                    };
                    let target = PlayerMgr.shared.getPlayerByRoleId(pid);
                    if (target) {
                        friend.name = target.name;
                        friend.level = target.level;
                        friend.relive = target.relive;
                        friend.race = target.race;
                        friend.sex = target.sex;
                        player.updateFriend(friend);
                    }
                    friendlist.push(friend);
                }
            }
            let alist = player.applyFriendList;
            for (const pid in alist) {
                if (alist.hasOwnProperty(pid)) {
                    const pitem = alist[pid];
                    pitem.state = 0;
                    friendlist.push(pitem)
                }
            }
        }

        this.send('s2c_friends_info', {
            list: friendlist,
        });
    }

    c2s_update_friends(data:any) {
        //operation 0：删除 1：同意 2：拒绝 3：全部同意 4：全部拒绝
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player == null) {
            return;
        }
        if (data.operation == 0) {
            delete player.applyFriendList[data.roleid];
            delete player.friendList[data.roleid];
            let target = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
            if (target) {
                delete target.applyFriendList[player.roleid];
                delete target.friendList[player.roleid];
            }
        }
        if (data.operation == 1 || data.operation == 2) {
            if (data.operation == 1) {
                if (player.getFriendNum() > 50) {
                    this.send('s2c_notice', {
                        strRichText: '好友数已达上线，无法添加'
                    });
                    return;
                }
                let info = player.applyFriendList[data.roleid];
                let target = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
                if (target) {
                    // console.log(14.248 * Math.pow(9000, 0.7) + 285  )
                    player.friendList[info.roleid] = {
                        roleid: info.roleid, //  info.roleid,
                        name: info.name, //  info.name,
                        resid: info.resid, //  info.resid,
                    };
                    target.friendList[player.roleid] = {
                        roleid: player.roleid, //  info.roleid,
                        name: player.name, //  info.name,
                        resid: player.resid, //  info.resid,
                    };
                }
            }
            delete player.applyFriendList[data.roleid];
        }
        if (data.operation == 3) {
            let applynum = 0;
            for (const pid in player.applyFriendList) {
                if (player.applyFriendList.hasOwnProperty(pid)) {
                    // const element = player.applyFriendList[pid];
                    applynum++;
                }
            }
            if (player.getFriendNum() + applynum >= 50) {
                this.send('s2c_notice', {
                    strRichText: '申请人数超过上限，无法全部通过'
                });
                return;
            }
            for (const pid in player.applyFriendList) {
                if (player.applyFriendList.hasOwnProperty(pid)) {
                    let target = PlayerMgr.shared.getPlayerByRoleId(pid);
                    if (target) {
                        player.friendList[target.roleid] = {
                            roleid: target.roleid, //  info.roleid,
                            name: target.name, //  info.name,
                            resid: target.resid, //  info.resid,
                        };
                        target.friendList[player.roleid] = {
                            roleid: player.roleid, //  info.roleid,
                            name: player.name, //  info.name,
                            resid: player.resid, //  info.resid,
                        };
                    }
                }
            }
            player.applyFriendList = {};
        }
        if (data.operation == 4) {
            player.applyFriendList = {};
        }
        this.c2s_get_friends();
    }

    c2s_search_friends(data:any) {
        if (data.data == null || data.data == '') {
            return;
        }

        let list = PlayerMgr.shared.getLikePlayer(data.data);
        let rlist = [];
        while (list.length > 6) {
            let r = Global.random(0, list.length - 1);
            list.splice(r, 1);
        }

        for (const player of list) {
            rlist.push({
                roleid: player.roleid,
                name: player.name,
                resid: player.resid,
                level: player.level,
                relive: player.relive,
                race: player.race,
                sex: player.sex,
            });
        }
        this.send('s2c_search_friends', {
            list: rlist,
        })
    }

    c2s_add_friend(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            if (player.getFriendNum() >= 50) {
                this.send('s2c_notice', {
                    strRichText: '好友数已达上限，无法添加好友'
                });
                return;
            }
        }
        let target = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (target) {
            if (target.getFriendNum() >= 50) {
                this.send('s2c_notice', {
                    strRichText: '申请失败，对方好友数已达上限'
                });
                return;
            }
            if (target.friendList[data.roleid] != null) {
                this.send('s2c_notice', {
                    strRichText: '申请失败，已经是好友或已申请'
                });
                return;
            }
            if (target.applyFriendList[data.roleid] != null) {
                this.send('s2c_notice', {
                    strRichText: '申请失败，已经是好友或已申请'
                });
                return;
            }
        }
        if (player && target) {
            target.applyFriendList[player.roleid] = {
                roleid: player.roleid,
                name: player.name,
                resid: player.resid,
                level: player.level,
                relive: player.relive,
                race: player.race,
                sex: player.race,
            }
            this.send('s2c_notice', {
                strRichText: '已申请，等待对方同意'
            });
            target.send('s2c_friend_apply');
        } else {
            this.send('s2c_notice', {
                strRichText: '对方不在线'
            });
        }
    }

    c2s_friend_chat(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player == null) {
            return;
        }

        if (player.GetFlag(Global.EPlayerFlag.EBanSpeak) == 1) {
            player.send('s2c_notice', {
                strRichText: '你处于禁言状态'
            });
            return;
        }

        let msg = data.msg;
        for (let i = 0; i < Global.limitWordList.length; i++) {
            const fword = Global.limitWordList[i];
            if (msg.indexOf(fword) != -1) {
                msg = msg.replace(new RegExp(fword, 'g'), '*');
            }
        }

        let canBroadcast = true;
        let numcount = 0;
        for (let k = 0; k < msg.length; k++) {
            const msgchar = msg[k];
            if (Global.numchar.indexOf(msgchar) != -1) {
                numcount++
                if (numcount >= 7) {
                    canBroadcast = false;
                    break;
                }
            }
        }

        for (let i = 0; i < Global.limitBroadcastList.length; i++) {
            const fword = Global.limitBroadcastList[i];
            if (msg.indexOf(fword) != -1) {
                canBroadcast = false;
                break;
            }
        }

        if (canBroadcast) {
            let friend = PlayerMgr.shared.getPlayerByRoleId(data.toid);
            if (friend) {
                friend.send('s2c_friend_chat', data);
            }
        }
    }

    QueryPartner(nRoleID:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        let mapPartner = pPlayer.stPartnerMgr.mapPartner;

        let vecJson = [];

        for (var it in mapPartner) {
            let strJson = Global.getPartnerJson(mapPartner[it]);
            vecJson.push({
                strJson: strJson
            });
        }
        this.send('s2c_partner_list', {
            vecPartner: vecJson,
            strJsonPos: JSON.stringify(pPlayer.stPartnerMgr.vecChuZhan)
        });
    }

    PartnerRelive(data:any) {
        if (data == null || data.nPartnerID == null)
            return;

        let nPartnerID = data.nPartnerID;

        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        let pPartner = pPlayer.stPartnerMgr.GetPartner(nPartnerID);
        if (null == pPartner)
            return;

        let strErr = pPartner.DoRelive();
        pPlayer.send('s2c_npc_notice', {
            nNpcConfigID: 10094,
            strRichText: strErr == '' ? '伙伴转生成功' : strErr
        });

        pPlayer.stPartnerMgr.SendPartnerInfoToClient(nPartnerID);

    }

    ChangePartnerState(data:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        pPlayer.stPartnerMgr.ChangeChuZhanPos(data.nPos, data.nPartnerID);
        if (pPlayer.teamid > 0 && pPlayer.isleader) {
            TeamMgr.shared.changePartner(pPlayer.teamid, pPlayer);
        }

        pPlayer.syncSchemePartner();
    }

    PartnerExchangeExp(data:any) {
        let pPlayer = PlayerMgr.shared.getPlayerByRoleId(data.nRoleID);
        if (null == pPlayer)
            return;


        if (data.nCostWhat == 0) {
            return;
        }


        if (data.nCostWhat == 1) {

            let strErr = pPlayer.CostFee(0, 3000000, '传功');
            if (strErr != '') {
                pPlayer.send('s2c_notice', {
                    strRichText: strErr
                });
                return;
            }
        }

        let pPartnerA = pPlayer.stPartnerMgr.GetPartner(data.nPartnerA);
        let pPartnerB = pPlayer.stPartnerMgr.GetPartner(data.nPartnerB);
        if (null == pPartnerA || null == pPartnerB)
            return;

        for (let key of ['relive', 'level', 'exp']) {
            let nTmp = pPartnerA[key];
            pPartnerA[key] = pPartnerB[key];
            pPartnerB[key] = nTmp;
        }

        this.QueryPartner(data.nRoleID);
        this.send('s2c_partner_exchange_exp_ok', {
            nPartnerA: data.nPartnerA,
            nAExp: pPartnerA.exp,
            nPartnerB: data.nPartnerB,
            nBExp: pPartnerB.exp
        });
    }


    QueryOther(nRoleID:any) {
        let sql = `select roleid,resid,level,relive,name from qy_role where roleid = ${nRoleID}`;
        DB.query(sql, (ret:any, rows:any) => {
            let stData = null;

            for (let i = 0; i < rows.length; i++) {
                stData = {
                    nRoleID: rows[i].roleid,
                    nResID: rows[i].resid,
                    nLevel: rows[i].level,
                    nRelive: rows[i].relive,
                    strName: rows[i].name,
                    strBangName: '',
                };

                break;
            }
            this.send('c2s_other_info', stData);
        });
    }

    QueryRoleTask() {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        pPlayer.GetTaskMgr().UpdateTaskStateToClient();
    }

    PlayerChallengeNpc(nOnlyID:any, nConfigID:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        let pNpc = NpcMgr.shared.FindNpc(nOnlyID);
        if (null == pNpc)
            return;

        if (World.shared.pStarMgr.IsStar(nOnlyID)) {
            let strErr = World.shared.pStarMgr.ApplyChallenge(nOnlyID, pPlayer.accountid, pPlayer.getWorldStar());
            if (strErr == 0) {
                pPlayer.send('s2c_npc_notice', {
                    nNpcConfigID: pNpc.configid,
                    strRichText: '报名成功，请等待'
                });
                pPlayer.send('s2c_star_waiting', {});
            } else {
                let str = '你来晚了，下次早点来哦';
                if (strErr == 3) {
                    str = '请先击杀低级地煞星！';
                }
                pPlayer.send('s2c_npc_notice', {
                    nNpcConfigID: pNpc.configid,
                    strRichText: str
                });
            }
        } else {
            this.TrigleNpcBomb(nConfigID, nOnlyID);
        }
    }

    PlayerEnterBattle(nGroupID:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        let battle = pPlayer.monsterBattle(nGroupID);
    }

    TrigleNpcBomb(nNpcConfigID:any, nNpcOnlyID:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        if (pPlayer.teamid > 0 && pPlayer.isleader == false)
            return;

        let stConfig = NpcConfigMgr.shared.GetConfig(nNpcConfigID);
        let battle = pPlayer.monsterBattle(stConfig.monster_group);
        if (battle != null)
            battle.source = nNpcOnlyID;
    }

    StartGropTask(nNpcOnlyID:any, nTaskGrop:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        let pNpc = NpcMgr.shared.FindNpc(nNpcOnlyID);
        if (null == pNpc)
            return;

        let strErr = pPlayer.GetTaskMgr().StartGroupTask(nTaskGrop);
        if (strErr != '') {
            pPlayer.send('s2c_npc_notice', {
                nNpcConfigID: pNpc.configid,
                strRichText: strErr
            });
        }
    }


    c2s_player_shutup(nTargetRoleID:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        GMMgr.shared.LetPlayerShutUp(pPlayer, nTargetRoleID);
    }

    c2s_player_speak(nTargetRoleID:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        GMMgr.shared.letPlayerSpeak(pPlayer, nTargetRoleID);
    }

    KickOffPlayer(nTargetRoleID:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;
        GMMgr.shared.FreezePlayer(pPlayer, nTargetRoleID);
    }

    FreezePlayerIP(nTargetRoleID:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;
        GMMgr.shared.FreezePlayerIP(pPlayer, nTargetRoleID);
    }

    FreezePlayerMAC(nTargetRoleID:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;
        GMMgr.shared.FreezePlayerMAC(pPlayer, nTargetRoleID);
    }

    TaskReset() {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        if (0) {
            pPlayer.InitTaskMgr('{}');
            pPlayer.GetTaskMgr().UpdateTaskStateToClient();
        }
    }

    AbortTask(data:any) {
        if (null == data || data.nTaskID == null)
            return;

        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (pPlayer == null)
            return;

        let pTaskInfo = TaskConfigMgr.shared.GetTaskInfo(data.nTaskID);
        if (null == pTaskInfo)
            return;

        if (TaskConfigMgr.shared.IsTeamTask(data.nTaskID)) {
            if (pPlayer.isleader == false)
                return;

            let vecMember = TeamMgr.shared.getTeamPlayer(pPlayer.teamid);

            for (var it in vecMember) {
                let pMember = vecMember[it];
                if (null == pMember)
                    continue;

                pMember.GetTaskMgr().AbortTask(data.nTaskID);
            }
        } else {
            pPlayer.GetTaskMgr().AbortTask(data.nTaskID);
        }

    }

    InceptFuBenTask(nNpcOnlyID:any, nTaskID:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        let strErr = pPlayer.GetTaskMgr().CheckAndInceptFuBenTask(nTaskID);
        if (strErr != '' && strErr != 'syserr') {
            if (nNpcOnlyID > 0) {
                let pNpc = NpcMgr.shared.FindNpc(nNpcOnlyID);
                if (null == pNpc) {
                    return;
                }
                pPlayer.send('s2c_npc_notice', {
                    nNpcConfigID: pNpc.configid,
                    strRichText: strErr
                });
            } else {
                pPlayer.send('s2c_notice', {
                    strRichText: strErr
                });
            }
        }
    }

    OnTaskTalkNpc(nTaskID:any, nStep:any, nNpcConfigID:any, nNpcOnlyID:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        if (pPlayer.teamid > 0 && pPlayer.isleader == false)
            return;

        let stStepConfig = TaskConfigMgr.shared.GetTaskStepInfo(nTaskID, nStep);
        if (null == stStepConfig)
            return;

        if (null == pPlayer.stTaskMgr)
            return;

        let stStepState = pPlayer.GetTaskMgr().GetTaskStepState(nTaskID, nStep);
        if (null == stStepConfig || null == stStepState)
            return;


        if (stStepConfig.nEventType == Global.EEventType.PlayerTalkNpc) {
            pPlayer.GetTaskMgr().OnGameEvent(Global.EEventType.PlayerTalkNpc, {
                nTaskID: nTaskID,
                nStep: nStep
            });
            NpcMgr.shared.CheckAndDeleteNpc(nNpcOnlyID, pPlayer);
        }

        if (stStepConfig.nEventType == Global.EEventType.PlayerKillNpc) { //zzzErr
            let nGroupID = 0;
            for (let it in stStepState.vecRemainNpc) {
                if (stStepState.vecRemainNpc[it].nOnlyID != nNpcOnlyID)
                    continue;

                let pNpcConfig = NpcConfigMgr.shared.GetConfig(nNpcConfigID);
                if (null == pNpcConfig)
                    continue;

                nGroupID = pNpcConfig.shared.monster_group;

                let battle = pPlayer.monsterBattle(nGroupID);
                if (battle != null)
                    battle.source = nNpcOnlyID;

                break;
            }

        }

        if (stStepConfig.nEventType == Global.EEventType.PlayerGiveNpcItem) {

            if (pPlayer.getBagItemNum(stStepConfig.nItemID) < stStepConfig.nNum)
                return;

            pPlayer.AddItem(stStepConfig.nItemID, -stStepConfig.nNum, true, '任务上交');
            pPlayer.GetTaskMgr().OnGameEvent(Global.EEventType.PlayerGiveNpcItem, 0);
        }
    }

    OnRoleActNpc(nOnlyID:any, nNpcConfigID:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        pPlayer.GetTaskMgr().OnGameEvent(Global.EEventType.PlayerGatherNpc, nOnlyID);
        NpcMgr.shared.CheckAndDeleteNpc(nOnlyID, pPlayer);
    }

    OnRoleAction(stData:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        pPlayer.GetTaskMgr().OnGameEvent(Global.EEventType.PlayerDoAction, stData);
    }

    QueryPaiHang(nByWhat:any) {
        let vecData = null;
        switch (nByWhat) {
            case 0:
                {
                    vecData = PaiHangMgr.shared.getLevelRank();
                }
                break;
            case 1:
                {
                    vecData = PaiHangMgr.shared.getMoneyRank();
                }
                break;
            case 2:
                {
                    vecData = PaiHangMgr.shared.getBangRank();
                }
                break;
            case 3:
                {
                    vecData = PaiHangMgr.shared.getShuiluRank();
                }
                break;
        }
        if (vecData != null) {
            this.send('s2c_paihang', {
                rankKind: nByWhat,
                vecRow: JSON.stringify(vecData)
            });
        }
    }

    QueryItemGoods(data:any) {
        let vecGoods = [];

        for (let it in Shop.shared.mapItem) {
            let stItem = Shop.shared.mapItem[it];

            if (stItem.nKind != data.nKind)
                continue;

            if (data.nConfigID > 0 && stItem.nConfigID != data.nConfigID)
                continue;

            if (stItem.nCnt <= 0)
                continue;

            let stGoods = {
                nID: stItem.nID,
                nConfigID: stItem.nConfigID,
                nPrice: stItem.nPrice,
                nCnt: stItem.nCnt,
                nTime: stItem.nAddTime
            };

            vecGoods.push(stGoods);
        }

        this.send('s2c_goods', {
            vecGoods: vecGoods
        })
    }

    QueryEquipGoods(data:any) {

        let vecGoods = [];

        for (let it in Shop.shared.mapItem) {
            let stItem = Shop.shared.mapItem[it];

            if (stItem.nKind != 1)
                continue;

            if (data.nPart > 0 && stItem.nSubKind != data.nPart)
                continue;

            if (stItem.nCnt <= 0)
                continue;

            let stGoods = {
                nID: stItem.nID,
                nConfigID: stItem.nConfigID,
                nPrice: stItem.nPrice,
                nCnt: stItem.nCnt,
                nTime: stItem.nAddTime
            };

            vecGoods.push(stGoods);
        }

        this.send('s2c_goods', {
            vecGoods: vecGoods
        })
    }

    QueryAndSendRolsGoods(nRoleID:any) {

        let vecGoods = [];

        for (let it in Shop.shared.mapItem) {
            let stItem = Shop.shared.mapItem[it];

            if (stItem.nSeller != this.accountid)
                continue;

            let stGoods = {
                nID: stItem.nID,
                nConfigID: stItem.nConfigID,
                nPrice: stItem.nPrice,
                nCnt: stItem.nCnt,
                nTime: stItem.nAddTime
            };

            vecGoods.push(stGoods);
        }

        this.send('s2c_roles_goods', {
            vecGoods: vecGoods
        })
    }

    AskDailyInfo() {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        pPlayer.GetTaskMgr().SendDailyActive();

    }

    TakeActivePrize(nIndex:number) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        if (nIndex < 0 || nIndex > 5)
            return;

        if (pPlayer.GetTaskMgr().szBeenTake[nIndex] == 1)
            return;

        let strPrize = pPlayer.GetTaskMgr().szActivePrize[nIndex];
        let vecTmp = strPrize.split(",");
        pPlayer.AddItem(parseInt(vecTmp[0]), parseInt(vecTmp[1]), true, '活跃度奖励');

        pPlayer.GetTaskMgr().szBeenTake[nIndex] = 1;

        this.AskDailyInfo();

    }

    AddGoods(data:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        pPlayer.send('s2c_notice', {
            strRichText: '物品暂时无法出售'
        });
        return;

        if (pPlayer.bag_list.hasOwnProperty(data.nConfigID) == false)
            return;

        if (Shop.shared.IsIteamCanSell(data.nConfigID) == false) {
            pPlayer.send('s2c_notice', {
                strRichText: '此物品不可出售'
            });
            return;
        }

        if (pPlayer.bag_list[data.nConfigID] < data.nCnt)
            return;

        let stItemInfo = GoodsMgr.shared.GetItemInfo(data.nConfigID);
        if (null == stItemInfo)
            return;

        let nRet = pPlayer.AddItem(data.nConfigID, -data.nCnt, false, '出售物品');
        if (!nRet)
            return;

        let nID = Shop.shared.GetMaxID() + 1;
        let stShopItem = new ShopItem(nID, data.nConfigID, stItemInfo.type, 0, '', this.accountid, Global.getTime(), data.nPrice, data.nCnt, 0);
        Shop.shared.mapItem[nID] = stShopItem;
        this.QueryAndSendRolsGoods(this.accountid);
    }

    TakeBackGoods(stMsg:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        let pShopItem = Shop.shared.FindShopItem(stMsg.nID);
        if (null == pShopItem)
            return;

        if (pShopItem.nSeller != this.accountid)
            return;

        let nMoney = pShopItem.nSellCnt * pShopItem.nPrice * 0.9;

        if (pShopItem.nCnt > 0)
            pPlayer.AddItem(pShopItem.nConfigID, pShopItem.nCnt, false, '取回出售物品');

        if (pShopItem.nSellCnt > 0)
            pPlayer.AddMoney(0, nMoney);


        delete Shop.shared.mapItem[stMsg.nID];
        this.QueryAndSendRolsGoods(this.accountid);

        let strMsg = pShopItem.nSellCnt > 0 ? `取回剩余物品${pShopItem.nCnt},已售部分所得银两${nMoney}` : `取回剩余物品${pShopItem.nCnt}`;
        pPlayer.send('s2c_notice', {
            strRichText: strMsg
        });
    }

    BuyGoods(data:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        let pShopItem = Shop.shared.FindShopItem(data.nID);
        if (null == pShopItem)
            return;

        if (pShopItem.nCnt < data.nCnt) {
            pPlayer.send('s2c_notice', {
                strRichText: '数量不足'
            });
            return;
        }

        if (pPlayer.money < data.nCnt * pShopItem.nPrice) {
            pPlayer.send('s2c_notice', {
                strRichText: '银两不足'
            });
            return;
        }

        if (pPlayer.getBagItemAllKindNum() >= Global.limitBagKindNum) {
            pPlayer.send('s2c_notice', {
                strRichText: '背包已满，无法购买'
            });
            return;
        }
        pPlayer.AddItem(pShopItem.nConfigID, data.nCnt, false, '摆摊处购买');
        pPlayer.AddMoney(0, -data.nCnt * pShopItem.nPrice);

        pShopItem.nCnt -= data.nCnt;
        pShopItem.nSellCnt += data.nCnt;

        pShopItem.nKind == 0 ? this.QueryItemGoods({
            nKind: pShopItem.nKind,
            nItem: 0
        }) : this.QueryEquipGoods({
            nKind: pShopItem.nKind,
            nItem: 0
        });
        pPlayer.send('s2c_notice', {
            strRichText: '购买成功'
        });
    }

    BuyFromNpc(nNpcConfigID:any, nItemID:any, nCnt:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer) {
            return;
        }

        if (pPlayer.getBagItemAllKindNum() >= Global.limitBagKindNum) {
            pPlayer.send('s2c_notice', {
                strRichText: '背包已满，无法购买'
            });
            return;
        }

        //let pNpcShop = mallMgr.mapNpcShop[nNpcConfigID];
        let pNpcShop;
        if (nNpcConfigID != 60002) {
            pNpcShop = MallMgr.shared.getNpcShopData(nNpcConfigID);
        } else {
            pNpcShop = ZhenbukuiMgr.shared.getNpcShopData();
        }
        if (null == pNpcShop) {
            return;
        }

        let vecGoods = pNpcShop.goods;
        if (null == vecGoods) {
            return;
        }

        let pGoods = null;
        for (var it in vecGoods) {
            if (vecGoods[it].itemid != nItemID)
                continue;
            pGoods = vecGoods[it];
            break;
        }

        if (null == pGoods) {
            return;
        }

        if (pGoods.quantity != null && pGoods.quantity <= 0) {
            pPlayer.send('s2c_notice', {
                strRichText: '商品已經售罄'
            });
            this.updateShopItemQuantity(nItemID, nCnt);
            return;
        }

        if (nCnt <= 0) {
            return;
        }

        if (Global.getDefault(pGoods.type) == 'weapon') {
            this.c2s_creat_equip({
                type: 0,
                roleid: pPlayer.roleid,
                index: 0,
                resid: nItemID
            });
        } else {
            let pItemInfo = GoodsMgr.shared.GetItemInfo(nItemID);
            if (null == pItemInfo)
                return;

            let strErr = pPlayer.CostFee(pGoods.moneykind, nCnt * pGoods.price, `从Npc购买${nCnt}个${pItemInfo.name}`);
            if (strErr != '') {
                pPlayer.send('s2c_notice', {
                    strRichText: strErr
                });
                return;
            }
            pPlayer.AddItem(nItemID, nCnt, true, '从NPC购买');
        }
        if (nNpcConfigID == 60002)
            this.updateShopItemQuantity(nItemID, nCnt);

    }

    updateShopItemQuantity(itemId:any, nCnt:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        let netItemInfo = ZhenbukuiMgr.shared.updateShopItem(itemId, nCnt);
        if (netItemInfo.length > 0) {
            if (netItemInfo[0].itemid == itemId) {
                pPlayer.send('s2c_update_shop_info', {
                    nItemID: itemId,
                    quantity: netItemInfo[0].quantity
                });
            }
        }
    }

    BuyMall(data:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer) {
            return;
        }

        MallMgr.shared.buyItem(pPlayer, data.mallid, data.mallnum);
    }


    TakeGoodsMoney() {

    }



    c2s_get_bagitem(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.send('s2c_bagitem', {
                info: JSON.stringify(p.bag_list)
            });
        }
    }

    c2s_get_mall(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        let mall_items = MallMgr.shared.mall_items;
        if (p) {
            p.send('s2c_mallitems', {
                info: JSON.stringify(mall_items)
            });
        }
    }

    c2s_ask_relive_list(data:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        pPlayer.sendReliveList();
    }

    c2s_change_relive_list(data:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;
        pPlayer.changeReliveList(data);
    }


    c2s_compose(data:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        let nFatherItem = data.nFatherItem;
        if (ComposMgr.shared.mapExplan.hasOwnProperty(nFatherItem) == false)
            return;

        if (data.nNum <= 0)
            return;

        let mapNum:any = {};
        let vecSon = ComposMgr.shared.mapExplan[nFatherItem]

        for (var it in vecSon) {
            let vecData = vecSon[it].split(':');
            if (vecData.length != 2)
                return;

            let nItem = vecData[0];
            let nNum = vecData[1];

            mapNum[nItem] = Global.getDefault(mapNum[nItem], 0) + nNum * data.nNum;
        }

        for (var it in mapNum) {
            if (pPlayer.getBagItemNum(it) < mapNum[it]) {
                pPlayer.send('s2c_notice', {
                    strRichText: '物品不足'
                });
                return;
            }
        }

        for (var it in mapNum) {
            pPlayer.AddItem(it, -mapNum[it], true, '物品合成消耗');
        }

        pPlayer.AddItem(nFatherItem, data.nNum, true, '物品合成');

    }



    c2s_ask_lottery_info(data:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        if (pPlayer.getBagItemNum(50004) <= 0) {
            pPlayer.send('s2c_notice', {
                strRichText: '高级藏宝图不足'
            });
            return;
        }

        if (pPlayer.getBagItemAllKindNum() >= Global.limitBagKindNum) {
            pPlayer.send('s2c_notice', {
                strRichText: '背包已满，无法挖宝'
            });
            return;
        }

        pPlayer.AddItem(50004, -1, false, '使用高级藏宝图');

        let strJson = LotteryMgr.shared.CreateLotteryBox();

        pPlayer.send('s2c_lottery_info', {
            strJson: strJson
        });
    }

    c2s_lottery_go(data:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        let pBox = LotteryMgr.shared.GetBox(data.nID);
        if (null == pBox) {
            pPlayer.send('s2c_notice', {
                strRichText: '藏宝图已失效'
            });
            return;
        }

        let nSelect = pBox.RandSelect()
        let nLen = Global.random(1, 3) * 15 + nSelect;
        pPlayer.send('s2c_lottery_result', {
            nSelect: nSelect,
            nLen: nLen
        });

        setTimeout(() => {
            Global.givePlayerPrize(pPlayer, pBox.vecItem[nSelect].strItem, parseInt(pBox.vecItem[nSelect].nNum));
            LotteryMgr.shared.DeleteBox(pBox.nBoxID);

        }, pBox.GetSumTime(nLen) + 1000);
    }

    c2s_ask_npc_shop_item(data:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer)
            return;

        let itemList;
        if (data.nNpcConfigID != 60002) {
            if (!MallMgr.shared.checkNpcData(data.nNpcConfigID))
                return;
            var dl = MallMgr.shared.getNpcShopData(data.nNpcConfigID);
            itemList = JSON.stringify(dl);
        } else {
            if (!ZhenbukuiMgr.shared.checkNpcData(data.nNpcConfigID))
                return;
            itemList = JSON.stringify(ZhenbukuiMgr.shared.getNpcShopData(data.nNpcConfigID));
        }

        if (itemList != null) {
            pPlayer.send('s2c_npc_shop_item', {
                info: itemList
            });
        }
    }

    c2s_use_bagitem(data:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(this.accountid);
        if (null == pPlayer) {
            return;
        }

        let itemData = GoodsMgr.shared.GetItemInfo(data.itemid);
        if (null == itemData) {
            return;
        }

        if (itemData.effect == 1 && (!pPlayer.bag_list.hasOwnProperty(data.itemid) || pPlayer.bag_list[data.itemid] < 1)) {
            return;
        }
        // 如果使用的是 高级藏宝图 判断物品栏够不够
        if (data.itemid == 50004) {
            if (pPlayer.getBagItemAllKindNum() >= Global.limitBagKindNum) {
                pPlayer.send('s2c_notice', {
                    strRichText: '背包已满，无法使用'
                });
                return;
            }
        }

        data.operation = 0;
        if (itemData.effect == 1) {
            if (GoodsMgr.shared.useItem(data)) {
                // data.operation = 1;
                // this.c2s_update_bagitem(data);
                this.c2s_update_bagitem(data);
            }
        }
    }

    c2s_stop_incense(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.stopIncense();
        }
    }

    c2s_get_lockeritem(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.send('s2c_lockeritem', {
                bag: JSON.stringify(p.bag_list),
                locker: JSON.stringify(p.locker_list),
                equip: JSON.stringify(p.getLockerEquipInfo())
            });
        }
    }

    c2s_update_bagitem(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.update_bagitem(data);
            
        }
    }

    c2s_update_lockeritem(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.update_lockeritem(data);
        }
    }

    c2s_createbang(data:any):number{
        let p = PlayerMgr.shared.getPlayer(this.accountid);
        if (p == null || p.bangid > 0) {
            return 0;
        }
        BangMgr.shared.createBang(p, data);
        return 1;
    }

    c2s_joinbang(data:any){
        let p = PlayerMgr.shared.getPlayer(this.accountid);
        if (p == null || p.bangid > 0) {
            return;
        }
        if (BangMgr.shared.joinBang(p.roleid, data.bangid)) {
            this.c2s_getbanginfo(data);
        } else {
            this.send('s2c_operation_result', {
                code: Global.msgCode.FAILED,
            });
        }
    }

    c2s_requestbang(data:any) {
        let p = PlayerMgr.shared.getPlayer(this.accountid);
        if (p == null || p.bangid > 0) {
            p.send('s2c_notice', {
                strRichText: '申请失败'
            });
            return;
        }
        BangMgr.shared.requestBang(p, data.bangid);
    }

    c2s_operbang(data:any) {
        let master = PlayerMgr.shared.getPlayer(this.accountid);
        if (master == null) {
            return;
        }
        let bang = BangMgr.shared.getBang(data.bangid);
        if (bang == null) {
            return;
        }
        bang.operRequest(master.roleid, data.roleid, data.operation);
    }

    c2s_leavebang(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player == null) {
            return;
        }
        let bang = BangMgr.shared.getBang(data.bangid);
        if (bang == null) {
            return;
        }

        if (player.roleid == data.roleid) {
            if (bang.masterid == player.roleid) {
                BangMgr.shared.disbandBang(data)
            } else {
                bang.leave(data.roleid, 0);
            }
            player.send('s2c_leavebang', {
                ecode: Global.msgCode.SUCCESS
            });
        } else {
            if (bang.masterid != player.roleid) {
                return;
            }
            bang.leave(data.roleid, 1);
            let tplayer = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
            if (tplayer) {
                tplayer.send('s2c_leavebang', {
                    ecode: Global.msgCode.SUCCESS
                });
            }
            this.c2s_getbanginfo({
                roleid: player.roleid,
                bangid: data.bangid
            });
        }
    }

    c2s_getbanglist() {
        this.send('s2c_getbanglist', {
            list: BangMgr.shared.getBangList()
        });
    }

    c2s_getbangrequest(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player == null) {
            return;
        }

        let bang = BangMgr.shared.getBang(player.bangid);
        if (bang) {
            if (bang.masterid != data.roleid) {
                return;
            } else {
                this.send('s2c_getbangrequest', {
                    requestlist: bang.getBangRequest()
                });
            }
        }
    }

    c2s_getbanginfo(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            if (p.bangid != data.bangid) {
                this.c2s_getbanglist();
                return;
            }
            BangMgr.shared.playerGetBangInfo(p);
        }
    }

    c2s_searchbang(data:any) {
        if (data.data == null || data.data == 0 || data.data == '') {
            return;
        }
        this.send('s2c_getbanglist', {
            list: BangMgr.shared.searchBang(data)
        });
    }

    c2s_bang_bid(data:any) {
        let p = PlayerMgr.shared.getPlayer(this.accountid);
        if (p) {
            let bang = BangMgr.shared.getBang(p.bangid);
            if (bang) {
                bang.addBidding(p, data.money);
            }
        }
    }

    c2s_relive_pet(data:any) {
        let p = PlayerMgr.shared.getPlayer(this.accountid);
        if (p) {
            p.relivePet(data);
        }
    }

    c2s_wash_petproperty(data:any) {
        let p = PlayerMgr.shared.getPlayer(this.accountid);
        if (p) {
            p.washProperty(data);
        }
    }

    c2s_save_petproperty(data:any) {
        let p = PlayerMgr.shared.getPlayer(this.accountid);
        if (p) {
            p.savePetProperty(data);
        }
    }

    c2s_charge_reward(data:any) {
        let p = PlayerMgr.shared.getPlayer(this.accountid);
        if (p) {
            p.chargeReward(data);
        }
    }

    c2s_hecheng_pet(data:any) {
        let p = PlayerMgr.shared.getPlayer(this.accountid);
        if (p) {
            p.hechengPet(data);
        }
    }

    c2s_create_pet(data:any) {
        let p = PlayerMgr.shared.getPlayer(this.accountid);
        if (p) {
            p.createPet(data);
        }
    }

    c2s_get_petlist(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.getPetlist(data);
        }
    }

    c2s_change_pet(data:any) {
        let p = PlayerMgr.shared.getPlayer(this.accountid);
        if (p) {
            p.changePet(data.petid);
        }
    }
    c2s_update_pet(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.updatePetPoint(data);
        }
    }
    c2s_level_reward(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.levelReward(data.level);
        }
    }
    c2s_del_pet(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.delPet(data);
        }
    }
    c2s_pet_forgetskill(data:any) {
        let p = PlayerMgr.shared.getPlayer(this.accountid);
        if (p) {
            p.petForgetSkill(data.petid, data.skillid)
        }
    }
    c2s_pet_lockskill(data:any) {
        let p = PlayerMgr.shared.getPlayer(this.accountid);
        if (p) {
            p.petLockSkill(data.petid, data.skillid)
        }
    }
    c2s_pet_changeSskill(data:any) {
        let p = PlayerMgr.shared.getPlayer(this.accountid);
        if (!p) {
            return;
        }

        p.petShenShouSkill(data.petid, data.skillid);
    }

    c2s_creat_equip(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.createEquip(data);
        }
    }
    c2s_equip_list(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.sendEquipList();
        }
    }
    c2s_equip_info(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.sendEquipInfo(data.equipid);
        }
    }

    c2s_next_equip(data:any) {
        let equipMgr = require('../object/equip_mgr');
        let equipArr = EquipMgr.shared.getEquipData(data);
        this.send('s2c_next_equip', {
            equip: JSON.stringify(equipArr)
        });
    }

    c2s_equip_update(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.updateEquip(data);
        }
    }

    c2s_equip_upgrade(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.upgradeEquip(data);
        }
    }

    c2s_equip_inlay(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.equipInlay(data);
        }
    }

    c2s_equip_refine(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.equipRefine(data);
        }
    }

    c2s_equip_recast(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.equipRecast(data);
        }
    }

    c2s_xianqi_list(data:any) {
        let equipMgr = require('../object/equip_mgr');
        let equipArr = EquipMgr.shared.getXianQiList(data);
        this.send('s2c_xianqi_list', {
            list: JSON.stringify(equipArr)
        });
    }

    c2s_shenbing_upgrade(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.shenbignUpgrade(data);
        }
    }

    c2s_xianqi_upgrade(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (p) {
            p.xianqiUpGrade(data);
        }
    }

    c2s_btl(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            if (player.battle_id == 0) {
                player.monsterBattle();
            }
        }
    }

    c2s_btl_auto(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            let battle = BattleMgr.shared.getBattle(player.battle_id);
            if (battle) {
                battle.playerAuto(player.onlyid);
            }
        }
    }

    c2s_btl_act(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            let battle = BattleMgr.shared.getBattle(player.battle_id);
            if (battle) {
                battle.playerAction(data);
            }
        }
    }


    c2s_mall_buy(data:any) {
        //data.id;
    }
    // c2s_Get_WX(){
    //     let str1 = `select *  from qy_WX`;
    //     DB.query(str1, (ret, rows) => {
    //         let data = rows;
    //         this.send('s2c_Get_WX', {
    //             data: data,
    //         })
    //     });
    // }

    c2s_relive(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            player.playerRelive(data);
        }
    }

    c2s_changerace(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            player.playerChangeRace(data);
        }
    }

    c2s_changename(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            player.playerChangeName(data);
        }
    }

    c2s_pk(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            let target = PlayerMgr.shared.getPlayerByRoleId(data.troleid);
            if (target) {
                player.playerBattle(target.onlyid, Global.battleType.Force);
            }
        }
    }

    c2s_hongbao_open(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            let activity = ActivityMgr.shared.getActivity(ActivityDefine.activityKindID.HongBao);
            if (activity) {
                activity.playerOpenHongbao(player.roleid);
            }
        }
    }

    c2s_getgift_info() {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (!player) {
            return;
        }

        let senddata:any = {}
        senddata.hasgot = player.getgift;
        senddata.list = [];

        let gift = require('../gift/gift');
        for (const itemid in gift.libao) {
            const itemnum = gift.libao[itemid];
            senddata.list.push({
                itemid: itemid,
                itemnum: itemnum,
            });
        }

        this.send('s2c_getgift_info', senddata);
    }

    c2s_resetgift() {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (!player) {
            return;
        }
        player.getgift = 1;
    }

    c2s_remunerate(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (!player) {
            return;
        }

        let errorcode = player.reGetGift();
        if (errorcode != Global.msgCode.SUCCESS) {
            this.send('s2c_remunerate', {
                errorcode: errorcode,
            })
        }
    }

    c2s_shuilu_sign(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            if (player.isTeamLeader() == false) {
                return;
            }
            let activity = ActivityMgr.shared.getActivity(ActivityDefine.activityKindID.ShuiLuDaHui);
            if (activity && activity.activity_state == ActivityDefine.activityState.Opening) {
                let errorcode = activity.playerSign(player);
                // 成功通知全体成员，失败则通知队长一人
                if (Global.msgCode.SUCCESS == errorcode) {
                    TeamMgr.shared.broadcast(player.getTeamId(), 's2c_shuilu_sign', {
                        errorcode: errorcode,
                        shuilustate: activity.sldh_state,
                    });
                } else {
                    this.send('s2c_shuilu_sign', {
                        errorcode: errorcode,
                        shuilustate: activity.sldh_state,
                    });
                }
            } else {
                this.send('s2c_shuilu_sign', {
                    errorcode: Global.msgCode.SLDH_NOT_OPEN
                });
            }
        }
    }

    c2s_shuilu_unsign(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            if (player.isTeamLeader() == false) {
                return;
            }
            let activity = ActivityMgr.shared.getActivity(ActivityDefine.activityKindID.ShuiLuDaHui);
            if (activity && activity.activity_state == ActivityDefine.activityState.Opening) {
                let errorcode = activity.playerUnsign(player);
                if (Global.msgCode.SUCCESS == errorcode) {
                    TeamMgr.shared.broadcast(player.getTeamId(), 's2c_shuilu_unsign', {
                        errorcode: errorcode
                    });
                } else {
                    this.send('s2c_shuilu_unsign', {
                        errorcode: errorcode
                    });
                }
            } else {
                this.send('s2c_shuilu_unsign', {
                    errorcode: Global.msgCode.SLDH_NOT_OPEN
                });
            }
        }
    }

    c2s_shuilu_info() {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            let activity = ActivityMgr.shared.getActivity(ActivityDefine.activityKindID.ShuiLuDaHui);
            if (activity && activity.activity_state == ActivityDefine.activityState.Opening) {
                let senddata = activity.getShuiLuInfo(player);
                this.send('s2c_shuilu_info', senddata);
            } else {
                this.send('s2c_shuilu_sign', {
                    errorcode: Global.msgCode.SLDH_NOT_OPEN
                });
            }
        }
    }


    c2s_world_reward(data:any) {
        let worldReward = require('../worldReward/worldRewardMgr');
        worldReward.sendReward(data.roleid, data.yuNum, data.num);
    }

    c2s_world_reward_list() {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (!player) {
            return;
        }
        let worldReward = require('../worldReward/worldRewardMgr');
        worldReward.getRewardList(player);
    }

    c2s_world_reward_open(data:any) {
        let worldMgr = require('../worldReward/worldRewardMgr');
        worldMgr.toReceive(data.tagID, data.roleid);
    }

    c2s_title_change(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            player.changeTitle(data);
        }
    }

    c2s_title_info(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            player.getTitles();
        }
    }

    c2s_linghou_fight(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            let activity = ActivityMgr.shared.getActivity(ActivityDefine.activityKindID.TianJiangLingHou);
            if (activity && activity.activity_state == ActivityDefine.activityState.Opening) {
                let ecode = activity.playerFightMonkey(player, data.mid);
                if (ecode != Global.msgCode.SUCCESS) {
                    this.send('s2c_linghou_fight', {
                        ecode: ecode
                    });
                }
            } else {
                this.send('s2c_linghou_fight', {
                    ecode: Global.msgCode.LINGHOU_FIGHT_TOO_MACH
                });
            }
        }
    }

    c2s_palace_fight(data:any) {
        let subJade = 2000;
        let subMoney = 1500000;
        if (data.sponsorid == data.recipientid) {
            this.send('s2c_notice', {
                strRichText: '不能跟自己决斗！'
            });
            return;
        }
        let palaceMgr = require('../activity/palace_mgr');
        if (palaceMgr.getPKInfo(data.sponsorid) || palaceMgr.getPKInfo(data.recipientid)) {
            this.send('s2c_notice', {
                strRichText: '你或者此玩家正在被其他人邀请皇城pk中！'
            });
            return;
        }
        let sponsor_role = PlayerMgr.shared.getPlayerByRoleId(data.sponsorid);
        let recipient_role = PlayerMgr.shared.getPlayerByRoleId(data.recipientid);
        if (!recipient_role || !sponsor_role) {
            this.send('s2c_notice', {
                strRichText: '未找到玩家！'
            });
            return;
        }
        if (!recipient_role.getIsOnline() || !sponsor_role.getIsOnline()) {
            this.send('s2c_notice', {
                strRichText: '玩家未在线！'
            });
            return;
        }
        if (recipient_role.level < 30 || sponsor_role.level < 30) {
            this.send('s2c_notice', {
                strRichText: '玩家等级未到30级！'
            });
            return;
        }
        if (data.type == 0) {
            if (sponsor_role.money < subMoney) {
                this.send('s2c_notice', {
                    strRichText: '玩家银两不够！'
                });
                return;
            }
            sponsor_role.AddMoney(0, -subMoney, `玩家${data.sponsorid}对玩家${data.recipientid}发起皇城决斗！`);
        }
        if (data.type == 1) {
            if (sponsor_role.jade < subJade) {
                this.send('s2c_notice', {
                    strRichText: '玩家仙玉不够！'
                });
                return;
            }
            sponsor_role.AddMoney(1, -subJade, `玩家${data.sponsorid}对玩家${data.recipientid}发起皇城决斗！`);
        }
        let sponsor = {
            roleid: sponsor_role.roleid,
            name: sponsor_role.name,
            level: sponsor_role.level,
            race: sponsor_role.race,
            resid: sponsor_role.resid,
            state: 1,
        };
        let recipient = {
            roleid: recipient_role.roleid,
            name: recipient_role.name,
            level: recipient_role.level,
            race: recipient_role.race,
            resid: recipient_role.resid,
            state: 0,
        };
        let senddata = {
            sponsor: sponsor,
            recipient: recipient,
            type: data.type,
            tm: 120 * 1000,
            msg: data.msg,
            win: 0,
        };
        palaceMgr.addToList(senddata);
        if (data.type == 0) {
            this.send('s2c_palace_fight', senddata);
            recipient_role.send('s2c_palace_fight', senddata);
        } else if (data.type == 1) {
            PlayerMgr.shared.broadcast('s2c_palace_fight', senddata);
            let str = `玩家[${senddata.sponsor.name}]${data.sponsorid}向玩家[${senddata.recipient.name}]${data.recipientid}发起了皇城决斗邀请！并写下战书：${data.msg}`;
            if (data.msg.length == 0) {
                str = `玩家[${senddata.sponsor.name}]${data.sponsorid}向玩家[${senddata.recipient.name}]${data.recipientid}发起了皇城决斗邀请！`;
            }
            PlayerMgr.shared.broadcast('s2c_game_chat', {
                roleid: sponsor_role.roleid,
                onlyid: sponsor_role.onlyid,
                scale: 0,
                msg: str,
                name: sponsor_role.name,
                resid: sponsor_role.resid,
            });
        }
        this.send('s2c_game_chat', {
            scale: 3,
            msg: `你向玩家[${senddata.recipient.name}]${data.recipientid}发起了皇城决斗邀请！`,
        });
        recipient_role.send('s2c_game_chat', {
            scale: 3,
            msg: `玩家[${senddata.sponsor.name}]${data.sponsorid}向你发起了皇城决斗邀请！`,
        });
    }

    c2s_palace_agree(data:any) {
        let role = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (!role) {
            return;
        }
        let palaceMgr = require('../activity/palace_mgr');
        let info = palaceMgr.getPKInfo(data.roleid);
        if (!info) {
            this.send('s2c_notice', {
                strRichText: '决斗已被取消！'
            });
            return;
        }
        for (let item of [info.sponsor, info.recipient]) {
            if (item.roleid == data.roleid) {
                item.state = (data.battle == 1) ? 1 : 2;
            }
        }
        let sponsor_role = PlayerMgr.shared.getPlayerByRoleId(info.sponsor.roleid);
        let recipient_role = PlayerMgr.shared.getPlayerByRoleId(info.recipient.roleid);
        if (!sponsor_role || !recipient_role) {
            return;
        }


        if (info.sponsor.state == 1 && info.recipient.state == 1) { // 两人都同意决斗 
            if (!sponsor_role.canPalaceFight()) {
                info.sponsor.state = 2;
                palaceMgr.delPKInfo(data.roleid, 'sponsor');
            } else if (!recipient_role.canPalaceFight()) {
                info.recipient.state = 2;
                palaceMgr.delPKInfo(data.roleid, 'recipient');
            } else {
                palaceMgr.setCanPK(info);
            }
        }

        sponsor_role.send('s2c_palace_fight', info);
        recipient_role.send('s2c_palace_fight', info);

        if (info.sponsor.state == 2) { // 发起人取消决斗 
            palaceMgr.delPKInfo(data.roleid, 'sponsor');
        }
        if (info.recipient.state == 2) { // 接受人取消了决斗 
            palaceMgr.delPKInfo(data.roleid, 'recipient');
        }
    }

    c2s_palace_rolelist(data:any) {
        let palaceMgr = require('../activity/palace_mgr');
        palaceMgr.sendPalaceRoleList(data.roleid);
    }

    c2s_relation_new(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) {
            return;
        }
        RelationMgr.shared.applyRelation(p, data);
    }

    c2s_relation_agree(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) {
            return;
        }
        RelationMgr.shared.confirmRelation(p, data);
    }

    c2s_relation_List(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) {
            return;
        }
        RelationMgr.shared.getRelationListByRoleId(p, data);
    }

    c2s_relation_leave(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) {
            return;
        }
        RelationMgr.shared.leaveRelation(p, data);
    }

    c2s_relation_add(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) {
            return;
        }
        RelationMgr.shared.addRelationMember(p, data);
    }

    c2s_relation_reject(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) {
            return;
        }
        RelationMgr.shared.rejectRelation(p, data);
    }

    c2s_change_role_color(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (player) {
            player.setRoleColor(data.index1, data.index2);
        }
    }

    c2s_scheme_create(data:any) {
        return;
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) { return; }
        p.schemeMgr.addScheme(data.name);
    }

    c2s_scheme_List(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) { return; }
        p.schemeMgr.getSchemeNameList();
    }

    c2s_scheme_info(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) { return; }
        p.schemeMgr.getSchemeInfo(data.schemeId);
    }

    c2s_scheme_updateEquip(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) { return; }
        p.schemeMgr.updateSchemeEquip(data);
    }

    c2s_scheme_addCustomPoint(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) { return; }
        p.schemeMgr.addCustomPoint(data);
    }

    c2s_scheme_addXiulianPoint(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) { return; }
        p.schemeMgr.addXiulianPoint(data);
    }

    c2s_scheme_resetXiulianPoint(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) { return; }
        p.schemeMgr.resetXiulianPoint(data);
    }

    c2s_scheme_changePartner(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) { return; }
        p.schemeMgr.changePartner(data);
    }

    c2s_scheme_activate(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) { return; }
        p.schemeMgr.activateScheme(data);
    }

    c2s_scheme_changeName(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) { return; }
        p.schemeMgr.changeScheneName(data);
    }

    c2s_scheme_use(data:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(data.roleId);
        if (!p) { return; }
        p.schemeMgr.useSchene(data);
    }

    c2s_bell_msg(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (!player) {
            return;
        }
        player.costBell(data.msg);
    }

    c2s_safepass_msg(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (!player) {
            return;
        }
        player.setSafePassword(data.pass, data.lock);
    }

    c2s_petfly_msg(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (!player) {
            return;
        }
        let pet = player.getPetByID(data.petid);
        if (!pet) {
            return;
        }
        pet.flyingUp(data.type);
    }
    // 骑乘
    c2s_ride_msg(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (!player) {
            return;
        }
        let mountId=data.mountId;
        player.ride(mountId);
    }
    // 下马
    c2s_dismount_msg(data:any) {
        let player = PlayerMgr.shared.getPlayer(this.accountid);
        if (!player) {
            return;
        }
        player.dismount();
    }
}
