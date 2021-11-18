import EventStateBase from "./EventStateBase";

export default class GatherNpcState extends EventStateBase //采集 完成状态
{
    vecRemainNpc:any;
    constructor() {
        super();
        this.vecRemainNpc = [];
    }
}