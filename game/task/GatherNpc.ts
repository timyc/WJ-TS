import EventBase from "../event/EventBase";

export default class GatherNpc extends EventBase {
    vecCreateNpc:[];
    vecNpc:[];
    constructor() {
        super();
        this.vecCreateNpc = [];
        this.vecNpc = [];
    }
}