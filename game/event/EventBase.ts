export default class EventBase {
    nEventType:number;
    strTip:string;
    vecPrize:[];

    constructor() {
        this.nEventType = 0;
        this.strTip = '';
        this.vecPrize = [];
    }
}