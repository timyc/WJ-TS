import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class GongXingTianFa extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.GongXingTianFa;
		this.skill_name = '恭行天罚';
		this.action_type = Global.BtlActionType.Passive;
		this.effect_type = [Global.attrTypeL1.PMINGZHONG, Global.attrTypeL1.PKUANGBAO];
		this.kind = Global.skillIds.GongXingTianFa;
		this.quality = Global.skillQuality.High;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let qinmi = param.qinmi || 0;
		let relive = param.relive || 0;

		let ret:any= {}
		ret.add = Math.round(0.1 + 4 * (relive * 0.4 + 1) * (level ** 0.5 / 10 + qinmi ** 0.16666666666666666 * 10 / (100 + relive * 20)))
		// ret.add = Math.floor(50 * (relive * 0.3 + 1) * (level ** 0.5 / 10 + qinmi ** 0.16666666666666666 * 10 / (100 + relive * 20)))
		return ret;
	}
}
