import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

// 用自己的法力 换 对方的法力
export default class XiaoLouYeKu extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.XiaoLouYeKu;
		this.kind = Global.skillIds.XiaoLouYeKu;
		this.skill_name = '小楼夜哭';
		this.skill_type = Global.EMagicType.Physics;
		this.action_type = Global.BtlActionType.Initiative;
		this.quality = Global.skillQuality.Low;
		this.act_on = Global.skillActOn.Enemy;// 技能作用于 0 all 1 敌人 2 自己人
	}

	useSkill(brole:any):any {
		let cur = brole.getAttr(Global.attrTypeL1.MP) || 0;
		let max = brole.getAttr(Global.attrTypeL1.MAXMP) || 0;
		if (cur < 10) {
			return '法力不足，无法释放';
		}
		let sub = Math.ceil(max * 0.95);
		cur -= sub;
		brole.setAttr(Global.attrTypeL1.MP, cur);
		return 0;
	}

	getEffect(param:any):any{
		let level = param.level || 0;
		let qinmi = param.qinmi || 0;
		let relive = param.relive || 0;

		let ret = Global.deepClone(Global.skillEffect);
		ret.smppre = Math.round(10.1 + 2 * (relive * 0.4 + 1) * (level ** 0.5 / 10 + qinmi ** 0.16666666666666666 * 10 / (100 + relive * 20)));
		return ret;
	}
}
