import EventBase from "./EventBase";
import Global from "../../game/core/Global";

export default class FailEventTimeOut extends EventBase {
    nEventType:number;
    nMaxTime:number;
    constructor() {
        super();
        this.nEventType = Global.EEventType.FailEventTimeOut;
        this.nMaxTime = 60;
    }
}