import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class DianShanLeiMing extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.DianShanLeiMing;
		this.skill_name = '电闪雷鸣';
		this.skill_type = Global.EMagicType.Thunder;
		this.quality = Global.skillQuality.Low;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.hurt = Math.floor(65 * level * (profic ** 0.4 * 2.8853998118144273 / 100 + 1));
		return ret;
	}
}