import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class ShiXinKuangLuan extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.ShiXinKuangLuan;
		this.skill_name = '失心狂乱';
		this.skill_type = Global.EMagicType.Chaos;
		this.buff_type = Global.buffType.Once;
		this.quality = Global.skillQuality.High;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.round = Math.floor(3 * (1 + profic ** 0.3 * 5 / 100));
		ret.cnt = Math.min(5, Math.floor(3 * (1 + profic ** 0.35 * 3 / 100)));
		return ret;
	}
}
