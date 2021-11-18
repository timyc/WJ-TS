import EventBase from "../event/EventBase";

export default class DoActionInArea extends EventBase {
    nMap:number;
    nX:number;
    nY:number;
    strAction:any;
    strTalk:string;
    constructor() {
        super();
        this.nMap = 0;
        this.nX = 0;
        this.nY = 0;
        this.strAction;
        this.strTalk = '';
    }
}