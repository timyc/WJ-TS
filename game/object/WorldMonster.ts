export default class WorldMonster {
    nNpc:any;
    nOnlyID:number;
    nInPos:number;
    nKind:any;
    nCnt:number;
    constructor(nNpc:any, nKind:any) {
        this.nNpc = nNpc;
        this.nOnlyID = 0;
        this.nInPos = 0;
        this.nKind = nKind;
        this.nCnt = nKind == 1 ? 10 : 1;
    }
}
