import Global from "../../game/core/Global";
import PlayerMgr from "./PlayerMgr";
import DB from "../../utils/DB";
import Launch from "../core/launch";

export default class EquipMgr {
    static shared=new EquipMgr();
    maxEquipID: number;
    shenbingData: any;
    xianqiData: any;
    equipDBTimer: any;
    xinshouData: any;
    highData: any;
    highAttrData: any;
    lianhuaData: any;
    equipObjs:any;
    shopObjs:any;
    lianhuaArr:any;
    constructor() {
        this.maxEquipID = 0;
        this.shenbingData = null;
        this.xianqiData = null;
        this.equipDBTimer = null;
    }

    init() {
        this.shenbingData = Global.require_ex('../prop_data/prop_shenbing');
        this.xianqiData = Global.require_ex('../prop_data/prop_xianqi');
        this.xinshouData = Global.require_ex('../prop_data/prop_xinshou_equip');
        this.highData = Global.require_ex('../prop_data/prop_high_equip');
        this.highAttrData = Global.require_ex('../prop_data/prop_high_equip_attr');

        this.lianhuaData = Global.require_ex('../prop_data/prop_lianhua');

        this.equipObjs = {};
        this.shopObjs = {};
        // this.getDBdata();

        this.lianhuaArr = {};
        for (let index = 0; index < 5; index++) {
            this.lianhuaArr[index + 1] = [];
        }
        for (const key in this.lianhuaData) {
            if (this.lianhuaData.hasOwnProperty(key)) {
                let info = this.lianhuaData[key];
                for (let index = 0; index < 5; index++) {
                    if (info[`pos${index + 1}`].length > 0) {
                        info.key = key;
                        this.lianhuaArr[index + 1].push(info);
                    }
                }
            }
        }

        DB.getEquipMaxId();
        this.equipDBTimer = setInterval(() => {
			DB.getEquipMaxId();
		}, 60 * 1000);
    }

    setMaxEquipID(equipid:any){
        this.maxEquipID = equipid;
        if(this.equipDBTimer != null){
			clearInterval(this.equipDBTimer);
            this.equipDBTimer = null;
            console.log('装备模块加载完毕！');
            Launch.shared.complete('equipmgr');
		}
    }

    addEquip(equip:any) {
        this.equipObjs[equip.EquipID] = equip;
    }

    delEquip(equipid:any) {
        delete this.equipObjs[equipid];
    }

    getEquipByID(equipid:any) {
        return this.equipObjs[equipid];
    }

    sellEquip(equipid:any) {
        let equip = this.equipObjs[equipid];
        if (equip) {
            equip.state = 2;
            this.shopObjs[equip.EquipID] = equip;
            return true;
        }
        return false;
    }

    buyEquip(equipid:any) {
        let equip = this.shopObjs[equipid];
        if (equip) {
            equip.state = 1;
            delete this.shopObjs[equipid];
            return true;
        }
        return false;
    }

    getSellList():any{
        let list = [];
        for (const key in this.shopObjs) {
            if (this.shopObjs.hasOwnProperty(key)) {
                const equip = this.shopObjs[key];
                list.push({
                    Shape: equip.Shape,
                    EquipID: equip.EquipID,
                    EIndex: equip.EIndex,
                    EName: equip.EName,
                    OwnerRoleId: equip.OwnerRoleId
                });
            }
        }
        return JSON.stringify(list);
    }

    save() {
        for (const key in this.equipObjs) {
            if (this.equipObjs.hasOwnProperty(key)) {
                const equip = this.equipObjs[key];
                equip.save();
            }
        }
    }

    getLianhuaData(pos:any, level:any) {
        let arr = this.lianhuaArr[pos];
        let cnt = Math.floor(Math.random() * 5) + 1;
        let lianhuaAttr = [];
        // for (const key in AttrEquipTypeStr) {
        //     if (AttrEquipTypeStr.hasOwnProperty(key)) {
        //         const element = AttrEquipTypeStr[key];
        //         console.log('----',element);
        //     }
        // }
        let factor = 0;
        if (level == 1) factor = 0.3;
        if (level == 2) factor = 0.5;

        for (let index = 0; index < cnt; index++) {
            let info = arr[Math.floor(Math.random() * arr.length)];
            let valuearr = info[`pos${pos}`].split(',');
            let deltaValue = Number(valuearr[1]) - Number(valuearr[0]);
            let randValue = Math.random() * deltaValue * 0.5 + deltaValue * factor;

            let fvalue = Number(valuearr[0]) + randValue;// Math.floor(Math.random() * (Number(valuearr[1]) - Number(valuearr[0])));
            let attrtype = Global.attrEquipTypeStr[info.key];
            let oneinfo:any = {};
            oneinfo[attrtype] =  parseInt(String(fvalue));
            lianhuaAttr.push(oneinfo);
        }
        return lianhuaAttr;//JSON.stringify(lianhuaAttr);
    }

    
    getRecastData(info:any) {
        let p = info.role;
        let dataAttr = null;
        if (info.type == 1) {
            dataAttr = this.highData;
        }
        else if (info.type == 3) {
            dataAttr = this.xianqiData;
        }
        else {
            return null;
        }
        let datalist = [];
        for (const key in dataAttr) {
            if (dataAttr.hasOwnProperty(key)) {
                const data = dataAttr[key];
                if (data.OwnerRoleId && data.OwnerRoleId > 0 && data.OwnerRoleId != p.resid) {
                    continue;
                }
                if ((data.Race == p.race || data.Race == 9) && (data.Sex == p.sex || data.Sex == 9) && (data.Index == info.pos || info.pos == 0) && data.Type != info.resid) {
                    if (info.grade != 0 && info.grade != data.Grade) {
                        continue;
                    }
                    datalist.push(data);
                }
            }
        }
        if (datalist.length == 0) {
            return null;
        }
        let recastdata = datalist[Math.floor(Math.random() * datalist.length)];
        // let baseinfo = {};
        // if (info.type == 1) {
        //     if (recastdata.AttrLib && recastdata.AttrFactor) {
        //         baseinfo = this.getHighBaseArr(recastdata.AttrLib, recastdata.AttrFactor);//JSON.stringify(this.getHighBaseArr(recastdata.AttrLib, recastdata.AttrFactor));
        //     }
        // }
        // else {
        //     if (recastdata.BaseAttr) {
        //         let basearr = recastdata.BaseAttr.split(';');
        //         for (const item of basearr) {
        //             let itemarr = item.split(':');
        //             if (itemarr.length == 2 && AttrEquipTypeStr[itemarr[0]] != null) {
        //                 baseinfo[AttrEquipTypeStr[itemarr[0]]] = itemarr[1];
        //             }
        //         }
        //     }
        // }
        // return baseinfo;//JSON.stringify(baseinfo);
        return this.getEquipArr(recastdata, info.type);
    }

    
    getEquipRes(info:any, resData:any, p:any):any{
        if (info.resid && info.resid != 0) {
            return resData[info.resid];
        }
        let datalist = [];
        for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
                let data = resData[key];
                if (data.OwnerRoleId && data.OwnerRoleId > 0 && data.OwnerRoleId != p.resid) {
                    continue;
                }
                if ((data.Race == p.race || data.Race == 9) && (data.Sex == p.sex || data.Sex == 9) && (data.Index == info.index || info.index == 0)) {
                    if (info.grade != 0 && info.grade != data.Grade) {
                        continue;
                    }
                    datalist.push(data);
                }
            }
        }
        if (datalist.length > 0) {
            return datalist[Math.floor(Math.random() * datalist.length)];
        }
        else {
            return null;
        }
    }

    getXianQiList(info:any) {
        let p = PlayerMgr.shared.getPlayerByRoleId(info.roleid);
        if (!p) {
            return null;
        }
        info.type = 3;
        info.grade = 1;
        let list = [];
        for (let index = 0; index < 5; index++) {
            info.index = index + 1;
            list.push(this.getEquipData(info));
        }
        return list;
    }

    makeEquipAttr(equipInfo:any){
        this.maxEquipID++;
        if (!equipInfo.resid) {
			equipInfo.resid = 0;
		}
        if(equipInfo.grade == null){
            equipInfo.grade = 1;
        }
        let equiparr:any = this.getEquipData(equipInfo);
        if(equiparr == null){
            return null;
        }
        equiparr.EquipID = this.maxEquipID;
        return equiparr;
    }

    getEquipData(info:any):any{
        let p = null;
        if (!info.resid || info.resid == 0) {
            p = PlayerMgr.shared.getPlayerByRoleId(info.roleid);
            if (!p) {
                return null;
            }
        }
        let equipInfo = null;
        if (info.type == Global.EquipType.XinShou) {//新手装备
            equipInfo = this.getEquipRes(info, this.xinshouData, p);
        }
        else if (info.type == Global.EquipType.High) {//高级装备
            equipInfo = this.getEquipRes(info, this.highData, p);
        }
        else if (info.type == Global.EquipType.ShenBing) {//神兵
            equipInfo = this.getEquipRes(info, this.shenbingData, p);
        }
        if (info.type == Global.EquipType.XianQi) {//仙器
            equipInfo = this.getEquipRes(info, this.xianqiData, p);
        }
        if (equipInfo == null) {
            return null;
        }
        return this.getEquipArr(equipInfo, info.type);
    }

    getHighRndRange(rangestr:any) {
        if (rangestr == null) {
            return 1;
        }
        if (rangestr.endsWith(';')) {
            rangestr = rangestr.substr(0, rangestr.length - 1);
        }
        let rangelist = rangestr.split(';');
        let rndvalue = Math.random() * 100;//用来计算阶梯概率
        if (rangelist.length == 0) {
            return 1;
        }
        let rangevaluelist = [];//每条记录里存三个数，最小，最大，阶梯概率
        for (const valuestr of rangelist) {
            if (valuestr.split(',').length != 3) {
                return 1;
            }
            rangevaluelist.push(valuestr.split(','));
        }
        let minrndvalue = 1;//当前概率的最小值
        let maxrndvalue = 100;//当前概率的最大值
        let startvalue = 0;//阶梯概率初始位置
        for (let index = 0; index < rangevaluelist.length; index++) {
            let v = Number(rangevaluelist[index][2]);
            if (rndvalue >= startvalue && rndvalue <= startvalue + v) {
                minrndvalue = Number(rangevaluelist[index][0]);
                maxrndvalue = Number(rangevaluelist[index][1]);
                break;
            }
            startvalue += v;
        }
        return minrndvalue + Math.floor(Math.random() * (maxrndvalue - minrndvalue));
    }

    getHighBaseArr(lib:any,factor:any) {//获得高级装备的基础属性
        let basearr:any= {};
        let libarr = lib.split(',');
        for (const lib of libarr) {
            if (this.highAttrData[lib] == null) {
                continue;
            }
            let basestr = this.highAttrData[lib].BaseAttr;
            if (!basearr) {
                continue;
            }
            if (basestr.endsWith(';')) {
                basestr = basestr.substr(0, basestr.length - 1);
            }
            let baselist = basestr.split(';');
            if (baselist.length == 0) {
                continue;
            }
            let curbase = baselist[Math.floor(Math.random() * baselist.length)];
            let curbasearr = curbase.split(',');
            if (curbasearr.length != 3) {
                continue;
            }
            let curkey = curbasearr[0];
            let curminvalue = Number(curbasearr[1]);
            let curmaxvalue = Number(curbasearr[2]);

            let rndrange = this.getHighRndRange(this.highAttrData[lib].RndRange);
            let curvalue = curminvalue + Math.floor(rndrange * (curmaxvalue - curminvalue) / 100);
            basearr[Global.attrEquipTypeStr[curkey]] = Math.floor(curvalue * factor);
        }
        return basearr;
    }

    getEquipArr(equipInfo:any, type:any) {
        let equipArr:any = {};
        equipArr['BaseAttr'] = '{}';
        equipArr['Shuxingxuqiu'] = '{}';
        equipArr['BaseScore'] = 0;
        equipArr['EDesc'] = '';
        equipArr['Detail'] = '';
        equipArr['Dynamic'] = 0;
        equipArr['Grade'] = 0;
        equipArr['EIndex'] = 0;
        equipArr['JiLv'] = 0;
        equipArr['MaxEmbedGemCnt'] = 0;
        equipArr['MaxEndure'] = 0;
        equipArr['EName'] = '';
        equipArr['NeedGrade'] = 0;
        equipArr['NeedRei'] = 0;
        equipArr['NextType'] = 0;
        equipArr['Overlap'] = 0;
        equipArr['Quan'] = '';
        equipArr['Race'] = 0;
        equipArr['Rarity'] = 0;
        equipArr['RndRange'] = '';
        equipArr['RndWeight'] = 0;
        equipArr['Sex'] = 0;
        equipArr['Shape'] = '';
        equipArr['Type'] = 0;
        equipArr['OwnerRoleId'] = 0;
        equipArr['EquipType'] = type;

        if (type == 1) {
            if (equipInfo.AttrLib && equipInfo.AttrFactor) {
                equipArr['BaseAttr'] = JSON.stringify(this.getHighBaseArr(equipInfo.AttrLib, equipInfo.AttrFactor));
            }
        } else {
            if (equipInfo.BaseAttr) {
                let baseinfo:any = {};
                let basearr = equipInfo.BaseAttr.split(';');
                for (const item of basearr) {
                    let itemarr = item.split(':');
                    if (itemarr.length == 2 && Global.attrEquipTypeStr[itemarr[0]] != null) {
                        baseinfo[Global.attrEquipTypeStr[itemarr[0]]] = itemarr[1];
                    }
                }
                equipArr['BaseAttr'] = JSON.stringify(baseinfo);
            }
        }
        if (equipInfo.Shuxingxuqiu) {
            let xuqiuinfo:any = {};
            let xuqiuarr = equipInfo.Shuxingxuqiu.split(':');
            if (xuqiuarr.length == 2 && Global.attrEquipTypeStr[xuqiuarr[0]] != null) {
                xuqiuinfo[Global.attrEquipTypeStr[xuqiuarr[0]]] = xuqiuarr[1];
            }
            equipArr['Shuxingxuqiu'] = JSON.stringify(xuqiuinfo);
        }
        if (equipInfo.NeedAttr) {
            let xuqiuinfo:any = {};
            let xuqiuarr = equipInfo.NeedAttr.split(':');
            if (xuqiuarr.length == 2 && Global.attrEquipTypeStr[xuqiuarr[0]] != null) {
                xuqiuinfo[Global.attrEquipTypeStr[xuqiuarr[0]]] = xuqiuarr[1];
            }
            equipArr['Shuxingxuqiu'] = JSON.stringify(xuqiuinfo);
        }
        equipInfo.BaseScore && (equipArr['BaseScore'] = equipInfo.BaseScore);
        equipInfo.Desc && (equipArr['EDesc'] = equipInfo.Desc);
        equipInfo.Detail && (equipArr['Detail'] = equipInfo.Detail);
        equipInfo.Dynamic && (equipArr['Dynamic'] = equipInfo.Dynamic);
        equipInfo.Grade && (equipArr['Grade'] = equipInfo.Grade);
        equipInfo.Index && (equipArr['EIndex'] = equipInfo.Index);
        equipInfo.JiLv && (equipArr['JiLv'] = equipInfo.JiLv);
        equipInfo.MaxEmbedGemCnt && (equipArr['MaxEmbedGemCnt'] = equipInfo.MaxEmbedGemCnt);
        equipInfo.MaxEndure && (equipArr['MaxEndure'] = equipInfo.MaxEndure);
        equipInfo.Name && (equipArr['EName'] = equipInfo.Name);
        equipInfo.NeedGrade && (equipArr['NeedGrade'] = equipInfo.NeedGrade);
        equipInfo.NeedRei && (equipArr['NeedRei'] = equipInfo.NeedRei);
        equipInfo.NextType && (equipArr['NextType'] = equipInfo.NextType);
        equipInfo.Overlap && (equipArr['Overlap'] = equipInfo.Overlap);
        equipInfo.Quan && (equipArr['Quan'] = equipInfo.Quan);
        equipInfo.Race && (equipArr['Race'] = equipInfo.Race);
        equipInfo.Rarity && (equipArr['Rarity'] = equipInfo.Rarity);
        equipInfo.RndRange && (equipArr['RndRange'] = equipInfo.RndRange);
        equipInfo.RndWeight && (equipArr['RndWeight'] = equipInfo.RndWeight);
        equipInfo.Sex && (equipArr['Sex'] = equipInfo.Sex);
        equipInfo.Shape && (equipArr['Shape'] = equipInfo.Shape);
        equipInfo.Type && (equipArr['Type'] = equipInfo.Type);
        equipInfo.OwnerRoleId && (equipArr['OwnerRoleId'] = equipInfo.OwnerRoleId);
        return equipArr;
    }

    getInsertData(equipArr:any, roleid:any):any{
        if (!equipArr) {
            return null;
        }
        let fieldstr = 'EquipID, EquipType, BaseAttr, Grade, EIndex, Shuxingxuqiu, Type, GemCnt, LianhuaAttr, RoleID, create_time, pos';
        let valuestr = `${equipArr.EquipID}, ${equipArr.EquipType}, '${equipArr.BaseAttr}', ${equipArr.Grade}, ${equipArr.EIndex}, '${equipArr.Shuxingxuqiu}', ${equipArr.Type}, 0, '{}', ${roleid}, NOW(), ${Global.equipPos.BAG}`;
        // let fieldstr = '';
        // let valuestr = '';
        // for (const field in equipArr) {
        //     if (equipArr.hasOwnProperty(field)) {
        //         fieldstr += field + ',';
        //         valuestr += `'${equipArr[field]}',`;
        //     }
        // }
        // fieldstr = fieldstr.substr(0, fieldstr.length - 1);
        // valuestr = valuestr.substr(0, valuestr.length - 1);

        let data:any = {};
        data.fieldstr = fieldstr;
        data.valuestr = valuestr;
        return data;
    }
}