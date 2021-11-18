import Global from "../../game/core/Global";

export default class ShopItem {
    nID:any;
    nConfigID:any;
    nKind:any;
    nSubKind:any;
    strJson:any;
    nSeller:any;
    nAddTime:any;
    nPrice:any;
    nCnt:any;
    nSellCnt:any;
    constructor(nID:any, nConfigID:any, nKind:any, nSubKind:any, strJson:any, nSeller:any, nAddTime:any, nPrice:any, nCnt:any, nSellCnt:any) {
        this.nID = nID;
        this.nConfigID = nConfigID;
        this.nKind = nKind;
        this.nSubKind = nSubKind;
        this.strJson = Global.getDefault(strJson, '');
        this.nSeller = nSeller;
        this.nAddTime = nAddTime;
        this.nPrice = nPrice;
        this.nCnt = nCnt;
        this.nSellCnt = nSellCnt;
    }
}