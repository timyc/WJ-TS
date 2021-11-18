
import mysql, { MysqlError } from "mysql";
import Global from "../game/core/Global";
import EquipMgr from "../game/object/EquipMgr";
import PetMgr from "../game/core/PetMgr";
import DBFrom from "./DBForm";
import MountModel from "../game/mount/MountModel";

DBFrom.shared;

export default class DB {

    static pool: mysql.Pool;

    static nop(a: any, b: any, c: any, d: any, e: any, f: any, g: any) {
    }

    static init(config: any) {
        DB.pool = mysql.createPool({
            host: config.HOST,
            user: config.USER,
            password: config.PWD,
            database: config.DB,
            port: config.PORT,
            timeout: 60 * 60 * 1000,
        });
    };

    static query(sql: string, callback: Function) {
        // DB.pool.getConnection((err: MysqlError, conn: mysql.PoolConnection)=>{
        //     if (err) {
        //         callback(err, null, null);
        //     } else {
        //         conn.query(sql, function (qerr:any, vals:any, fields:any) {
        //             //释放连接
        //             conn.release();
        //             //事件驱动回调  
        //             if(callback){
        //                 callback(qerr, vals, fields);
        //             }else{
        //                 console.log("回调不能为空");
        //             }
        //         });
        //     }
        // });
        DBFrom.shared.query(sql,callback);
    };
    static set(key: any, value: any, callback: any) {
        callback = callback == null ? DB.nop : callback;
        if (key == null) {
            callback(null);
            return;
        }
        var sql = 'insert into t_tbl( t_key, t_value )values(' + key + ',' + value + ')ON DUPLICATE KEY UPDATE t_value = ' + value + ';';
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(null);
                throw err;
            }
            if (rows.length == 0) {
                callback(null);
                return;
            }
            callback(true);
        });
    };

    static get(key:any, callback:any) {
        callback = callback == null ? DB.nop : callback;
        if (key == null) {
            callback(null);
            return;
        }
        var sql = 'select * from t_tbl where t_key = ' + key + ';';
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(null);
                throw err;
            }
            if (rows.length == 0) {
                callback(null);
                return;
            }
            callback(rows[0].t_value);
        });
    };

    static updateLoginInfo(accountid:any, ip:any, mac:any) {
        var sql = `UPDATE qy_account SET last_login_time = now(), login_ip = '${ip}', mac = '${mac}' WHERE accountid =${accountid};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                throw err;
            }
        })
    }

    static accountLogin(logininfo:any, callback:any){
        console.log(logininfo, 'logininfo');

        let account = logininfo.account;
        let password = logininfo.password;
        let ip = logininfo.ip == null ? "" : logininfo.ip;
        let mac = logininfo.mac;

        callback = callback == null ? DB.nop : callback;
        if (account == null || password == null) {
            callback(Global.msgCode.FAILED);
            return;
        }
        console.log(account, 'account');
        console.log(password, 'password');
        var sql = `SELECT * FROM qy_account WHERE account = '${account}';`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            if (rows.length > 0) {
                let playerdbinfo = rows[0];
                if (password == playerdbinfo.password) {
                    callback(Global.msgCode.SUCCESS, playerdbinfo);
                    DB.updateLoginInfo(playerdbinfo.accountid, ip, mac);
                } else {
                    callback(Global.msgCode.LOGIN_ACCOUNT_PWD_ERROR);
                }
            }
            if (rows.length == 0) {
                callback(Global.msgCode.LOGIN_ACCOUNT_PWD_ERROR);
            }
        })
    }
    // 帐号注册
    static accountRegister(register_info:any, callback:any){
        let account = register_info.account;
        let password = register_info.password;
        let invitecode = register_info.invitecode;
        var sql = `SELECT * FROM qy_account WHERE account = '${account}';`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            if (rows.length > 0) {
                callback(Global.msgCode.REGISTER_ACCOUNT_REPEAT);
                return;
            } else {
                sql = `INSERT INTO qy_account(account, password,invite, register_time) VALUES('${account}', '${password}','${invitecode}', NOW() );`;
                DB.query(sql, function (err: any, rows: any, fields: any) {
                    if (err) {
                        callback(false, {});
                        throw err;
                    }
                    callback(Global.msgCode.SUCCESS);
                });
            }
        });
    }

    
    static accountChangePassword = (data: any, callback: any) => {
        let account = data.account;
        let safecode = data.safecode;
        let password = data.password;
        let sql = `update qy_account set password = '${password}' where account = '${account}' and safecode like '_:${safecode}';`;
        DB.query(sql, (err:any) => {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            else {
                callback(Global.msgCode.SUCCESS);
            }
        });
    };

    static getFrozenList(callback: any) {
        var sql = `SELECT frozenip FROM ip_frozen;`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED, []);
                throw err;
            }
            if (rows.length == 0) {
                callback(Global.msgCode.FAILED, []);
                return;
            }
            callback(Global.msgCode.SUCCESS, rows);
        });
    }
    static getFrozenIpRoleid(ip:any, callback:any) {
        var sql = `SELECT accountid FROM qy_account WHERE login_ip = '${ip}';`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED, []);
                throw err;
            }
            if (rows.length == 0) {
                callback(Global.msgCode.FAILED, []);
                return;
            }

            let accounts = '';
            for (const id of rows) {
                accounts = accounts + id.accountid + ',';
            }
            accounts = accounts.substr(0, accounts.length - 1); //.splice(-1);

            sql = `SELECT roleid FROM qy_role WHERE accountid in (${accounts});`;
            DB.query(sql, function (err: any, rows: any, fields: any) {
                if (err) {
                    callback(Global.msgCode.FAILED, []);
                    throw err;
                }
                if (rows.length == 0) {
                    callback(Global.msgCode.FAILED, []);
                    return;
                }
                callback(Global.msgCode.SUCCESS, rows);
            });
        });
    }

    static freezeIP = (accountid:any, callback:any) => {
        var sql = `SELECT login_ip FROM qy_account WHERE accountid = '${accountid}';`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            if (rows.length == 0) {
                callback(Global.msgCode.FAILED);
                return;
            }
            let fip = rows[0].login_ip;
            sql = `SELECT * FROM ip_frozen WHERE frozenip = '${fip}';`;
            DB.query(sql, function (err: any, rows: any, fields: any) {
                if (err) {
                    callback(Global.msgCode.FAILED);
                    throw err;
                }
                if (rows.length > 0) {
                    callback(Global.msgCode.SUCCESS, 0);
                    return;
                }
                sql = `INSERT INTO ip_frozen(accountid, frozenip, frozentime) VALUES('${accountid}', '${fip}', NOW());`;
                DB.query(sql, function (err: any, rows: any, fields: any) {
                    if (err) {
                        callback(Global.msgCode.FAILED);
                        throw err;
                    }
                    callback(Global.msgCode.SUCCESS, fip);
                });
            });
        });
    }

    static getFrozenMacList = (callback:any) => {
        var sql = `SELECT mac FROM mac_frozen;`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED, []);
                throw err;
            }
            if (rows.length == 0) {
                callback(Global.msgCode.FAILED, []);
                return;
            }
            callback(Global.msgCode.SUCCESS, rows);
        });
    }

    static clearFrozenMacTabel = (callback:any) => {
        let sql = `truncate mac_frozen;`
        DB.query(sql, (err: any, rows: any, fields: any) => {
            if (err) {
                throw err;
            }
            callback(Global.msgCode.SUCCESS, rows);
        });
    };

    static getFrozenMacRoleid(mac:any, callback:any) {
        var sql = `SELECT accountid FROM qy_account WHERE mac = '${mac}';`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED, []);
                throw err;
            }
            if (rows.length == 0) {
                callback(Global.msgCode.FAILED, []);
                return;
            }

            let accounts = '';
            for (const id of rows) {
                accounts = accounts + id.accountid + ',';
            }
            accounts = accounts.substr(0, accounts.length - 1); //.splice(-1);

            sql = `SELECT roleid FROM qy_role WHERE accountid in (${accounts});`;
            DB.query(sql, function (err: any, rows: any, fields: any) {
                if (err) {
                    callback(Global.msgCode.FAILED, []);
                    throw err;
                }
                if (rows.length == 0) {
                    callback(Global.msgCode.FAILED, []);
                    return;
                }
                callback(Global.msgCode.SUCCESS, rows);
            });
        });
    }

    static freezeMAC = (info:any, callback:any) => {
        let accountid = info.accountid;
        let gmroleid = info.gmroleid;
        let sql = `SELECT mac FROM qy_account WHERE accountid = '${accountid}';`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            if (rows.length == 0) {
                callback(Global.msgCode.FAILED);
                return;
            }
            let mac = rows[0].mac;
            sql = `SELECT * FROM mac_frozen WHERE mac = '${mac}';`;
            DB.query(sql, function (err: any, rows: any, fields: any) {
                if (err) {
                    callback(Global.msgCode.FAILED);
                    throw err;
                }
                if (rows.length > 0) {
                    //暂时改为
                    callback(Global.msgCode.SUCCESS, mac);
                    return;
                }
                sql = `INSERT INTO mac_frozen(GM, mac, time) VALUES('${gmroleid}', '${mac}', NOW());`;
                DB.query(sql, function (err: any, rows: any, fields: any) {
                    if (err) {
                        callback(Global.msgCode.FAILED);
                        throw err;
                    }
                    callback(Global.msgCode.SUCCESS, mac);
                });
            });
        });
    }

    static getServerListByAccountId = (accountid:any, callback:any) => {
        var sql = `SELECT * FROM qy_role WHERE accountid = ${accountid};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            callback(Global.msgCode.SUCCESS, rows);
        });
    }
    // 插入坐骑
    static insertRole(roleInfo:any, callback:Function){
        var sql = `SELECT * FROM qy_role WHERE (accountid = '${roleInfo.accountid}' OR name = '${roleInfo.name}') AND serverid = '${roleInfo.serverid}';`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED,null);
                throw err;
            }
            if (rows.length > 0) {
                if (rows[0].name == roleInfo.name) {
                    callback(Global.msgCode.ROLE_NAME_EXIST,null);
                } else {
                    callback(Global.msgCode.FAILED,null);
                }
            }
            if (rows.length == 0) {
                sql = `INSERT INTO qy_role(name, race, sex, level, resid, mapid, x, y, create_time, accountid,serverid,money,taskstate) VALUES('${roleInfo.name}', '${roleInfo.race}','${roleInfo.sex}',1,'${roleInfo.resid}',1010,-1,-1, NOW(),'${roleInfo.accountid}','${roleInfo.serverid}',0,'[]' );`;
                DB.query(sql, function (err: any, rows: any) {
                    if (err) {
                        callback(Global.msgCode.FAILED,0);
                        throw err;
                    }
                    if (rows.length <1) {
                        callback(Global.msgCode.FAILED,0);
                        return;
                    }
                    DB.insertMount(roleInfo,(err:any,rows:any)=>{
                        if (err) {
                            callback(Global.msgCode.FAILED,0);
                            throw err;
                        }
                        callback(Global.msgCode.SUCCESS,0);
                        return;
                    });
                });
            }
        })
    }

    static insertMount(roleId:number, callback:Function){
        let list=MountModel.shared.getAllList();
        let count:number=0;
        let end:number=list.length;
        let hasError:boolean=false;
        for(let item of list){
            let sql=`INSERT INTO dhxy_mount (roleid,resid,race,name,level) VALUES(${roleId},${item.resid},${item.race},'${item.name}',${item.level});`;
            DB.query(sql,(err:any,rows:any)=>{
                count++;
                if(err || !rows){
                    hasError=true;
                    callback(err,null);
                    throw (err);
                }
                if(count==end){
                    if(hasError){
                        callback(err,null);
                    }else{
                        callback(err.rows);
                    }
                }
            })
        }
    }

    static changeName(info:any, callback:any){
        var sql = `SELECT * FROM qy_role WHERE name = '${info.name}';`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            if (rows.length > 0) {
                callback(Global.msgCode.ROLE_NAME_EXIST);
            }
            if (rows.length == 0) {
                sql = `UPDATE qy_role SET name = '${info.name}' WHERE roleid = ${info.roleid};`;
                DB.query(sql, function (err: any, rows: any, fields: any) {
                    if (err) {
                        callback(Global.msgCode.FAILED);
                        throw err;
                    }
                    callback(Global.msgCode.SUCCESS);
                });
            }
        })
    }

    static updateLastOnlineTime(roleid:any) {
        let sql = `UPDATE qy_role SET lastonline = FROM_UNIXTIME(${Math.ceil(Global.gTime / 1000)}) WHERE roleid =${roleid};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                throw err;
            }
        })
    }

    static getRoleByAccountId(accountid:any, callback:any){
        var sql = `SELECT * FROM qy_role WHERE accountid = ${accountid} AND serverid = ${Global.serverID};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            if (rows.length > 0) {
                let role = rows[0];
                // updateLastOnlineTime(role.roleid)
                role.equipdata = {};
                sql = `SELECT * FROM qy_equip_${Global.serverID} WHERE RoleID = ${role.roleid} AND state != 0;`;
                DB.query(sql, function (err: any, rows: any, fields: any) {
                    if (err) {
                        callback(Global.msgCode.SUCCESS, role);
                        throw err;
                    }
                    for (const info of rows) {
                        role.equipdata[info.EquipID] = info;
                    }
                    callback(Global.msgCode.SUCCESS, role);
                });
            } else {
                callback(Global.msgCode.FAILED);
            }
        });
    }
    // 登录角色
    static loginByRoleid(roleid: any, callback: any) {
        let sql = `SELECT qy_account.safecode, qy_role.* FROM qy_account, qy_role WHERE qy_role.roleid = ${roleid} and qy_account.accountid = qy_role.accountid;`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            if (rows.length > 0) {
                let role:any = rows[0];
                role.equipdata = {};
                sql = `SELECT * FROM qy_equip_${Global.serverID} WHERE RoleID = ${role.roleid} AND state != 0;`;
                DB.query(sql, (err: any, rows: any)=>{
                    if (err) {
                        callback(Global.msgCode.SUCCESS, role);
                        throw err;
                    }
                    for (let info of rows) {
                        role.equipdata[info.EquipID] = info;
                    }
                    // 读取坐骑
                    sql=`SELECT * FROM dhxy_mount WHERE roleid=${role.roleid};`;
                    DB.query(sql,(err:any,rows:any)=>{
                        if(err){
                            callback(Global.msgCode.SUCCESS, role);
                            throw err;
                        }
                        if(rows.length<1){
                            DB.insertMount(roleid,(err:any,rows:any)=>{
                                if(err){
                                    callback(Global.msgCode.FAILED,role);
                                }
                                role.mountList=rows;
                                callback(Global.msgCode.SUCCESS,role);
                            });
                            return;
                        }
                        role.mountList=rows;
                        callback(Global.msgCode.SUCCESS,role);
                    });
                });
            } else {
                callback(Global.msgCode.FAILED,null);
            }
        });
    };

    static getRoleByRoleId(roleid: any, callback: any) {
        let sql = `SELECT * FROM qy_role WHERE roleid = ${roleid};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            if (rows.length <= 0) {
                callback(Global.msgCode.FAILED);
                return;
            }
            let roleinfo = rows[0];
            callback(Global.msgCode.SUCCESS, roleinfo);
        });
    }

    static savePlayerInfo(roleid:any, roleinfo:any, callback:any){
        if (callback == null) callback = DB.nop;
        let addpoint = JSON.stringify(roleinfo.addpoint);
        let pet = roleinfo.pet;
        // let equipstr = JSON.stringify(roleinfo.equiplist);
        let bagitem = JSON.stringify(roleinfo.bagitem);
        let taskstate = JSON.stringify(roleinfo.taskstate);
        let partnerlist = roleinfo.partnerlist;
        let lockeritem = JSON.stringify(roleinfo.lockeritem);
        let skill = JSON.stringify(roleinfo.skill);
        let relivelist = JSON.stringify(roleinfo.relivelist);
        let money = roleinfo.money;
        let jade = roleinfo.jade;
        let exp = roleinfo.exp;
        let level = roleinfo.level;
        let relive = roleinfo.relive;
        let sex = roleinfo.sex;
        let resid = roleinfo.resid;
        let race = roleinfo.race;
        let xiulevel = roleinfo.xiulevel;
        let xiupoint = JSON.stringify(roleinfo.xiupoint);
        let shane = roleinfo.shane;
        let flag = roleinfo.flag;
        let level_reward = roleinfo.level_reward;
        let rewardrecord = roleinfo.rewardrecord;
        let getgift = roleinfo.getgift;
        let shuilu = JSON.stringify(roleinfo.shuilu);
        let color = JSON.stringify(roleinfo.color);
        let active_scheme_name = roleinfo.active_scheme_name;
        let friendlist = JSON.stringify(roleinfo.friendlist);
        let star = roleinfo.star;

        let sql = `UPDATE qy_role SET mapid = ${roleinfo.mapid}, x = ${roleinfo.x}, y = ${roleinfo.y}, bangid = ${roleinfo.bangid},
                    addpoint = '${addpoint}', pet = ${pet}, equiplist = NULL, bagitem = '${bagitem}', star = '${star}',
                    lockeritem = '${lockeritem}',taskstate = '${taskstate}', sex = ${sex}, resid = ${resid}, friendlist = '${friendlist}',
                    partnerlist = '${partnerlist}', skill = '${skill}', relivelist = '${relivelist}', race = ${race},state = ${flag},
                    money =${money}, jade = ${jade}, exp = ${exp}, level = ${level}, xiulevel = ${xiulevel}, xiupoint = '${xiupoint}',
                    rewardrecord = ${rewardrecord}, getgift = ${getgift}, shuilu = '${shuilu}', title = '${roleinfo.titles}', color = '${color}',
                    relive = ${relive}, shane = ${shane}, level_reward = '${level_reward}',active_scheme_name = '${active_scheme_name}', lastonline = FROM_UNIXTIME(${Math.ceil(Global.gTime / 1000)})
                    WHERE roleid = ${roleid};`;
        sql += roleinfo.equipinfo;

        DB.query(sql, (err: any, rows: any, fields: any) => {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            callback(Global.msgCode.SUCCESS);
        });
    };


    static getFriends(roleid: any, callback: any) { //state=1 已验证的好友  state=0未验证的好友
        var sql = `SELECT * FROM qy_friends WHERE ((roleidA = '${roleid}' OR roleidB = '${roleid}') AND state = 1) OR (roleidB = '${roleid}' AND state = 0);`;
        let friendsList:any = [];
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED, friendsList);
                throw err;
            }

            if (Array.isArray(rows) == false) {
                callback(Global.msgCode.FAILED, friendsList);
            }

            if (rows.length <= 0) {
                callback(Global.msgCode.FAILED, friendsList);
            } else {
                for (const info of rows) {
                    if (info.roleidA == roleid) {
                        friendsList.push({
                            friendid: info.id,
                            roleid: info.roleidB,
                            name: info.nameB,
                            resid: info.residB,
                            relive: info.reliveB,
                            level: info.levelB,
                            race: info.raceB,
                            sex: info.sexB,
                            accountid: info.accountidB,
                            state: info.state,
                        });
                    } else if (info.roleidB == roleid) {
                        friendsList.push({
                            friendid: info.id,
                            roleid: info.roleidA,
                            name: info.nameA,
                            resid: info.residA,
                            relive: info.reliveA,
                            level: info.levelA,
                            race: info.raceA,
                            sex: info.sexA,
                            accountid: info.accountidA,
                            state: info.state,
                        });
                    }
                }
                callback(Global.msgCode.SUCCESS,friendsList);
            }
        });
    }

    static updateFriends(friendid:any, roleid:any, operation:any, callback:any) { //operation 0：删除 1：同意 2：拒绝 3：全部同意 4：全部拒绝
        var sql = `UPDATE qy_friends SET state = '1' WHERE id =${friendid};`;
        if (operation == 0 || operation == 2) {
            sql = `DELETE FROM qy_friends WHERE id =${friendid};`;
        } else if (operation == 3) {
            sql = `UPDATE qy_friends SET state = '1' WHERE roleidB =${roleid};`;
        } else if (operation == 4) {
            sql = `DELETE FROM qy_friends WHERE roleidB = ${roleid} AND state = 0;`;
        }
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED, []);
                throw err;
            }
            DB.getFriends(roleid, callback);
        });
    }

    static searchRoles(info: any, callback: any) {
        let sql = `SELECT serverid, level FROM qy_role WHERE roleid = ${info.roleid}`;
        let playerList: any = [];
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED, playerList);
                throw err;
            }
            if (rows.length <= 0) {
                callback(Global.msgCode.FAILED, playerList);
            } else {
                let serverid = rows[0].serverid;
                sql = `SELECT * FROM qy_role WHERE serverid = ${serverid} AND roleid != ${info.roleid} AND (name LIKE '%${info.data}%' OR roleid = '${info.data}') AND (SELECT COUNT(1) FROM qy_friends WHERE (qy_friends.roleidA = ${info.roleid} AND qy_friends.roleidB = qy_role.roleid) OR (qy_friends.roleidB = ${info.roleid} AND qy_friends.roleidA = qy_role.roleid)) = 0 ORDER BY RAND() LIMIT 10;`;
                if (info.type == 0) {
                    let maxLevel = rows[0].level + 30;
                    let minLevel = rows[0].level - 30;
                    sql = `SELECT * FROM qy_role WHERE serverid = ${serverid} AND roleid != ${info.roleid} AND level > ${minLevel} AND level < ${maxLevel} AND (SELECT COUNT(1) FROM qy_friends WHERE (qy_friends.roleidA = ${info.roleid} AND qy_friends.roleidB = qy_role.roleid) OR (qy_friends.roleidB = ${info.roleid} AND qy_friends.roleidA = qy_role.roleid)) = 0 ORDER BY RAND() LIMIT 10;`;
                }
                DB.query(sql, function (err: any, rows: any, fields: any) {
                    if (err) {
                        callback(Global.msgCode.FAILED, playerList);
                        throw err;
                    }

                    if (rows.length <= 0) {
                        callback(Global.msgCode.FAILED, playerList);
                    } else {
                        for (const info of rows) {
                            playerList.push({
                                roleid: info.roleid,
                                name: info.name,
                                resid: info.resid,
                                level: info.level,
                                relive: info.relive,
                                race: info.race,
                                sex: info.sex,
                            });
                        }
                        callback(Global.msgCode.SUCCESS, playerList);
                    }
                });
            }
        });
    }

    static addFriends(pinfo: any, callback: any) {
        if (pinfo.roleidA == pinfo.roleidB) {
            callback(Global.msgCode.FAILED);
            return;
        }
        let sql = `SELECT * FROM qy_friends WHERE (roleidA = '${pinfo.roleidA}' AND roleidB = '${pinfo.roleidB}') OR (roleidA = '${pinfo.roleidB}' AND roleidB = '${pinfo.roleidA}');`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }

            if (Array.isArray(rows) == false) {
                callback(Global.msgCode.FAILED);
            }

            if (rows.length > 0) {
                callback(Global.msgCode.FAILED);
            } else {
                let roleinfoA: any = {};
                let roleinfoB: any = {};
                DB.getRoleByRoleId(pinfo.roleidA, (ret: any, dbdata: any) => {
                    if (ret == Global.msgCode.SUCCESS) {
                        roleinfoA = dbdata;
                        DB.getRoleByRoleId(pinfo.roleidB, (ret: any, dbdata: any) => {
                            if (ret == Global.msgCode.SUCCESS) {
                                roleinfoB = dbdata;
                                let sql = `INSERT INTO qy_friends(roleidA, nameA, residA, reliveA, levelA, raceA, sexA, accountidA, roleidB, nameB, residB, reliveB, levelB, raceB, sexB, accountidB, state, time) VALUES('${roleinfoA.roleid}', '${roleinfoA.name}', '${roleinfoA.resid}', '${roleinfoA.relive}', '${roleinfoA.level}', '${roleinfoA.race}', '${roleinfoA.sex}', '${roleinfoA.accountid}', '${roleinfoB.roleid}', '${roleinfoB.name}', '${roleinfoB.resid}', '${roleinfoB.relive}', '${roleinfoB.level}', '${roleinfoB.race}', '${roleinfoB.sex}', '${roleinfoB.accountid}', 0, NOW());`;
                                DB.query(sql, function (err: any, rows: any, fields: any) {
                                    if (err) {
                                        callback(Global.msgCode.FAILED);
                                        throw err;
                                    }
                                    callback(Global.msgCode.SUCCESS);
                                });
                            } else {
                                callback(ret);
                            }
                        });
                    } else {
                        callback(ret);
                    }
                });
            }
        });
    }

    static updateBang(bangInfo: any, callabck: any) {
        let sql = `UPDATE qy_bang SET rolenum = ${bangInfo.rolenum} WHERE bangid =${bangInfo.bangid};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                throw err;
            }
            if (callabck) {
                callabck();
            }
        });
    }

    static updateBangBidding(bangid: any, bidding: any) {
        let sql = `UPDATE qy_bang SET bidding = ${bidding} WHERE bangid =${bangid};`;
        DB.query(sql, function (err: any, rows: any, fields: any) { });
    }

    static deleteBang(bangid: any) {
        let sql = `UPDATE qy_bang SET state = 0 WHERE bangid =${bangid};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                throw err;
            }
        });
        // var sql = `DELETE FROM qy_bang WHERE bangid = ${bangid};`;
        // query(sql, function (err:any, rows:any, fields:any) {
        //     if (err) {
        //         throw err;
        //     }
        // });
    }

    static getBangList(callback: any) {
        let sql = `SELECT * FROM qy_bang WHERE state = 1 and serverid = ${Global.serverID};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            // if (rows.length == 0) {//没有帮派信息
            //     callback(Global.msgCode.FAILED);
            //     return;
            // }
            callback(Global.msgCode.SUCCESS, rows);
        });
    }

    static getBangRoles(callback: any) {
        let sql = `SELECT roleid, name, resid, relive, level, race, sex, bangid FROM qy_role WHERE bangid <> 0 AND serverid = ${Global.serverID};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            let tlist: any = {};
            for (const info of rows) {
                if (tlist[info.bangid] == null) {
                    tlist[info.bangid] = [];
                }
                tlist[info.bangid].push(info);
            }
            callback(Global.msgCode.SUCCESS, tlist);
        });
    }

    static updatePlayerBangID = function (roleid: any, bangid: any, callback: any) {
        if (callback == null) {
            callback = DB.nop;
        }
        let sql = `UPDATE qy_role SET bangid = ${bangid} WHERE roleid = ${roleid}`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                console.log(sql);
                throw err;
            }
        });
    }

    static getBangMaxId(callback: any) {
        let sql = `SELECT MAX(bangid) AS bangId FROM qy_bang WHERE serverid = ${Global.serverID};`;
        DB.query(sql, (err: any, rows: any) => {
            if (err) {
                callback(Global.msgCode.FAILED);
                console.log('ERROR', err);
                throw err;
            }

            callback(Global.msgCode.SUCCESS, rows[0].bangId);
        });
    }

    static createBang(bangInfo: any, callback: any) {
        let sql = `INSERT INTO qy_bang(bangid,name, aim, masterid, mastername, createtime, state, serverid) 
            VALUES(${bangInfo.bangid},'${bangInfo.name}', '${bangInfo.aim}','${bangInfo.masterid}','${bangInfo.mastername}', NOW(), 1, ${Global.serverID});`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                console.log('ERROR', sql);
                throw err;
            }
            if (rows.length == 0) {
                callback(Global.msgCode.FAILED);
                return;
            }
            callback(Global.msgCode.SUCCESS, rows.insertId);
        });
    }

    static createPet(petInfo: any, callback: any) {
        let sql = `INSERT INTO qy_pet_${Global.serverID}(petid, name, resid, dataid, grade, roleid, rate, hp, mp, atk, spd, wuxing, create_time) VALUES(${petInfo.petid}, '${petInfo.name}', ${petInfo.resid}, ${petInfo.dataid}, ${petInfo.grade}, ${petInfo.ownid}, ${petInfo.rate}, ${petInfo.hp}, ${petInfo.mp}, ${petInfo.atk}, ${petInfo.spd}, '${petInfo.wuxing}', NOW());`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                console.log(sql);
                throw err;
            }
            callback(Global.msgCode.SUCCESS)
        });
    }

    static getPetList(roleid: any, callback: any) {
        let sql = `SELECT * FROM qy_pet_${Global.serverID} WHERE roleid = ${roleid} and state = 1 limit ${Global.limitPetNum}`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                console.log(sql);
                throw err;
            }
            callback(Global.msgCode.SUCCESS, rows);
        });
    }

    static getPetByID(petid: any, callback: any) {
        let sql = `SELECT * FROM qy_pet_${Global.serverID} WHERE petid = ${petid}`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                console.log(sql);
                throw err;
            }
            if (rows.length == 0) {
                callback(Global.msgCode.FAILED);
                return;
            }
            callback(Global.msgCode.SUCCESS, rows[0]);
        });
    }

    static delPet(petid: any, callback: any) {
        let sql = `UPDATE qy_pet_${Global.serverID} SET state = 0, delete_time = NOW() WHERE petid =${petid};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            // if (err) {
            //     callback(Global.msgCode.FAILED);
            //     throw err;
            // }
        });
    }

    static savePetInfo(petid: any, petinfo: any, callback: any) {
        let updatestr = '';
        for (const key in petinfo) {
            let value = petinfo[key];
            if (typeof (value) == 'number') {
                updatestr += `${key} = ${value}, `
            } else if (typeof (value) == 'string') {
                updatestr += `${key} = '${value}', `
            }
        }
        updatestr = updatestr.substr(0, updatestr.length - 2);
        let sql = `UPDATE qy_pet_${Global.serverID} SET ${updatestr} WHERE petid = ${petid}`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                console.log(sql);
                throw err;
            }
            callback(Global.msgCode.SUCCESS);
        });
    }

    static getEquipMaxId() {
        let sql = `SELECT MAX(EquipID) AS equipid FROM qy_equip_${Global.serverID};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            EquipMgr.shared.setMaxEquipID(rows[0].equipid);
        });
    }

    static getPetMaxId() {
        let sql = `SELECT MAX(petid) AS petid FROM qy_pet_${Global.serverID};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            PetMgr.shared.setMaxPetSeed(rows[0].petid);
        });
    }

    static createEquip(roleid: any, equiparr: any, callback: any) {
        let equipdata = EquipMgr.shared.getInsertData(equiparr, roleid);
        let sql = `INSERT INTO qy_equip_${Global.serverID}(${equipdata.fieldstr}) VALUES(${equipdata.valuestr});`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                console.log(sql);
                throw err;
            }
            callback(Global.msgCode.SUCCESS);
        });
    }

    static getEquipByEquipID(equipid: any, callback: any) {
        let sql = `SELECT * FROM qy_equip_${Global.serverID} WHERE EquipID = ${equipid};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                console.log(sql);
                throw err;
            }
            if (rows.length == 0) {
                callback(Global.msgCode.FAILED);
                return;
            }
            callback(Global.msgCode.SUCCESS, rows[0]);
        });
    }

    static delEquip(equipid: any, callback: any) {
        let sql = `UPDATE qy_equip_${Global.serverID} SET state = 0, delete_time = NOW() WHERE EquipID =${equipid};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            // if (err) {
            //     callback(Global.msgCode.FAILED);
            //     throw err;
            // }
        });
    }

    static saveEquipInfo = (equipid: any, savedata: any, callback: any) => {
        let numlist = ['pos', 'Grade', 'Type', 'GemCnt', 'EIndex'];
        let updatestr = '';
        for (const key in savedata) {
            if (numlist.indexOf(key) == -1) {
                updatestr += `${key} = '${savedata[key]}', `
            } else {
                updatestr += `${key} = ${savedata[key]}, `
            }
        }
        updatestr = updatestr.substr(0, updatestr.length - 2);

        let sql = `UPDATE qy_equip_${Global.serverID} SET ${updatestr} WHERE EquipID = ${equipid}`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                console.log(sql);
                throw err;
            }
            callback(Global.msgCode.SUCCESS);
        });
    }

    static dbGETWX(callback: any) {
        let sql = `SELECT * FROM qy_wx`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                console.log(sql);
                return
            }
            callback(true, rows);
        });
    }

    static getPet(roleid: any) {
        let sql = `UPDATE qy_role SET getpet = 1 WHERE roleid =${roleid}`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                console.log('ERROR', err);
                console.log(sql);
                return
            }
        });
    }

    
    static createChargeOrder(orderid: any, roleid: any, money: any, jade: any, count: any, goodsid: any, activitystates: any, callback: any) {
        DB.getRoleByRoleId(roleid, (errcode: any, role: any) => {
            if (errcode == Global.msgCode.SUCCESS) {
                let server_id = role.serverid;
                if (activitystates[server_id] && activitystates[server_id].state == 1) { // 双倍活动 
                    jade *= 2;
                }
                let sql = `insert into charge_record (orderid, roleid, money, jade, goodscount, goodsid, create_time, serverid) values ('${orderid}', ${roleid}, ${money}, ${jade}, ${count}, ${goodsid}, NOW(), ${server_id});`;
                DB.query(sql, (err: any, packet: any) => {
                    if (err) {
                        callback(false);
                        console.log(sql);
                        throw (err);
                    } else
                        callback(true);
                });
            } else
                callback(false);
        });
    };

    
    static canFinishOrder(orderid: any, money: any, callback: any) {
        DB.query(`select * from charge_record where finish_time is null and orderid = '${orderid}';`, (err: any, rows: any) => {
            if (err) {
                console.log(`查询订单${orderid}失败！`);
                callback(false);
                throw (err);
            }
            if (rows.length == 0) {
                console.log(`未查询到订单${orderid}!`);
                callback(false);
            } else {
                if (rows[0].money == money) {
                    callback(true, rows[0]);
                } else {
                    DB.query(`update charge_record set finish_time = now(), realmoney = ${money}, status = 0 where orderid = '${orderid}';`,(ret:any)=>{});
                    console.log(`订单${orderid}充值金额错误！`);
                }
            }
        });
    };

    
    static finishOrder(orderid: any, callback: any) {
        DB.query(`select * from charge_record where finish_time is null and orderid = '${orderid}';`, (err: any, rows: any) => {
            if (err) {
                console.log(`完成订单${orderid}失败，查询订单错误！`);
                callback(false);
                throw (err);
            }
            if (rows.length == 0) {
                console.log(`完成订单${orderid}失败，未找到订单！`);
                callback(false);
            } else {
                let roleid = rows[0].roleid;
                let jade = rows[0].jade;
                let money = rows[0].money;
                DB.query(`update charge_record set finish_time = NOW(), realmoney = money, status = 1 where orderid = '${orderid}' and finish_time is null;`, (err: any, packet: any) => {
                    if (err) {
                        console.log(`完成订单${orderid}时失败！`);
                        callback(false);
                        throw (err);
                    }
                    if (packet.affectedRows == 0) {
                        console.log(`完成订单${orderid}时失败！`);
                        callback(false);
                    } else {
                        DB.query(`update qy_role set jade = jade + ${jade}, chargesum = chargesum + ${money} where roleid = ${roleid};`, (err:any) => {
                            if (err) {
                                console.log(`订单${orderid}充值加金币失败！`);
                                callback(false);
                                throw (err);
                            }
                            console.log(`玩家${roleid}充值${jade}仙玉成功，订单${orderid}！`);
                            callback(true);
                        });
                    }
                });
            }
        });
    };

    
    

    static setOrderFinish(orderid: any, callback: any) {
        DB.query(`update charge_record set finish_time = NOW(), realmoney = money, status = 1 where orderid = '${orderid}';`, (err: any, packet: any) => {
            if (err) {
                console.log(`订单${orderid}设置完成状态时失败！`);
                callback(false);
                throw (err);
            }
            if (packet.affectedRows == 0) {
                console.log(`订单${orderid}设置完成状态时失败！`);
                callback(false);
            } else {
                console.log(`订单${orderid}成功设置完成状态！`);
                callback(true);
            }
        });
    };

    static fixEquip(callback: any) {
        let sql = 'SELECT * from qy_role';
        DB.query(sql, (err: any, rows: any) => {
            if (err) {
                callback(false);
                throw (err);
            }

            let run = () => {
                let roleinfo = rows.shift();
                if (roleinfo == null) {
                    console.log('well done!');
                    return;
                }
                let eplist = JSON.parse(roleinfo.equiplist);
                if (eplist == null) {
                    run();
                    return;
                }
                let upsql = `update qy_equip_${Global.serverID} set RoleID = ${roleinfo.roleid} where EquipID in `;

                let equips = '';
                let keys = Object.keys(eplist.use);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const equipid = eplist.use[key];
                    // upsql +=  + ' where EquipID=' + equipid + ';\n';
                    if (i == 0) {
                        equips = '(';
                    }
                    equips += (equipid + ((i == keys.length - 1) ? ')' : ','));
                }

                if (eplist.list.length > 0) {
                    equips += ' or EquipID in ';
                    for (let i = 0; i < eplist.list.length; i++) {
                        const equipid = eplist.list[i];
                        if (i == 0) {
                            equips = '(';
                        }
                        equips += (equipid + ((i == eplist.list.length - 1) ? ')' : ','));
                    }
                }
                if (equips.length > 0) {
                    upsql += equips;
                    DB.query(upsql, (uperror:any, rows:any) => {
                        if (uperror) {
                            console.log('equip error', roleinfo.roleid, upsql);
                            throw (uperror);
                        }
                        run();
                    });
                } else {
                    run();
                }

            }
            run();
        });
    }

    
    static getConfigInfo(callback: any) {
        let sql = "SELECT * FROM qy_role";
        DB.query(sql, (err: any, rows: any) => {
            callback(rows);
        });
    }

    static setNotice(text: any) {
        let sql = `UPDATE qy_info SET comment = '${text}';`;
        DB.query(sql, (err: any, rows: any) => {
            if (err) {
                throw err;
            }
        });
    }

    static setGuideServerID(id: any) {
        let sql = `UPDATE qy_info SET guideid = '${id}';`;
        DB.query(sql, (err: any, rows: any) => {
            if (err) {
                throw err;
            }
        });
    }

    static setShuilu(sid: any, lid: any) {
        let sql = `UPDATE qy_info SET shuilusid = ${sid}, shuilulid = ${lid};`;
        DB.query(sql, (err: any, rows: any) => {
            if (err) {
                throw err;
            }
        });
    }

    
    static getScrollNotice(serverid: any, limit: any, callback: any) {
        let sql = `select text, type from qy_notice where serverid = ${serverid} or serverid = 0 order by time desc limit ${limit};`;
        DB.query(sql, (err: any, rows: any) => {
            if (err) {
                callback(false);
                throw err;
            }
            callback(true, rows);
        });
    };

    static addScrollNotice(serverid: any, type: any, text: any, callback?: any) {
        let sql = `insert into qy_notice (text, type, serverid, time) values ('${text}', ${type}, ${serverid}, NOW());`;
        callback = (callback) ? callback : DB.nop;
        DB.query(sql, (err: any, rows: any) => {
            if (err) {
                callback(false);
                throw (err);
            }
            callback(true);
        });
    };


    

    static createRelation(sqlData: any, callback: any) {
        let sql = `insert into qy_relation (relationId,members, relationType, relationName, createTime,status) values (${sqlData.relationId},'${sqlData.members}', ${sqlData.relationType},'${sqlData.relationName}',  NOW(),${sqlData.status});`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                console.log(sql);
                throw err;
            }
            if (rows.length == 0) {
                callback(Global.msgCode.FAILED);
                return;
            }
            callback(Global.msgCode.SUCCESS, rows.insertId);
        });
    };

    static queryAllRelations(callback: any) {
        let sql = `select * from qy_relation where status = 0`;
        DB.query(sql, function (err: any, rows: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            callback(Global.msgCode.SUCCESS, rows);
        });
    }


    static deleteRelationById(sqlData: any, callback: any) {// status 0 正常 -1 已删除
        //var sql = `DELETE FROM qy_relation WHERE relationId =${relationId};`;
        var sql = `select * from qy_relation where relationId = ${sqlData.relationId}`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            if (rows.length > 0) {
                sql = `update qy_relation set status = -1,deleteTime = NOW() where relationId = ${sqlData.relationId};`;
                DB.query(sql, function (err: any, rows: any, fields: any) {
                    if (err) {
                        callback(Global.msgCode.FAILED, []);
                        console.log('ERROR', err);
                        throw err;
                    }
                    callback(Global.msgCode.SUCCESS, []);
                });

            } else {
                sql = `insert into qy_relation (relationId, members, relationType, relationName, createTime,status,deleteTime) values (${sqlData.relationId},'${sqlData.members}', ${sqlData.relationType},'${sqlData.relationName}',  NOW(),${sqlData.status}, NOW());`;
                DB.query(sql, function (err: any, rows: any, fields: any) {
                    if (err) {
                        callback(Global.msgCode.FAILED);
                        console.log(sql);
                        throw err;
                    }
                    if (rows.length == 0) {
                        callback(Global.msgCode.FAILED);
                        return;
                    }
                    callback(Global.msgCode.SUCCESS, rows.insertId);
                });
            }
        });
    }

    static updateRelationMembersById(info: any, callback: any) {
        var sql = `select * from qy_relation where relationId = ${info.relationId};`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            if (rows.length > 0) {
                sql = `update qy_relation set members = '${info.members}' where relationId = ${info.relationId};`;
                DB.query(sql, function (err: any, rows: any, fields: any) {
                    if (err) {
                        callback(Global.msgCode.FAILED);
                        throw err;
                    }
                    callback(Global.msgCode.SUCCESS);
                });
            } else {
                sql = `insert into qy_relation (relationId, members, relationType, relationName, createTime,status) values (${info.relationId},'${info.members}', ${info.relationType},'${info.relationName}',  NOW(),${info.status});`;
                DB.query(sql, function (err: any, rows: any, fields: any) {
                    if (err) {
                        callback(Global.msgCode.FAILED);
                        console.log(sql);
                        throw err;
                    }
                    if (rows.length == 0) {
                        callback(Global.msgCode.FAILED);
                        return;
                    }
                    callback(Global.msgCode.SUCCESS, rows.insertId);
                });
            }
        })
    }

    static getRelationById(id: any, callback: any) {
        let sql = `select * from qy_relation where relationId = ${id}`;
        DB.query(sql, (err: any, rows: any) => {
            if (err) {
                callback(false);
                throw err;
            }

            callback(true, rows);
        });
    }

    static getRelationMaxId(callback?: any) {
        let sql = `select max(relationId) as relationId from qy_relation;`;
        DB.query(sql, (err: any, rows: any) => {
            if (err) {
                callback(Global.msgCode.FAILED);
                console.log('ERROR', err);
                throw err;
            }
            callback(Global.msgCode.SUCCESS, rows[0].relationId);
        });
    }

    static getSchemesByRoleId(id: any, callback: any) {
        let sql = `select * from qy_scheme where roleId = ${id}`;
        DB.query(sql, (err: any, rows: any) => {
            if (err) {
                callback(false);
                throw err;
            }

            callback(Global.msgCode.SUCCESS, rows);
        });
    }

    static updateSchemeById(info: any, callback: any) {
        var sql = `select * from qy_scheme where schemeId = '${info.schemeId}';`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                console.log('ERROR', err);
                throw err;
            }
            if (rows.length > 0) {
                sql = `update qy_scheme set schemeName = '${info.schemeName}',content = '${info.content}',status = ${info.status} where schemeId = '${info.schemeId}';`;
                DB.query(sql, function (err: any, rows: any, fields: any) {
                    if (err) {
                        callback(Global.msgCode.FAILED);
                        console.log('ERROR', err);
                        throw err;
                    }
                    callback(Global.msgCode.SUCCESS);
                });
            } else {
                sql = `insert into qy_scheme(schemeId,roleId,schemeName,content,status) values (${info.schemeId},${info.roleId},'${info.schemeName}','${info.content}',${info.status});`;
                DB.query(sql, function (err: any, rows: any, fields: any) {
                    if (err) {
                        callback(Global.msgCode.FAILED);
                        console.log('ERROR', err);
                        throw err;
                    }
                    callback(Global.msgCode.SUCCESS, rows.insertId, 1);
                });
            }
        })
    }

    static getSchemeMaxId(callback?: any) {
        let sql = `select max(schemeId) as schemeId from qy_scheme;`;
        DB.query(sql, (err: any, rows: any) => {
            if (err) {
                callback(Global.msgCode.FAILED);
                console.log('ERROR', err);
                throw err;
            }
            if(callback){
                callback(Global.msgCode.SUCCESS, rows[0].schemeId);
            }
        });
    }

    static setSafecode(accountid: any, safecode: any, callback: any) {
        let sql = `update qy_account set safecode = '${safecode}' where accountid = ${accountid};`;
        DB.query(sql, (err:any) => {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw (err);
            }
            else {
                callback(Global.msgCode.SUCCESS);
            }
        });
    }

    static getConfigInfo2(rows: any) {
        if (rows == null) {
            return;
        }
        let row = rows[0];
        if (row == null) {
            return;
        }
        if (row.comment) {
            Global.serverConfig.comment = row.comment;
        } else {
            Global.serverConfig.comment = '欢迎来到大话西游手游';
        }
        if (row.guideid) {
            Global.serverConfig.guideServerID = row.guideid;
        }
    };
    // 骑乘
    static ride(roleId:number,mountId:number,callback:Function){
        let sql = `SELECT mountid from dhxy_mount WHERE roleid = ${roleId} AND mountid=${mountId};`;
        DB.query(sql, (err:any,rows:any) => {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw (err);
            }
            // 没有找到坐骑定义
            if(rows.length<1){
                callback(Global.msgCode.FAILED);
                return;
            }
            let mountId=rows[0].mountid;
            sql=`UPDATE qy_role SET mountid=${mountId} WHERE roleid=${roleId};`;
            DB.query(sql,(err:any,rows:any)=>{
                if(err){
                    callback(Global.msgCode.FAILED);
                    throw (err);
                }
                callback(Global.msgCode.SUCCESS,mountId);
            })
        });
    }
    // 下骑
    static dismount(roleid:number,callback:Function){
        let sql=`UPDATE qy_role SET mountid=0 WHERE roleid=${roleid};`;
        DB.query(sql,(err:any,rows:any)=>{
            if(err){
                callback(Global.msgCode.FAILED);
                throw (err);
            }
            callback(Global.msgCode.SUCCESS);
        })
    }
    // 获得公告
    static getComment(serverId:number,callback:Function){
        let sql=`SELECT * FROM dhxy_comment WHERE serverId=${serverId}`;
        DB.query(sql,(err:any,rows:any)=>{
            if(err){
                callback(Global.msgCode.FAILED,"");
                throw (err);
            }
            if(rows.length<1){
                callback(Global.msgCode.FAILED,"");
                return;
            }
            let text=rows[0].text;
            callback(Global.msgCode.SUCCESS,text);
        })
    }
    // 设置公告
    static setComment(serverId:number,text:string,callback:Function){
        let sql=`INSERT INTO dhxy_comment(serverId,text) VALUES(${serverId},'${text}') ON DUPLICATE KEY UPDATE text='${text}';`;
        DB.query(sql,(err:any,rows:any)=>{
            if(err){
                callback(Global.msgCode.FAILED);
                throw (err);
            }
            callback(Global.msgCode.SUCCESS);
        })
    }
}