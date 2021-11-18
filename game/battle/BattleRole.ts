import Global from "../../game/core/Global";
import SkillMgr from "../skill/core/SkillMgr";
import ExpMgr from "../core/ExpMgr";
import PlayerMgr from "../../game/object/PlayerMgr";

export default class BattleRole {
	onlyid:number;
	online_state:number;
	battle_id:number;
	dataid:number;
	name:string;
	resid:number;
	level:number;
	relive:number;
	pos:number;
	owner:any;
	own_onlyid:number;
	qinmi:number;
	bindid:number;
	living_type:number;
	team_id:number;
	isact:boolean;
	isroundact:boolean;
	isdead:boolean;
	beCache:boolean;
	act:any;
	roleattr:any;
	last_skill:any;
	def_skill_times:any;
	skill_list:any;
	buff_list:any;
	is_bb:boolean;
	color:any;
	color1:any;
	color2:any;
	// 自己的原型
	source:any;
	// 用过的技能 限制技能
	used_skill:any; // skillid: times
	ownid:any;
	weapon:any;

	constructor() {
		this.onlyid = 0;
		this.online_state = 1;
		this.battle_id = 0;
		this.dataid = 0;
		this.name = '';
		this.resid = 0;
		this.level = 0;
		this.relive = 0;
		this.pos = 0; // -1 不可登场 0 等待登场 >0 战场所在位置
		this.owner = null;
		this.own_onlyid = 0;
		this.qinmi = 0;// 如果是宠物 亲密值
		this.bindid = 0; // 关系id 宠物对应主人，主人对应上场宠物
		this.living_type = Global.livingType.Unknow;

		this.team_id = 0; // 1 or 2

		this.isact = false; // 是否 得到了玩家行动指令
		this.isroundact = false; // 在一回合内是否行动过

		this.isdead = false;
		this.beCache = false;

		this.act = {
			acttype: 0, //1伤害 2治疗 3buff
			skill: 0,
			target: 0,
			actionid: 0,
			action: 0, // 1技能 2道具 3召唤
		};

		this.roleattr = {};

		this.last_skill = 0;
		this.def_skill_times = 0;

		this.skill_list = {};

		this.buff_list = [];

		this.is_bb = false;
		this.color = -1;
		this.color1 = 0;
		this.color2 = 0;
		// 自己的原型
		this.source = null;
		// 用过的技能 限制技能
		this.used_skill = {}; // skillid: times
	}

	init() {
		this.isact = false;
		this.isroundact = false; // 在一回合内是否行动过
		this.act = {
			acttype: 0, //1伤害 2治疗 3buff
			skill: 0,
			target: 0,
			actionid: 0,
			action: 0, // 1技能 2道具 3召唤
		};
	}

	setRole(role:any) {
		this.roleattr = role.getBtlAttr();
		this.onlyid = role.onlyid;
		let skilllist = role.getSkillList();
		let slist:any = {};
		for (const sid in skilllist) {
			const p = skilllist[sid];
			if (sid == Global.skillIds.FeiLongZaiTian) {
				slist[Global.skillIds.FeiLongZaiTian_Feng] = { skillid: Global.skillIds.FeiLongZaiTian_Feng, profic: p, canuse: true, cooldown: 0, };
				slist[Global.skillIds.FeiLongZaiTian_Huo] = { skillid: Global.skillIds.FeiLongZaiTian_Huo, profic: p, canuse: true, cooldown: 0, };
				slist[Global.skillIds.FeiLongZaiTian_Shui] = { skillid: Global.skillIds.FeiLongZaiTian_Shui, profic: p, canuse: true, cooldown: 0, };
				slist[Global.skillIds.FeiLongZaiTian_Lei] = { skillid: Global.skillIds.FeiLongZaiTian_Lei, profic: p, canuse: true, cooldown: 0, };
				continue;
			}
			if (sid == Global.skillIds.YouFengLaiYi) {
				slist[Global.skillIds.YouFengLaiYi_Jin] = { skillid: Global.skillIds.YouFengLaiYi_Jin, profic: p, canuse: true, cooldown: 0, };
				slist[Global.skillIds.YouFengLaiYi_Mu] = { skillid: Global.skillIds.YouFengLaiYi_Mu, profic: p, canuse: true, cooldown: 0, };
				slist[Global.skillIds.YouFengLaiYi_Shui] = { skillid: Global.skillIds.YouFengLaiYi_Shui, profic: p, canuse: true, cooldown: 0, };
				slist[Global.skillIds.YouFengLaiYi_Huo] = { skillid: Global.skillIds.YouFengLaiYi_Huo, profic: p, canuse: true, cooldown: 0, };
				slist[Global.skillIds.YouFengLaiYi_Tu] = { skillid: Global.skillIds.YouFengLaiYi_Tu, profic: p, canuse: true, cooldown: 0, };
				continue;
			}

			slist[sid] = {
				skillid: sid,
				profic: p,
				canuse: true,
				cooldown: 0,
			};
		}
		if (role.shenskill != null) {
			slist[role.shenskill] = {
				skillid: role.shenskill,
				profic: 0,
				canuse: true,
				cooldown: 0,
			};
		}
		this.skill_list = slist;

		this.resid = role.resid;
		this.name = role.name;
		this.level = role.level;
		this.relive = role.relive;
		this.living_type = role.living_type;
		if (role.isPet()) {
			if (role.owner) {
				this.ownid = role.owner.roleid;
				this.own_onlyid = role.owner.onlyid;
				if (role.owner.offline) {
					this.online_state = 0;
				}
			}
			this.qinmi = role.qinmi || 0;
		}
		if (role.isPlayer() && role.offline) {
			this.online_state = 0;
		}

		this.last_skill = role.default_btl_skill;

		this.weapon = '';
		if (this.isPlayer() && role.curEquips) {
			for (const equip of role.curEquips) {
				if (equip.EIndex == 1) {
					let equipobj:any = {};
					equipobj.equipid = equip.EquipID;
					equipobj.gemcnt = equip.GemCnt;
					equipobj.type = equip.EquipType;
					equipobj.level = equip.Grade;
					this.weapon = JSON.stringify(equipobj);
					break;
				}
			}
		}
		this.dataid = role.dataid;
		if (typeof (role.color) == 'number') { // 宠物变色 
			this.color = role.color;
		}
		if (typeof (role.color1) == 'number') { // 人物染色1 
			this.color1 = role.color1;
		}
		if (typeof (role.color2) == 'number') { // 人物染色2 
			this.color2 = role.color2;
		}
		this.source = role;
	}

	isNpc() {
		return this.living_type == Global.livingType.NPC;
	}

	isPlayer() {
		return this.living_type == Global.livingType.Player;
	}

	isMonster() {
		return this.living_type == Global.livingType.Monster;
	}

	isPet() {
		return this.living_type == Global.livingType.Pet;
	}

	isPartner() {
		return this.living_type == Global.livingType.Partner;
	}

	addLimitSkill(skillid:any) {
		if (this.used_skill[skillid] == null) {
			this.used_skill[skillid] = 0;
		}
		this.used_skill[skillid]++;
	}

	getData():any{
		let skilllist = [];
		if (this.living_type == Global.livingType.Pet) {
			for (const skillid in this.skill_list) {
				const sinfo = this.skill_list[skillid];
				skilllist.push(sinfo.skillid);
			}
		}
		return {
			onlyid: this.onlyid,
			resid: this.resid,
			name: this.name,
			maxhp: this.getMaxHp(),
			maxmp: this.getMaxMp(),
			hp: this.getHp(),
			mp: this.getMp(),
			pos: this.pos,
			type: this.living_type,
			ownonlyid: this.own_onlyid,
			weapon: this.weapon,
			relive: this.relive,
			skilllist: skilllist,
			isbb: this.is_bb,
			level: this.level,
			isfight: this.pos != 0 ? 1 : 0,
			color: this.color,
			color1: this.color1,
			color2: this.color2,
		};
	}

	getHp():any{
		return this.roleattr[Global.attrTypeL1.HP];
	}

	getMp():any{
		return this.roleattr[Global.attrTypeL1.MP];
	}

	getMaxHp():any{
		return this.roleattr[Global.attrTypeL1.MAXHP] + this.getBuffAttr(Global.attrTypeL1.MAXHP);
	}

	getMaxMp():any{
		return this.roleattr[Global.attrTypeL1.MAXMP] + this.getBuffAttr(Global.attrTypeL1.MAXMP);
	}

	clean() {

	}

	subHp(hp:any) {
		this.roleattr[Global.attrTypeL1.HP] += hp;
		if (this.roleattr[Global.attrTypeL1.HP] > this.roleattr[Global.attrTypeL1.MAXHP]) {
			this.roleattr[Global.attrTypeL1.HP] = this.roleattr[Global.attrTypeL1.MAXHP];
		}
		if (this.roleattr[Global.attrTypeL1.HP] <= 0) {
			this.roleattr[Global.attrTypeL1.HP] = 0;
			this.dead();
		} else {
			this.isdead = false;
		}
	}

	subMp(mp:any) {
		this.roleattr[Global.attrTypeL1.MP] += mp;
		if (this.roleattr[Global.attrTypeL1.MP] > this.roleattr[Global.attrTypeL1.MAXMP]) {
			this.roleattr[Global.attrTypeL1.MP] = this.roleattr[Global.attrTypeL1.MAXMP];
		}
	}

	getHpPre() {
		return this.getHp() / this.getMaxHp();
	}

	getMpPre() {
		return this.getMp() / this.getMaxMp();
	}

	getBuffAttr(attrtype:any) {
		let attr = 0;
		for (const buff of this.buff_list) {
			attr += buff.getAttr(attrtype);
		}
		return attr;
	}

	isDead() {
		return this.isdead;
	}

	dead() {
		this.isdead = true;
	}

	getAttr(attrtype:any) {
		let num = this.roleattr[attrtype] + this.getBuffAttr(attrtype);
		let list = Global.attrToBtlAttr[attrtype];
		if (list != null) {
			for (const t of list) {
				let n = this.roleattr[t];
				if (Global.equipTypeNumerical[t] == null) {
					num = num + n;
				} else {
					num = (1 + n) * num;
				}
			}
		}
		return num;
	}

	setAttr(attrtype:any, num:any) {
		this.roleattr[attrtype] = num;
	}

	getPoFangPre() {
		return;
	}

	getPoFang():any{
		let r = Global.random(0, 10000);
		let pflv = this.getAttr(Global.attrTypeL1.PPOFANGLV);
		if (r > pflv * 100) {
			return 0;
		}
		return this.getAttr(Global.attrTypeL1.PPOFANG);
	}

	getLianji():number{
		let num = 0;
		let lv = this.getAttr(Global.attrTypeL1.PLIANJILV);
		let r = Global.random(0, 10000);
		if (r > lv * 100) {
			return num;
		}
		let max = this.getAttr(Global.attrTypeL1.PLIANJI);
		r = Global.random(0, 10000);
		num = Math.ceil(r / (10000 / max));
		return num;
	}

	getKangWuLi():any{
		return this.getAttr(Global.attrTypeL1.DWULI);
	}

	getKuangBaoPre(skilltype:any):any{
		let ret = 0;
		if (skilltype == Global.EMagicType.Physics) {
			ret = this.getAttr(Global.attrTypeL1.PKUANGBAO);
		} else if (skilltype == Global.EMagicType.Fire) {
			ret = this.getAttr(Global.attrTypeL1.HUOKBPRE);
		} else if (skilltype == Global.EMagicType.Water) {
			ret = this.getAttr(Global.attrTypeL1.SHUIKBPRE);
		} else if (skilltype == Global.EMagicType.Wind) {
			ret = this.getAttr(Global.attrTypeL1.FENGKBPRE);
		} else if (skilltype == Global.EMagicType.Thunder) {
			ret = this.getAttr(Global.attrTypeL1.LEIKBPRE);
		} else if (skilltype == Global.EMagicType.ThreeCorpse) {
			ret = this.getAttr(Global.attrTypeL1.SANSHIKBPRE);
		} else if (skilltype == Global.EMagicType.GhostFire) {
			ret = this.getAttr(Global.attrTypeL1.GUIHUOKBPRE);
		}
		return ret;
	}

	getKuangBaoStr(skilltype:any):any{
		let ret = 0;
		if (skilltype == Global.EMagicType.Physics) {
			ret = 50;
		} else if (skilltype == Global.EMagicType.Fire) {
			ret = this.getAttr(Global.attrTypeL1.HUOKB);
		} else if (skilltype == Global.EMagicType.Water) {
			ret = this.getAttr(Global.attrTypeL1.SHUIKB);
		} else if (skilltype == Global.EMagicType.Wind) {
			ret = this.getAttr(Global.attrTypeL1.FENGKB);
		} else if (skilltype == Global.EMagicType.Thunder) {
			ret = this.getAttr(Global.attrTypeL1.LEIKB);
		} else if (skilltype == Global.EMagicType.ThreeCorpse) {
			ret = this.getAttr(Global.attrTypeL1.SANSHIKB);
		} else if (skilltype == Global.EMagicType.GhostFire) {
			ret = this.getAttr(Global.attrTypeL1.GUIHUOKB);
		}
		return ret;
	}

	// 分花拂柳
	fenhua(){
		if(this.hasPassiveSkill(Global.skillIds.FenHuaFuLiu) == false){
			return false;
		}
		let fenhuafuliu = SkillMgr.shared.getSkill(Global.skillIds.FenHuaFuLiu);
		let rate = fenhuafuliu.getEffect({level: this.level,qinmi: this.qinmi,relive: this.relive});
		let r = Global.random(0, 10000);
		// rate = 100;
		return r <= rate * 100;
	}

	fenLie(){
		let fenlie = null;
		if(this.hasPassiveSkill(Global.skillIds.FenLieGongJi)){
			fenlie = SkillMgr.shared.getSkill(Global.skillIds.FenLieGongJi);
		}
		if(this.hasPassiveSkill(Global.skillIds.HighFenLieGongJi)){
			fenlie = SkillMgr.shared.getSkill(Global.skillIds.HighFenLieGongJi);
		}
		if(fenlie == null){
			return false;
		}
		let rate = fenlie.getEffect();
		// rate = 100;
		let r = Global.random(0, 10000);
		return r <= rate * 100;
	}

	geShan(){
		let geshan = null;
		let rate = 0;
		if(this.hasPassiveSkill(Global.skillIds.GeShanDaNiu)){
			geshan = SkillMgr.shared.getSkill(Global.skillIds.GeShanDaNiu);
			rate = 25;
		}

		if(this.hasPassiveSkill(Global.skillIds.HighGeShanDaNiu)){
			geshan = SkillMgr.shared.getSkill(Global.skillIds.HighGeShanDaNiu);
			rate = 35;
		}

		if(geshan == null){
			return 0;
		}

		// let rate = fenlie.getEffect();
		// rate = 100;
		let r = Global.random(0, 10000);
		if(r > rate * 100){
			return 0
		}
		let atk = this.getAttr(Global.attrTypeL1.ATK);
		let qinmi = this.qinmi;
		let level = this.level;
		let relive = this.relive;
		let geshannum = geshan.getEffect({atk:atk, level:level, relive: relive, qinmi: qinmi});
		return geshannum;
	}

	shanXian() {
		// return true;
		let shan_xian_rate = 0;
		let shanxian = null;

		if(this.pos == -1){
			return 1;
		}

		if (this.hasPassiveSkill(Global.skillIds.ShanXian)) {
			shanxian = SkillMgr.shared.getSkill(Global.skillIds.ShanXian);
		}
		if (this.hasPassiveSkill(Global.skillIds.HighShanXian)) {
			shanxian = SkillMgr.shared.getSkill(Global.skillIds.HighShanXian);
		}
		if (shanxian == null) {
			return 1;//
		}

		shan_xian_rate = shanxian.getEffect();
		if (shan_xian_rate == 0) {
			return 2;
		}
		let r = Global.random(0, 10000);
		if (r > (shan_xian_rate * 100)) {
			return 2
		}
		return 0;
	}

	addBuff(buff:any) {
		let buffindex = -1;
		let alleq = true;
		if (this.hasBuff(Global.EMagicType.Seal)) {
			return;
		}

		if (buff.effecttype == Global.EMagicType.Seal) {
			this.buff_list = [];
			this.buff_list.push(buff);
			return;
		}

		if (buff.effecttype == Global.EMagicType.Forget) {
			let keys = Object.keys(this.skill_list);
			let r = Global.random(0, keys.length - 1);
			let skillid = keys[r];
			if (this.skill_list[skillid]) {
				this.skill_list[skillid].canuse = false;
			}
		}

		let wuxing = [
			Global.skillIds.ChuiJinZhuanYu, Global.skillIds.KuMuFengChun, Global.skillIds.RuRenYinShui,
			Global.skillIds.FengHuoLiaoYuan, Global.skillIds.XiTianJingTu,
			Global.skillIds.YouFengLaiYi_Jin, Global.skillIds.YouFengLaiYi_Mu, Global.skillIds.YouFengLaiYi_Shui,
			Global.skillIds.YouFengLaiYi_Huo, Global.skillIds.YouFengLaiYi_Tu,
		];
		if (wuxing.indexOf(buff.skill_id) != -1) {
			for (let index = this.buff_list.length - 1; index >= 0; index--) {
				const cbuff = this.buff_list[index];
				if (wuxing.indexOf(cbuff.skill_id) != -1) {
					this.removeBuff(cbuff.buff_id);
				}
			}
		}

		if (SkillMgr.shared.isKongzhiSkill(buff.skill_id)) {
			for (let index = this.buff_list.length - 1; index >= 0; index--) {
				const cbuff = this.buff_list[index];
				if (SkillMgr.shared.isKongzhiSkill(cbuff.skill_id)) {
					this.removeBuff(cbuff.buff_id);
				}
			}
		}

		for (let index = 0; index < this.buff_list.length; index++) {
			const cbuff = this.buff_list[index];
			if (cbuff.skill_id == buff.skill_id) {
				buffindex = index;
				for (const key in cbuff.effects) {
					if (cbuff.effects.hasOwnProperty(key)) {
						const effect = cbuff.effects[key];
						if (buff.effects[key] > effect) {
							this.removeBuff(cbuff.buff_id);
							this.buff_list.push(buff);
							return;
						}
						if (buff.effects[key] != effect) {
							alleq = false;
						}
					}
				}
			}
		}
		if (buffindex == -1) {
			this.buff_list.push(buff);
		}
		if (buffindex != -1 && alleq) {
			this.buff_list[buffindex].cur_round = 0;
		}
	}

	getBuffList() {
		return this.buff_list;
	}

	getBuffsSkillId() {
		let list = [];
		for (const buff of this.buff_list) {
			list.push(buff.skill_id);
		}
		return list;
	}

	removeBuff(buffid:any) {
		for (let i = 0; i < this.buff_list.length; i++) {
			const buff = this.buff_list[i];
			if (buffid == buff.buff_id) {
				if (buff.effecttype == Global.EMagicType.Forget) {
					for (const skillid in this.skill_list) {
						const sinfo = this.skill_list[skillid];
						sinfo.canuse = true;
					}
				}
				this.buff_list.splice(i, 1);
				return;
			}
		}
	}

	hasBuff(effecttype:any) {
		for (let i = 0; i < this.buff_list.length; i++) {
			const buff = this.buff_list[i];
			if (buff.effecttype == effecttype) {
				return true;
			}
		}
		return false;
	}

	getBuffByEffect(effecttype:any):any{
		for (let i = 0; i < this.buff_list.length; i++) {
			const buff = this.buff_list[i];
			if (buff.effecttype == effecttype) {
				return buff;
			}
		}
		return null;
	}

	hasPassiveSkill(skillid:any):any{
		return this.skill_list[skillid] != null;
	}

	checkReplaceBuffRound(skillid:any, round:any) {
		for (let i = 0; i < this.buff_list.length; i++) {
			const buff = this.buff_list[i];
			if (buff.skill_id == skillid) {
				if (buff.round - buff.cur_round < round) {
					buff.cur_round = 0;
					buff.round = round;
				}
			}
		}
	}

	cleanBuff(effecttype:any){
		let list = [];
		for (let i = 0; i < this.buff_list.length; i++) {
			const buff = this.buff_list[i];
			let buffskill = SkillMgr.shared.getSkill(buff.skill_id);
			if (buffskill.skill_type == effecttype) {
				list.push(buff.buff_id);
			}
		}
		for (const buffid of list) {
			this.removeBuff(buffid);
		}
	}

	getSkillProfic(skillid:any) {
		let profic = 0;
		if (skillid == Global.normalAtkSkill) {
			return profic;
		}
		if (this.isPlayer()) {
			let sinfo = this.skill_list[skillid];
			if (sinfo) {
				profic = sinfo.profic == null ? 0 : sinfo.profic;
			}
		} else if (this.isMonster() || this.isPartner() || this.isPet()) {
			profic = ExpMgr.shared.GetMaxSkillLevel(this.relive);
		}
		return profic;
	}

	getSkillInfo(skillid:any):any{
		return this.skill_list[skillid];
	}

	niepan() {
		if (!this.hasPassiveSkill(Global.skillIds.NiePan)) {
			return false;
		}
		let r = Global.random(0, 10000);
		if (r > 3000) {
			return false;
		}
		this.setAttr(Global.attrTypeL1.HP, this.getMaxHp());
		this.setAttr(Global.attrTypeL1.MP, this.getMaxMp());
		this.isdead = false;
		this.buff_list = []
		return true;
	}

	getAiSkill() {
		if (this.isPlayer()) {
			if (this.last_skill == 0) {
				this.last_skill = Global.normalAtkSkill;
			}
			return this.last_skill;
		}
		if (this.isPartner() || this.isMonster() || this.isPet()) {
			let atk_list = [];
			let def_list = [];
			for (const skillid in this.skill_list) {
				if (this.skill_list.hasOwnProperty(skillid)) {
					let sinfo = this.skill_list[skillid];
					if (sinfo.canuse == false || sinfo.cooldown > 0) {
						continue;
					}
					if (SkillMgr.shared.isAtkSkill(skillid)) {
						atk_list.push(skillid);
					}
					if (SkillMgr.shared.isSelfBuffSkill(skillid)) {
						def_list.push(skillid);
					}
					if (SkillMgr.shared.isEnemyBuffSkill(skillid)) {
						atk_list.push(skillid);
					}
				}
			}
			if (def_list.length > 0) {
				if (this.def_skill_times % 3 == 0) {
					this.def_skill_times++;
					let skid:any = def_list[Global.random(0, def_list.length - 1)];
					try {
						skid = parseInt(skid);
					} catch (error) {
						skid = Global.normalAtkSkill;
					}
					return skid;
				}
				this.def_skill_times++;
			}
			if (atk_list.length > 0) {
				let skid:any = atk_list[Global.random(0, atk_list.length - 1)];
				try {
					skid = parseInt(skid);
				} catch (error) {
					skid = Global.normalAtkSkill;
				}
				return skid;
			}
			return Global.normalAtkSkill;
		}
	}

	send(event:any, obj:any) {
		let onlyid = this.onlyid;
		if(this.isPet()){
			onlyid = this.bindid;
		}
		PlayerMgr.shared.sendToPlayer(onlyid, event, obj);
	}
}
