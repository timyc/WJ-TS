import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class RuHuTianYi extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.RuHuTianYi;
		this.skill_name = '如虎添翼';
		this.action_type = Global.BtlActionType.Passive;
		this.kind = Global.skillIds.RuHuTianYi;

		this.skill_type = Global.EMagicType.Defense;
		this.buff_type = Global.buffType.Once;
	}

	getEffect(param:any):any{
		let ret = Global.deepClone(Global.skillEffect);
		ret.kongzhi = 5;
		ret.fashang = 15;
		ret.fangyu = 15;
		ret.round = 2;
		ret.cnt = 2;
		return ret;
	}
}