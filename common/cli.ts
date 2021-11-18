import Global from "../game/core/Global";
import net from "net";
import os from "os";
import PlayerMgr from "../game/object/PlayerMgr";

let curconn:any = null;

function closeFunc(){
	if (Global.serverType == 'game') {
		let lauch = require('../game/launch');
		lauch.close(() => {
			curconn.write('服务器关闭!!!!');
			console.log('服务器关闭!!!!');
			// process.exit(0);
		})
	}
}

function playerNum() {
	if (Global.serverType == 'game') {
		let playerMgr = require('../game/object/player_mgr');
		let n = PlayerMgr.shared.getPlayerNum();
		let m = PlayerMgr.shared.getPlayerNumPeak();
		console.log('服务器当前玩家' + n);
		curconn.write('\r\nonline player num:' + n + '\r\n' + 'player peak num:' + m + '\r\n');
	}
}

function kick(commands:any){
	let userid = commands[1];
	if(userid == null){
		return;
	}
	
	if (Global.serverType == 'game') {
		let playerMgr = require('../game/object/player_mgr');
		let player = PlayerMgr.shared.getPlayerByRoleId(userid);
		if(player){
			player.agent.destroy();
		}
	}
}

function reload(){
	let errorlist = Global.reloadPropData();
	curconn.write('hot update complete !!!!');
	if (errorlist && errorlist.length > 0) {
		for (const filename of errorlist) {
			curconn.write(`file load error, [${filename}]`);
		}
	}
}

function hotfix() {
	let full_path = '../hotfix';
	let old = require.cache[require.resolve(full_path)];
	require.cache[require.resolve(full_path)] = null;

	try {
		require(full_path);
		console.log('hot fix complete !');
		curconn.write(`hot fix complete !\r\n`);
	} catch (error) {
		require.cache[require.resolve(full_path)] = old;
		console.error('hot fix  Error Catch!');
		console.error(error.stack);
	}
}

function memory() {
	let t = process.memoryUsage()
	curconn.write(`\r\n rss: ${t.rss}\r\n heapTotal: ${t.heapTotal}\r\n heapUsed: ${t.heapUsed}\r\n external: ${t.external}\r\n`);
}

let server = net.createServer();
server.on('connection', function (conn) {
	if (curconn != null){
		curconn.destroy();
	}
	curconn = conn;
	let info='\r\n> welcome to \x1b[92m lc console \x1b[39m'
	+ '\r\n> Windows user, please use ctrl + ] and send commond.'
	+'\r\n> please input ur command:'
	conn.write(info);
	conn.on('data', function (data:any) {
		let commandstr = data.toString();
		var type = os.type();
		if(type == 'linux'){
			commandstr = commandstr.replace('\r\n', '');
		}else if (type == 'Windows_NT'){
			if (commandstr.length == 1) {
				conn.write('\r\nWindwos User, please ctrl + ] and send commnad\r\n');
				return;
			}
		} else if (type == 'Darwin'){
			commandstr = commandstr.replace('\r\n', '');
		}
		let commands = commandstr.split(',');
		let command = commands[0];
		if (command == 'close'){
			closeFunc();
		} else if(command == 'num'){
			playerNum()
		} else if (command == 'kick') {
			kick(commands);
		} else if (command == 'reload') {
			reload();
		} else if (command == 'hotfix') {
			hotfix();
		} else if (command == 'mem') {
			memory();
		} else {
			console.log(`invalid command`);
		}
	});
	conn.on('close', function () {
	});
});

exports.start = (port:number, callback:Function) => {
	server.listen(port, function () {
		console.log(`监控系统启动完毕，监听${port}端口`);
		callback();
	});
}