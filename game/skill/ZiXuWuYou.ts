import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class ZiXuWuYou extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.ZiXuWuYou;
		this.skill_name = '子虚乌有';
		this.skill_type = Global.EMagicType.YinShen;
		this.action_type = Global.BtlActionType.Initiative;
		this.buff_type = Global.buffType.None;
		this.effect_type = [];//Global.attrTypeL1.HP;
		this.kind = Global.skillIds.ZiXuWuYou; // 技能类型
		this.quality = Global.skillQuality.Final; //技能 品质
		this.cooldown = 5; // 技能冷却时间
		this.act_on = Global.skillActOn.Self;
	}

	getEffect():any{
		let ret = Global.deepClone(Global.skillEffect);
		ret.round = 3;
		ret.cnt = 2;
		ret.yinshen = 1;
		return ret;
	}
}
