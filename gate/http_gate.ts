import Global from "../game/core/Global";
import ServerMgr from "./ServerMgr";
import TokenMgr from "./TokenMgr";
import FrozenIPMgr from "./FrozenIPMgr";
import FrozenMacMgr from "./FrozenMacMgr";
import DB from "../utils/DB";
import WhiteListMgr from "./WhiteListMgr";
import Charge from "../utils/Charge";
import Http from "../utils/Http";
import GateAgentMgr from "./GateAgentMgr";

let orderList:any = {}; // orderid  state 
let AccountRegisterList:any = {};
let CraeteList:any = {};
let chargeActivityState:any = {}; // 充值活动是否开启的状态 

function S_Register(req:any, res:any){
    let id = req.query.id;
    let ip = req.query.ip;
    let fake = req.query.fake;
    let port = req.query.port;
    let hport = req.query.http_port;
    let name = req.query.name;
    let ret = ServerMgr.shared.serverReg(id, ip, fake, port, hport, name);
    console.log('游戏服务器注册:',id,ip,fake,port,hport,name);
    Http.reply(res, {
        result: ret ? Global.msgCode.SUCCESS : Global.msgCode.FAILED,
        tokens: TokenMgr.shared.getAllToken(),
    });
};

let S_Ping = (req:any, res:any) => {
    let id = req.query.id;
    let n = req.query.num;

    let ret = ServerMgr.shared.serverPing(id, n);
    Http.reply(res, {
        result: ret,
    });
};

let S_Guide = (req:any, res:any) => {
    let id = req.query.id;
    ServerMgr.shared.setGuideServer(id);
};


function getServerListByServerid (serverid:number) {
    let server_list = [];
	let servers = ServerMgr.shared.getServerList();
    if (serverid == 0) {
        for (let key in servers) {
			server_list.push(servers[key]);
        }
	}
	else {
        let server = ServerMgr.shared.getServer(serverid);
        if (server) {
            server_list.push(server);
		}
	}
	return server_list;
}

// 通过连接 获取客户端ip
function getClientIP(req:any) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    ip = ip.replace(/::ffff:/, '');
    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0];
    }
    return ip;
}

function register(req:any, res:any) {
    let account = req.query.account;
    let password = req.query.password;
    let invitecode = req.query.invitecode;
    if (AccountRegisterList[account] != null) {
        res.end();
        return;
    }
    let ip = getClientIP(req);
    if (!FrozenIPMgr.shared.checkIP(ip)) {
        Http.reply(res, {
            result: Global.msgCode.INVITE_CODE_ERR
        });
        return;
    }

    // if (pAgentMgr.IsCodeEnable(invitecode) == false) {
    //     let retdata = {
    //         result: Global.msgCode.INVITE_CODE_ERR
    //     };
    //     Http.reply(res, retdata);
    //     return;
    // }

    // let last_reg_time = RegisterIPList[ip];
    let nowtime = Date.now();
    // if (last_reg_time) {
    //     if (nowtime - last_reg_time < 3 * 60 * 1000) {
    //         let retdata = {
    //             result: Global.msgCode.REGISTER_ACCOUNT_REPEAT
    //         };
    //         Http.reply(res, retdata);
    //         return;
    //     }
    // }

    AccountRegisterList[account] = {
        account: account,
        password: password,
        invitecode: invitecode,
        reqtime: nowtime,
        ip: ip,
    }
    // RegisterIPList[ip] = nowtime;
    DB.accountRegister({
        account: account,
        password: password,
        invitecode: invitecode
    }, (errorcode:any, dbdata:any) => {
        delete AccountRegisterList[account];
        let retdata:any = {
            result: errorcode
        };
        Http.reply(res, retdata);
    });
}


function login(req:any, res:any) {
    let account = req.query.account;
    let password = req.query.password;
    let gametype = req.query.gametype;
    let version = req.query.version;
    let mac = req.query.mac;


    let ip = getClientIP(req);
    if (!FrozenIPMgr.shared.checkIP(ip)) {
        Http.reply(res, {
            result: Global.msgCode.NETWORK_ERROR
        });
        return;
    }

    if (!FrozenMacMgr.shared.checkMAC(mac)) {
        Http.reply(res, {
            result: Global.msgCode.NETWORK_ERROR
        });
        return;
    }

    if (!WhiteListMgr.shared.checkIn(ip)) {
        Http.reply(res, {
            result: Global.msgCode.NETWORK_ERROR
        });
        return;
    }
    if (gametype == 'Debug') {

    } else {
        if (gametype == null || gametype == '') {
            Http.reply(res, {
                result: Global.msgCode.VERSION_ERROR
            });
            return;
        }
        if (gametype == 'Release') {
            if (version != Global.clientVersion) {
                Http.reply(res, {
                    result: Global.msgCode.VERSION_ERROR
                });
                return;
            }
        }
    }

    DB.accountLogin({
        account: account,
        password: password,
        ip: ip,
        mac: mac,
    }, (errorcode:any, dbdata:any) => {
        let retdata:any = {
            result: errorcode,
            accountid: 0,
        };
        if (errorcode == Global.msgCode.SUCCESS) {
            retdata.accountid = dbdata.accountid;
            retdata.account = dbdata.account;
            if (dbdata.state == 1) {
                retdata.result = Global.msgCode.NETWORK_ERROR;
            }

            if (dbdata.state == 0) {
                let token = TokenMgr.shared.makeSecret(dbdata.accountid);
                retdata.token = token;
            }
        }
        Http.reply(res, retdata);
    });
}


function changePassword (req:any, res:any) {
	let account = req.query.account;
	let safecode = req.query.safecode;
	let password = req.query.password;
	let verify = true;
	if (safecode.length < 4 || safecode.length > 12 || !/^[a-zA-Z0-9]*$/.test(safecode)) {
		verify = false;
	}
	if (account.length < 6 || account.length > 20 || !/^[a-zA-Z0-9]*$/.test(account) || /^[0-9]*$/.test(account)) {
		verify = false;
	}
	if (password.length < 6 || password.length > 20 || !/^[a-zA-Z0-9]*$/.test(password)) {
		verify = false;
	}
	if (!verify) {
		Http.reply(res, { errcode: Global.msgCode.FAILED });
	}
	else {
		DB.accountChangePassword({
			account: account,
			safecode: safecode,
			password: password,
		}, (ret:any) => {
			Http.reply(res, { errcode: ret });
		});
	}
}

function serList(req:any, res:any) {
    let accountid = req.query.accountid;

    let sList = ServerMgr.shared.getServerList();
    let serlist:any = {};
    for (const sid in sList) {
        if (sList.hasOwnProperty(sid)) {
            let server = sList[sid];
            let ser = {
                id: server.sid,
                servername: server.name,
                ip: 0, //net_ip,
                port: 0, //net_port,
            };
            serlist[ser.id] = ser;
        }
    }
    // 设置向导服
    let guide = Global.serverConfig.guideServerID;
    if (guide == 0) {
        guide = ServerMgr.shared.guide_server_id;
    }
    let retdata:any = {
        serlist: serlist,
        guide: [guide],
        rolelist: [],
    };
    DB.getServerListByAccountId(accountid, (errorcode:any, dbdata:any) => {
        if (errorcode == Global.msgCode.SUCCESS) {
            for (let data of dbdata) {
                let rinfo = {
                    accountid: data.accountid,
                    roleid: data.roleid,
                    name: data.name,
                    race: data.race,
                    sex: data.sex,
                    level: data.level,
                    serverid: data.serverid,
                    resid: data.resid,
                    mapid: data.mapid,
                };
                retdata.rolelist.push(rinfo);
            }
            retdata.result = errorcode;
        }
        Http.reply(res, retdata);
    });
}

function createRole(req:any, res:any) {
    let name = req.query.name;
    let race = req.query.race;
    let sex = req.query.sex;
    let accountid = req.query.accountid;
    let serverid = req.query.serverid;
    let resid = req.query.resid;

    let namelimit = ['江湖', '如来', '第一人'];
    for (const ln of namelimit) {
        if (name.indexOf(ln) != -1) {
            Http.reply(res, {
                result: Global.msgCode.ROLE_NAME_EXIST,
                roleid: 0,
            });
            return;
        }
    }
    let checkname = Global.checkLimitWord(name);
    if (!checkname) {
        Http.reply(res, {
            result: Global.msgCode.ROLE_NAME_EXIST,
            roleid: 0,
        });
        return;
    }
    let roleData = {
        name: name,
        race: race,
        sex: sex,
        accountid: accountid,
        serverid: serverid,
        resid: resid,
    };
    let nowtime = Date.now();
    let createtime = CraeteList[accountid * 10000 + serverid];
    if (createtime != null && (nowtime - createtime) < 10 * 1000) {
        res.end();
        return;
    }
    CraeteList[accountid * 10000 + serverid] = nowtime;
    DB.insertRole(roleData, (errorcode:any,roleId:any) => {
        delete CraeteList[accountid * 10000 + serverid];
        let retdata = {
            result: errorcode,
            roleid: roleId,
        };
        Http.reply(res, retdata);
        console.log("注册角色:",errorcode,roleId);
    });
}


function toServer(req:any,res:any){
    let accountid = req.query.accountid;
    let serverid = req.query.serverid;
    let token = TokenMgr.shared.getSecretByAccountId(accountid);
    if (token == null) {
        Http.reply(res, {
            result: Global.msgCode.LOGIN_FIRST,
        });
    } else {
		console.log("返回游戏服务器:",serverid);
        let server = ServerMgr.shared.getServer(serverid);
        if (server == null) {
            Http.reply(res, {
                result: Global.msgCode.Global.serverID_ERROR,
            });
        } else {
            console.log("返回游戏服务器:",server.fake_ip,server.net_port);
            Http.sendget(server.net_ip,server.http_port, '/loginToken', {
                accountid: accountid,
                token: token,
            }, (ret:any) => {
                Http.reply(res, {
                    result: Global.msgCode.SUCCESS,
                    ip: server.fake_ip,
                    port: server.net_port,
                    token: token,
                });
            });
        }
    }
}

function GETWX(req:any, res:any) {
    DB.dbGETWX((isback:any, dbdata:any) => {
        Http.reply(res, dbdata);
    });
}


function setChargeActivity (req:any, res:any) {
	let cur_tm = (new Date()).getTime();
	Http.reply(res, {
		errcode: (cur_tm < req.query.end)? 0:1,
	});
	if (cur_tm >= req.query.end) {
		return;
	}
    let ip = getClientIP(req);
    if (ip != Global.serverConfig.HTTP.IP) {
        return;
    }

	let send_data:any = {
		start: parseInt(req.query.start),
		end: parseInt(req.query.end),
	};
	let callback = (ret:any, data:any) => {
		// console.log(ret, data);
	};
	let serverid = req.query.serverid;
    let server_list = getServerListByServerid(serverid);
	for (let server of server_list) {
		Http.sendget(
			server.net_ip,
			server.http_port,
			'/setChargeActivity',
			send_data,
			callback
		);
		chargeActivityState[server.sid] = {
			state: 0,
			start: req.query.start,
			end: req.query.end,
		};
	}
}


function openChargeActivity (req:any, res:any) {
	Http.reply(res, {
		errcode: 0,
	});
    let ip = getClientIP(req);
    if (ip != Global.serverConfig.HTTP.IP) {
        return;
    }
	let serverid = req.query.serverid;
	if (serverid == 0) {
		let servers = ServerMgr.shared.getServerList();
		for (let key in servers) {
			if (chargeActivityState[key]) {
				chargeActivityState[key].state = 1;
			}
		}
	}
	else {
		if (chargeActivityState[serverid]) {
			chargeActivityState[serverid].state = 1;
		}
	}
}


function closeChargeActivity (req:any, res:any) {
	Http.reply(res, {
		errcode: 0,
	});
    let ip = getClientIP(req);
    if (ip != Global.serverConfig.HTTP.IP) {
        return;
    }
	let serverid = req.query.serverid;
	if (serverid == 0) {
		let servers = ServerMgr.shared.getServerList();
		for (let key in servers) {
			if (chargeActivityState[key]) {
				chargeActivityState[key].state = 0;
			}
		}
	}
	else {
		if (chargeActivityState[serverid]) {
			chargeActivityState[serverid].state = 0;
		}
	}

	let server_list = getServerListByServerid(serverid);
	let callback = (ret:any, data:any) => { 
		// console.log(ret, data);
	};
	for (let server of server_list) {
		Http.sendget(
			server.net_ip,
			server.http_port,
			'/closeChargeActivity',
			{},
			callback
		);
	}
}


function getChargeActivity (req:any, res:any) {
	Http.reply(res, chargeActivityState);
}


function charge(req:any, res:any) {
    //关闭充值
    // Http.reply(res, {errorcode: Global.msgCode.FAILED});
    // return;
    
    let roleid = req.query.roleid;
    let goodsid = req.query.goodsid;
    let goodscount = 1;
    let pay_bankcode = parseInt(req.query.pay_bankcode);
    let money = parseInt(req.query.money);
    Charge.shared.createOrder(roleid, goodsid, goodscount, pay_bankcode, money, chargeActivityState, (ret:any,data:any) => {
        let send_data = {
            errcode: (ret) ? Global.msgCode.SUCCESS : Global.msgCode.FAILED,
            data: data,
        };
        Http.reply(res, send_data);
    });
}


function charge_callback(req:any, res:any) {
    let orderid = req.query.orderid;
    let amount = req.query.amount;
    let ip = getClientIP(req);
    if (ip != Global.serverConfig.HTTP.IP) {
        console.log('尝试攻击服务器的订单', orderid);
        return;
    }

    if (orderList[orderid] != null) {
        console.log('订单正在处理', orderid);
        return;
    }
    orderList[orderid] = 0;

    DB.canFinishOrder(orderid, amount, (ret:any, list:any) => {
        if (!ret) {
            delete orderList[orderid];
            Http.reply(res, {
                errcode: Global.msgCode.FAILED
            });
        } else {
            let server = ServerMgr.shared.getServer(list.serverid);
            if (!server || !server.net_ip || !server.http_port) {
                delete orderList[orderid];
                res.end(JSON.stringify({
                    errcode: Global.msgCode.FAILED,
                }));
                return;
            }
            Http.sendget(server.net_ip, server.http_port, '/chargeCallback', {
                roleid: list.roleid,
                orderid: orderid,
                jade: list.jade,
                money: list.money,
            }, (ret:any, data:any) => {
                if (data.errcode == Global.msgCode.FAILED) { 
                    DB.finishOrder(orderid, (ret:any) => {
                        delete orderList[orderid];
                        if (ret) {
                            console.log('finishOrder success');
                            res.end(JSON.stringify({
                                errcode: Global.msgCode.SUCCESS,
                            }));
                        } else {
                            console.log('finishOrder failed');
                            res.end(JSON.stringify({
                                errcode: Global.msgCode.FAILED,
                            }));
                        }
                    });
                } else {
                    DB.setOrderFinish(orderid,(ret:any)=>{
                        delete orderList[orderid];
                        res.end(JSON.stringify({
                            errcode: ret ? Global.msgCode.SUCCESS : Global.msgCode.FAILED,
                        }));
                    });
                }
            });
        }
    });
}
// 获得公告
function getComment(req:any, res:any) {
    let serverId=0;
    if(req.serverId){
        serverId=req.serverId;
    }
    DB.getComment(serverId,(code:number,text:string)=>{
        Http.reply(res, {
            text: text,
        });
    });
}
// 设置公告
function setComment(req:any, res:any) {
    let serverId = req.query.serverId;
    if(!serverId){
        serverId=0;
    }
    let text:string=req.query.text;
    if(text.length<1){
        return;
    }
    text= decodeURI(text);
    DB.setComment(serverId,text,(code:number)=>{
        DB.setNotice(text);
        Http.reply(res,{
            code:code,
        });
    })
}

function SysNotice(req:any, res:any) {
    let text = req.query.text;
    let type = req.query.type; // 1 走马灯 2 聊天框 3 走马灯 + 聊天框
    let serverid = req.query.sid; // 0 则全服公告
    let times = req.query.times; // -1 则永久公告 需入库
    let interval = req.query.interval; // 单位 秒
    text = decodeURIComponent(text);

    let server_list = [];
    if (serverid == 0) {
        let servers = ServerMgr.shared.getServerList();
        for (let key in servers) {
            server_list.push(servers[key]);
        }
    } else {
        let server = ServerMgr.shared.getServer(serverid);
        if (server)
            server_list.push(server);
    }
    if (server_list.length == 0) {
        Http.reply(res, {
            ret: 'failed',
        });
        return;
    }
    Http.reply(res, {
        ret: 'success',
    });
    for (let server of server_list) {
        Http.sendget(server.net_ip, server.http_port, '/sysNotice', {
            text: text,
            type: type,
            times: times,
            interval: interval,
        }, (ret:any) => { });
    }
    if (times == -1)
        DB.addScrollNotice(serverid, type, text);
}

function onlineNum(req:any, res:any) {
    let numinfo = [];
    let list = ServerMgr.shared.getServerList();
    for (const sid in list) {
        if (list.hasOwnProperty(sid)) {
            const server = list[sid];
            let n = server.getPlayerNum();
            numinfo.push({
                id: server.sid,
                name: server.name,
                num: n,
            });
        }
    }
    Http.reply(res, {
        info: JSON.stringify(numinfo),
    });
}

function NotSpeak(req:any, res:any) {
    let roleid = req.query.roleid;
    let serverid = req.query.serverid;

    let pServer = ServerMgr.shared.getServer(serverid);
    if (null == pServer)
        return;
    Http.sendget(pServer.net_ip, pServer.http_port, '/setBanSpeak', {
        roleid: roleid,
        state: 1
    }, (ret:any) => { });
    Http.reply(res, {
        ret: 'success',
    });
}

function CanSpeak(req:any, res:any) {
    let roleid = req.query.roleid;
    let serverid = req.query.serverid;

    let pServer = ServerMgr.shared.getServer(serverid);
    if (null == pServer)
        return;

    Http.sendget(pServer.net_ip, pServer.http_port, '/setBanSpeak', {
        roleid: roleid,
        state: 0
    }, (ret:any) => { });


    Http.reply(res, {
        ret: 'success',
    });
}

function guideServer(req:any, res:any) {
    let serverid = req.query.serverid;

    let pServer = ServerMgr.shared.getServer(serverid);
    if (pServer == null || pServer.is_reg == false) {
        Http.reply(res, {
            ret: 'faild',
        });
        return;
    }

    DB.setGuideServerID(serverid);
    Global.serverConfig.guideServerID = serverid;
    Http.reply(res, {
        ret: 'success',
    });
}

function frozenIP(req:any, res:any) {
    let fip = req.query.frozenip;
    let ip = getClientIP(req);

    let list = ServerMgr.shared.getServerList();
    let find = false;
    for (const serverid in list) {
        const server = list[serverid];
        if (server.net_ip == ip) {
            find = true;
            break;
        }
    }

    if (!find) {
        console.log('尝试攻击服务器的封IP', fip);
        Http.reply(res, {
            ret: 'faild',
        });
        return;
    }
    FrozenIPMgr.shared.addFrozenIp(fip);
    //通知当前IP下的所有玩家下线
    DB.getFrozenIpRoleid(fip, (ret:any, ips:any) => {
        if (ret == Global.msgCode.SUCCESS) {
            let roleids = [];
            for (const ip of ips) {
                roleids.push(ip.roleid);
            }
            if (roleids.length == 1) {
                roleids.push(0);
            }
            ServerMgr.shared.sendAllServer('/kickedOut', {
                roleids: roleids,
            });
        }
    });

    Http.reply(res, {
        ret: 'success',
    });
}

function frozenMAC(req:any, res:any) {
    let accountid = req.query.accountid;
    let gmRoleid = req.query.gmRoleid;


    DB.freezeMAC({
        accountid: accountid,
        gmroleid: gmRoleid
    }, (ret:any, mac:any) => {
        if (ret == Global.msgCode.SUCCESS) {
            if (mac == null) {
                return;
            }
            FrozenMacMgr.shared.addFrozenMAC(mac);
            DB.getFrozenMacRoleid(mac, (ret:any, rows:any) => {
                if (ret == Global.msgCode.SUCCESS) {
                    let roleids = [];
                    for (const id of rows) {
                        roleids.push(id.roleid);
                    }
                    if (roleids.length == 1) {
                        roleids.push(0);
                    }
                    ServerMgr.shared.sendAllServer('/kickedOut', {
                        roleids: roleids,
                    });
                }
            });

            Http.reply(res, {
                ret: 'success',
            });
        }
    });
}

function agentUpdate(req:any, res:any) {
    GateAgentMgr.shared.ReadItemFromDB();
    Http.reply(res, {
        ret: 'success',
    });
}

function whiteip(req:any, res:any) {
    let wip = req.query.wip;
    let ip = getClientIP(req);
    if (!WhiteListMgr.shared.checkIn(ip) && ip != Global.serverConfig.HTTP.IP) {
        Http.reply(res, {
            ret: `error`,
        });
        return;
    }

    WhiteListMgr.shared.addWhiteIP(wip);
    Http.reply(res, {
        ret: `添加白名单[${wip}]成功`,
    });
}

function clearwip(req:any, res:any) {
    let ip = getClientIP(req);
    if (!WhiteListMgr.shared.checkIn(ip) && ip != Global.serverConfig.HTTP.IP) {
        Http.reply(res, {
            ret: `error`,
        });
        return;
    }
    WhiteListMgr.shared.clearAllIP();
    Http.reply(res, {
        ret: `清除白名单完成！所有ip均可登陆`,
    });
}

function clearPlayerCache(req:any, res:any) {
    let roleid = req.query.id;
    ServerMgr.shared.sendAllServer('/clearPCache', {
        roleid: roleid,
    });
    res.end(JSON.stringify({
        ret: `操作完成`,
    }));
}

let gate_list = {
    ['S_Register']: S_Register,
    ['S_Ping']: S_Ping,
    ['S_Guide']: S_Guide,
    ['register']: register,
    ['login']: login,
    ['createRole']: createRole,
    ['serList']: serList,
    ['toServer']: toServer,
    ['GETWX']: GETWX,
    ['charge']: charge,
    ['charge_callback']: charge_callback,
    ['gonggao']: getComment,
    ['setComment']: setComment,
    ['SysNotice']: SysNotice,
    ['onlineNum']: onlineNum,
    ['NotSpeak']: NotSpeak,
    ['CanSpeak']: CanSpeak,
    ['guideServer']: guideServer,
    ['frozenIP']: frozenIP,
    ['frozenmac']: frozenMAC,
    ['agentUpdate']: agentUpdate,
    ['whiteip']: whiteip,
    ['clearwip']: clearwip,
    ['clearPlayerCache']: clearPlayerCache,
    ['changePassword']: changePassword,
    ['setChargeActivity']: setChargeActivity,
    ['openChargeActivity']: openChargeActivity,
    ['closeChargeActivity']: closeChargeActivity,
    ['getChargeActivity']: getChargeActivity,
};

module.exports = gate_list;
