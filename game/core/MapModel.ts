import Global from "../../game/core/Global";
import Aoi from "./Aoi";

export default class MapModel{
	map_id:any;
	map_name:string;
	map_data:any;
	maptype:number;
	instance_id:number;
	obj_list:any;
	player_list:any;
	npc_list:any;
	monster_list:any;
	aoi:Aoi;
	MAP_RES_WIDTH:number;
	MAP_RES_HEIGHT:number;
	gridWidth:number;
	gridHeight:number;
	rowCount:number;
	lineCount:number;
	gridInfoArr:any;

	constructor() {
		this.map_id = 0;
		this.map_name = '';

		this.map_data = null;
		this.maptype = Global.mapType.Unknow;
		this.instance_id = 0;

		this.obj_list = {};
		this.player_list = [];
		this.npc_list = [];
		this.monster_list = [];

		this.aoi = new Aoi();
		this.MAP_RES_WIDTH = 0;
        this.MAP_RES_HEIGHT = 0;
        this.gridWidth = 20;
		this.gridHeight = 20;
		this.rowCount = Math.ceil(this.MAP_RES_HEIGHT / this.gridHeight);
        this.lineCount = Math.ceil(this.MAP_RES_WIDTH / this.gridWidth);
	}

	enterfunc(sobj:any, tobj:any) {
		if (tobj.isPlayer()) {
			// agent同步前端数据
			tobj.aoi_enter(sobj);
		} else if (tobj.isNpc()) {
			//tobj.aoi_enter(sobj);
		} else if (tobj.isMonster() && sobj.isPlayer()) {
			// tobj.enter_field(sobj);
		}
	}
	
	exitfunc(sobj:any, tobj:any) {
		if (tobj.isPlayer()) {
			tobj.aoi_exit(sobj);
		}
		if (sobj.isPlayer()) {
			sobj.aoi_exit(tobj);
		}
	}
	
	movefunc(sobj:any, tobj:any) {
		if (tobj.isPlayer()) {
			tobj.aoi_update(sobj);
		}
	}
	

	setMapId(id:any) {
		this.map_id = id;
	}

	setMapData(data:any) {
		// mapInfo  npcInfo  transferInfo
		this.map_data = data;

		this.MAP_RES_WIDTH = data.baseInfo.width;
		this.MAP_RES_HEIGHT = data.baseInfo.height;
		this.gridInfoArr = data.mapInfo;
        this.rowCount = Math.ceil(this.MAP_RES_HEIGHT / this.gridHeight);
        this.lineCount = Math.ceil(this.MAP_RES_WIDTH / this.gridWidth);
	}

	enterMap(obj:any, objtype:any):any{
		this.obj_list[obj.onlyid] = obj;
		return this.aoi.enter(obj, this.enterfunc);
	}

	exitMap(obj:any) {
		let pobj = this.obj_list[obj.onlyid];
		if (pobj) {
			this.aoi.remove(pobj, this.exitfunc)
			delete this.obj_list[obj.onlyid];
		}
		// console.log(`玩家[${obj.name}],离开地图[${this.map_name}]`);
	}

	move(onlyid:any, x:any, y:any):any{
		let pobj = this.obj_list[onlyid];
		if (pobj) {
			return this.aoi.update(pobj, x, y, this.movefunc, this.enterfunc, this.exitfunc);
		}
	}

	getWatcher(onlyid:any):any{
		let pobj = this.obj_list[onlyid];
		if (pobj) {
			return this.aoi.get_watcher(pobj);
		}
		return [];
	}

	getAnleiGroup() {
		if (!this.map_data.anlei || !Array.isArray(this.map_data.anlei) || this.map_data.anlei.length == 0) {
			return false;
		}
		let groupindex = Math.floor(Math.random() * this.map_data.anlei.length);
		return this.map_data.anlei[groupindex];
	}

	getARandomPos():any{
		if(this.map_data == null){
			return null;
		}
		let rx = Math.floor(Math.random() * this.rowCount);
		let ry = Math.floor(Math.random() * this.lineCount);
		let p = this.getAvailabelPoint(ry, rx, this.gridInfoArr, this.rowCount, this.lineCount);
		return {x:p.l, y:p.r};
	}

	getAvailabelPoint(r:any, l:any, mapArr:any, rows:any, lines:any) {
        if (r < 0) {
            r = 0;
        }
        if (l < 0) {
            l = 0;
        }
        if (r >= rows) {
            r = rows - 1;
        }
        if (l >= lines) {
            l = lines - 1;
        }
        if (mapArr[r][l] != 0) {
            return {
                r: r,
                l: l
            };
        }
        let count = 1;
        while (true) {
            if (count > lines && count > rows) {
                return {
                    r: -1,
                    l: -1
                };
            }
            if (r + count < rows && mapArr[r + count][l] != 0) {
                return {
                    r: r + count,
                    l: l
                };
            }
            if (l + count < lines && mapArr[r][l + count] != 0) {
                return {
                    r: r,
                    l: l + count
                };
            }
            if (r >= count && mapArr[r - count][l] != 0) {
                return {
                    r: r - count,
                    l: l
                };
            }
            if (l >= count && mapArr[r][l - count] != 0) {
                return {
                    r: r,
                    l: l - count
                };
            }
            if (r + count < rows && l + count < lines && mapArr[r + count][l + count] != 0) {
                return {
                    r: r + count,
                    l: l + count
                };
            }
            if (r >= count && l >= count && mapArr[r - count][l - count] != 0) {
                return {
                    r: r - count,
                    l: l - count
                };
            }
            if (r >= count && l + count < lines && mapArr[r - count][l + count] != 0) {
                return {
                    r: r - count,
                    l: l + count
                };
            }
            if (l >= count && r + count < rows && mapArr[r + count][l - count] != 0) {
                return {
                    r: r + count,
                    l: l - count
                };
            }
            count++;
        }
    }
}