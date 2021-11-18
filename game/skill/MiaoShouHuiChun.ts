import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class MiaoShouHuiChun extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.MiaoShouHuiChun;
		this.skill_name = '妙手回春';
		this.skill_type = Global.EMagicType.Rrsume;
		this.action_type = Global.BtlActionType.Initiative;
		this.kind = Global.skillIds.MiaoShouHuiChun;
		this.quality = Global.skillQuality.High;
		this.limit_round = 5;
		this.limit_times = 1;
		this.act_on = Global.skillActOn.Self;
	}

	getEffect() {
		let ret = Global.deepClone(Global.skillEffect);
		ret.hppre = 50;
		ret.mppre = 50;
		ret.cnt = 3;
		return ret;
	}
}
