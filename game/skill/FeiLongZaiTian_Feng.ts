import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class FeiLongZaiTian_Feng extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.FeiLongZaiTian_Feng;
		this.skill_name = '飞龙在天-风';
		this.action_type = Global.BtlActionType.Initiative;
		this.kind = Global.skillIds.FeiLongZaiTian_Feng;
		this.quality = Global.skillQuality.High;
		this.skill_type = Global.EMagicType.Wind;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let qinmi = param.qinmi || 0;
		let relive = param.relive || 0;
		let maxmp = param.maxmp || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.hurt = Math.floor(80 * level + maxmp / 100 * 6 * (relive * 0.6 + 1) * (level ** 0.5 / 10 + qinmi ** 0.16666666666666666 * 10 / (100 + relive * 20)));
		ret.cnt = 3;
		return ret;
	}
}