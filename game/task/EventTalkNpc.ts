import EventBase from "../event/EventBase";

export default class EventTalkNpc extends EventBase {
    vecCreateNpc:any[];
    nNpcConfigID:number;
    vecSpeak:any[];
    bAutoTrigle:number;
    vecNpc:any;
    
    constructor() {
        super();
        this.vecCreateNpc = [];
        this.nNpcConfigID = 0;
        this.vecSpeak = [];
        this.bAutoTrigle = 0;
    }

}
