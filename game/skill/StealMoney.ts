import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class StealMoney extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.StealMoney;
		this.skill_name = '飞龙探云手';
		this.action_type = Global.BtlActionType.Initiative;
		this.kind = Global.skillIds.StealMoney;
		this.quality = Global.skillQuality.Low;
		this.skill_type = Global.EMagicType.StealMoney;
	}

	getEffect() {
		let ret = Global.deepClone(Global.skillEffect);
		ret.hurt = 1;
		let random = Global.random(0, 10000);

		if (random < 100) {
			ret.money = Global.random(Global.lingHouMinMoney, 1000000);
		} else if (random >= 100 && random < 1000) {
			ret.money = Global.random(Global.lingHouMinMoney, 500000);
		} else {
			ret.money = Global.random(Global.lingHouMinMoney, 50000);
		}
		return ret;
	}
}
