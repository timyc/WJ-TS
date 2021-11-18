import DB from "../utils/DB";
import Global from "../game/core/Global";

export default class FrozenMACMgr
{
	static shared=new FrozenMACMgr();
	frozenlist:any[];

	constructor(){
		this.frozenlist = [];
	}

	init(){
		DB.getFrozenMacList((ret:any, rows:any)=>{
			if (ret == Global.msgCode.SUCCESS) {
				for (const row of rows) {
					let mac = row.mac;
					this.addFrozenMAC(mac);
				}
			}
		});
	}

	addFrozenMAC(mac:any){
		if (this.frozenlist.indexOf(mac) == -1) {
			this.frozenlist.push(mac);
		}
	}

	checkMAC(mac:any){
		if (this.frozenlist.indexOf(mac) == -1) {
			return true;
		}
		return false;
	}
}