import Global from "../game/core/Global";

let socketio = require('socket.io-client');
let sql_seed = 0;

export default class DBForm {
	static shared=new DBForm();
	sqlPool:any;
	socket:any;

	constructor() {
		let uri="http://localhost:8807";
		let socket = socketio.connect(uri,{
			reconnect: true
		});
		let self = this;
		socket.on('connect', function () { //绑定连接上服务器之后触发的数据
			self.init();
			self.restart();
		});
		socket.on("disconnection",function(){
			console.log("断开连接");
		})
		this.sqlPool = {};
		this.socket = socket;
	}

	init() {
		let self = this;
		self.socket.emit('reg', {
			name: Global.serverName,
		});
		this.socket.on('sqled', (data:any) => {
			let id = data.id;
			let sqlinfo = self.sqlPool[id];
			if (sqlinfo){
				try {
					if (sqlinfo.func){
						if (data.errorcode == Global.msgCode.SUCCESS) {
							sqlinfo.func(null, data.data);
						} else {
							sqlinfo.func(data.errorcode)
						}
					}
				} catch (error) {
					console.error('DB Error Catch!');
					console.error(sqlinfo.sql);
					console.error(error.stack);
				}
			}
			delete this.sqlPool[id];
		});
	}

	restart(){
		for (const sql_seed_id in this.sqlPool) {
			const sqlinfo = this.sqlPool[sql_seed_id];
			this.socket.emit('sql', {
				id: sql_seed_id,
				sql: sqlinfo.sql,
			});
		}
	}

	checkDate(){
		// let ctime = Date.now();
		// for (const sql in this.dbData) {
		// 	const datainfo = this.dbData[sql];
		// 	if(ctime - datainfo.time > 3 * 60 * 1000){
		// 		delete this.dbData[sql];
		// 	}
		// }
	}

	query(sql:any, callback:any) {
		console.log("SQL:",sql);
		sql_seed++;
		if(sql_seed > 5000){
			sql_seed = 0;
		}

		this.sqlPool[sql_seed] = {
			id: sql_seed,
			sql: sql,
			func: callback,
		}

		let b = this.socket.emit("sql", {
			id: sql_seed,
			sql: sql,
		});
	}
}