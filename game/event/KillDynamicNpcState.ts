import EventStateBase from "./EventStateBase";

export default class KillDynamicNpcState extends EventStateBase {
    vecRemainNpc:any;
    constructor() {
        super();
        this.vecRemainNpc = [];
    }
}