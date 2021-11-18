import Global from "../../game/core/Global";

export default class FailEventTimeOutState {

    nEventType:any;
    nStartTime:number;

    constructor() {
        this.nEventType = Global.EEventType.FailEventTimeOut;
        this.nStartTime = 0;
    }
}