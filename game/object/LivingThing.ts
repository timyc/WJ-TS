import Global from "../../game/core/Global";

export default class LivingThing {
	onlyid:number;
	resid:number;
	name:string;
	mapid:number;
	x:number;
	y:number;
	living_type:any;

	constructor(){
		this.onlyid = Global.getAutoAddId(); //唯一id
		this.resid = 0;//资源id
		this.name = '未知';

		this.mapid = 0;
		this.x = 0;
		this.y = 0;

		this.living_type = Global.livingType.Unknow;
	}

	toObj() {
		return {
			onlyid: this.onlyid,
			name: this.name,
			
			mapid: this.mapid,
			x: this.x,
			y: this.y,
			type: this.living_type,
		}
	}

	move(){

	}

	isNpc(){
		return this.living_type == Global.livingType.NPC;
	}

	isPlayer(){
		return this.living_type == Global.livingType.Player;
	}

	isMonster() {
		return this.living_type == Global.livingType.Monster;
	}

	isPet(){
		return this.living_type == Global.livingType.Pet;
	}
}
