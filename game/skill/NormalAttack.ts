import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class NormalAttack extends SkillBase {

	constructor() {
		super();
		this.skill_id = Global.normalAtkSkill;
		this.skill_name = '普通攻击';
		this.skill_type = Global.EMagicType.Physics;
		this.act_on = Global.skillActOn.All;
		this.quality = Global.skillQuality.Low;
	}

	getEffect(param:any):any{
		let atk = param.atk || 0;
		let ret = Global.deepClone(Global.skillEffect);
		ret.hurt = atk;
		return ret;
	}
}
