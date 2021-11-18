
export default class Task {
    nTaskID:number;
    nKind:number;
    nTaskGrop:number;
    nDailyCnt:number;
    strTaskName:string;
    vecLimit:any[];
    vecEvent:any[];
    vecFailEvent:any[];
    constructor() {
        this.nTaskID = 0;
        this.nKind = 0;
        this.nTaskGrop = 0;
        this.nDailyCnt = 0;
        this.strTaskName = '';
        this.vecLimit = [];
        this.vecEvent = [];  //事件列表
        this.vecFailEvent = [];
    }
}