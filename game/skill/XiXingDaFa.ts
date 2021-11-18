import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class XiXingDaFa extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.XiXingDaFa;
		this.skill_name = '吸星大法';
		this.skill_type = Global.EMagicType.ThreeCorpse;
		this.quality = Global.skillQuality.High;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;

		let ret = Global.deepClone(Global.skillEffect);
		let xianhurt = Math.floor(65 * level * (profic ** 0.4 * 2.8853998118144273 / 100 + 1));
		let hurt = xianhurt / 3;

		ret.hurt = hurt;
		ret.aihp = ret.hurt * 3;
		ret.cnt = Math.min(5, Math.floor(3 * (1 + profic ** 0.3 * 5 / 100)));
		return ret;
	}
}