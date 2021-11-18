import Global from "../../game/core/Global";
import SkillBase from "./core/SkillBase";

export default class HighGeShanDaNiu extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.HighGeShanDaNiu;
		this.skill_name = '高级隔山打牛';
		this.action_type = Global.BtlActionType.Passive;
		this.kind = Global.skillIds.GeShanDaNiu;
		this.quality = Global.skillQuality.High;
		this.act_on = Global.skillActOn.Enemy;// 技能作用于 0 all 1 敌人 2 自己人
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let qinmi = param.qinmi || 0;
		let relive = param.relive || 0;
		let atk = param.atk || 0;

		let ret = Global.deepClone(Global.skillEffect);
		let pre = Math.round(0.1 + 20 * (relive * 0.4 + 1) * (level ** 0.5 / 10 + qinmi ** 0.16666666666666666 * 10 / (100 + relive * 20)));
		ret.hurt = Math.round(atk * pre / 100);
		return pre;
	}
}
