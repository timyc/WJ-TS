import Global from "../../game/core/Global";
import DB from "../../utils/DB";
import GoodsMgr from "../item/GoodsMgr";
import Pet from "../object/Pet";
import Launch from "./launch";

export default class PetMgr{
	static shared=new PetMgr();
	pet_data_list:any;
	pet_color_list:any;
	maxPetID:any;
	petDBTimer:any;

	constructor() {
		this.pet_data_list = {};
		this.pet_color_list = {};
		this.maxPetID = 0;
		this.petDBTimer = null;
	}

	init() {
		let propPet = Global.require_ex('../prop_data/prop_pet');

		for (const petid in propPet) {
			if (propPet.hasOwnProperty(petid)) {
				try {
					const petdata = propPet[petid];
					petdata.rate = JSON.parse(petdata.rate);
					petdata.hp = JSON.parse(petdata.hp);
					petdata.mp = JSON.parse(petdata.mp);
					petdata.atk = JSON.parse(petdata.atk);
					petdata.spd = JSON.parse(petdata.spd);
					petdata.needitem = petdata.gettype == 1 ? JSON.parse(petdata.needitem) : [];
					petdata.wuxing = JSON.parse(petdata.wuxing);

					this.pet_data_list[petid] = petdata;
				} catch (error) {
					console.log('ERROR', petid);
					console.log(error);
				}
			}
		}

		let propPetColor = Global.require_ex('../prop_data/prop_pet_color');
		for (const petid in propPetColor) {
			if (propPetColor.hasOwnProperty(petid)) {
				try {
					let colorValue = propPetColor[petid].colorValue.split(',');
					let colorNice = propPetColor[petid].colorNice.split(',');
					this.pet_color_list[petid] = {
						colorValue: colorValue,
						colorNice: colorNice,
					};
				} catch (error) {
					console.log('ERROR', petid);
					console.log(error);
				}
			}
		}
		DB.getPetMaxId();
		this.petDBTimer = setInterval(() => {
			DB.getPetMaxId();
		}, 60 * 1000);
	}

	setMaxPetSeed(petseedid:any) {
		this.maxPetID = petseedid;
		if (this.petDBTimer != null) {
			clearInterval(this.petDBTimer);
			this.petDBTimer = null;
			console.log('宠物管理模块加载完毕！');
			Launch.shared.complete('petmgr');
		}
	}

	getPetData(petid:any):any{
		return this.pet_data_list[petid];
	}

	canHeCheng(role:any, petid:any) {
		if (role.petObjs.length >= Global.limitPetNum) {
			return false;
		}

		let petdata = this.getPetData(petid);
		let curitems = Global.deepClone(role.bag_list);
		for (const itemid of petdata.needitem) {
			if (!curitems[itemid]) {
				return false;
			}
			curitems[itemid]--;
		}

		let logstr = `玩家[${role.name}(${role.roleid})] 消耗`;
		for (const itemid of petdata.needitem) {
			role.bag_list[itemid]--;
			let iteminfo = GoodsMgr.shared.GetItemInfo(itemid);

			if (iteminfo) {
				logstr += `${iteminfo.name}`;
			}
			logstr += `(${itemid})`;
		}
		logstr += `合成[${petdata.name}]`;
		console.log(logstr);
		return true;
	}

	getNextRate(rate:any, dataid:any) {
		let petdata = this.getPetData(dataid);
		let rate2 = petdata.rate[1] * 10000;
		return Global.random(rate, rate2);
	}

	getMaxSkillCnt(dataid:any) {
		let petdata = this.getPetData(dataid);
		if (petdata.maxskillcnt) {
			return petdata.maxskillcnt;
		}
		return 4;
	}

    
	getMaxRate(dataid:any) {
		let petdata = this.getPetData(dataid);
		let rate2 = petdata.rate[1] * 10000;
		return rate2;
	}

	getBaseAttr(dataid:any) {
		let petdata = this.getPetData(dataid);
		let rate1 = petdata.rate[0] * 10000;
		let rate2 = petdata.rate[1] * 10000;
		let ret:any= {};
		let r = Global.random(0, 10000);
		if (r < 200) {
			ret.rate = rate2;
		} else {
			ret.rate = Global.random(rate1, rate2);
		}
		ret.hp = Global.random(petdata.hp[0], petdata.hp[1]);
		ret.mp = Global.random(petdata.mp[0], petdata.mp[1]);
		ret.atk = Global.random(petdata.atk[0], petdata.atk[1]);
		ret.spd = Global.random(petdata.spd[0], petdata.spd[1]);
		return ret;
	}

	createPet(role:any, petid:any, callback:any) {
		if (role.petObjs.length >= Global.limitPetNum) {
			return;
		}
		this.maxPetID++;

		let pet = new Pet(petid);
		pet.petid = this.maxPetID;
		pet.dataid = petid;
		pet.owner = role;
		pet.ownid = role.roleid;

		let petdata = this.getPetData(petid);
		pet.resid = petdata.resid;
		pet.name = petdata.name;
		pet.grade = petdata.grade;
		pet.level = 0;

		let baseattr = this.getBaseAttr(petid);
		pet.rate = baseattr.rate;
		pet.hp = baseattr.hp;
		pet.mp = baseattr.mp;
		pet.atk = baseattr.atk;
		pet.spd = baseattr.spd;

		pet.basehp = pet.hp;
		pet.basemp = pet.mp;
		pet.baseatk = pet.atk;
		pet.basespd = pet.spd;

		pet.skill_list = {};
		if (petdata.skill != null && petdata.skill != '' && petdata.skill != 0) {
			pet.skill_list[petdata.skill] = {idx:0, lck:0};
		}
		pet.calculateAttribute();

		DB.createPet(pet.toObj(), (ret:any) => {
			if (ret != Global.msgCode.SUCCESS) {
				console.log(`玩家[${role.name}(${role.roleid})]宠物[${pet.name}]创建失败, 宠物属性{${pet.toObj()}}`);
			}
		});
		callback(pet);
	}

	getPetListByRoleId(roleid:any, callback:any) {
		DB.getPetList(roleid, (ret:any, data:any) => {
			if (ret != Global.msgCode.SUCCESS) {
				callback(ret)
				return;
			}
			let petlist = [];
			for (const petdata of data) {
				if (petdata.state == 0) {
					continue;
				}
				let pet = new Pet(petdata.dataid);
				pet.setDBdata(petdata);
				petlist.push(pet);
			}
			callback(ret, petlist)
		});
	}

	getMaxLongGu(relive:any):number{
		if (relive == 0) return 2;
		if (relive == 1) return 4;
		if (relive == 2) return 7;
		if (relive == 3) return 12;
		return 0;
	}

	getPetColors (petid:any):any{
		if (this.pet_color_list[petid]) {
			return this.pet_color_list[petid];
		}
		else {
			console.log(`未找到${petid}的宠物颜色！`);
			return { colorValue: [0], colorNice: [0], };
		}
	}
}
