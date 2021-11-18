import Global from "../../game/core/Global";

export default class EventStateBase {
    nEventType:number;
    nState:number;

    constructor() {
        this.nEventType = 0;
        this.nState = Global.EState.ELock;
    }
}