import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class HighFenLieGongJi extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.HighFenLieGongJi;
		this.skill_name = '高级分裂攻击';
		this.action_type = Global.BtlActionType.Passive;
		this.kind = Global.skillIds.FenLieGongJi;
		this.quality = Global.skillQuality.High;
		this.act_on = Global.skillActOn.Enemy;// 技能作用于 0 all 1 敌人 2 自己人
	}

	getEffect() {
		let pre = 30;
		return pre;
	}
}