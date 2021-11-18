import Global from "../../game/core/Global";
import EquipMgr from "./EquipMgr";
import DB from "../../utils/DB";

export default class Equip {
	name:string;
	EquipID:any;
	EquipType:number;
	BaseAttr:any;
	Grade:number;
	EIndex:number;
	Shuxingxuqiu:any;
	Type:any;
	GemCnt:any;
	LianhuaAttr:any;
	pos:any;
	state:any;
	attr1:any;
	gemarr:any;
	refineData:any;
	recastData:any;

	constructor(info:any) {
		this.name = '';
		this.EquipID = info.EquipID;
		this.EquipType = 0;
		this.BaseAttr = {};
		this.Grade = 0;
		this.EIndex = 0;
		this.Shuxingxuqiu = {};
		this.Type = 0;
		this.GemCnt = 0;
		this.LianhuaAttr = {};
		this.pos = Global.equipPos.BAG; // 所在位置 0 初始 1身上 2背包 3仓库
		this.state = 1;
		// 属性
		this.attr1 = {};
		for (const key in Global.attrTypeL1) {
			if (Global.attrTypeL1.hasOwnProperty(key)) {
				this.attr1[Global.attrTypeL1[key]] = 0;
			}
		}

		this.gemarr = [
			[30025, 30026, 30027, 30028, 30029, 30030],
			[30013, 30014, 30015, 30016, 30017, 30018],
			[30019, 30020, 30021, 30022, 30023, 30024],
			[30001, 30002, 30003, 30004, 30005, 30006],
			[30007, 30008, 30009, 30010, 30011, 30012]
		];

		this.setDBdata(info);

		this.refineData = null;
		this.recastData = null;
	}

	// getDBdata() {
	// 	DB.getEquipByEquipID(this.EquipID, (errorcode:any, dbdata:any) => {
	// 		if (errorcode == Global.msgCode.SUCCESS) {
	// 			this.init = true;
	// 			this.setDBdata(dbdata);
	// 		}
	// 	});
	// }

	setDBdata(info:any) {
		if (info == null) {
			return;
		}
		info.name && (this.name = info.name);
		info.EquipType && (this.EquipType = info.EquipType);
		info.BaseAttr && (this.BaseAttr = JSON.parse(info.BaseAttr));
		info.Grade && (this.Grade = info.Grade);
		info.EIndex && (this.EIndex = info.EIndex);
		info.Shuxingxuqiu && (this.Shuxingxuqiu = JSON.parse(info.Shuxingxuqiu));
		info.Type && (this.Type = info.Type);
		info.GemCnt && (this.GemCnt = info.GemCnt);
		info.LianhuaAttr && (this.LianhuaAttr = JSON.parse(info.LianhuaAttr));
		info.pos && (this.pos = info.pos);
		this.calculateAttribute();
	}

	getAttr(attrtype:any) {
		return this.attr1[attrtype];
	}

	canUpgrade() {
		let fulldata:any = this.getFullData();
		if (fulldata.EquipType == Global.EquipType.XinShou) {

		} else if (fulldata.EquipType == Global.EquipType.High) {
			if (fulldata.Grade >= 120) {
				return false;
			}
		} else if (fulldata.EquipType > Global.EquipType.High) {
			if (!fulldata.NextType || fulldata.NextType == 0) {
				return false;
			}
		}
		return true;
	}

	checkUpgradeBroke():boolean{
		// 		1-2=50%
		// 		2-3=25%
		// 		3-4=5%
		// 		4-5=1%
		if (this.Grade > Global.shenBingBroke.length) {
			return false;
		}
		let r = Global.random(0, 10000);
		let successpre = Global.shenBingBroke[this.Grade - 1];
		if (r < successpre) {
			return true;
		}
		return false;
	}

	upgrade(data:any):boolean{
		let fulldata:any = this.getFullData();
		let nextGrade = 0;
		let nextType = fulldata.NextType;
		let toType = fulldata.EquipType;
		if (fulldata.EquipType == 0) {
			nextGrade = 40;
			toType = 1;
		}
		else if (fulldata.EquipType == 1) {
			if (fulldata.Grade < 120) {
				nextGrade = fulldata.Grade + 20;
			} else {
				return false;
			}
		}
		else if (fulldata.EquipType > 1) {
			if (!fulldata.NextType || fulldata.NextType == 0) {
				return false;
			}
			nextGrade = fulldata.Grade + 1;
		}
		let equipMgr = require('./equip_mgr');
		data.resid = nextType;
		data.grade = nextGrade;
		data.type = toType;
		data.index = fulldata.EIndex;
		let equipdata = EquipMgr.shared.getEquipData(data);
		this.setDBdata(equipdata);
		return true;
	}

	calculateAttribute() {
		for (const key in Global.attrTypeL1) {
			if (Global.attrTypeL1.hasOwnProperty(key)) {
				this.attr1[Global.attrTypeL1[key]] = 0;
			}
		}
		for (const key in this.BaseAttr) {
			if (this.BaseAttr.hasOwnProperty(key)) {
				let nkey = parseInt(key);
				let value = parseInt(this.BaseAttr[nkey]);
				if (Global.equipTypeNumerical.indexOf(nkey) == -1) {
					value = value / 10;
				}
				value = Math.ceil(value * (1 + 0.03 * this.GemCnt));
				this.attr1[key] += value;
			}
		}
		if (Array.isArray(this.LianhuaAttr)) {
			for (const data of this.LianhuaAttr) {
				for (const key in data) {
					let nkey = parseInt(key);
					let value = parseInt(data[nkey]);
					if (Global.equipTypeNumerical.indexOf(nkey) == -1) {
						value = value / 10;
					}
					this.attr1[key] += value;
					break;
				}
			}
		}
	}

	getInlayGemID():any{
		return this.gemarr[this.EIndex - 1][Math.floor(this.GemCnt / 3)];
	}

	getGemList():any{
		let list:any = {};
		if (this.GemCnt > 18) {
			this.GemCnt = 18;
		}
		let curGemlevel = Math.floor(this.GemCnt / 3);
		for (let index = 0; index < curGemlevel; index++) {
			list[this.gemarr[this.EIndex - 1][index]] = 3;
		}
		list[this.gemarr[this.EIndex - 1][curGemlevel]] = this.GemCnt % 3;
		return list;
	}

	getFullData() {
		let equipdata = EquipMgr.shared.getEquipData({ resid: this.Type, type: this.EquipType });
		this.name = equipdata.EName;

		let fulldata:any = {};
		fulldata.EquipID = this.EquipID;
		fulldata.EquipType = this.EquipType;
		fulldata.BaseAttr = this.BaseAttr;
		fulldata.BaseScore = equipdata.BaseScore;
		fulldata.EDesc = equipdata.EDesc;
		fulldata.Detail = equipdata.Detail;
		fulldata.Dynamic = equipdata.Dynamic;
		fulldata.Grade = this.Grade;
		fulldata.EIndex = this.EIndex;
		fulldata.JiLv = equipdata.JiLv;
		fulldata.MaxEmbedGemCnt = equipdata.MaxEmbedGemCnt;
		fulldata.MaxEndure = equipdata.MaxEndure;
		fulldata.EName = equipdata.EName;
		fulldata.NeedGrade = equipdata.NeedGrade;
		fulldata.NeedRei = equipdata.NeedRei;
		fulldata.NextType = equipdata.NextType;
		fulldata.Overlap = equipdata.Overlap;
		fulldata.Quan = equipdata.Quan;
		fulldata.Race = equipdata.Race;
		fulldata.Rarity = equipdata.Rarity;
		fulldata.RndRange = equipdata.RndRange;
		fulldata.RndWeight = equipdata.RndWeight;
		fulldata.Sex = equipdata.Sex;
		fulldata.Shape = equipdata.Shape;
		fulldata.Shuxingxuqiu = this.Shuxingxuqiu;
		fulldata.Type = this.Type;
		fulldata.GemCnt = this.GemCnt;
		fulldata.LianhuaAttr = this.LianhuaAttr;
		fulldata.OwnerRoleId = equipdata.OwnerRoleId;

		return fulldata;
	}

	toObj() {
		let fulldata = this.getFullData();
		let curBaseAttr:any = {};
		for (const key in this.BaseAttr) {
			curBaseAttr[key] = this.attr1[key];
			let nkey = parseInt(key);
			if (Global.equipTypeNumerical.indexOf(nkey) == -1) {
				curBaseAttr[key] *= 10;
			}
		}
		let obj:any = {};
		obj.EquipID = this.EquipID;
		obj.EquipType = this.EquipType;
		obj.BaseAttr = JSON.stringify(curBaseAttr);
		obj.BaseScore = fulldata.BaseScore;
		obj.EDesc = fulldata.EDesc;
		obj.Detail = fulldata.Detail;
		obj.Dynamic = fulldata.Dynamic;
		obj.Grade = this.Grade;
		obj.EIndex = this.EIndex;
		obj.JiLv = fulldata.JiLv;
		obj.MaxEmbedGemCnt = fulldata.MaxEmbedGemCnt;
		obj.MaxEndure = fulldata.MaxEndure;
		obj.EName = fulldata.EName;
		obj.NeedGrade = fulldata.NeedGrade;
		obj.NeedRei = fulldata.NeedRei;
		obj.NextType = fulldata.NextType;
		obj.Overlap = fulldata.Overlap;
		obj.Quan = fulldata.Quan;
		obj.Race = fulldata.Race;
		obj.Rarity = fulldata.Rarity;
		obj.RndRange = fulldata.RndRange;
		obj.RndWeight = fulldata.RndWeight;
		obj.Sex = fulldata.Sex;
		obj.Shape = fulldata.Shape;
		obj.Shuxingxuqiu = JSON.stringify(this.Shuxingxuqiu);
		obj.Type = this.Type;
		obj.GemCnt = this.GemCnt;
		obj.LianhuaAttr = JSON.stringify(this.LianhuaAttr);
		obj.OwnerRoleId = fulldata.OwnerRoleId;
		return obj;
	}

	getSendInfo():any{
		let fullEquipData = this.getFullData();
		return {
			EquipID: fullEquipData.EquipID,
			Shape: fullEquipData.Shape,
			EName: fullEquipData.EName,
			EquipType: fullEquipData.EquipType,
			EIndex: fullEquipData.EIndex,
			Grade: fullEquipData.Grade,
			NextType: fullEquipData.NextType
		};
	}

	save() {
		if (this.state == 0) {
			DB.delEquip(this.EquipID, () => { });
		}
		else {
			let savedata:any = {};
			savedata.name = this.name;
			savedata.EquipType = this.EquipType;
			savedata.BaseAttr = JSON.stringify(this.BaseAttr);
			savedata.Grade = this.Grade;
			savedata.EIndex = this.EIndex;
			savedata.Shuxingxuqiu = JSON.stringify(this.Shuxingxuqiu);
			savedata.Type = this.Type;
			savedata.GemCnt = this.GemCnt;
			savedata.LianhuaAttr = JSON.stringify(this.LianhuaAttr);
			savedata.pos = this.pos;
			DB.saveEquipInfo(this.EquipID, savedata, () => { })
		}
	}

	saveStr() {
		if (this.state == 0) {
			return `UPDATE qy_equip_${Global.serverID} SET state = 0, delete_time = NOW() WHERE EquipID =${this.EquipID};`
		} else {
			let savedata:any = {};
			savedata.name = this.name;
			savedata.EquipType = this.EquipType;
			savedata.BaseAttr = JSON.stringify(this.BaseAttr);
			savedata.Grade = this.Grade;
			savedata.EIndex = this.EIndex;
			savedata.Shuxingxuqiu = JSON.stringify(this.Shuxingxuqiu);
			savedata.Type = this.Type;
			savedata.GemCnt = this.GemCnt;
			savedata.LianhuaAttr = JSON.stringify(this.LianhuaAttr);
			savedata.pos = this.pos;

			let numlist= ['pos', 'Grade', 'Type', 'GemCnt', 'EIndex'];
			let updatestr = '';
			for (const key in savedata) {
				if(numlist.indexOf(key) == -1){
					updatestr += `${key} = '${savedata[key]}', `
				}else{
					updatestr += `${key} = ${savedata[key]}, `
				}
			}
			updatestr = updatestr.substr(0, updatestr.length - 2);
			let sql = `UPDATE qy_equip_${Global.serverID} SET ${updatestr} WHERE EquipID = ${this.EquipID};`;
			return sql;
		}
	}
}