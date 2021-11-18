import Global from "../../game/core/Global";
import BattleObj from "./BattleObj";
import DB from "../../utils/DB";
import PetMgr from "../core/PetMgr";
import ExpMgr from "../core/ExpMgr";
import SkillMgr from "../skill/core/SkillMgr";
import GoodsMgr from "../item/GoodsMgr";

export default class Pet extends BattleObj{
	petid:number;
	dataid:number;
	owner:any;
	resid:number;
	intro:string;
	name:string;
	relive:number;
	level:number;
	grade:number;
	qinmi:number;
	skill_list:any;
	rate:number;
	basehp:number;
	basemp:number;
	baseatk:number;
	basespd:number;
	ppoint:any;
	dpoint:any;
	wuxing:any;
	exp:number;
	xexp:number;
	xlevel:number;
	longgu:number;
	state:number;
	maxskillcnt:number;
	wash_property:any; // 洗练的属性
	color:number; // -1:未变色 0:变色未成功 >0:其他颜色
	fly:number; // %10飞升次数 /10飞升增加的属性 1hp 2mp 3atk 4spd
	shenskill:number;
	petinfo:any;
	dfengyin:any;
	dhunlun:any;
	dhunshui:any;
	dyiwang:any;
	dfeng:any;
	dshui:any;
	dhuo:any;
	ddu:any;
	dlei:any;
	dguihuo:any;
	dsanshi:any;
	dzhenshe:number;
	pxishou:any;
	pmingzhong:number;
	pshanbi:number;
	plianji:number;
	plianjilv:number;
	pkuangbao:number;
	ppofang:number;
	ppofanglv:number;
	pfanzhenlv:number;
	pfanzhen:number;

	constructor(petid:any) {
		super();
		this.petid = 0;
		this.dataid = petid;
		this.owner = null;
		this.resid = 0; // 资源id
		this.intro = ''; // 介绍
		this.name = '';
		this.relive = 0;
		this.level = 0;
		this.grade = 0;
		this.qinmi = 0; // 亲密
		this.skill_list = {};
		this.rate = 0;
		this.basehp = 0; // 初始血
		this.basemp = 0;
		this.baseatk = 0;
		this.basespd = 0;
		this.ppoint = {};
		this.dpoint = {};
		this.wuxing = {};
		this.exp = 0;
		this.xexp = 0;
		this.xlevel = 0;
		this.longgu = 0;
		this.state = 1;
		this.maxskillcnt = 4;
		this.wash_property = null; // 洗练的属性
		this.color = -1; // -1:未变色 0:变色未成功 >0:其他颜色
		// this.yuanqi = 0;
		this.fly = 0; // %10飞升次数 /10飞升增加的属性 1hp 2mp 3atk 4spd

		this.shenskill = 0;
		this.living_type = Global.livingType.Pet;
	}

	getDBdata() {
		DB.getPetByID(this.petid, (errorcode:any, dbdata:any) => {
			if (errorcode == Global.msgCode.SUCCESS) {
				this.setDBdata(dbdata);
			} else {
				return;
			}
		});
	}

	setOwner(player:any) {
		this.maxskillcnt = PetMgr.shared.getMaxSkillCnt(this.dataid);
		this.owner = player;
	}

	setDBdata(info:any) {
		this.petinfo = info;
		if (this.petinfo == null) {
			return;
		}
		let data = PetMgr.shared.getPetData(this.dataid);
		
		while (info.hp && info.hp > data.hp[1]) {
			info.hp -= 60;
		}
		while (info.mp && info.mp > data.mp[1]) {
			info.mp -= 60;
		}
		while (info.atk && info.atk > data.atk[1]) {
			info.atk -= 60;
		}
		while (info.spd && info.spd > data.spd[1]) {
			info.spd -= 60;
		}

		info.petid && (this.petid = info.petid);
		info.dataid && (this.dataid = info.dataid);
		info.resid && (this.resid = info.resid);
		info.intro && (this.intro = info.intro);
		info.name && (this.name = info.name);
		info.relive && (this.relive = info.relive);
		info.level && (this.level = info.level);
		info.grade && (this.grade = info.grade);
		info.shenskill && (this.shenskill = info.shenskill);

		let skillinfos = Global.safeJson(info.skill);
		this.initSkill(skillinfos);

		info.rate && (this.rate = info.rate);
		info.hp && (this.basehp = info.hp);
		info.mp && (this.basemp = info.mp);
		info.atk && (this.baseatk = info.atk);
		info.spd && (this.basespd = info.spd); 
		info.ppoint && (this.ppoint = JSON.parse(info.ppoint));
		info.dpoint && (this.dpoint = JSON.parse(info.dpoint));
		info.wuxing && (this.wuxing = JSON.parse(info.wuxing));
		info.exp && (this.exp = info.exp);
		info.xexp && (this.xexp = info.xexp);
		info.xlevel && (this.xlevel = info.xlevel);
		info.longgu && (this.longgu = info.longgu);
		info.maxskillcnt && (this.maxskillcnt = info.maxskillcnt);
		(typeof (info.color) == 'number') && (this.color = this.petColorTransformCom(info.color));
		// if (this.color != -1) {
		// 	this.yuanqi = goodsMgr.getPetUseYuanqiRate(this.dataid);
		// }
		info.qinmi && (this.qinmi = info.qinmi);
		if (typeof (info.fly) == 'number') {
			this.fly = info.fly;
		}

		this.maxskillcnt = PetMgr.shared.getMaxSkillCnt(this.dataid);
		this.calculateAttribute();
	}

	initSkill(skillinfos:any) {
		for (const skillid in skillinfos) {
			if (skillinfos.hasOwnProperty(skillid)) {
				const skillinfo = skillinfos[skillid];
				if (typeof skillinfo == 'object' && skillinfo) {
					this.skill_list[skillid] = skillinfo;
				}
				if (typeof skillinfo == 'number') {
					this.skill_list[skillid] = {
						idx: skillinfo,
						lck: 0
					};
				}
			}
		}
	}

	
	useYuanqi() {
		let can_wash_rate = 1; // 能洗颜色的概率 

		if (this.color == -1) { // 未吃过元气丹 
			this.color = 0;
			// this.yuanqi = goodsMgr.getPetUseYuanqiRate(this.dataid);
			this.calculateAttribute();
			can_wash_rate = 0.1;
		}

		if (Math.random() < can_wash_rate || this.getCurRate() == this.getMaxRate()) {
			this.color = this.changeColor();
		}

		if (this.owner) {
			this.owner.send('s2c_update_pet', {
				info: this.toObj()
			});
			return true;
		} else {
			return false;
		}
	}

	
	changeColor() {
		let colors = PetMgr.shared.getPetColors(this.resid);
		let common_colors = colors.colorValue; // 普通颜色 
		let special_colors = colors.colorNice; // 特殊颜色 
		let random = Math.random();
		let rate = 0.9; // 普通颜色的概率 
		let color = 0;
		if (random < rate) {
			color = parseInt(common_colors[Math.floor(Math.random() * common_colors.length)]);
		} else {
			color = parseInt(special_colors[Math.floor(Math.random() * special_colors.length)]);
		}
		return color;
	}

	calculateAttribute() {
		this.dpoint[Global.attrTypeL2.GENGU] = this.dpoint[Global.attrTypeL2.GENGU] || 0;
		this.dpoint[Global.attrTypeL2.LINGXING] = this.dpoint[Global.attrTypeL2.LINGXING] || 0;
		this.dpoint[Global.attrTypeL2.LILIANG] = this.dpoint[Global.attrTypeL2.LILIANG] || 0;
		this.dpoint[Global.attrTypeL2.MINJIE] = this.dpoint[Global.attrTypeL2.MINJIE] || 0;

		this.ppoint[Global.attrTypeL2.GENGU] = this.ppoint[Global.attrTypeL2.GENGU] || 0;
		this.ppoint[Global.attrTypeL2.LINGXING] = this.ppoint[Global.attrTypeL2.LINGXING] || 0;
		this.ppoint[Global.attrTypeL2.LILIANG] = this.ppoint[Global.attrTypeL2.LILIANG] || 0;
		this.ppoint[Global.attrTypeL2.MINJIE] = this.ppoint[Global.attrTypeL2.MINJIE] || 0;

		let cur_rate = this.getCurRate();
		let calhp = Math.round(this.level * cur_rate / 10000 * (this.level + this.ppoint[Global.attrTypeL2.GENGU]) + 0.7 * this.getBaseProperty('hp') * this.level * cur_rate / 10000 + this.getBaseProperty('hp'));
		let calmp = Math.round(this.level * cur_rate / 10000 * (this.level + this.ppoint[Global.attrTypeL2.LINGXING]) + 0.7 * this.getBaseProperty('mp') * this.level * cur_rate / 10000 + this.getBaseProperty('mp'));
		let calatk = Math.round(0.2 * this.level * cur_rate / 10000 * (this.level + this.ppoint[Global.attrTypeL2.LILIANG]) + 0.2 * 0.7 * this.getBaseProperty('atk') * this.level * cur_rate / 10000 + this.getBaseProperty('atk'));
		let calspd = Math.round((this.getBaseProperty('spd') + (this.level + this.ppoint[Global.attrTypeL2.MINJIE])) * cur_rate / 10000);

		this.setAttr1(Global.attrTypeL1.HP, calhp);
		this.setAttr1(Global.attrTypeL1.MAXHP, calhp);
		this.setAttr1(Global.attrTypeL1.MP, calmp);
		this.setAttr1(Global.attrTypeL1.MAXMP, calmp);
		this.setAttr1(Global.attrTypeL1.ATK, calatk);
		this.setAttr1(Global.attrTypeL1.SPD, calspd);

		this.dpoint[Global.attrTypeL1.DFENGYIN] = this.dpoint[Global.attrTypeL1.DFENGYIN] || 0;
		this.dpoint[Global.attrTypeL1.DHUNLUAN] = this.dpoint[Global.attrTypeL1.DHUNLUAN] || 0;
		this.dpoint[Global.attrTypeL1.DHUNSHUI] = this.dpoint[Global.attrTypeL1.DHUNSHUI] || 0;
		this.dpoint[Global.attrTypeL1.DYIWANG] = this.dpoint[Global.attrTypeL1.DYIWANG] || 0;
		this.dfengyin = this.dpoint[Global.attrTypeL1.DFENGYIN] * 4;
		this.dhunlun = this.dpoint[Global.attrTypeL1.DHUNLUAN] * 4;
		this.dhunshui = this.dpoint[Global.attrTypeL1.DHUNSHUI] * 4;
		this.dyiwang = this.dpoint[Global.attrTypeL1.DYIWANG] * 4;

		this.setAttr1(Global.attrTypeL1.DFENGYIN, this.dfengyin);
		this.setAttr1(Global.attrTypeL1.DHUNLUAN, this.dhunlun);
		this.setAttr1(Global.attrTypeL1.DHUNSHUI, this.dhunshui);
		this.setAttr1(Global.attrTypeL1.DYIWANG, this.dyiwang);

		this.dpoint[Global.attrTypeL1.DFENG] = this.dpoint[Global.attrTypeL1.DFENG] || 0;
		this.dpoint[Global.attrTypeL1.DSHUI] = this.dpoint[Global.attrTypeL1.DSHUI] || 0;
		this.dpoint[Global.attrTypeL1.DHUO] = this.dpoint[Global.attrTypeL1.DHUO] || 0;
		this.dpoint[Global.attrTypeL1.DDU] = this.dpoint[Global.attrTypeL1.DDU] || 0;
		this.dpoint[Global.attrTypeL1.DLEI] = this.dpoint[Global.attrTypeL1.DLEI] || 0;
		this.dpoint[Global.attrTypeL1.DGUIHUO] = this.dpoint[Global.attrTypeL1.DGUIHUO] || 0;
		this.dpoint[Global.attrTypeL1.DSANSHI] = this.dpoint[Global.attrTypeL1.DSANSHI] || 0;

		this.dfeng = this.dpoint[Global.attrTypeL1.DFENG] * 4;
		this.dshui = this.dpoint[Global.attrTypeL1.DSHUI] * 4;
		this.dhuo = this.dpoint[Global.attrTypeL1.DHUO] * 4;
		this.ddu = this.dpoint[Global.attrTypeL1.DDU] * 4;
		this.dlei = this.dpoint[Global.attrTypeL1.DLEI] * 4;
		this.dguihuo = this.dpoint[Global.attrTypeL1.DGUIHUO] * 4;
		this.dsanshi = this.dpoint[Global.attrTypeL1.DSANSHI] * 4;
		this.dzhenshe = 0;

		this.setAttr1(Global.attrTypeL1.DFENG, this.dfeng);
		this.setAttr1(Global.attrTypeL1.DSHUI, this.dshui);
		this.setAttr1(Global.attrTypeL1.DHUO, this.dhuo);
		this.setAttr1(Global.attrTypeL1.DDU, this.ddu);
		this.setAttr1(Global.attrTypeL1.DLEI, this.dlei);
		this.setAttr1(Global.attrTypeL1.DGUIHUO, this.dguihuo);
		this.setAttr1(Global.attrTypeL1.DSANSHI, this.dzhenshe);

		this.dpoint[Global.attrTypeL1.PXISHOU] = this.dpoint[Global.attrTypeL1.PXISHOU] || 0;
		this.dpoint[Global.attrTypeL1.PMINGZHONG] = this.dpoint[Global.attrTypeL1.PMINGZHONG] || 0;
		this.dpoint[Global.attrTypeL1.PSHANBI] = this.dpoint[Global.attrTypeL1.PSHANBI] || 0;
		this.dpoint[Global.attrTypeL1.PLIANJI] = this.dpoint[Global.attrTypeL1.PLIANJI] || 0;
		this.dpoint[Global.attrTypeL1.PLIANJILV] = this.dpoint[Global.attrTypeL1.PLIANJILV] || 0;
		this.dpoint[Global.attrTypeL1.PKUANGBAO] = this.dpoint[Global.attrTypeL1.PKUANGBAO] || 0;
		this.dpoint[Global.attrTypeL1.PPOFANG] = this.dpoint[Global.attrTypeL1.PPOFANG] || 0;
		this.dpoint[Global.attrTypeL1.PPOFANGLV] = this.dpoint[Global.attrTypeL1.PPOFANGLV] || 0;
		this.dpoint[Global.attrTypeL1.PFANZHENLV] = this.dpoint[Global.attrTypeL1.PFANZHENLV] || 0;
		this.dpoint[Global.attrTypeL1.PFANZHEN] = this.dpoint[Global.attrTypeL1.PFANZHEN] || 0;

		this.pxishou = this.dpoint[Global.attrTypeL1.PXISHOU] * 3;
		this.pmingzhong = 80 + this.dpoint[Global.attrTypeL1.PMINGZHONG] * 1.5;
		this.pshanbi = this.dpoint[Global.attrTypeL1.PSHANBI] * 1.5;
		this.plianji = 3 + this.dpoint[Global.attrTypeL1.PLIANJI] * 1;
		this.plianjilv = this.dpoint[Global.attrTypeL1.PLIANJILV] * 1.5;
		this.pkuangbao = this.dpoint[Global.attrTypeL1.PKUANGBAO] * 1.5;
		this.ppofang = this.dpoint[Global.attrTypeL1.PPOFANG] * 3;
		this.ppofanglv = this.dpoint[Global.attrTypeL1.PPOFANGLV] * 3;
		this.pfanzhenlv = this.dpoint[Global.attrTypeL1.PFANZHENLV] * 4;
		this.pfanzhen = this.dpoint[Global.attrTypeL1.PFANZHEN] * 4;

		this.setAttr1(Global.attrTypeL1.PXISHOU, this.pxishou);
		this.setAttr1(Global.attrTypeL1.PMINGZHONG, this.pmingzhong);
		this.setAttr1(Global.attrTypeL1.PSHANBI, this.pshanbi);
		this.setAttr1(Global.attrTypeL1.PLIANJI, this.plianji);
		this.setAttr1(Global.attrTypeL1.PLIANJILV, this.plianjilv);
		this.setAttr1(Global.attrTypeL1.PKUANGBAO, this.pkuangbao);
		this.setAttr1(Global.attrTypeL1.PPOFANG, this.ppofang);
		this.setAttr1(Global.attrTypeL1.PPOFANGLV, this.ppofanglv);
		this.setAttr1(Global.attrTypeL1.PFANZHENLV, this.pfanzhenlv);
		this.setAttr1(Global.attrTypeL1.PFANZHEN, this.pfanzhen);

		this.maxhp = this.getBaseProperty('hp');
		this.maxmp = this.getBaseProperty('mp');
		this.maxexp = ExpMgr.shared.GetSummonUpGradeExp(this.relive, this.level);

		this.calPassiveSkillAttr();
	}

	calPassiveSkillAttr() {
		// let list = deepClone(this.skill_list);
		// list[this.shenskill] = 1;
		let skillattr = (skillid:any) => {
			let skill = SkillMgr.shared.getSkill(skillid);
			if (skill && skill.action_type == Global.BtlActionType.PPassive) {
				let ret = skill.getEffect({
					level: this.level,
					relive: this.relive,
					qinmi: this.qinmi
				});
				let effectlist = skill.effect_type;
				for (const effecttype of effectlist) {
					if (ret.add) {
						this.attr1[effecttype] += ret.add;
						if (effecttype == Global.attrTypeL1.MAXHP) {
							this.attr1[Global.attrTypeL1.HP] = this.attr1[Global.attrTypeL1.MAXHP];
						}
						if (effecttype == Global.attrTypeL1.MAXMP) {
							this.attr1[Global.attrTypeL1.MP] = this.attr1[Global.attrTypeL1.MAXMP];
						}
					}
					if (ret.reduce) {
						this.attr1[effecttype] -= ret.reduce;
					}
				}
			}
		};
		for (const skillid in this.skill_list) {
			skillattr(skillid);
		}
		if (this.shenskill != 0) {
			skillattr(this.shenskill);
		}
	}

	toObj() {
		let obj:any = {};
		obj.petid = this.petid;
		obj.dataid = this.dataid;
		obj.onlyid = this.onlyid;
		obj.ownid = this.owner.roleid;
		obj.name = this.name;
		obj.relive = this.relive;
		obj.level = this.level;
		obj.resid = this.resid;
		obj.grade = this.grade;
		obj.skill = JSON.stringify(this.skill_list);
		obj.ppoint = JSON.stringify(this.ppoint);
		obj.dpoint = JSON.stringify(this.dpoint);
		obj.wuxing = JSON.stringify(this.wuxing);
		obj.exp = this.exp;
		obj.rate = this.getCurRate();
		obj.maxrate = this.getMaxRate();
		obj.hp = this.getBaseProperty('hp');
		obj.mp = this.getBaseProperty('mp');
		obj.atk = this.getBaseProperty('atk');
		obj.spd = this.getBaseProperty('spd');
		obj.intro = this.intro;
		obj.xexp = this.xexp;
		obj.xlevel = this.xlevel;
		obj.longgu = this.longgu;
		obj.maxskillcnt = this.maxskillcnt;
		obj.attr1 = JSON.stringify(this.attr1);
		obj.shenskill = this.shenskill;
		obj.color = this.color;
		obj.qinmi = this.qinmi;
		obj.fly = this.fly;
		// obj.curhp = this.getAttr1(Global.attrTypeL1.MAXHP);
		// obj.curmp = this.getAttr1(Global.attrTypeL1.MAXMP);
		// obj.curatk = this.getAttr1(Global.attrTypeL1.ATK);
		// obj.curspd = this.getAttr1(Global.attrTypeL1.SPD);
		return obj;
	}

	petRelive() {
		if (!this.owner) {
			return;
		}

		let nextlive = this.relive + 1;
		if (nextlive > 3) { //最大转生3
			this.owner.send('s2c_notice', {
				strRichText: Global.msgCode.RELIVE_LEVEL_TOO_HIGH + ''
			});
			return;
		}
		if (nextlive > this.owner.relive) { //最大转生3
			this.owner.send('s2c_notice', {
				strRichText: '角色转生等级不足'
			});
			return;
		}
		if (this.level < ExpMgr.shared.GetSummonMaxGrade(this.relive)) { //等级不够
			this.owner.send('s2c_notice', {
				strRichText: Global.msgCode.RELIVE_LEVEL_NOT_ENOUGH + ''
			});
			return;
		}
		let maxrate = this.getMaxRate();
		if (this.rate > maxrate) {
			this.rate = maxrate;
		}

		this.relive = nextlive;
		this.level = ExpMgr.shared.GetSummonGradeStart(this.relive);

		for (const key in this.ppoint) {
			this.ppoint[key] = 0;
		}
		this.addExp(0);

		this.calculateAttribute();
		this.owner.send('s2c_notice', {
			strRichText: `您的召唤兽${this.name}${this.relive}转成功！`
		});
	}

	
	washProperty() {
		if (!this.owner) {
			return;
		}
		let data = PetMgr.shared.getBaseAttr(this.dataid);
		this.wash_property = Global.deepClone(data); // 保存的属性不能+60 
		switch (parseInt(""+this.fly/10)) { // 神兽飞升 
			case 1:
				data.hp += 60;
				break;
			case 2:
				data.mp += 60;
				break;
			case 3:
				data.atk += 60;
				break;
			case 4:
				data.spd += 60;
				break;
		}
		data.rate += this.getRateAdd();
		data.maxrate = this.getMaxRate(); // 元气丹可以影响最大成长率 
		if (data.rate > data.maxrate) {
			console.log('data.rate, data.maxrate', data.rate, data.maxrate);
		}
		this.owner.send('s2c_wash_petproperty', data);
	}

	
	saveProperty() {
		if (!this.owner) {
			return;
		}
		if (this.wash_property) {
			this.rate = this.wash_property.rate;
			this.basehp = this.wash_property.hp;
			this.basemp = this.wash_property.mp;
			this.basespd = this.wash_property.spd;
			this.baseatk = this.wash_property.atk;

			this.calculateAttribute();

			this.owner.send('s2c_update_pet', {
				info: this.toObj()
			});
			let ret_data = {
				errcode: Global.msgCode.SUCCESS,
				petid: this.petid,
				rate: this.getCurRate(),
				maxrate: this.getMaxRate(),
				hp: this.getBaseProperty('hp'),
				mp: this.getBaseProperty('mp'),
				spd: this.getBaseProperty('spd'),
				atk: this.getBaseProperty('atk'),
			};
			
			this.owner.send('s2c_save_petproperty', ret_data);
			this.wash_property = null;
		}
	}

	useLongGu() {
		if (this.longgu < PetMgr.shared.getMaxLongGu(this.relive)) {
			this.longgu += 1;
			this.calculateAttribute();
			if (this.owner) {
				this.owner.send('s2c_update_pet', {
					info: this.toObj()
				});
			}
			return true;
		}
		return false;
	}

	save() {
		if (this.state == 0) {
			DB.delPet(this.petid, () => {});
		} else {
			let savedata:any = {};
			savedata.name = this.name;
			savedata.relive = this.relive;
			savedata.level = this.level;
			savedata.grade = this.grade;
			savedata.dataid = this.dataid;
			savedata.skill = JSON.stringify(this.skill_list);
			savedata.ppoint = JSON.stringify(this.ppoint);
			savedata.dpoint = JSON.stringify(this.dpoint);
			savedata.wuxing = JSON.stringify(this.wuxing);
			savedata.rate = this.rate;
			savedata.hp = this.basehp;
			savedata.mp = this.basemp;
			savedata.atk = this.baseatk;
			savedata.spd = this.basespd;
			savedata.exp = this.exp;
			savedata.xexp = this.xexp;
			savedata.xlevel = this.xlevel;
			savedata.roleid = this.owner.roleid;
			savedata.longgu = this.longgu;
			savedata.shenskill = this.shenskill;
			savedata.color = this.petColorTransformDB(this.color);
			savedata.qinmi = this.qinmi;
			savedata.fly = this.fly;
			DB.savePetInfo(this.petid, savedata, () => {});
		}
	}

	addExp(exp:any):boolean{
		if(exp == 0){
			return false;
		}
		let maxlevel = ExpMgr.shared.GetSummonMaxGrade(this.relive);
		let plevel = this.owner == null ? 0 : this.owner.level;
		let prelive = this.owner == null ? 0 : this.owner.relive;
		if (this.relive >= prelive) {
			maxlevel = Math.min(maxlevel, plevel + 10);
		}
		let upexp = ExpMgr.shared.GetSummonUpGradeExp(this.relive, this.level);
		if (this.level >= maxlevel && this.exp >= upexp) { //超过本次转生的最大等级
			return false;
		}
		this.exp += exp;
		let isleavelup = false;
		while (this.exp >= upexp) {
			this.exp -= upexp;
			this.level++;
			if (this.level > maxlevel) {
				this.level = maxlevel;
				this.exp = ExpMgr.shared.GetSummonUpGradeExp(this.relive, this.level);
				break;
			}
			isleavelup = true;
			upexp = ExpMgr.shared.GetSummonUpGradeExp(this.relive, this.level);
		}
		if (isleavelup) {
			this.owner.send('s2c_notice', {
				strRichText: `您的召唤兽${this.name}等级升到了${this.level}级！`
			});
		}
		this.calculateAttribute();
		if (this.owner) {
			this.owner.send('s2c_update_pet', {
				info: this.toObj()
			});
		}
		this.owner.send('s2c_notice', {
			strRichText: `获得  ${exp} 宠物经验`
		});
		return true;
	}

	getSkillNum() {
		return Object.keys(this.skill_list).length;
	}

	learnSkill(skillid:any) {
		let skilldata = SkillMgr.shared.getSkill(skillid);
		if (skilldata == null) {
			return false;
		}
		if (this.skill_list[skillid] != null) {
			return false;
		}

		let skillnum = this.getSkillNum();
		if (skillnum >= this.maxskillcnt) {
			this.send('s2c_notice', {
				strRichText: `宠物技能已满`
			});
			return false;
		}

		if (skilldata.kind != 0) {
			for (const sid in this.skill_list) {
				let tmpsinfo = SkillMgr.shared.getSkill(sid);
				if (tmpsinfo.kind == skilldata.kind) {
					if (tmpsinfo.quality > skilldata.quality) {
						return false;
					}
					delete this.skill_list[sid];
				}
			}
		}

		// 遗忘上一个技能
		let forget_str = '';
		let lastskillinfo = null;
		let tmp = 0;
		for (const skillid in this.skill_list) {
			const skillinfo = this.skill_list[skillid];
			if (skillinfo.idx > tmp && skillinfo.lck == 0) {
				lastskillinfo = skillinfo;
				lastskillinfo.skillid = skillid;
				tmp = skillinfo.idx;
			}
		}
		if (lastskillinfo && lastskillinfo.lck == 0) {
			if (skillnum > 1 || skilldata.skill == 0 || lastskillinfo.skillid != skilldata.skill) {
				let onerand = 10000 / (this.maxskillcnt - 1);
				let rand = Global.random(0, 10000);
				if (rand < onerand * tmp) {
					delete this.skill_list[lastskillinfo.skillid];
					skillnum--;
					let lastskilldata = SkillMgr.shared.getSkill(lastskillinfo.skillid);
					if (lastskilldata) {
						forget_str = `, 遗忘了 ${lastskilldata.skill_name} 技能`;
					} else {
						forget_str = `, 遗忘了技能`;
					}
				}
			}
		}

		this.skill_list[skillid] = {
			idx: skillnum,
			lck: 0
		};
		this.calculateAttribute();

		let str = `${this.name}习得 ${skilldata.skill_name}` + forget_str;
		this.send('s2c_notice', {
			strRichText: str,
		});
		this.send('s2c_update_pet', {
			info: this.toObj()
		});

		if (this.owner) {
			console.log(`玩家[${this.owner.name}(${this.owner.roleid})]的召唤兽[${this.name}(${this.petid})]习得${skilldata.skill_name}` + forget_str);
		}
		return true;
	}

	getLockedSkillNum(){
		let n = 0;
		for (const skillid in this.skill_list) {
			if (this.skill_list.hasOwnProperty(skillid)) {
				const skillinfo = this.skill_list[skillid];
				if(skillinfo.lck == 1){
					n ++;
				}
			}
		}
		return n;
	}

	forgetSkill(skillid:any) {
		delete this.skill_list[skillid];
		let skillinfo = SkillMgr.shared.getSkill(skillid);
		let str = `玩家[${this.owner.name}(${this.owner.roleid})]的召唤兽[${this.name}(${this.petid})]遗忘了`;
		if (skillinfo) {
			str += `${skillinfo.skill_name}`;

			this.send('s2c_notice', {
				strRichText: `你的召唤兽 ${this.name} 遗忘了 ${skillinfo.skill_name}`,
			});
		}
		str += `(${skillid})`;
		console.log(str);

		this.send('s2c_update_pet', {
			info: this.toObj()
		});
	}

	lockSkill(skillid:any) {
		let skillinfo = this.skill_list[skillid];
		if (skillinfo && skillinfo.lck == 0) {
			skillinfo.lck = 1;
			this.send('s2c_update_pet', {
				info: this.toObj()
			});
			return true;
		}
		return false;
	}

	changeShenShouSkill(skillid:any) {
		this.shenskill = skillid;
		this.calculateAttribute();
	}

	send(event:any, data:any) {
		if (this.owner) {
			this.owner.send(event, data);
		}
	}

	
	petColorTransformDB(color:any) {
		if (color > 700) {
			return color;
		}
		return color + 2000;
	}

	
	petColorTransformCom(color:any) {
		if (color > 700) {
			return color - 2000;
		}
		return color;
	}

	
	addQinmi(qinmi:number) {
		if (this.qinmi < 500000) {
			this.qinmi += qinmi;
			this.owner.send('s2c_update_pet', {
				info: this.toObj()
			});
			return true;
		}
		return false;
	}

	getMaxRate() {
		let maxrate = PetMgr.shared.getMaxRate(this.dataid) + this.getRateAdd(); // 元气丹可以影响最大成长率 
		return maxrate;
	}

	// 成长增量 0.612 + 0.01 * 12 + 0.1 * 3 + 1 = 
	getRateAdd() {
		let yqrate = GoodsMgr.shared.getPetUseYuanqiRate(this.dataid);
		yqrate = this.color == -1 ? 0 : yqrate;
		let addrate = this.relive * 1000 + this.longgu * 100 + yqrate * 10000;

		addrate += (this.fly%10 >= 1)? 1000:0;
		addrate += (this.fly%10 >= 2)? 500:0;
		return addrate;
	}

	getCurRate() {
		let rate = this.rate + this.getRateAdd(); // 成长率，服务器计算 
		return rate;
	}

	
	flyingUp (type:any) {
		if (this.grade < 3 || !this.owner) { 
			return;
		}
		if (this.level >= 50 && this.relive >= 0 && this.fly%10 == 0) { // 第一次飞升 
			++ this.fly;
			type = 0;
			this.owner.send('s2c_notice', { strRichText: '第一次飞升成功！' });
		}
		else if (this.level >= 100 && this.relive >= 1 && this.fly%10 == 1) { // 第二次飞升 
			++ this.fly;
			type = 0;
			this.owner.send('s2c_notice', { strRichText: '第二次飞升成功！' });
		}
		else if (this.level >= 120 && this.relive >= 2 && this.fly%10 == 2) { // 第三次飞升 
			if (this.owner.money < 5000000) {
				this.owner.send('s2c_notice', { strRichText: '银两不足' });
				return;
			}
			this.owner.send('s2c_notice', { strRichText: '第三次飞升成功！' });
			++ this.fly;
		}
		else if (this.level >= 120 && this.relive >= 2 && this.fly%10 == 3) { // 不是修改属性 
			if (this.owner.money < 5000000) {
				this.owner.send('s2c_notice', { strRichText: '银两不足' });
				return;
			}
			this.owner.send('s2c_notice', { strRichText: '修改属性成功！' });
		}
		else {
			return;
		}
		if (this.fly%10 == 3 && type != 0 && type != parseInt(""+this.fly/10)) {
			this.owner.AddMoney(0, -5000000, '宠物进行飞升');
		}
		this.fly = type*10 + this.fly%10;
		this.calculateAttribute();
		this.owner.send('s2c_update_pet', {
			info: this.toObj()
		});
	}

	
	getBaseProperty (type:any) {
		let fly_property = parseInt(""+this.fly/10);
		let ret = 0;
		if (type == 1 || type == 'hp') {
			ret = this.basehp + ((fly_property == 1)? 60:0);
		}
		else if (type == 2 || type == 'mp') {
			ret = this.basemp + ((fly_property == 2)? 60:0);
		}
		else if (type == 3 || type == 'atk') {
			ret = this.baseatk + ((fly_property == 3)? 60:0);
		}
		else if (type == 4 || type == 'spd') {
			ret = this.basespd + ((fly_property == 4)? 60:0);
		}
		return ret;
	}
}
