import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class FengHuoLiaoYuan extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.FengHuoLiaoYuan;
		this.skill_name = '烽火燎原';
		this.action_type = Global.BtlActionType.Initiative;
		this.kind = Global.skillIds.FengHuoLiaoYuan;
		this.quality = Global.skillQuality.High;
		this.cooldown = 5;
	}
	getEffect() {
		let ret = Global.deepClone(Global.skillEffect);
		ret.round = 3;
		ret.cnt = 10;
		ret.attrtype = Global.attrTypeL1.FIRE;
		ret.attrnum = 50;
		return ret;
	}
}