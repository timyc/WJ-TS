import crypto from "crypto";
import DB from "./DB";
import ChargeConfig from "../game/core/ChargeConfig";
import Http from "./Http";

export default class Charge {
	static shared = new Charge();

	constructor() {
	}

	
	getRandomOrderid20() {
		let date = new Date();
		let second = date.getTime();
		let random = Math.floor(900000 * Math.random()) + 100000;
		let orderid = 'E' + second + '' + random;
		return orderid;
	}

	
	getRandomOrderid30() {
		let date = new Date();
		let year = date.getFullYear();
		let month = date.getMonth();
		let smonth = "" + month;
		if (month < 10) { smonth = '0' + month; }
		let day = date.getDate();
		let sday = "" + day;
		if (day < 10) { sday = '0' + day; }
		let hour = date.getHours();
		let shour = "" + hour;
		if (hour < 10) { shour = '0' + hour; }
		let min = date.getMinutes();
		let smin = "" + min;
		if (min < 10) { smin = '0' + min; }
		let second = date.getSeconds();
		let ssecond = "" + second;
		if (second < 10) { ssecond = '0' + second; }
		let random = Math.floor(900000000 * Math.random()) + 100000000;
		let orderid = `E${year}${smonth}${sday}00${shour}00${smin}00${ssecond}${random}`;
		return orderid;
	}

	
	createCustomOrder(roleid: any, goodsid: any, goodscount: any, pay_bankcode: any, money: any, activitystates: any, callback: any) {
		if ([210, 220, 310, 330].indexOf(pay_bankcode) == -1) {
			callback(false);
			return;
		}
		money = parseInt(money);
		if (isNaN(money) || money <= 998) {
			callback(false);
			return;
		}
		let jade = this.getAllJadeByMoney(money);
		let name = 'XianYu' + money * 100;

		let orderid = this.getRandomOrderid30();
		DB.createChargeOrder(orderid, roleid, money, jade, goodscount, goodsid, activitystates, (ret: any) => {
			
			if (!ret) {
				callback(false, {});
				return;
			}
			let url = this.getRequestUrl(orderid, money, pay_bankcode);
			callback(true, { url: url });
		});
	}

	
	createOrder(roleid: any, goodsid: any, goodscount: any, pay_bankcode: any, money: any, activitystates: any, callback: any) {
		if (goodsid == 0) {
			this.createCustomOrder(roleid, goodsid, goodscount, pay_bankcode, money, activitystates, callback);
			return;
		}
		if ([210, 220, 310, 330].indexOf(pay_bankcode) == -1) {
			callback(false);
			return;
		}
		let jade = 0;
		let name = '';
		for (let data of ChargeConfig.shared.charge_list) {
			if (data.goodsid == goodsid) {
				jade = (data.jade + data.ex_jade) * goodscount;
				money = data.money * goodscount;
				name = data.name;
			}
		}
		if (jade == 0 || money == 0 || name == '') {
			callback(false);
			return;
		}

		let orderid = this.getRandomOrderid30();
		DB.createChargeOrder(orderid, roleid, money, jade, goodscount, goodsid, activitystates, (ret: any) => {
			if (!ret) {
				callback(false, {});
				return;
			}
			// let url = `http://${Global.serverConfig.HTTP.IP}:8080/?pay_bankcode=${pay_bankcode}&pay_amount=${money}&pay_orderid=${orderid}&pay_productname=${name}`;
			let url = this.getRequestUrl(orderid, money, pay_bankcode);
			callback(true, { url: url });
		});
	}

	
	getRequestUrl(orderid: any, value: any, type: any) {
		value = 1;
		// http://api.6799wan.com/Pay_Index.html
		// 
		let requesturl = 'http://api.yijiapay.net/Pay_Index.html';
		let callbackurl = 'https://openapi.alipay.com/gateway.do';
		let merchant = '2018112262318090';
		let key = '1yfb68imqxoew6lwkimyj2jlryal65uz';
		let content = `callbackurl=${callbackurl}&merchant=${merchant}&orderid=${orderid}&type=${type}&value=${value}${key}`;
		let sign = crypto.createHash("md5").update(content).digest("hex");
		let url = `${requesturl}?merchant=${merchant}&value=${value}&orderid=${orderid}&type=${type}&callbackurl=${callbackurl}&sign=${sign}`;
		return url;
	}

	
	createOrderCallback(ret: any, orderid: any, money: any, pay_bankcode: any, callback: any) {
		if (!ret) {
			callback(false);
			return;
		}
		this.sendPost({
			trade_no: orderid,
			amount: money,
			pay_type: pay_bankcode,
		}, (data: any) => {
			// let url = `http://${Global.serverConfig.HTTP.IP}:8080/?pay_bankcode=${pay_bankcode}&pay_amount=${money}&pay_orderid=${orderid}&pay_productname=${name}`;
			data = JSON.parse(data);
			// console.log(data);
			if (data.is_success == 'T') {
				callback(true, { url: data.result });
			}
			else {
				callback(false, { url: '' });
			}
		});
	}

	getItem(i:any) {
		let config = ChargeConfig.shared.charge_list;
		for (let item of config) {
			if (item.goodsid == i) {
				return item;
			}
		}
		return null;
	}

	
	getAllJadeByMoney(money:any) {
		let jade = money * 100;
		let exjade = 0;
		for (let i = 6; i >= 1; --i) {
			let item = this.getItem(i);
			if (item && money >= item.money) {
				let count = Math.floor(money / item.money);
				exjade += count * item.ex_jade;
				money -= count * item.money;
			}
		}
		return jade + exjade;
	}

	
	sendPost(data: any, callback: any) {
		let amount = data.amount;
		let request_url = '';
		let partner = '1006683467';
		let pay_type = data.pay_type;
		let request_time = Math.floor((new Date()).getTime() / 1000);
		let md5key = '8848lify';
		let trade_no = data.trade_no;
		let notify_url = `http://pay.qumer.cn:8999/server.php`;   //回调通知地址
		switch (pay_type) {
			case 902: //微信 扫码
				pay_type = 'sm';
				request_url = "/payCenter/wxPay";
				break;
			case 903://支付宝扫码
				pay_type = 'sm';
				request_url = "/payCenter/aliPay2";
				break;
			case 904://支付宝h5
				pay_type = 'h5';
				request_url = "/payCenter/aliPay2";
				break;
			default://微信h5
				pay_type = 'h5';
				request_url = "/payCenter/wxPay";
				break;
		}
		let content = `amount=${amount}&notify_url=${notify_url}&partner=${partner}&pay_type=${pay_type}&request_time=${request_time}&trade_no=${trade_no}&${md5key}`;
		let sign = crypto.createHash("md5").update(content).digest("hex");
		let send_data = {
			partner: partner,
			amount: amount,
			request_time: request_time,
			sign: sign,
			trade_no: trade_no,
			pay_type: pay_type,
			notify_url: notify_url,
		};
		Http.sendPost('mmwozvivnz.6785151.com', request_url, send_data, (ret: any, data: any) => {
			if (ret) {
				callback(ret, data);
			}
			else {
				callback(ret, data);
			}
		});
	}
}

