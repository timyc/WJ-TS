import Global from "../../game/core/Global";
import GoodsMgr from "../item/GoodsMgr";

export default class MallMgr {
    static shared=new MallMgr();
    mall_items:any;
    mapNpcShop:any;
    constructor() {
        this.mall_items = null;
        this.mapNpcShop = {};
    }

    init() {
        this.mall_items = Global.require_ex('../prop_data/prop_mall');
        let npcdata = Global.require_ex('../prop_data/prop_npc_shop');

        for (const _ in npcdata) {
            const npcmall = npcdata[_];
            if (this.mapNpcShop[npcmall.npcid] == null) {
                this.mapNpcShop[npcmall.npcid] = { goods: [] }
            }
            let mtype = npcmall.type == '' ? null : npcmall.type;
            this.mapNpcShop[npcmall.npcid].goods.push({
                itemid: npcmall.itemid,
                moneykind: npcmall.kind,
                price: npcmall.price,
                type: mtype,
            })
        }

    }

    checkNpcData(npcid:any){
        if (this.mapNpcShop.hasOwnProperty(npcid) == false)
            return false;  
        return true;
    }

    getNpcShopData(npcId:any){
        return this.mapNpcShop[npcId];
    }

    getMallData(mallid:any) {
        return this.mall_items[mallid];
    }

    buyItem(player:any, mallid:any, num:any) {
        if (player.getBagItemAllKindNum() >= Global.limitBagKindNum) {
            player.send('s2c_notice', {
                strRichText: '背包已满，无法购买'
            });
            return;
        }

        let malldata = this.getMallData(mallid);
        if (malldata == null)
            return;

        if (num <= 0)
            return;

        let pItemInfo = GoodsMgr.shared.GetItemInfo(malldata.itemid);
        if (null == pItemInfo) {
            return;
        }

        let cost = malldata.price * num;
        let strErr = player.CostFee(1, cost, `从多宝购买${num}个${pItemInfo.name}`);
        if (strErr != '') {
            player.send('s2c_notice', {
                strRichText: strErr
            });
            return;
        }

        player.AddItem(malldata.itemid, num, true, '多宝购物');
    }
}