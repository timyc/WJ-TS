import Global from "../../../game/core/Global";

export default class Buff {
	buff_id:number;
	skill_id:any;
	effects:any;
	effecttype:any;
	buffActive:boolean;
	source:number;
	round:any;
	cur_round:number;
	probability:number;

	constructor(skill:any, skilleffect:any) {
		this.buff_id = Global.getAutoBuffId();
		this.skill_id = skill.skill_id;
		this.effects = skilleffect;
		this.effecttype = skill.skill_type;

		this.buffActive = false;
		this.source = 0;

		this.round = skilleffect.round;
		this.cur_round = 0;

		this.probability = 10000;
	}

	// this.cnt = 1; // 人数
	// this.round = 1; // 回合
	// this.hurt = 0; //伤害
	// this.smp = 0; // 法力减少-
	// this.hit = 0; // 命中增加+
	// this.spd = 0; // 速度增加+
	// this.atk = 0; // 攻击增加+
	// this.kongzhi = 0; // 控制抗性+
	// this.fashang = 0; // 法伤抗性+
	// this.fangyu = 0; // 防御+
	// this.hp = 0; // 增加血量
	// this.skongzhi = 0; // 减少控制抗性
	// this.yinshen = 0; // 隐身
	getAttr(attrtype:any):any{
		let num = 0;
		for (const effectkey in this.effects) {
			if (this.effects.hasOwnProperty(effectkey)) {
				const effect = this.effects[effectkey];
				if (effectkey == 'hit' && attrtype == Global.attrTypeL1.PMINGZHONG) {
					num += effect;
				} else if (effectkey == 'spd' && attrtype == Global.attrTypeL1.SPD) {
					num += effect;
				} else if (effectkey == 'atk' && attrtype == Global.attrTypeL1.ATK) {
					num += effect;
				} else if (effectkey == 'kongzhi' && (attrtype == Global.attrTypeL1.DFENGYIN
					|| attrtype == Global.attrTypeL1.DHUNSHUI || attrtype == Global.attrTypeL1.DHUNLUAN)) {
					num += effect;
				} else if (effectkey == 'fashang' && (attrtype == Global.attrTypeL1.DFENG ||
					attrtype == Global.attrTypeL1.DLEI || attrtype == Global.attrTypeL1.DSHUI || attrtype == Global.attrTypeL1.DHUO ||
					attrtype == Global.attrTypeL1.DDU || attrtype == Global.attrTypeL1.DGUIHUO)) {
					num += effect;
				} else if (effectkey == 'fangyu' && attrtype == Global.attrTypeL1.DWULI) {
					num += effect;
				} else if (effectkey == 'skongzhi' && (attrtype == Global.attrTypeL1.DFENGYIN ||
					attrtype == Global.attrTypeL1.DHUNSHUI || attrtype == Global.attrTypeL1.DHUNLUAN)) {
					num += -effect;
				} else if(effectkey == 'attrtype' && attrtype == effect){
					num += this.effects['attrnum'];
				}
			}
		}

		return num;
	}

	active(brole:any):any{
		let addhp = 0;
		if (brole.hasBuff(Global.EMagicType.Seal)) {
			return addhp;
		}
		for (const effectkey in this.effects) {
			if (this.effects.hasOwnProperty(effectkey)) {
				const effect = this.effects[effectkey];
				if (effectkey == 'hurt' && effect > 0) {
					if (brole.hasBuff(Global.EMagicType.Sleep)) {
						brole.cleanBuff(Global.EMagicType.Sleep);
					}
					brole.subHp(-effect);
					addhp += -effect;
				}
				if (effectkey == 'hp') {
					brole.subHp(effect);
					addhp += effect;
				}
			}
		}
		return addhp;
	}

	addRound() {
		this.cur_round++;
	}

	checkEnd():boolean{
		if (this.cur_round >= this.round) {
			return true;
		}
		return false;
	}
}
