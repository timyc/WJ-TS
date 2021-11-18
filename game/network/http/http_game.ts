import express from "express";
import Global from "../../core/Global";
import Signal from "../../core/Signal";
import Http from "../../../utils/Http";
import PlayerMgr from "../../object/PlayerMgr";
import GMMgr from "../../core/GMMgr";
import NoticeMgr from "../../core/NoticeMgr";
import ChargeSum from "../../core/ChargeSum";

function loginToken(req:any, res:any) {
	let accountid = req.query.accountid;
	let login_token = req.query.token;

	Signal.shared.addLoginToken(accountid, login_token);
	Http.reply(res, {
		result: Global.msgCode.SUCCESS,
	});
}

function getClientIP(req:any) {
	var ip = req.headers['x-forwarded-for'] ||
		req.ip ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress || '';
	if (ip.split(',').length > 0) {
		ip = ip.split(',')[0];
	}
	return ip;
}

function chargeCallback(req:any, res:any) {
	let roleid = req.query.roleid;
	let jade = Number(req.query.jade);
	let orderid = req.query.orderid;
	let money = Number(req.query.money);
	let ip = getClientIP(req);
	// if (ip != Global.serverConfig.HTTP.IP){
	// 	return;
	// }
	if (ip != Global.serverConfig.GAME.GATE_IP) {
		return;
	}
	let player = PlayerMgr.shared.getPlayerByRoleId(roleid);
	if (player) {
			console.log(`在线玩家${roleid}充值${jade}仙玉成功，订单${orderid}！`);
	}
	Http.reply(res, { errcode: (player)? Global.msgCode.SUCCESS:Global.msgCode.FAILED });
	ChargeSum.shared.playerCharge(roleid, money, jade); // 玩家充值 
}

function sysNotice(req:any, res:any) {
	let text = req.query.text;
	let type = req.query.type;         // 1 走马灯 2 聊天框 3 走马灯 + 聊天框
	let serverid = req.query.sid;      // 0 则全服公告
	let times = req.query.times;       // -1 则永久公告 需入库
	let interval = req.query.interval; // 单位 秒
	let id = req.query.id;             // 消息id
	let notice = {
		id: id,
		text: text,
		type: type,
		times: times,
		interval: interval,
	};
	NoticeMgr.shared.addNewNotice(notice);
	Http.reply(res, { errcode: Global.msgCode.SUCCESS });
}

function deleteNotice(req:any, res:any) {
	let id = req.query.id;
	NoticeMgr.shared.delNotice(id);
	Http.reply(res, { errcode: Global.msgCode.SUCCESS });
}

function setBanSpeak(req:any, res:any) {
	let roleid = req.query.roleid;
	let state = req.query.state;
	GMMgr.shared.setBanSpeak(roleid, state);
	Http.reply(res, { errcode: Global.msgCode.SUCCESS });
}

function clearPCache(req:any, res:any) {
	let ip = getClientIP(req);
	if (ip != Global.serverConfig.GAME.GATE_IP) {
		return;
	}
	let roleid = req.query.roleid;
	PlayerMgr.shared.clearPlayerCache(roleid);
	res.end(JSON.stringify({
        ret: `操作完成`,
    }));
}

function kickedOut(req:any,res:any){
	let roleids = req.query.roleids;
	PlayerMgr.shared.kickedOutPlayer(roleids);
}


function setChargeActivity (req:any, res:any) {
	let start = parseInt(req.query.start);
	let end = parseInt(req.query.end);
	GMMgr.shared.setChargeActivity(start, end);
	Http.reply(res, { errcode: 0, });
}


function closeChargeActivity (req:any, res:any) {
	GMMgr.shared.closeChargeActivity();
	Http.reply(res, { errcode: 0, });
}

let game_list = {
	['loginToken']: loginToken,
	['chargeCallback']: chargeCallback,
	['sysNotice']: sysNotice,
	['setBanSpeak']: setBanSpeak,
	['deleteNotice']: deleteNotice,
	['clearPCache']: clearPCache,
	['kickedOut']: kickedOut,
	['setChargeActivity']: setChargeActivity,
	['closeChargeActivity']: closeChargeActivity,
};

var app = express();
app.get('/toGetWX', function (req:any, res:any) {
});

module.exports = game_list;