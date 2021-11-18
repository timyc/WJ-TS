import EventBase from "../event/EventBase";

export default class KillDynamicNpc extends EventBase {
    vecCreateNpc:any[];
    vecNpc:any[];
    bAutoTrigle:number;
    constructor() {
        super();
        this.vecCreateNpc = [];
        this.vecNpc = [];
        this.bAutoTrigle = 0;
    }
}