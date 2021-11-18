import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class FengYin extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.FengYin;
		this.kind = Global.skillIds.FengYin;
		this.skill_name = '封印';
		this.skill_type = Global.EMagicType.Seal;
		this.buff_type = Global.buffType.Once;
		this.action_type = Global.BtlActionType.Passive;
		this.quality = Global.skillQuality.Low;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let qinmi = param.qinmi || 0;
		let relive = param.relive || 0;

		let pre = Math.round(0.1 + 1.5 * (relive * 0.4 + 1) * (level ** 0.5 / 10 + qinmi ** 0.16666666666666666 * 10 / (100 + relive * 20)))
		let rate = Global.random(0, 10000);
		pre = 100;
		if(rate < pre * 100){
			return Global.skillIds.ZuoBiShangGuan;
		}
		return null;
	}
}