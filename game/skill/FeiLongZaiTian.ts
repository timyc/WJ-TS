import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class FeiLongZaiTian extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.FeiLongZaiTian;
		this.skill_name = '飞龙在天';
		this.action_type = Global.BtlActionType.Passive;
		this.kind = Global.skillIds.FeiLongZaiTian;
		this.quality = Global.skillQuality.High;
	}

	getEffect() {
		return {};
	}
}