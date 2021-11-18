import EventStateBase from "./EventStateBase";

export default class ArriveAreaState extends EventStateBase { //做指定动作 完成状态

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