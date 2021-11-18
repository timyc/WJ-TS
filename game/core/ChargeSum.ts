

import PlayerMgr from "../object/PlayerMgr";
import DB from "../../utils/DB";
import Launch from "./launch";

export default class ChargeSum {
	static shared=new ChargeSum();
	rolelist:any;
	constructor() {
		this.rolelist = {};
	}
	
	init() {
		DB.query('SELECT roleid, sum(realmoney) AS rmb FROM charge_record WHERE status = 1 GROUP BY roleid;', (err:any, rows:any) => {
			if (err) {
				throw err;
			}
			if (rows.length != 0) {
				for (let item of rows) {
					if (item.roleid && item.rmb) {
						// this.playerCharge(item.roleid, item.rmb);
						if (this.rolelist[item.roleid]) {
							this.rolelist[item.roleid] += item.rmb;
						} else {
							this.rolelist[item.roleid] = item.rmb;
						}
					}
				}
			}
			console.log('充值模块加载完毕！');
			Launch.shared.complete('chargemgr');
		});
	}

	
	playerCharge(roleid:any, charge:any, jade:any) {
		if (this.rolelist[roleid]) {
			this.rolelist[roleid] += charge;
		} else {
			this.rolelist[roleid] = charge;
		}
		let player = PlayerMgr.shared.getPlayerByRoleId(roleid);
		if (player) {
			player.ChargeSuccess(jade, charge);
		}
	}

	
	getPlayerChargeSum(roleid:any):any{
		return this.rolelist[roleid] || 0;
	}
}