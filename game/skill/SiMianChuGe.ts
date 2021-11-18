import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class SiMianChuGe extends SkillBase{
	constructor() {
		super();
		this.skill_id = Global.skillIds.SiMianChuGe;
		this.skill_name = '四面楚歌';
		this.skill_type = Global.EMagicType.Seal;
		this.buff_type = Global.buffType.Once;
		this.quality = Global.skillQuality.High;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;
		let ret = Global.deepClone(Global.skillEffect);
		ret.round = Math.floor(3 * (1 + profic ** 0.3 * 7 / 100));
		ret.cnt = Math.min(7, Math.floor(3 * (1 + profic ** 0.35 * 5 / 100)));
		return ret;
	}
}
