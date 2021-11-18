import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";
// 万毒攻心
export default class WanDuGongXin extends SkillBase {
	constructor() {
		super();

		this.skill_id = Global.skillIds.WanDuGongXin;
		this.skill_name = '万毒攻心';
		this.skill_type = Global.EMagicType.Toxin;
		this.buff_type = Global.buffType.Loop;
		this.quality = Global.skillQuality.High;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let profic = param.profic || 0;

		let xianhurt = Math.floor(65 * level * (profic ** 0.4 * 2.8853998118144273 / 100 + 1));
		let hurt = Math.floor(xianhurt / 3);

		let ret = Global.deepClone(Global.skillEffect);
		ret.hurt = hurt;
		ret.round = Math.floor(2 * (1 + profic ** 0.34 * 4 / 100));
		ret.cnt = Math.min(7, Math.floor(3 * (1 + profic ** 0.35 * 5 / 100)));
		return ret;
	}
}