import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class JiQiBuYi extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.JiQiBuYi;
		this.kind = Global.skillIds.YinShen;
		this.skill_name = '击其不意';
		this.action_type = Global.BtlActionType.Passive;
		this.quality = Global.skillQuality.High;
	}
}