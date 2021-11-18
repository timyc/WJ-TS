import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class KuMuFengChun extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.KuMuFengChun;
		this.skill_name = '枯木逢春';
		this.action_type = Global.BtlActionType.Initiative;
		this.kind = Global.skillIds.KuMuFengChun;
		this.quality = Global.skillQuality.High;
		this.cooldown = 5;
	}
	getEffect() {
		let ret = Global.deepClone(Global.skillEffect);
		ret.round = 3;
		ret.cnt = 10;
		ret.attrtype = Global.attrTypeL1.WOOD;
		ret.attrnum = 50;
		return ret;
	}
}