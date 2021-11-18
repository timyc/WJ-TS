import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class QianKunJieSu extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.QianKunJieSu;
		this.skill_name = '乾坤借速';
		this.skill_type = Global.EMagicType.Speed;
		this.buff_type = Global.buffType.Once;
		this.act_on = Global.skillActOn.Self;
		this.quality = Global.skillQuality.High;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.spd = Math.round(12 + 8 * level / 25000);
		ret.cnt = Math.min(7, Math.floor(3 * (1 + profic ** 0.3 * 8 / 100)));
		ret.round = Math.floor(3 * (1 + profic ** 0.35 * 5 / 100));
		return ret;
	}
}
