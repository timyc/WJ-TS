import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

// 用自己的气血 换 对方的气血
export default class HighTianMoJieTi extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.HighTianMoJieTi;
		this.kind = Global.skillIds.TianMoJieTi;
		this.skill_name = '高级天魔解体';
		this.skill_type = Global.EMagicType.Physics;
		this.action_type = Global.BtlActionType.Initiative;
		this.quality = Global.skillQuality.High;
		this.act_on = Global.skillActOn.Enemy;// 技能作用于 0 all 1 敌人 2 自己人
	}

	useSkill(brole:any):any {
		let cur = brole.getAttr(Global.attrTypeL1.HP) || 0;
		let max = brole.getAttr(Global.attrTypeL1.MAXHP) || 0;
		let sub = Math.ceil(max * 0.95);
		cur -= sub;
		brole.setAttr(Global.attrTypeL1.HP, cur);
		return 0;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let qinmi = param.qinmi || 0;
		let relive = param.relive || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.hurtpre = Math.round(22.1 + 4 * (relive * 0.5 + 1) * (level ** 0.5 / 10 + qinmi ** 0.16666666666666666 * 10 / (100 + relive * 20)));
		return ret;
	}
}
