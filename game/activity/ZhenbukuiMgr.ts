import Global from "../../game/core/Global";

export default class ZhenbukuiMgr {
    static shared=new ZhenbukuiMgr();
    mall_items:any;
    mapNpcZhenbukuiShop:any;
    totalZBKWeight:number;
    current_items:any;
    constructor() {
        this.mall_items = null;
        this.mapNpcZhenbukuiShop = {};
        this.mapNpcZhenbukuiShop.goods = [];
        this.totalZBKWeight = 0;
        this.current_items = {};
        this.current_items.goods = [];
    }

    init() {
        let npcZhenbukuiData = Global.require_ex('../prop_data/prop_zhenbukui_shop');
        
        //初始化甄不亏的商品数据
        for (const _ in npcZhenbukuiData) {
            const npcmall = npcZhenbukuiData[_];
            this.totalZBKWeight += + npcmall.weight;
            let mtype = npcmall.type == '' ? null : npcmall.type;
            this.mapNpcZhenbukuiShop.goods.push({
                itemid: npcmall.itemid,
                moneykind: npcmall.kind,
                price: npcmall.min_price,
                min_price: npcmall.min_price,
                max_price: npcmall.max_price,
                quantity: npcmall.min_quantity,
                min_quantity: npcmall.min_quantity,
                max_quantity: npcmall.max_quantity,
                saled_quantity:0,
                weight:npcmall.weight,
                type:mtype
            })
        }
        // console.log(this.totalZBKWeight);
    }

    checkNpcData(npcid:any):boolean{
        if (this.mapNpcZhenbukuiShop.goods.length == 0)
            return false;        
        return true;
    }

    getNpcShopData(npcId?:any):any{
        
                    

        if(this.current_items.goods.length == 0){
            //加权随机抽取十个物品
            for(var i = 0;i < 10;i++){     
                this.getRandomItem();              
            }
            //随机商品价格和数量
            let shopItem;
            for(var i = 0;i < 10;i++){
                shopItem = this.current_items.goods[i];
                var r_price = Math.floor(Math.random() * (shopItem.max_price - shopItem.min_price + 1) + shopItem.min_price);                
                shopItem.price = r_price;

                var r_quantity = Math.floor(Math.random() * (shopItem.max_quantity - shopItem.min_quantity + 1) + shopItem.min_quantity); 
                shopItem.quantity = r_quantity;
            }

        }
        return this.current_items;

        
    }


    clearShopItem(){
        this.current_items.goods = [];
    }


    updateShopItem(itemid:any,quantity:any):any{
        console.log(`甄不亏售出${itemid}商品${quantity}份`);
        return this.current_items.goods.filter(function(e:any,p:any):boolean{
            if(e.itemid == itemid){
                e.quantity = (e.quantity -= quantity) >= 0 ? e.quantity : 0;
                return true;
            }
            return false;
        });
    }

    getRandomItem(){
        let r_num = Math.ceil(Math.random() * this.totalZBKWeight);
        console.log('当前随机权重： ' + r_num)
        let tempWeight = 0;
        for(var j = 0;j < this.mapNpcZhenbukuiShop.goods.length;j++){
            let hitWeight = 0;
            let zbkItem = this.mapNpcZhenbukuiShop.goods[j];  
            tempWeight += + zbkItem.weight;   
            if(tempWeight >= r_num){                        
                hitWeight = zbkItem.weight;              
                //去掉已有的物品
                let checkRes = this.current_items.goods.find(function(v:any):boolean{
                    if(v.itemid == zbkItem.itemid)
                        return true;
                    return false;
                });
                if(checkRes == undefined){
                    this.current_items.goods.push(zbkItem);
                }else{
                    this.getRandomItem()
                }  
                break;             
            }
        }
    }

    getMallData(mallid:any):any{
        return this.mall_items[mallid];
    }
}