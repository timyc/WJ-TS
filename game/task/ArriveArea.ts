import EventBase from "../event/EventBase";

export default class ArriveArea extends EventBase {
    nMap:number;
    nX:number;
    nY:number;
    constructor() {
        super();
        this.nMap = 0;
        this.nX = 0;
        this.nY = 0;
    }
}