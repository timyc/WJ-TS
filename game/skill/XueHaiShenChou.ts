import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class XueHaiShenChou extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.XueHaiShenChou;
		this.skill_name = '血海深仇';
		this.skill_type = Global.EMagicType.GhostFire;
		this.quality = Global.skillQuality.High;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;
		let deadnum = param.deadnum || 0;

		let ret = Global.deepClone(Global.skillEffect);
		let hurt = Math.floor(60 * level * (profic ** 0.4 * 2.8853998118144273 / 100 + 1));
		if (deadnum > 0) {
			hurt = hurt * (1 + deadnum * 0.2);
		}
		ret.hurt = hurt;
		ret.cnt = Math.min(5, Math.floor(3 * (1 + profic ** 0.3 * 5 / 100)));
		return ret;
	}
}
