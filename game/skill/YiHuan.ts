import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class YiHuan extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.YiHuan;
		this.skill_name = '遗患';
		this.action_type = Global.BtlActionType.Passive;
		this.kind = Global.skillIds.YiHuan;
		this.quality = Global.skillQuality.Shen;
	}
}