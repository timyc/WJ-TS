import qs from "qs";
import https from "https";
import http from "http";

export default class Http{
	static sendpost(host:any, port:any, path:any, data:any, callback:any){
		if (host == null) {
			console.log('[HTTP] ERROR: host is null');
			return;
		}
		var content = qs.stringify(data);
		var options = {
			hostname: host,
			port: port,
			path: path + '?' + content,
			method: 'GET'
		};
	
		var req = http.request(options, function (res) {
			console.log('STATUS: ' + res.statusCode);
			console.log('HEADERS: ' + JSON.stringify(res.headers));
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				//console.log('BODY: ' + chunk);
				callback(chunk);
			});
		});
		req.setTimeout(5000);
		req.on('error', function (e) {
			console.log('problem with request: ' + e.message);
		});
		req.end();
	};
	
	static sendgeturl = function (url:any, data:any, callback:any, safe:any) {
		let content = qs.stringify(data);
		url = url + '?' + content;
		let proto:any = http;
		if (safe) {
			proto = https;
		}
		let req = proto.get(url, function (res:any) {
			//console.log('STATUS: ' + res.statusCode);  
			//console.log('HEADERS: ' + JSON.stringify(res.headers));  
			var str = "";
			res.setEncoding('utf8');
			res.on('data', function (chunk:any) {
				//console.log('BODY: ' + chunk);
				// var json = JSON.parse(chunk);
				// callback(true, json);
				str += chunk;
			});
			res.on("end", function () {
				console.log(str.toString());
			});
		});
	
		req.on('error', function (e:any) {
			console.log('problem with request: ' + e.message);
			callback(false, e);
		});
		req.setTimeout(5000);
	
		req.end();
	};
	
	static isJSON(str:any) {
		if (typeof str == 'string') {
			try {
				var obj = JSON.parse(str);
				if (typeof obj == 'object' && obj) {
					return true;
				} else {
					return false;
				}
	
			} catch (e) {
				console.log('error：' + str + '!!!' + e);
				return false;
			}
		}
		return false;
	}
	
	static sendget(host:any, port:any, path:any, data:any, callback:any, safe?:any){
		if (host == null){
			console.log('[HTTP] ERROR: host is null');
			return;
		}
		var content = qs.stringify(data);
		var options:any = {
			hostname: host,
			path: path + '?' + content,
			method: 'GET'
		};
		if (port) {
			options.port = port;
		}
		let proto:any = http;
		if (safe) {
			proto = https;
		}
		let req = proto.request(options, function (res:any) {
			res.setEncoding('utf8');
			res.on('data', function (chunk:any) {
				try {
					let json = JSON.parse(chunk);
					callback(true, json);
				} catch (error) {
					callback(false, chunk);
				}
			});
		});
		req.setTimeout(5000);
		req.on('error', function (e:any) {
			console.log('problem with request: ' + e.message);
			callback(false, e);
		});
		req.end();
	};
	
	static sendPost = function (host:any, path:any, data:any, callback:any) {
		let contents = qs.stringify(data);
		let options:any = {
			host: host,
			// port: 8081,
			path: path,
			method:'POST',
			headers:{
				'Content-Type':'application/x-www-form-urlencoded',
				'Content-Length':contents.length
			}
		};
	
		let req = https.request(options, function(res:any){
			// console.log('STATUS:'+res.statusCode);
			// console.log('HEADERS:'+JSON.stringify(res.headers));
			res.setEncoding('utf8');
			res.on('data',function(data:any){
				// console.log("data:",data);   //一段html代码
				callback(data);
			});
		});
		req.write(contents);
		req.end();
	};
	static reply = function (res:any, data:any) {
		if (data == null) {
			data = {};
		}
		var jsonstr = JSON.stringify(data);
		res.send(jsonstr);
	};
}

