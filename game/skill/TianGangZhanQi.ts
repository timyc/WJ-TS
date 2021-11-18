import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class TianGangZhanQi extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.TianGangZhanQi;
		this.skill_name = '天罡战气';
		this.action_type = Global.BtlActionType.Passive;
		this.effect_type = [];
		this.kind = Global.skillIds.TianGangZhanQi;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let qinmi = param.qinmi || 0;
		let relive = param.relive || 0;

		let ret:any= {}
		ret.add = Math.round(0.1 + 13 * (relive * 0.5 + 1) * (level ** 0.5 / 10 + qinmi ** 0.16666666666666666 * 10 / (100 + relive * 20)))
		return ret;
	}
}