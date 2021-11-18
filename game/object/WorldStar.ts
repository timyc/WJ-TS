import MapMgr from "../core/MapMgr";

export default class WorldStar {
    nNpc:number;
    nOnlyID:number;
    vecApply:[];
    mapid:number;
    pos:any;
    level:number;
    constructor(npcid:number, mapid:number, level:number) {
        this.nNpc = npcid;
        this.nOnlyID = 0;
        this.vecApply = [];
        this.mapid = mapid;
        this.pos = {
            x: 0,
            y: 0
        };
        this.level = level;
    }

    Reset() {
        this.vecApply = [];
    }

    getCurPos():any{
        return this.pos;
    }

    GetPos() {
        // let vecTmp = this.strPos.split(",");
        let mapModel= MapMgr.shared.getMapById(this.mapid);
        let pos = mapModel.getARandomPos();
        this.pos = {
            map: this.mapid,
            x: pos.x,
            y: pos.y
        };
        return this.pos;
    }
}
