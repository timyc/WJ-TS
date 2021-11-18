import Global from "../../game/core/Global";
import SkillBase from "./core/SkillBase";

export default class HighYuanQuanWanHu extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.HighYuanQuanWanHu;
		this.skill_name = '高级源泉万斛';
		this.action_type = Global.BtlActionType.Passive;
		this.effect_type = [Global.attrTypeL1.MAXMP];
		this.kind = Global.skillIds.YuanQuanWanHu;
		this.quality = Global.skillQuality.High;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let qinmi = param.qinmi || 0;
		let relive = param.relive || 0;

		let ret:any= {}
		ret.add = Math.floor(6000 * (relive * 0.5 + 1) * (level ** 0.5 / 10 + qinmi ** 0.16666666666666666 * 10 / (100 + relive * 20)))
		return ret;
	}
}