import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class JueJingFengSheng extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.JueJingFengSheng;
		this.skill_name = '绝境逢生';
		this.skill_type = Global.EMagicType.Rrsume;
		this.action_type = Global.BtlActionType.Initiative;
		this.kind = Global.skillIds.MiaoShouHuiChun;
		this.quality = Global.skillQuality.Final;
		this.limit_round = 5;
		this.limit_times = 1;
		this.act_on = Global.skillActOn.Self;
	}

	getEffect() {
		let ret = Global.deepClone(Global.skillEffect);
		ret.hppre = 60;
		ret.mppre = 60;
		ret.cnt = 10;
		return ret;
	}
}