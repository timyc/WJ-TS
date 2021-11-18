import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class XiTianJingTu extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.XiTianJingTu;
		this.skill_name = '西天净土';
		this.action_type = Global.BtlActionType.Initiative;
		this.kind = Global.skillIds.XiTianJingTu;
		this.quality = Global.skillQuality.High;
		this.cooldown = 5;
	}
	getEffect() {
		let ret = Global.deepClone(Global.skillEffect);
		ret.round = 3;
		ret.cnt = 10;
		ret.attrtype = Global.attrTypeL1.EARTH;
		ret.attrnum = 50;
		return ret;
	}
}