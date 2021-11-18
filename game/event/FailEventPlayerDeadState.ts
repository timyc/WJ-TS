import Global from "../../game/core/Global";

export default class FailEventPlayerDeadState {

    nEventType:any;
    nDeadCnt:number;

    constructor() {
        this.nEventType = Global.EEventType.FailEventPlayerDead;
        this.nDeadCnt = 0;
    }
}