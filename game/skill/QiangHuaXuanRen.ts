import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class QiangHuaXuanRen extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.QiangHuaXuanRen;
		this.skill_name = '强化悬刃';
		this.action_type = Global.BtlActionType.Passive;
		this.kind = Global.skillIds.QiangHuaXuanRen;
		this.quality = Global.skillQuality.Shen;
	}
}