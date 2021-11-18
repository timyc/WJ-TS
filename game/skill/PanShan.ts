import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class PanShan extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.PanShan;
		this.skill_name = '蹒跚';
		this.action_type = Global.BtlActionType.Passive;
		this.effect_type = [Global.attrTypeL1.SPD];
		this.kind = Global.skillIds.PanShan;
		this.quality = Global.skillQuality.Low;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let qinmi = param.qinmi || 0;
		let relive = param.relive || 0;

		let ret:any= {}
		ret.reduce = Math.floor(0.1 + 30 * (relive * 0.3 + 1) * (level ** 0.5 / 10 + qinmi ** 0.16666666666666666 * 10 / (100 + relive * 20)))
		return ret;
	}
}