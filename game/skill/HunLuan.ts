import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class HunLuan extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.HunLuan;
		this.kind = Global.skillIds.HunLuan;
		this.skill_name = '混乱';
		this.action_type = Global.BtlActionType.Passive;
		this.skill_type = Global.EMagicType.Chaos;
		this.buff_type = Global.buffType.Once;
		this.quality = Global.skillQuality.Low;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let qinmi = param.qinmi || 0;
		let relive = param.relive || 0;

		let pre = Math.round(0.1 + 1.5 * (relive * 0.4 + 1) * (level ** 0.5 / 10 + qinmi ** 0.16666666666666666 * 10 / (100 + relive * 20)))
		let rate = Global.random(0, 10000);
		
		if(rate < pre * 100){
			return Global.skillIds.JieDaoShaRen;
		}
		return null;
	}
}