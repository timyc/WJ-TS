import BattleObj from "../object/BattleObj";
import Global from "../../game/core/Global";

export default class Monster extends BattleObj 
{
	pos:any;
	skill_pre:any;
	canCatch:any;
	constructor(mondata:any){
		super();
		this.dataid = mondata.monsterid;

		this.hp = mondata.hp;
		this.mp = 9999999;
		this.maxhp = mondata.hp;
		this.maxmp = 9999999;
		
		this.atk = mondata.atk;
		this.name = mondata.name;
		this.resid = mondata.resid;
		this.pos = 0;

		let skilllist = mondata.skill.split(';');
		let skill_list:any = {}
		for (const t of skilllist) {
			if (t.length > 0) {
				skill_list[t] = 0;
			}
		}
		this.skill_list = skill_list;
		this.skill_pre = mondata.proficient;
		this.level = mondata.level;
		this.canCatch = mondata.catch;
		this.spd = mondata.spd;
		
		for (const key in Global.attrTypeL1) {
			if (Global.attrTypeL1.hasOwnProperty(key)) {
				this.attr1[Global.attrTypeL1[key] + ''] = mondata[key] == null ? 0 : mondata[key];
			}
		}
		this.attr1[Global.attrTypeL1.ATK] = this.atk;
		this.attr1[Global.attrTypeL1.SPD] = this.spd;
		this.attr1[Global.attrTypeL1.HP] = this.hp;
		this.attr1[Global.attrTypeL1.MP] = this.mp;
		this.attr1[Global.attrTypeL1.MAXHP] = this.hp;
		this.attr1[Global.attrTypeL1.MAXMP] = this.mp;

		this.living_type = Global.livingType.Monster;
	}

	getSkillProfic(skillid:any):any{
		return this.skill_pre;
	}
}