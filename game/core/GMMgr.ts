import Global from "../../game/core/Global";
import Signal from "./Signal";
import GoodsMgr from "../item/GoodsMgr";
import PlayerMgr from "../object/PlayerMgr";
import DB from "../../utils/DB";
import Http from "../../utils/Http";
import ActivityMgr from "../activity/ActivityMgr";
import ActivityDefine from "../activity/ActivityDefine";

export default class GMMgr{
	static shared=new GMMgr();
	list:any = {
		['fight']: this.fight,
		['addexp']: this.addExp,
		['additem']: this.addItem,
		['attr']: this.changeAttr,
		['freeze']: this.freeze,
		['activity']: this.activity,
		['shutup']: this.LetPlayerShutUp,
		['speak']: this.letPlayerSpeak,
		['mon']: this.createMonster,
		['role']: this.createPlayer,
	};

	exec(player:any,command:any){
		let func = this.list[command[0]];
		if (func) {
			func(player, command);
		}
	}

	fight(player:any, command:any) {
		if (Global.netType == 'InSide' || (player && player.gmlevel >= 1)) {
			if (player) {
				let groupid = parseInt(command[1]);
				player.monsterBattle(groupid, Global.battleType.Normal, true);
			}
		}
	}
	
	addExp(player:any, command:any) {
		if (Global.netType == 'InSide' || (player && player.gmlevel >= 20)) {
			let expstr = command[1] + '';
			if (expstr.length >= 10) {
				if (player) {
					player.send('s2c_notice', {
						strRichText: '大兄弟，gm指令不能乱用'
					});
				}
				return;
			}
			let exp = parseInt(expstr);
			player.addExp(exp);
		}
	}
	
	freeze(player:any, command:any) {
		let userid = command[1];
		if (Global.netType == 'InSide' || (player && player.gmlevel > 10)) {
			try {
				let uid = parseInt(userid);
				let target = PlayerMgr.shared.getPlayerByRoleId(uid);
				if (target) {
					player.send('s2c_notice', {
						strRichText: '被GM  踢下线！'
					});
					setTimeout(() => {
						target.agent.destroy();
					}, 1000);
	
				}
			} catch (error) {
	
			}
		}
	}
	
	FreezePlayer(pGmPlayer:any, nTargetID:any){
		if (null == pGmPlayer)
			return;
		if (pGmPlayer.gmlevel < 10) {
			return;
		}
	
		let pTarget = PlayerMgr.shared.getPlayerByRoleId(nTargetID);
		if (null == pTarget)
			return;
	
		pGmPlayer.send('s2c_notice', {
			strRichText: '封号成功'
		});
	
		let sql = `update qy_account set state= 1 where accountid = ${pTarget.accountid}`;
		DB.query(sql, (ret:any, rows:any) => { });
	
		Signal.shared.DeleteTocken(pTarget.accountid);
	
		setTimeout(() => {
			// pTarget.agent.destroy();
			pTarget.destroy();
		}, 1000);
	}
	
	FreezePlayerIP(pGmPlayer:any, nTargetID:any){
		this.FreezePlayer(pGmPlayer, nTargetID);
		if (null == pGmPlayer)
			return;
		if (pGmPlayer.gmlevel < 15) {
			return;
		}
	
		let pTarget = PlayerMgr.shared.getPlayerByRoleId(nTargetID);
		if (null == pTarget)
			return;
	
		DB.freezeIP(pTarget.accountid, (ret:any, ip:any) => {
			if (ret == Global.msgCode.SUCCESS) {
				pGmPlayer.send('s2c_notice', {
					strRichText: '封IP成功'
				});
				if (ip == 0) {
					return;
				}
				Http.sendget(Global.serverConfig.GAME.GATE_IP, Global.serverConfig.GAME.GATE_PORT, '/frozenip', {
					frozenip: ip
				}, () => { });
				let str = `玩家[${pGmPlayer.name}:${pGmPlayer.roleid}]使用GM命令，封了[${pTarget.accountid}]的IP[${ip}]`;
				console.log(str);
			} else {
				// 	pGmPlayer.send('s2c_notice', {
				// 	strRichText: '封IP失败'
				// });
			}
		});
	}
	
	FreezePlayerMAC(pGmPlayer:any, nTargetID:any){
		if (null == pGmPlayer)
			return;
		if (pGmPlayer.gmlevel < 30) {
			return;
		}
	
		let pTarget = PlayerMgr.shared.getPlayerByRoleId(nTargetID);
		if (null == pTarget)
			return;
	
		Http.sendget(Global.serverConfig.GAME.GATE_IP, Global.serverConfig.GAME.GATE_PORT, '/frozenmac', {
			 accountid: pTarget.accountid,
			 gmRoleid: pGmPlayer.roleid
		}, () => { });
	
		let str = `玩家[${pGmPlayer.name}:${pGmPlayer.roleid}]使用GM命令，封了[${pTarget.accountid}]的MAC `;
		console.log(str);
	
		
	}
	
	LetPlayerShutUp(pGmPlayer:any, nTargetID:any){
		if (null == pGmPlayer)
			return;
		if (pGmPlayer.gmlevel < 1) {
			return;
		}
	
		let pTarget = PlayerMgr.shared.getPlayerByRoleId(nTargetID);
		if (null == pTarget)
			return;
	
		pTarget.SetFlag(Global.EPlayerFlag.EBanSpeak, 1);
	
		pGmPlayer.send('s2c_notice', {
			strRichText: '禁言成功'
		});
	
		PlayerMgr.shared.broadcast('s2c_game_chat', {
			scale: 5,
			msg: '',
			name: '',
			resid: 0,
			teamid: 0,
			roleid:nTargetID,
		});
	}
	
	letPlayerSpeak(pGmPlayer:any, nTargetID:any){
		if (null == pGmPlayer)
			return;
		if (pGmPlayer.gmlevel < 1) {
			return;
		}
	
		let pTarget = PlayerMgr.shared.getPlayerByRoleId(nTargetID);
		if (null == pTarget)
			return;
	
		pTarget.SetFlag(Global.EPlayerFlag.EBanSpeak, 0);
	
		pGmPlayer.send('s2c_notice', {
			strRichText: '解禁成功'
		});
	
		pTarget.send('s2c_notice', {
			strRichText: '成功解禁发言'
		});
	}

	setBanSpeak = (nPlayer:any, nBan:any) => {
		let pTarget = PlayerMgr.shared.getPlayerByRoleId(nPlayer);
		if (null == pTarget)
			return;
		pTarget.SetFlag(Global.EPlayerFlag.EBanSpeak, nBan);
	}
	
	addItem(player:any, command:any) {
		if (Global.netType == 'InSide' || (player && player.gmlevel >= 100)) {
			let item = command[1];
			let itemnum = command[2];
			let targetid = command[3];
			if (!player || !item || !itemnum) {
				// player.createItem(itemid);
				return;
			}
			let itemid = parseInt(item);
			if (isNaN(itemid)) {
				let iteminfo = GoodsMgr.shared.getItemInfoByName(item);
				if (iteminfo) {
					itemid = iteminfo.id;
				} else {
	
				}
			}
	
			if (itemid != 0) {
				if (targetid != null && targetid != 0) {
					let target = PlayerMgr.shared.getPlayerByRoleId(targetid);
					if (target) {
						let str = `玩家[${player.name}:${player.roleid}]使用GM命令，给玩家[${target.name}${target.roleid}]添加${itemnum}个物品[${itemid}]`;
						target.AddItem(itemid, itemnum, true, str);
					}
				} else {
					let str = `玩家[${player.name}:${player.roleid}]使用GM命令，给自己添加${itemnum}个物品[${itemid}]`;
					player.AddItem(itemid, itemnum, true, str);
				}
			}
	
		}
	}
	
	changeAttr(player:any, command:any) {
		if (Global.netType == 'InSide' || (player && player.gmlevel >= 2)) {
			let attrtype = command[1];
			let attr = command[2];
			if (Global.attrTypeStrL1[attrtype] == null) {
				return;
			}
			try {
				let num = attr;
				if (num.length > 10) {
					return;
				}
				num = parseInt(num);
				player.setAttr1(attrtype, num);
				player.send('s2c_player_data', player.getData());
			} catch (error) {
	
			}
		}
	}
	
	activity(player:any, command:any) {
		if (Global.netType == 'InSide' || (player && player.gmlevel >= 100)) {
			let activity_id = parseInt(command[1]);
			let isopen = parseInt(command[2]); // 0 关闭 1 开启
			let activity = ActivityMgr.shared.getActivity(activity_id);
			if (activity) {
				if (isopen == 0) {
					activity.close();
				} 
				else {
					activity.gmState(isopen);
				}
			} 
			else {
				if (isopen == 1) {
					let activityDefine = require('../activity/active_define');
					let newactivity = null;
					switch (activity_id) {
						case ActivityDefine.activityKindID.HongBao: {
							newactivity = require('../activity/hongbao');
						} break;
						case ActivityDefine.activityKindID.ShuiLuDaHui: {
							newactivity = require('../activity/shuiludahui');
						} break;
						case ActivityDefine.activityKindID.TianJiangLingHou: {
							newactivity = require('../activity/linghou');
						} break;
					}
					if (newactivity) {
						if(newactivity.prototype.gmState){
							let activity = new newactivity();
							ActivityMgr.shared.addActivity(activity);
							activity.gmState(isopen);
						}
					}
				}
			}
		}
	}
	
	
	setChargeActivity (start:any, end:any) {
		let activityDefine = require('../activity/active_define');
		let activity_id = ActivityDefine.activityKindID.ChongZhi;
		let activityMgr = require('../activity/activity_mgr');
		let activity = ActivityMgr.shared.getActivity(activity_id);
		if (! activity) {
			let chongzhi = require('../activity/chongzhi');
			activity = new chongzhi();
			ActivityMgr.shared.addActivity(activity);
		}
		activity.setActivityTm(start, end);
	}
	
	
	closeChargeActivity () {
		let activityDefine = require('../activity/active_define');
		let activity_id = ActivityDefine.activityKindID.ChongZhi;
		let activityMgr = require('../activity/activity_mgr');
		let activity = ActivityMgr.shared.getActivity(activity_id);
		if (! activity) {
			console.log('未发现充值活动！');
			return;
		}
		activity.close();
	}
	
	createMonster(player:any, command:any) {
		if (Global.netType == 'InSide' || (player && player.gmlevel >= 100)) {
			let npcid = parseInt(command[1]);
			let npcMgr = require('../object/npc_mgr');
			npcMgr.CreateNpc(npcid, player.mapid, player.x, player.y);
		}
	}
	
	createPlayer(player:any, command:any){
		if (Global.netType == 'InSide' || (player && player.gmlevel >= 100)) {
			let playernum = parseInt(command[1]);
			if(playernum == null || isNaN(playernum)){
				playernum = 1;
			}
			let playerMgr = require('../object/player_mgr');
			PlayerMgr.shared.clearRobot();
			for (let index = 0; index < playernum; index++) {
				let p = player.clone();
				p.onlyid = p.roleid = p.accountid = 99999999 - index;
				p.agent = null;
				p.x = player.x + Global.random(0, 30) - 15;
				p.y = player.y + Global.random(0, 30) - 15;
				PlayerMgr.shared.addPlayer(p);
				p.onEnterMap();
			}
		}
	}
}
