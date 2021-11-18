import Global from "../game/core/Global";

export default class WhiteListMgr{
	static shared=new WhiteListMgr();
	white_list:any[];
	
	constructor(){
		this.white_list = [];
		this.init();
	}

	init(){
		this.white_list = this.white_list.concat(Global.serverConfig.WhiteList);
	}

	addWhiteIP(ip:any){
		this.white_list.push(ip);
	}

	checkIn(ip:any){
		if(this.white_list.length == 0){
			return true;
		}else{
			for (const whiteip of this.white_list) {
				if(whiteip == ip){
					return true;
				}
			}
		}
		return false;
	}

	delWhiteIP(ip:any){
		for (let i = 0; i < this.white_list.length; i++) {
			const whiteip = this.white_list[i];
			if(whiteip == ip){
				this.white_list.splice(i, 1);
				break;
			}
		}
	}

	clearAllIP(){
		this.white_list = [];
	}
}