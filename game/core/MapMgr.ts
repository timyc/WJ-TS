import MapModel from "./MapModel";
import NpcMgr from "./NpcMgr";

export default class MapMgr {

	static shared=new MapMgr();
	
	map_list:any;
	bang_map_list:any;
	home_map_list:any;

	constructor() {
		this.map_list = [];
		this.bang_map_list = {};
		this.home_map_list = {};
	}

	addMap(map:any) {
		this.map_list[map.map_id] = map;
	}

	getBangMap(bangid:any):any{
		if (bangid == 0) {
			return null;
		}
		if (this.bang_map_list[bangid]) {
			return this.bang_map_list[bangid];
		}
		else {
			let propMap = require('../prop_data/map_json/3002');
			if (propMap) {
				let pMap = new MapModel();
				pMap.map_id = bangid;
				pMap.map_name = '帮派';
				// 这里扩展map信息
				pMap.setMapData(propMap);
				this.bang_map_list[bangid] = pMap;
				NpcMgr.shared.InitNpcByMapId(3002, bangid);
				return pMap;
			}
		}
		return null;
	}

	getHomeMap(onlyid:any):any{
		if (this.home_map_list[onlyid]) {
			return this.home_map_list[onlyid];
		}
		else {
			let propMap = require('../prop_data/map_json/4001');
			if (propMap) {
				let pMap = new MapModel();
				pMap.map_id = onlyid;
				pMap.map_name = '家';
				// 这里扩展map信息
				pMap.setMapData(propMap);
				this.home_map_list[onlyid] = pMap;
				return pMap;
			}
		}
		return null;
	}

	getMap(obj:any):any{
		if (obj.mapid == 3002) {
			if (obj.isNpc()) {
				return this.getBangMap(obj.nFuBenID);
            } else
            {
                return this.getBangMap(obj.bangid);
			}
		}else if (obj.mapid == 4001) {
			if (!obj.isNpc()) {
				return this.getHomeMap(obj.onlyid);
			}else{
				return null;
			}
		} else {
			return this.map_list[obj.mapid];
		}
	}

	getMapById(mapId:any):MapModel{
		return this.map_list[mapId];
	}

	init() {
		let maplist = require("../prop_data/prop_map");
		for (let mapid in maplist) {
			if (maplist.hasOwnProperty(mapid)) {
				let mapinfo = maplist[mapid];
				let propMap = require('../prop_data/map_json/' + mapinfo.mapid);
				if (propMap) {
					let pMap = new MapModel();
					pMap.map_id = mapid;
					pMap.map_name = mapinfo.map_name;
					// 这里扩展map信息
					propMap.anlei = JSON.parse(mapinfo.anlei);
					pMap.setMapData(propMap);
					this.addMap(pMap);
				}
			}
		}
	}
}