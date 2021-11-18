import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class QinSiBingWu extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.QinSiBingWu;
		this.skill_name = '秦丝冰雾';
		this.skill_type = Global.EMagicType.SubDefense;
		this.buff_type = Global.buffType.Once;
		this.quality = Global.skillQuality.Low;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.skongzhi = Math.floor(1.5 * (profic ** 0.35 * 20 / 100 + 1));
		ret.round = Math.floor(3 * (1 + profic ** 0.35 * 5 / 100));
		return ret;
	}
}