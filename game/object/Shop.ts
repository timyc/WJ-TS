import Global from "../../game/core/Global";
import DB from "../../utils/DB";
import ShopItem from "./ShopItem";

export default class Shop {
    private static _shared:Shop;
    nMaxID:number;
    mapItem:any;

    static get shared():Shop{
        if(!this._shared){
            this._shared=new Shop();
        }
        return this._shared;
    }

    constructor() {
        this.nMaxID = 0;
        this.mapItem = {};
    }

    init() {
        this.ReadItemFromDB();
    }

    ReadItemFromDB() {
        let strSql = `select * from shop_goods`;
        DB.query(strSql, (err:any, rows:any) => {
            if (err != null)
                return;

            for (let i = 0; i < rows.length; i++) {

                if (Global.getTime() - rows[i].nAddTime > 86400 * 10) // 超过 10 天无人取回直接丢弃
                    continue;


                let stShopItem = new ShopItem(rows[i].nID, rows[i].nConfigID, rows[i].nKind, rows[i].nSubKind, rows[i].strJson, rows[i].nSeller, rows[i].nAddTime, rows[i].nPrice, rows[i].nCnt, rows[i].nSellCnt, );
                this.mapItem[stShopItem.nID] = stShopItem;
            }
        });
    }

    FindShopItem(nID:any):any{
        if (this.mapItem.hasOwnProperty(nID) == false)
            return null;

        return this.mapItem[nID];
    }


    GetMaxID() {
        let nMax = 0;
        for (let it in this.mapItem) {
            if (Number(it) > nMax)
                nMax = Number(it);
        }
        return nMax;
    }

    IsIteamCanSell(nID:any) {
        if (nID >= 30001 && nID <= 30030)
            return false;

        if (Global.isDataInVecter(nID, [10202, 10116, 10201, 50004, 10301, 10302, 10303, 10406, 10401]))
            return false;

        return true;
    }


    exitSave(callback:any) {
        let nRowCnt = Global.getMapLen(this.mapItem);
        if (nRowCnt == 0) {
            callback();
            return;
        }

        let strClear = 'TRUNCATE TABLE shop_goods';
        let str = '';
        for (let it in this.mapItem) {
            let pShopItem = this.mapItem[it];
            let strInsert = `insert into shop_goods( nID,nConfigID, nKind, nSubKind, strJson, nSeller,nAddTime,nPrice,nCnt,nSellCnt) values( ${pShopItem.nID},${pShopItem.nConfigID} ,${pShopItem.nKind} ,0,'${pShopItem.strJson}',${pShopItem.nSeller},${pShopItem.nAddTime},${pShopItem.nPrice},${pShopItem.nCnt},${pShopItem.nSellCnt});`;
            str += strInsert;
        }

        console.log('Shop Server Exit');
        console.log(str);

        DB.query(strClear, (ret:any, rows:any) => {
            if (ret != null) {
                callback();
                return;
            }

            DB.query(str, (ret2:any, rows2:any) => {
                callback();
            });
        });
    }
}