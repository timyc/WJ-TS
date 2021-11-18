import Global from "../../../game/core/Global";

export default class SkillBase {
	skill_id:number;
	skill_name:string;
	skill_type:number;
	action_type:number;
	skill_data:any;
	buff_type:number;
	effect_type:any;
	kind:number;
	quality:number;
	cooldown:number;
	limit_round:number;
	limit_times:number;
	act_on:number;
	constructor() {
		this.skill_id = 0;
		this.skill_name = '未知技能';
		this.skill_type = Global.EMagicType.Physics;
		this.action_type = Global.BtlActionType.Initiative;
		this.skill_data = null;
		this.buff_type = Global.buffType.None;
		this.effect_type = [];//Global.attrTypeL1.HP;
		this.kind = 0; // 技能类型
		this.quality = 0; //技能 品质
		this.cooldown = 0; // 技能冷却时间
		this.limit_round = 0; // 技能回合限制 前几回合不能用
		this.limit_times = 0;// 技能限制使用次数
		this.act_on = Global.skillActOn.Enemy;// 技能作用于 0 all 1 敌人 2 自己人
	}

	setSkillData(data:any) {
		this.skill_data = data;
	}

	// param curhp maxhp curmp maxmp
	useSkill(brole:any):any {
		let profic = brole.getSkillProfic(this.skill_id);
		let submp = 0;
		if (this.quality == Global.skillQuality.Low) {
			submp = profic * 0.13;
		} else if (this.quality == Global.skillQuality.High) {
			submp = profic * 0.42;
		}
		let curmp = brole.getAttr(Global.attrTypeL1.MP) || 0;
		if (curmp - submp < 0) {
			return '法力不足，无法释放';
		}
		curmp -= submp;
		brole.setAttr(Global.attrTypeL1.MP, curmp);

		return 0;
	}

	getEffect(param:any):any{
		return Global.deepClone(Global.skillEffect);
	}
}