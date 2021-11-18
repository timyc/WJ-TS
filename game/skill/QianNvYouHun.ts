import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class QianNvYouHun extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.QianNvYouHun;
		this.skill_name = '倩女幽魂';
		this.skill_type = Global.EMagicType.SubDefense;
		this.buff_type = Global.buffType.Once;
		this.quality = Global.skillQuality.High;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.skongzhi = Math.round(1.3 * (profic ** 0.35 * 20 / 100 + 1));
		ret.round = Math.floor(3 * (1 + profic ** 0.35 * 5 / 100));
		ret.cnt = Math.min(7, Math.floor(3 * (1 + profic ** 0.3 * 8 / 100)));
		return ret;
	}
}
