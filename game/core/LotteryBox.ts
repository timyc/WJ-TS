import Global from "../../game/core/Global";

export default class LotteryBox {
    nBoxID:any;
    nCreateTime:any;
    vecItem:any;
    constructor(nBoxID:any, nCreateTime:any, vecItem:any) {
        this.nBoxID = nBoxID
        this.nCreateTime = nCreateTime;
        this.vecItem = vecItem.slice(0);
    }

    ToJson() {
        let mapValue:any = {};

        for (let i = 0; i < 15; i++) {
            mapValue[i] = { strItem: this.vecItem[i].strItem, nNum: this.vecItem[i].nNum, nRate: this.vecItem[i].nRate, };
        }

        let stData = { nBoxID: this.nBoxID, mapValue: mapValue };
        let strJson = JSON.stringify(stData);

        return strJson;
    }



    GetSumRate() {
        let nSum = 0;
        for (let it in this.vecItem) {
            nSum += Number(this.vecItem[it].nRate);
        }

        return nSum;

    }

    RandSelect(nLotterBox:any):number{

        let nRand = Global.random(0, this.GetSumRate());

        for (let i = 0; i < this.vecItem.length; i++) {
            nRand -= this.vecItem[i].nRate;
            if (nRand <= 0)
                return i;
        }

        return 0;
    }

    GetSumTime(nLen:any) {
        let nSum = 0;

        if (nLen >= 8)
            nSum += (nLen - 8) * 100;

        for (let i = 7; i > 0; i--) {
            nSum += (8 - i) * 100;
        }

        return nSum;

    }
}
