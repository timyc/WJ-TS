import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class NiePan extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.NiePan;
		this.skill_name = '涅槃';
		this.action_type = Global.BtlActionType.Passive;
		this.effect_type = [];
		this.kind = Global.skillIds.NiePan;
		this.quality = Global.skillQuality.Shen;
	}
}
