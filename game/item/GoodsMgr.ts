import Global from "../../game/core/Global";
import PetPracticeMgr from "../object/PetPracticeMgr";
import PlayerMgr from "../object/PlayerMgr";

export default class GoodsMgr {
    static shared=new GoodsMgr();
    
    petrate:any;
    petSkillItem:any;
    itemData:any;

    constructor() {
    }

    init(){
        let data = Global.require_ex('../prop_data/prop_item');
        this.petrate = {} // 宠物吃元气丹成长率 
        this.petSkillItem = [[],[],[],[]]; // level 0 不被计算在内
        for (let itemid in data) {
            if (data.hasOwnProperty(itemid)) {
                let iteminfo = data[itemid];
                if (iteminfo.json != '' && iteminfo.json != null) {
                    iteminfo.json = JSON.parse(iteminfo.json);
                    if (Math.floor(Number(itemid) / 100) == 105 && iteminfo.json.pet && iteminfo.json.rate) {
                        this.petrate[iteminfo.json.pet] = iteminfo.json.rate;
                    }
                }
                if(iteminfo.type == 10){// 技能书
                    this.petSkillItem[iteminfo.level].push(itemid);
                }
            }
        }
        this.itemData = data;
    }

    useItem(data:any) {
        let pPlayer = PlayerMgr.shared.getPlayerByRoleId(data.roleid);
        if (null == pPlayer) return false;
        // if (this.itemData[data.itemid].effect == 1 && (!pPlayer.bag_list.hasOwnProperty(data.itemid) || pPlayer.bag_list[data.itemid] < 1))
        //     return;

        let pItemInfo = this.GetItemInfo(data.itemid);
        if (null == pItemInfo) {
            return false;
        }

        console.log(`玩家[${pPlayer.name}(${pPlayer.roleid})]使用物品[${pItemInfo.name}]`);

        if (Global.isDataInVecter(data.itemid, [50001, 50002, 50003])) { //藏宝图类型
            let stData = pItemInfo.json;

            if (stData.hasOwnProperty('money')) {
                pPlayer.AddMoney(0, stData.money, '藏宝图');
            }
            if (stData.hasOwnProperty('item')) {
                pPlayer.AddItem(stData.item, 1, true, '藏宝图');
            }
            if (stData.hasOwnProperty('monster')) {
                let pWorld = require('../object/world');
                pWorld.pWorldMonsterMgr.ReliveWorldMonster(pPlayer.accountid, stData.monster);
            }

            let r = Global.random(0, 10000);
            if (r < 5000) {
                // 藏宝图赠送一个神兽丹
                pPlayer.AddItem(10114, 1, true, '藏宝图赠送');
            }

            return true;
        } else if (data.itemid == 50004) { //高级藏宝图
            return false;
        } else if (data.itemid == 80001) { //银两物品
            let iteminfo = this.itemData[data.itemid];
            pPlayer.AddMoney(0, iteminfo.num, `使用物品[${iteminfo.name}]`);
            return true;
        } else if (Global.isDataInVecter(data.itemid, [10301, 10302, 10303])) { //见闻录
            return false;
        } else if ([10101,10102,10103].indexOf(data.itemid) != -1){ // 技能书残卷
            let n = pPlayer.getBagItemNum(data.itemid);
            if(n < pItemInfo.num){
                return false;
            }
            let sitem = this.getRandomPetSkill(pItemInfo.level);
            if(sitem){
                // pPlayer.AddBagItem(data.itemid, -pItemInfo.num, false);
                data.count = pItemInfo.num;
                pPlayer.AddBagItem(sitem, 1, true);
                return true;
            }
            return false;
        }else if (data.itemid == 10202 || data.itemid == 10204) { //经验书
            return pPlayer.stPartnerMgr.AddPartnerExp(data.operateid, this.itemData[data.itemid].num);
        } else if (data.itemid == 10203) { //超级星梦石
            pPlayer.resetPoint();
            return true;
        } else if (data.itemid == 10001 || data.itemid == 10004) { //引妖香
            return pPlayer.useIncense(this.itemData[data.itemid].num);
        } else if (data.itemid >= 10112 && data.itemid <= 10114) {
            let pet = pPlayer.getPetByID(data.operateid);
            if (pet == null) {
                return false;
            }
            return pet.addExp(this.itemData[data.itemid].num)
        } else if (data.itemid == 10116) {
            let pet = pPlayer.getPetByID(data.operateid);
            if (pet == null) {
                return false;
            }
            let maxxlevel = PetPracticeMgr.shared.GetMaxPriactiveLevel(pet.relive);
            let upexp = PetPracticeMgr.shared.GetUpdateHunPo(pet.xlevel);
            if (pet.xlevel >= maxxlevel && pet.xexp >= upexp) {
                return false;
            }
            pet.xexp += this.itemData[data.itemid].num;
            while (pet.xexp >= upexp) {
                pet.xexp -= upexp;
                pet.xlevel++;
                upexp = PetPracticeMgr.shared.GetUpdateHunPo(pet.xlevel);
            }
            if (pet.xlevel > maxxlevel) {
                pet.xlevel = maxxlevel;
                pet.xexp = PetPracticeMgr.shared.GetUpdateHunPo(pet.xlevel);
            }
            pPlayer.send('s2c_update_pet', {
                info: pet.toObj()
            });
            return true;
        } else if (data.itemid == 10117) { //龙之骨
            let pet = pPlayer.getPetByID(data.operateid);
            if (pet == null) {
                return false;
            }
            return pet.useLongGu();
        } else if (data.itemid == 90001) { //经验转魂魄
            let pet = pPlayer.getPetByID(data.operateid);
            if (pet == null) {
                return false;
            }
            let maxxlevel = PetPracticeMgr.shared.GetMaxPriactiveLevel(pet.relive);
            let upexp = PetPracticeMgr.shared.GetUpdateHunPo(pet.xlevel);
            if (pet.xlevel >= maxxlevel && pet.xexp >= upexp) {
                return false;
            }
            let count = this.itemData[data.itemid].num;
            pet.xexp += Math.floor(pet.exp / count);
            pet.exp = pet.exp % count;
            while (pet.xexp >= upexp) {
                pet.xexp -= upexp;
                pet.xlevel++;
                upexp = PetPracticeMgr.shared.GetUpdateHunPo(pet.xlevel);
            }
            if (pet.xlevel > maxxlevel) {
                pet.exp += (pet.xlevel - maxxlevel) * count; //返还剩余经验
                pet.xlevel = maxxlevel;
                pet.xexp = PetPracticeMgr.shared.GetUpdateHunPo(pet.xlevel);
            }
            pPlayer.send('s2c_update_pet', {
                info: pet.toObj()
            });
            return true;
        } else if (Math.floor(data.itemid / 100) == 105) { // 宠物元气丹 
            let pet = pPlayer.getPetByID(data.operateid);
            if (pet == null || pItemInfo.num != pet.dataid) {
                return false;
            }
            return pet.useYuanqi();
        } else if (data.itemid == 10111 || data.itemid == 10120) { // 宠物亲密丹
            let pet = pPlayer.getPetByID(data.operateid);
            if (pet == null) {
                return false;
            }
            if (typeof (pItemInfo.num) == 'number' && pItemInfo.num > 0) {
                return pet.addQinmi(pItemInfo.num);
            }
            return false;
        }


        if (pItemInfo.type == 10) { // 技能书
            if (Math.floor(pItemInfo.id / 1000) == 60) { // 宠物技能书
                if (pPlayer.curPet == null) {
                    return false;
                }
                return pPlayer.curPet.learnSkill(pItemInfo.num);
            }
        }
        return false;
    }

    GetItemInfo(nConfigID:any) {
        if (this.itemData.hasOwnProperty(nConfigID) == false)
            return null;

        return this.itemData[nConfigID];
    }


    getItemInfoByName(itemname:any) {
        for (const itemid in this.itemData) {
            if (this.itemData.hasOwnProperty(itemid)) {
                const item = this.itemData[itemid];
                if (item.name == itemname) {
                    return item;
                }
            }
        }
        return null;
    }

    
    getPetUseYuanqiRate(petid:any) {
        let rate = this.petrate[petid];
        if (!rate) {
            console.log('宠物元气丹成长概率未找到', petid);
        }
        return rate || 0;
    }

    getMedicineEffect(itemid:any) {
        let retEffect = {
            addhp: 0,
            addmp: 0,
            mulhp: 0,
            mulmp: 0,
            huoyan: 0,
        };
        let medicine = this.GetItemInfo(itemid);
        if (medicine == null) {
            return retEffect;
        }
        if (itemid == 40017) {
            retEffect.huoyan = 1;
            return retEffect;
        }

        let stData = medicine.json;
        if (stData == null || stData.hm == null) {
            return retEffect;
        }
        let hpc = stData.hm.indexOf('h');
        let mpc = stData.hm.indexOf('m');
        if (hpc != -1) {
            if (stData.jc == 'j') {
                retEffect.addhp = medicine.num;
            }
            if (stData.jc == 'c') {
                retEffect.mulhp = medicine.num;
            }
        }
        if (mpc != -1) {
            if (stData.jc == 'j') {
                retEffect.addmp = medicine.num;
            }
            if (stData.jc == 'c') {
                retEffect.mulmp = medicine.num;
            }
        }
        return retEffect;
    }

    getRandomPetSkill(skilllevel:any){
        let list = this.petSkillItem[skilllevel];
        let r = Math.floor(Math.random() * list.length);
        return list[r];
    }
}