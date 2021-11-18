import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class TianZhuDiMie extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.TianZhuDiMie;
		this.skill_name = '天诛地灭';
		this.skill_type = Global.EMagicType.Thunder;
		this.quality = Global.skillQuality.High;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.cnt = Math.min(5, Math.floor(3 * (1 + profic ** 0.3 * 5 / 100)));
		ret.hurt = Math.floor(60 * level * (profic ** 0.4 * 2.8853998118144273 / 100 + 1));
		return ret;
	}
}