import Global from "../../game/core/Global";
import BangMgr from "../../game/bang/BangMgr";
import DB from "../../utils/DB";
import Launch from "./launch";

export default class PaiHangMgr {
    static shared=new PaiHangMgr();
    vecLevel:any[];
    vecMoney:any[];
    vecBang:any[];
    shuiLuRank:any[];
    constructor() {
        this.vecLevel = [];
        this.vecMoney = [];
        this.vecBang = [];
        this.shuiLuRank = [];
    }

    init() {
        this.ReadFromDB();
    }

    ReadFromDB() {
        let nServerID = Global.serverID;
        let sql = `select roleid, name, relive, level, money, shuilu from qy_role where serverid =  ${nServerID}`;
        DB.query(sql, (ret:any, rows:any) => {
            for (let i = 0; i < rows.length; i++) {
                this.vecLevel.push({ nRoleID: rows[i].roleid, strName: rows[i].name, nRelive: rows[i].relive, nLevel: rows[i].level, nMoney: rows[i].money });
                this.vecMoney.push({ nRoleID: rows[i].roleid, strName: rows[i].name, nRelive: rows[i].relive, nLevel: rows[i].level, nMoney: rows[i].money });
                let t3 = null;
                try {
                    t3 = JSON.parse(rows[i].shuilu);
                } catch (error) {
                    t3 = { score: 0, gongji: 0, wtime: 0 };
                }
                if(t3 == null){
                    t3 = { score: 0, gongji: 0, wtime: 0 };
                }
                
                this.shuiLuRank.push({
                    roleid: rows[i].roleid, 
                    name: rows[i].name,
                    score: t3.score,
                    wtime: t3.wtime,
                });
            }
            this.vecLevel.sort((a, b) => {
                if (a.nRelive - b.nRelive == 0) {
                    return b.nLevel - a.nLevel;
                } else {
                    return b.nRelive - a.nRelive;
                }
            });
            this.vecMoney.sort((a, b) => {
                return b.nMoney - a.nMoney;
            });
            this.shuiLuRank.sort((a, b) => {
                return b.score - a.score;
            });
            this.vecLevel.splice(20, this.vecLevel.length);
            this.vecMoney.splice(20, this.vecMoney.length);
            this.shuiLuRank.splice(20, this.shuiLuRank.length);

            console.log('排行榜模块加载完毕！');
            Launch.shared.complete('paihangmgr');
        });
    }

    FindAndDelete(nRoleID:any, vecData:any) {
        for (let nIndex = 0; nIndex < vecData.length; nIndex++) {
            if (vecData[nIndex].nRoleID != nRoleID)
                continue;

            vecData.splice(nIndex, 1);
            break;
        }
    }

    initBangRank() {
        let list = BangMgr.shared.bangList;
        let tmplist = [];
        for (const bangid in list) {
            if (list.hasOwnProperty(bangid)) {
                const bang = list[bangid];
                tmplist.push({
                    bangid: bang.id,
                    name: bang.name,
                    num: bang.rolelist.length,
                    mastername: bang.mastername,
                })
            }
        }
        tmplist.sort((a, b) => {
            return b.num - a.num;
        });

        for (const info of tmplist) {
            this.vecBang.push(info);
            if (this.vecBang.length >= 20) {
                break;
            }
        };
    }

    getLevelRank() {
        let list = [];
        for (let i = 0; i < this.vecLevel.length; i++) {
            const levelinfo = this.vecLevel[i];
            list.push([
                levelinfo.nRoleID,
                levelinfo.strName,
                levelinfo.nRelive + '转' + levelinfo.nLevel + '级',
                levelinfo.nMoney,
            ])
        }
        return list;
    }

    getMoneyRank() {
        let list = [];
        for (let i = 0; i < this.vecMoney.length; i++) {
            const moneyinfo = this.vecMoney[i];
            list.push([
                moneyinfo.nRoleID,
                moneyinfo.strName,
                moneyinfo.nRelive + '转' + moneyinfo.nLevel + '级',
                moneyinfo.nMoney,
            ])
        }
        return list;
    }

    getBangRank() {
        let list = [];
        for (let i = 0; i < this.vecBang.length; i++) {
            const banginfo = this.vecBang[i];
            list.push([
                banginfo.bangid,
                banginfo.name,
                banginfo.mastername,
                banginfo.num,
            ])
        }
        return list;
    }

    getShuiluRank(){
        let list = [];
        for (let i = 0; i < this.shuiLuRank.length; i++) {
            const shuiluinfo = this.shuiLuRank[i];
            list.push([
                shuiluinfo.roleid,
                shuiluinfo.name,
                shuiluinfo.wtime,
                shuiluinfo.score,
            ])
        }
        return list;
    }


    CheckAndInsertLevelPaihang(nRoleID:any, strName:any, nRelive:any, nLevel:any, nMoney:any) {
        this.FindAndDelete(nRoleID, this.vecLevel);

        for (let nIndex = 0; nIndex < this.vecLevel.length; nIndex++) {
            if (nLevel > this.vecLevel[nIndex].nLevel && nRelive >= this.vecLevel[nIndex].nRelive) {
                this.vecLevel.splice(nIndex, 0, { nRoleID: nRoleID, strName: strName, nRelive: nRelive, nLevel: nLevel, nMoney: nMoney });
                break;
            }
        }

        let nLen = this.vecLevel.length;

        if (nLen < 20) {
            this.vecLevel.splice(nLen, 0, { nRoleID: nRoleID, strName: strName, nRelive: nRelive, nLevel: nLevel, nMoney: nMoney });
        }

        this.vecLevel.splice(20);
    }

    CheckAndInsertMoneyPaihang(nRoleID:any, strName:any, nRelive:any, nLevel:any, nMoney:any) {
        this.FindAndDelete(nRoleID, this.vecMoney);

        for (let nIndex = 0; nIndex < this.vecMoney.length; nIndex++) {
            if (nMoney > this.vecMoney[nIndex].nMoney) {
                this.vecMoney.splice(nIndex, 0, { nRoleID: nRoleID, strName: strName, nRelive: nRelive, nLevel: nLevel, nMoney: nMoney });
                break;
            }
        }

        this.vecMoney.splice(20);
    }

    onNewDay() {
        this.initBangRank()
    }
    ShuiLuRankUpdate(roleid:any, name:any, wtime:any, jifen:any) {
        let find = false;
        for (let i = 0; i < this.shuiLuRank.length; i++) {
            const item = this.shuiLuRank[i];
            if(item.roleid == roleid){
                find = true;
                item.wtime = wtime;
                item.name = name;
                item.score = jifen;
                break;
            }
        }
        if(!find){
            this.shuiLuRank.push({
                roleid: roleid,
                name:name,
                wtime:wtime,
                score:jifen,
            });
        }

        this.shuiLuRank.sort((a, b) => {
            return b.score - a.score;
        });

        this.shuiLuRank.splice(20);
    }
}







