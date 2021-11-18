import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class NormalDefend extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.normalDefSkill;
		this.skill_name = '防御';
		this.skill_type = Global.EMagicType.Physics;
		this.buff_type = Global.buffType.Once;
		this.quality = Global.skillQuality.Low;
	}

	getEffect(param:any):any{
		let ret = Global.deepClone(Global.skillEffect);
		ret.fangyu = 30;
		ret.round = 1;
		return ret;
	}
}