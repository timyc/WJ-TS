import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

// 砍死一个 追击一个 最多追3个
export default class FenHuaFuLiu extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.FenHuaFuLiu;
		this.skill_name = '分花拂柳';
		this.action_type = Global.BtlActionType.Passive;
		this.quality = Global.skillQuality.High;
		this.act_on = Global.skillActOn.Enemy;// 技能作用于 0 all 1 敌人 2 自己人
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let qinmi = param.qinmi || 0;
		let relive = param.relive || 0;

		let pre = Math.round(0.1 + 7 * (relive * 0.6 + 1) * (level ** 0.5 / 10 + qinmi ** 0.16666666666666666 * 10 / (100 + relive * 20)));
		return pre;
	}
}
