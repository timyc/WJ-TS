import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class BingLinChengXia extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.BingLinChengXia;
		this.skill_name = '兵临城下';
		this.action_type = Global.BtlActionType.Initiative;
		this.kind = Global.skillIds.BingLinChengXia;
		this.quality = Global.skillQuality.Shen;
	}

	useSkill(brole:any):any{
		let curhp = brole.getAttr(Global.attrTypeL1.HP) || 0;
		let maxhp = brole.getAttr(Global.attrTypeL1.MAXHP) || 0;
		let curmp = brole.getAttr(Global.attrTypeL1.MP) || 0;
		let maxmp = brole.getAttr(Global.attrTypeL1.MAXMP) || 0;

		if (curhp < maxhp / 2) {
			return '气血不足，无法释放';
		}
		if (curmp < maxmp / 4) {
			return '法力不足，无法释放';
		}
		curhp -= maxhp / 2;
		curmp -= maxmp / 4;
		brole.setAttr(Global.attrTypeL1.HP, curhp);
		brole.setAttr(Global.attrTypeL1.MP, curmp);

		return 0;
	}

	getEffect(param:any):any{
		let atk = param.atk || 0;
		let ret = Global.deepClone(Global.skillEffect);
		ret.hurt = atk * 2.5;
		return ret;
	}
}
