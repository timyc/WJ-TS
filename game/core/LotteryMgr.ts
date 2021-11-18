// 彩票管理器

import Global from "../../game/core/Global";
import LotteryBox from "./LotteryBox";

export default class LotteryMgr {
    static shared=new LotteryMgr();
    vecItem:any[];
    mapLotteryBox:any;
    nMaxID:number;

    constructor() {
        this.vecItem = [];
        this.mapLotteryBox = {};
        this.nMaxID = 0;
    }

    init() {
        let mapData = Global.require_ex('../prop_data/prop_lottery');
        for (var it in mapData) {
            let stInfo = mapData[it];
            this.vecItem.push(stInfo);
        }
    }


    CreateLotteryBox() {
        this.nMaxID += 1;
        if(this.nMaxID > 3000){
            this.nMaxID = 0;
        }
        this.mapLotteryBox[this.nMaxID] = new LotteryBox(this.nMaxID, Global.getTime(), this.RandSubItemList());

        return this.mapLotteryBox[this.nMaxID].ToJson();
    }


    RandSubItemList() {
        let vecTmp = this.vecItem.slice(0);
        let vecSub = [];

        for (let i = 0; i < 15; i++) {
            if (vecTmp.length <= 0)
                break;

            let nIndex = Global.random(0, vecTmp.length - 1);
            vecSub.push(vecTmp[nIndex]);
            vecTmp.splice(nIndex, 1);
        }

        return vecSub;
    }

    CheckAndDeleteLotteryBox() {
        let nCurTime = Global.getTime();

        for (var it in this.mapLotteryBox) {
            if (nCurTime - this.mapLotteryBox[it].nCreateTime > 600) {
                delete this.mapLotteryBox[it];
            }
        }
    }

    update(dt:number){
        if(dt % (1000 * 10) == 0){
            this.CheckAndDeleteLotteryBox();
        }
    }

    GetBox(nID:any) {
        if (this.mapLotteryBox.hasOwnProperty(nID) == false)
            return null;

        return this.mapLotteryBox[nID];
    }

    DeleteBox(nID:any) {
        delete this.mapLotteryBox[nID];
    }
}