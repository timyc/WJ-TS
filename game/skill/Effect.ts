export default class Effect {
	effect_id: any;
	effect_list: any[];
	effect_type: string;
	isgroup: boolean;
	effect_data: any;

	constructor(effectdata:any) {
		this.effect_id = effectdata.effect_id;
		this.effect_list = [];
		this.effect_type = '';
		this.isgroup = false;
		this.effect_data = effectdata;
	}

	getEffectDamage(damage:any) {
		if (this.effect_type == 'HURT') {
			if (this.effect_data.type == 1) {
				damage += this.effect_data.num;
			} else if (this.effect_data.type == 2) {
				damage = (1 + this.effect_data.num / 10000) * damage;
			}
			return damage;
		}
		return 0;
	}

	getEffectDefDamage(damage:any){
		if (this.effect_type == 'DEF') {
			if (this.effect_data.type == 1) {
				damage -= this.effect_data.num;
			} else if (this.effect_data.type == 2) {
				damage = (1 - this.effect_data.num / 10000) * damage;
			}
		}
		return damage;
	}

	active(role:any) {
		if (this.effect_type == 'HURT') {

		}
	}

	remove(role:any) {
		if (this.effect_type == 'ATK' || this.effect_type == 'DEF') {
			return;
		}
	}
}
