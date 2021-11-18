import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class LuoRiRongJin extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.LuoRiRongJin;
		this.skill_name = '落日熔金';
		this.skill_type = Global.EMagicType.GhostFire;
		this.quality = Global.skillQuality.Low;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;
		let deadnum = param.deadnum || 0;

		let ret = Global.deepClone(Global.skillEffect);
		let hurt = Math.floor(65 * level * (profic ** 0.4 * 2.8853998118144273 / 100 + 1));
		if (deadnum > 0) {
			hurt = hurt * (1 + deadnum * 0.2);
		}
		ret.hurt = hurt;
		return ret;
	}
}