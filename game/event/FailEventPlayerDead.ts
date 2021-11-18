import EventBase from "./EventBase";
import Global from "../../game/core/Global";

export default class FailEventPlayerDead extends EventBase {
    nEventType:any;
    nDeadCnt:number;
    constructor() {
        super();
        this.nEventType = Global.EEventType.FailEventPlayerDead;
        this.nDeadCnt = 1;
    }
}