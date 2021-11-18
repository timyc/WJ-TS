import EventStateBase from "./EventStateBase";

export default class TalkEventState extends EventStateBase //对话事件完成状态
{
    vecRemainNpc:any;
    constructor() {
        super();
        this.vecRemainNpc = [];
    }
}
