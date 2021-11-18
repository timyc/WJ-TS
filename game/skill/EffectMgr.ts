import Global from "../../game/core/Global";
import Effect from "./Effect";

export default class EffectMgr {
	static shared=new EffectMgr();

	effect_data:any;
	effect_list:any;
	constructor() {
		this.effect_data = {};
		this.effect_list = {};
	}

	init() {
		let propEffect = Global.require_ex('../prop_data/prop_effect');
		this.effect_data = propEffect;
		for (const effectid in propEffect) {
			if (propEffect.hasOwnProperty(effectid)) {
				const effectdata = propEffect[effectid];
				let effect = new Effect(effectdata);
				let effectlist = [];

				let attrs = effectdata.attr.split(';');
				if(attrs.length == 1){
					effect.effect_type = effectdata.attr;
				} else if (attrs.length > 1) {
					effect.isgroup = true;
					for (let i = 0; i < attrs.length; i++) {
						let attr = attrs[i];
						let attrid = parseInt(attr);
						if (!isNaN(attrid)) {
							effectlist.push(attrid);
						}
					}
					effect.effect_list = effectlist;
				}
				this.effect_list[effectid] = effect;
			}
		}
	}

	getEffectData(effectid:any) {
		return this.effect_data[effectid];
	}

	getEffect(effectid:any){
		return this.effect_list[effectid];
	}
}