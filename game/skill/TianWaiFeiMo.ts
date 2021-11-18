import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class TianWaiFeiMo extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.TianWaiFeiMo;
		this.skill_name = '天外飞魔';
		this.skill_type = Global.EMagicType.Speed;
		this.buff_type = Global.buffType.Once;
		this.act_on = Global.skillActOn.Self;
		this.quality = Global.skillQuality.Low;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.spd = Math.round(15 + level / 5000);
		ret.round = Math.floor(3 * (1 + profic ** 0.35 * 5 / 100));
		return ret;
	}
}