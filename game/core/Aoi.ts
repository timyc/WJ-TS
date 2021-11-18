var assert = require('assert');



export default class Aoi{
	w:number;
	h:number;
	obj_list:any;
	obj_list_x:any;
	obj_list_y:any;
	dst_max:number;

	constructor() {
		this.w = 300;
		this.h = 300;
		this.obj_list = {}
		this.obj_list_x = {}
		this.obj_list_y = {}
		this.dst_max = 40 //最大观察半径
	}


	is_watcher(obj:any):boolean{
		if (obj.aoi_model == "w" || obj.aoi_model == "wm" || obj.aoi_model == "mw") {
			return true;
		} else {
			return false;
		}
	}

	is_maker(obj:any):boolean{
		if (obj.aoi_model == "m" || obj.aoi_model == "wm" || obj.aoi_model == "mw") {
			return true;
		} else {
			return false;
		}
	}

	dispatch_message(obj:any, func:any) {
		assert(func);
		if (this.is_maker(obj)) {
			// 按照设置的最大视野范围遍历x轴
			let tmps = obj.x - this.dst_max;
			if (tmps <= 0) {
				tmps = 1;
			}
			let tmpe = obj.x + this.dst_max;
			if (tmpe > this.w) {
				tmpe = this.w;
			}

			for (let i = tmps; i < tmpe; i++) {
				if (i <= 0) {
					break;
				}
				if (this.obj_list_x[i]) {
					for (const k in this.obj_list_x[i]) {
						if (this.obj_list_x[i].hasOwnProperty(k)) {
							const v = this.obj_list_x[i][k];
							if (v == null) continue;
							// 是观察者，并且在他的视野范围内
							if (this.is_watcher(v) && Math.abs(v.x - obj.x) <= this.dst_max && Math.abs(v.y - obj.y) <= this.dst_max && v != obj) {
								// 执行更新回调
								func(obj, v)
							}
						}
					}
				}
			}
		}
	}

	get_watcher(obj:any) {
		let list:any = {};
		let tmps = obj.x - this.dst_max;
		if (tmps <= 0) {
			tmps = 1;
		}

		let tmpe = obj.x + this.dst_max;
		if (tmpe > this.w) {
			tmpe = this.w;
		}

		for (let i = tmps; i <= tmpe; i++) {
			if (i <= 0) {
				break;
			}

			if (this.obj_list_x[i]) {
				for (const k in this.obj_list_x[i]) {
					if (this.obj_list_x[i].hasOwnProperty(k)) {
						const v = this.obj_list_x[i][k];
						if (v == null) continue;
						if (this.is_watcher(v) && Math.abs(v.y - obj.y) <= this.dst_max && Math.abs(v.x - obj.x) <= this.dst_max && v != obj) {
							list[k] = v;
						}
					}
				}
			}
		}
		return list;
	}

	get_maker(obj:any, isproto?:any) {
		let list:any = {};
		let tmps = obj.x - this.dst_max;
		if (tmps < 0) {
			tmps = 0;
		}

		let tmpe = obj.x + this.dst_max;
		if (tmpe > this.w) {
			tmpe = this.w;
		}

		for (let i = tmps; i <= tmpe; i++) {
			if (i < 0) {
				break;
			}

			if (this.obj_list_x[i]) {
				for (const k in this.obj_list_x[i]) {
					if (this.obj_list_x[i].hasOwnProperty(k)) {
						const v = this.obj_list_x[i][k];
						if (v == null) continue;
						if (this.is_maker(v) && Math.abs(v.y - obj.y) <= this.dst_max && Math.abs(v.x - obj.x) <= this.dst_max && v != obj) {
							list[k] = v;
						}
					}
				}
			}
		}
		return list;
	}

	init(width:any, height:any, maxdst:any) {
		this.w = width == null ? this.w : width;
		this.h = height == null ? this.h : height;
		this.dst_max = maxdst == null ? this.dst_max : maxdst;
	}

	enter(obj:any, func:any) {
		this.obj_list[obj.onlyid] = obj;

		if (!this.obj_list_x[obj.x]) {
			this.obj_list_x[obj.x] = {};
		}

		if (!this.obj_list_y[obj.y]) {
			this.obj_list_y[obj.y] = {};
		}

		this.obj_list_x[obj.x][obj.onlyid] = obj;
		this.obj_list_y[obj.y][obj.onlyid] = obj;

		// 如果是maker模式， 广播给所有视野范围的带w模式的obj
		this.dispatch_message(obj, func);

		// 如果是watcher模式， 在进入之后返回视野上所有带m模式的obj
		if (this.is_watcher(obj)) {
			return this.get_maker(obj);
		}
	}

	remove(obj:any, func:any) {
		delete this.obj_list[obj.onlyid];
		delete this.obj_list_x[obj.x][obj.onlyid];
		delete this.obj_list_y[obj.y][obj.onlyid];
		// 如果是m活着mw模式， 需要广播给其他所有视野范围的w
		this.dispatch_message(obj, func)
	}
	// 需要计算更新之前和更新之后的交集作为广播集合
	update(obj:any, x:any, y:any, updatefunc:any, enterfunc:any, exitfunc:any) {
		let bef_w_list = this.get_watcher(this.obj_list[obj.onlyid])
		let bef_m_list = this.get_maker(this.obj_list[obj.onlyid])

		delete this.obj_list_x[obj.x][obj.onlyid];
		delete this.obj_list_y[obj.y][obj.onlyid];

		obj.x = x;
		obj.y = y;
		if (!this.obj_list_x[obj.x]) {
			this.obj_list_x[obj.x] = {};
		}

		if (!this.obj_list_y[obj.y]) {
			this.obj_list_y[obj.y] = {};
		}

		this.obj_list[obj.onlyid] = obj;
		this.obj_list_x[obj.x][obj.onlyid] = obj;
		this.obj_list_y[obj.y][obj.onlyid] = obj;

		let aft_w_list = this.get_watcher(obj);
		let aft_m_list = this.get_maker(obj);

		if (this.is_maker(obj)) {
			for (const k in aft_w_list) {
				if (aft_w_list.hasOwnProperty(k)) {
					const v = aft_w_list[k];
					if (bef_w_list[k]) {
						updatefunc(obj, v); // 更新交集
					} else {
						enterfunc(obj, v); //新增进入视野
					}
				}
			}

			// 走出对方的视野了也通知对方做退出视野的相关操作
			for (const k in bef_w_list) {
				if (bef_w_list.hasOwnProperty(k)) {
					const v = bef_w_list[k];
					if (!aft_w_list[k]) {
						exitfunc(obj, v);
					}
				}
			}
		}

		let list = [];
		if (this.is_watcher(obj)) {
			//找出新增的部分，需要更新到前端
			for (const k in aft_m_list) {
				if (aft_m_list.hasOwnProperty(k)) {
					const v = aft_m_list[k];
					if (!bef_m_list[k]) {
						list.push(v);
					}
				}
			}
		}
		return list;
	}
}