let effectMgr = require('./effect_mgr');

class Skill {
	constructor(id) {
		this.skill_id = id;
		this.round = 0;
		this.profic_target = [];
		this.effect_list = [];
	}

	setEffectList(list) {
		this.effect_list = list;
	}

	setProficTarget(list) {
		this.profic_target = list;
	}

	getEffectList() {
		return this.effect_list;
	}

	getTargetNum(profic){
		let prodata = null;
		for (const proinfo of this.profic_target) {
			if (prodata == null){
				prodata = proinfo;
			}
			if (profic >= prodata.profic && profic < proinfo.profic){
				return prodata.target;
			}
		}
		return 1;
	}

	getSkillDamage(damage) {
		let final_damage = damage;
		for (const effectid of this.effect_list) {
			let effect = effectMgr.getEffect(effectid);
			final_damage = effect.getEffectDamage(final_damage);
		}
		return final_damage;
	}
}

module.exports = Skill;