import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class MoShenFuShen extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.MoShenFuShen;
		this.skill_name = '魔神附身';
		this.skill_type = Global.EMagicType.Attack;
		this.buff_type = Global.buffType.Once;
		this.act_on = Global.skillActOn.Self;
		this.quality = Global.skillQuality.High;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.atk = Math.round(25 * (profic ** 0.35 * 3 / 100 + 1));
		ret.hit = 15;
		ret.round = Math.floor(3 * (1 + profic ** 0.35 * 5 / 100));
		ret.cnt = Math.min(7, Math.floor(3 * (1 + profic ** 0.3 * 8 / 100)));
		return ret;
	}
}