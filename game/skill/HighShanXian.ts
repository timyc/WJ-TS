import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class HighShanXian extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.HighShanXian;
		this.skill_name = '高级闪现';
		this.action_type = Global.BtlActionType.Passive;
		this.kind = Global.skillIds.ShanXian;
		this.quality = Global.skillQuality.High;
	}

	getEffect(param:any):any{
		return 35;
	}
}