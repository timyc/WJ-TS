import Global from "../../game/core/Global";
import Monster from "./Monster";

export default class MonsterMgr{

	static shared=new MonsterMgr();

	monster_data_list:any;
	monster_group:any;
	monster_list:any;
	bb_list:any;
	constructor(){
		this.monster_data_list = {};
		this.monster_group = {};
		this.monster_list = {};
		this.bb_list = {};
	}

	init(){
		let propMon = Global.require_ex('../prop_data/prop_monster');
		let propMonGroup = Global.require_ex('../prop_data/prop_monster_group');

		for (const monsterid in propMon) {
			if (propMon.hasOwnProperty(monsterid)) {
				const mondata = propMon[monsterid];
				this.monster_data_list[monsterid] = mondata;
				// let mon = this.makeMon(monsterid);
				// this.monster_list[monsterid] = mon;
				if (mondata.catch == 1){
					this.bb_list[monsterid] = mondata;
				}
			}
		}

		for (const id in propMonGroup) {
			if (propMonGroup.hasOwnProperty(id)) {
				const mongroupdata = propMonGroup[id];

				let monsterlist = mongroupdata.monsterlist;
				let monlist = monsterlist.split(';');
				let mon_list = [];	
				for (const moninfo of monlist) {
					if(moninfo.length > 0){
						let mon = moninfo.split(':');
						mon_list.push({
							monid: mon[0],
							pos: mon[1],
						})
					}
				}
				mongroupdata.monsterlist = mon_list;
				if (mongroupdata.item != null && mongroupdata.item.length > 0) {
					let itemlist = JSON.parse(mongroupdata.item);
					let items = [];
					for (const iteminfo of itemlist) {
						let t:any = {}
						t.per = iteminfo[0];
						let ts = [];
						let tlist = iteminfo[1];
						for (let i = 0; i < tlist.length;) {
							let itemid = tlist[i];
							let itemnum = tlist[i + 1];
							let item:any = {};
							item.itemid = itemid;
							item.itemnum = itemnum;
							ts.push(item);
							i += 2;
						}
						t.items = ts;
						items.push(t);
					}
					mongroupdata.item = items;
				}else{
					mongroupdata.item = [];
				}
				this.monster_group[id] = mongroupdata;
			}
		}
	}

	getMonsterData(monid:any):any{
		return this.monster_data_list[monid];
	}

	makeMon(monid:any):any{
		let mondata = this.monster_data_list[monid];
		if(mondata){
			let mon = new Monster(mondata);
			return mon;
		}
		return null;
	}

	getRandomBB(){
		let list = Object.keys(this.bb_list);
		let r = Global.random(0, list.length - 1);
		let mondata = this.bb_list[list[r]];
		if (mondata) {
			let mon = new Monster(mondata);
			return mon;
		}
		return null;
	}

	getGroupData(groupid:any):any{
		return this.monster_group[groupid];
	}

	getMonGroup(groupid:any):any{
		let mongroupdata = this.monster_group[groupid];
		if (mongroupdata == null){
			return null;
		}
		let mon_list = mongroupdata.monsterlist;
		let list = [];
		for (const mondata of mon_list) {
            let monster = this.makeMon(mondata.monid);
            if (null == monster)
                continue;

			if(monster){
				monster.pos = mondata.pos;
				list.push(monster);
			}
		}
		return list;
	}

	makeGroupDrop(groupid:any):any{
		let data = this.getGroupData(groupid);
		if(data && data.item.length > 0){
			let t = 0;
			let r = Global.random(0, 100);
			for (const info of data.item) {
				if (r >= t && r < info.per) {
					return info.items;
				}
			}
		}
		return [];
	}
}