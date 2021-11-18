import Global from "../game/core/Global";

export default class GTimer{
	static offsetTime:number=0;

	static getCurTime(){
		let curtime = Date.now();
		curtime += GTimer.offsetTime;
		return curtime;
	}
	
	static getCurDate() {
		let cuttime = GTimer.getCurTime()
		return new Date(cuttime);
	}
	
	static dateFormat(time:number) {
		let date = new Date(time);
		let y = date.getFullYear();
		let m = date.getMonth() + 1;
		let sm = m < 10 ? ('0' + m) : m;
		let d = date.getDate();
		let sd = d < 10 ? ('0' + d) : d;
		let h = date.getHours();
		let sh = h < 10 ? ('0' + h) : h;
		let mi = date.getMinutes();
		let smi = mi < 10 ? ('0' + mi) : mi;
		let s = date.getSeconds();
		let ss = s < 10 ? ('0' + s) : s;
		return y + '-' + sm + '-' + sd + ' ' + sh + ':' + smi + ':' + ss;
	}

	static getTimeFormat() {
		return GTimer.dateFormat(Global.gTime);
	}
	
	static getWeekDay() {
		let date = GTimer.getCurDate();
		let t = date.getDay(); // 
		return t + 1;
	}
	
	static getYearDay(date:any) {
		// 构造1月1日
		let lastDay:any = new Date(date);
		lastDay.setMonth(0);
		lastDay.setDate(1);
		// 获取距离1月1日过去多少天
		var days = Math.ceil(date - lastDay) / (1000 * 60 * 60 * 24);
		return days;
	}
	
	static getYearWeek(date:any):number{
		let days = GTimer.getYearDay(date);
		let num = Math.ceil(days / 7);
		return num;
	}
}


