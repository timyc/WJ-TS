import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class YanLuoZhuiMing extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.YanLuoZhuiMing;
		this.skill_name = '阎罗追命';
		this.skill_type = Global.EMagicType.Frighten;
		this.quality = Global.skillQuality.High;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.hurtpre = Math.round(25 * (profic ** 0.35 * 2 / 100 + 1));
		ret.cnt = Math.min(7, Math.floor(3 * (1 + profic ** 0.35 * 5 / 100)));
		ret.smppre = Math.round(37 * (profic ** 0.33 * 2 / 100 + 1));
		return ret;
	}
}