import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class LieHuoJiaoYang extends SkillBase{
	constructor() {
		super();
		this.skill_id = Global.skillIds.LieHuoJiaoYang;
		this.skill_name = '烈火骄阳';
		this.skill_type = Global.EMagicType.Fire;
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
