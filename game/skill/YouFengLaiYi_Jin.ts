import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class YouFengLaiYi_Jin extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.YouFengLaiYi_Jin;
		this.skill_name = '高级炊金馔玉';
		this.action_type = Global.BtlActionType.Initiative;
		this.kind = Global.skillIds.YouFengLaiYi_Jin;
		this.quality = Global.skillQuality.High;
		this.cooldown = 5;
	}
	getEffect(param:any):any{
		let level = param.level || 0;
		let qinmi = param.qinmi || 0;
		let relive = param.relive || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.round = 3;
		ret.cnt = 10;
		ret.attrtype = Global.attrTypeL1.GOLD;
		ret.attrnum = Math.floor(50 + 4.6 * (relive * 0.5 + 1) * (level ** 0.5 / 10 + qinmi ** 0.16666666666666666 * 10 / (100 + relive * 20)));
		return ret;
	}
}