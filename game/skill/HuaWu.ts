import SkillBase from "./core/SkillBase";
import Global from "../../game/core/Global";

export default class HuaWu extends SkillBase {
	constructor() {
		super();
		this.skill_id = Global.skillIds.HuaWu;
		this.skill_name = '化无';
		this.action_type = Global.BtlActionType.Passive;
		this.kind = Global.skillIds.HuaWu;
		this.quality = Global.skillQuality.Final;
	}

	getEffect():any{
		let ret = Global.deepClone(Global.skillEffect);
		ret.round = 3;
		ret.cnt = 2;
		ret.yinshen = 1;
		return ret;
	}
}
