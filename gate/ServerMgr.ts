import Global from "../game/core/Global";
import Server from "./Server";
import Http from "../utils/Http";

// 游戏服务器管理
export default class ServerMgr {
    static shared = new ServerMgr();

    inv_time: number;
    server_list: any;
    guide_server_id: number;

    constructor() {
        this.inv_time = 0;
        this.server_list = {};
        this.guide_server_id = 0;
    }

    init() {
        let gconf = require("../etc/gate_config");
        let server_list = gconf.ServerList;
        for (let index = 0; index < server_list.length; index++) {
            let serverinfo = server_list[index];
            let serv = this.createServer();
            serv.setServerInfo(serverinfo);
            this.addServer(serv);
        }

        this.guide_server_id = gconf.GuideServerId;

        let self = this;
        setInterval(() => {
            self.inv_time++;
            for (const sid in self.server_list) {
                if (self.server_list.hasOwnProperty(sid)) {
                    const server = self.server_list[sid];
                    if (server.is_reg && server.state != Global.serverState.close) {
                        if (self.inv_time > server.last_ping + 6) {
                            server.state = Global.serverState.close;
                            console.log(`网关服：游戏服[${server.name}(${server.sid})], 断开连接！`);
                        } else {
                            server.UpdateState();
                        }
                    }
                }
            }
        }, 5000);
    }

    createServer() {
        let serv = new Server();
        // serv.setServerInfo(server_info);
        return serv;
    }

    serverReg(sid: any, ip: any, fake: any, port: any, http_port: any, name: string = ''): boolean {
        let serverinfo: any = {
            id: sid,
            name: name,
            ip: ip,
            fake: fake,
            port: port,
            http_port: http_port,
        };
        let server = this.getServer(sid);
        if (server == null) {
            server = this.createServer()
        }
        if (server) {
            server.setServerInfo(serverinfo);
            server.registered(this.inv_time);
            this.addServer(server);
            console.log(`游戏服[${server.name}](${server.sid}), 已经注册！`);
            return true;
        }
        return false;
    }

    getServer(sid: any) {
        return this.server_list[sid];
    }

    addServer(server: any) {
        this.server_list[server.sid] = server;
    }

    delServer(server: any) {
        delete this.server_list[server.sid];
    }

    serverClose(sid: any) {

    }

    serverPing(sid: any, num: any) {
        let server = this.getServer(sid);
        if (server) {
            if (server.is_reg == false || server.state == Global.serverState.close) {
                return Global.msgCode.FAILED;
            }
            server.last_ping = this.inv_time;
            server.changePlayerNum(num);
            return Global.msgCode.SUCCESS;
        }
        return Global.msgCode.FAILED;
    }

    getServerList() {
        return this.server_list;
    }

    setGuideServer(sid: any) {
        let server = this.getServer(sid);
        if (server) {
            this.guide_server_id = sid;
        }
    }

    sendAllServer(event: any, data: any) {
        for (const sid in this.server_list) {
            if (this.server_list.hasOwnProperty(sid)) {
                const server = this.server_list[sid];
                Http.sendget(server.net_ip, server.http_port, event, data, (ret: any) => { });
            }
        }
    }
}
