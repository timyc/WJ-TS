import EventBase from "./EventBase";

export default class GiveNpcItem extends EventBase {
    nItemID:number;
    nNum:number;
    nFromNpc:any;
    nNpcConfigID:any;
    strTip2:any;
    constructor() {
        super();
        this.nItemID = 0;
        this.nNum = 0;
        this.nFromNpc;
        this.nNpcConfigID;
    }
}