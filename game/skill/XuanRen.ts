import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class XuanRen extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.XuanRen;
		this.skill_name = '悬刃';
		this.action_type = Global.BtlActionType.Passive;
		this.kind = Global.skillIds.XuanRen;
		this.quality = Global.skillQuality.Shen;
	}
}
