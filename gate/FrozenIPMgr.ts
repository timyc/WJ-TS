import Global from "../game/core/Global";
import DB from "../utils/DB";

export default class FrozenIPMgr {
	static shared=new FrozenIPMgr();
	frozenlist:any[];
	constructor(){
		this.frozenlist = [];
	}

	init(){
		DB.getFrozenList((ret:any, rows:any)=>{
			if (ret == Global.msgCode.SUCCESS) {
				for (const row of rows) {
					let fip = row.frozenip;
					this.addFrozenIp(fip);
				}
			}
		});
	}

	addFrozenIp(fip:any){
		if (this.frozenlist.indexOf(fip) == -1) {
			this.frozenlist.push(fip);
		}
	}

	checkIP(ip:any):boolean{
		if (this.frozenlist.indexOf(ip) == -1) {
			return true;
		}
		return false;
	}
}