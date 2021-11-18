import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class ShanXian extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.ShanXian;
		this.skill_name = '闪现';
		this.action_type = Global.BtlActionType.Passive;
		this.kind = Global.skillIds.ShanXian;
		this.quality = Global.skillQuality.Low;
	}
	getEffect(param:any):any{
		return 25;
	}
}