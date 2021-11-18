import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class JieDaoShaRen extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.JieDaoShaRen;
		this.skill_name = '借刀杀人';
		this.skill_type = Global.EMagicType.Chaos;
		this.buff_type = Global.buffType.Once;
		this.quality = Global.skillQuality.Low;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.round = Math.floor(3 * (1 + profic ** 0.3 * 5 / 100));
		return ret;
	}
}