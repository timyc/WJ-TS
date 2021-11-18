import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class YouFengLaiYi extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.YouFengLaiYi;
		this.skill_name = '有凤来仪';
		this.action_type = Global.BtlActionType.Passive;
		this.kind = Global.skillIds.YouFengLaiYi;
		this.quality = Global.skillQuality.High;
	}

	getEffect() {
		return {};
	}
}