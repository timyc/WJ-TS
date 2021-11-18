import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class XiaoHunShiGu extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.XiaoHunShiGu;
		this.skill_name = '销魂蚀骨';
		this.skill_type = Global.EMagicType.Frighten;
		this.quality = Global.skillQuality.Low;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.hurtpre = Math.round(27 * (profic ** 0.35 * 2 / 100 + 1));
		ret.smppre = Math.round(38 * (profic ** 0.33 * 2 / 100 + 1));
		return ret;
	}
}