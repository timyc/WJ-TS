import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class YinShen extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.YinShen;
		this.skill_name = '隐身';
		this.action_type = Global.BtlActionType.Passive;
		this.kind = Global.skillIds.YinShen;
		this.quality = Global.skillQuality.High;
		this.skill_type = Global.EMagicType.YinShen;
	}
	getEffect() {
		let ret = Global.deepClone(Global.skillEffect);
		ret.round = 3;
		ret.yinshen = 1;
		return ret;
	}
}