import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class QiangHuaYiHuan extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.QiangHuaYiHuan;
		this.skill_name = '强化遗患';
		this.action_type = Global.BtlActionType.Passive;
		this.kind = Global.skillIds.QiangHuaYiHuan;
		this.quality = Global.skillQuality.Shen;
	}
}
