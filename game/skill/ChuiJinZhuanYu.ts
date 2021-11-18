import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class ChuiJinZhuanYu extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.ChuiJinZhuanYu;
		this.skill_name = '炊金馔玉';
		this.action_type = Global.BtlActionType.Initiative;
		this.kind = Global.skillIds.ChuiJinZhuanYu;
		this.quality = Global.skillQuality.High;
		this.cooldown = 5;
	}
	getEffect():any{
		let ret = Global.deepClone(Global.skillEffect);
		ret.round = 3;
		ret.cnt = 10;
		ret.attrtype = Global.attrTypeL1.GOLD;
		ret.attrnum = 50;
		return ret;
	}
}