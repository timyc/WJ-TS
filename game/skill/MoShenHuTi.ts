import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class MoShenHuTi extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.MoShenHuTi;
		this.skill_name = '魔神护体';
		this.skill_type = Global.EMagicType.Defense;
		this.buff_type = Global.buffType.Once;
		this.act_on = Global.skillActOn.Self;
		this.quality = Global.skillQuality.Low;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;

		
		let ret = Global.deepClone(Global.skillEffect);
		ret.kongzhi = Math.round(1.1 * (profic ** 0.35 * 20 / 100 + 1));
		ret.fashang = Math.round(18 * (profic ** 0.35 * 2 / 100 + 1));
		ret.fangyu = Math.round(15 * (profic ** 0.35 * 2 / 100 + 1));
		ret.round = Math.floor(3 * (1 + profic ** 0.35 * 5 / 100));
		return ret;
	}
}
