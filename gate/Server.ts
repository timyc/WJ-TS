

import Global from "../game/core/Global";
import Http from "../utils/Http";

export default class Server {
    sid:number;
    net_ip:number;
    fake_ip:number;
    net_port:number;
    http_port:number;
    name:string;
    player_num:number;
    is_reg:boolean;
    state:number;
    last_ping:number;

    constructor(){
        this.sid = 0;
        this.net_ip = 0;
        this.fake_ip = 0;
        this.net_port = 0;
        this.http_port = 0;
        this.name = '未知服务器';
        this.player_num = 0;
        this.is_reg = false;
        this.state = Global.serverState.lower;
        this.last_ping = 0;
    }

    setServerInfo(server_info:any) {
        server_info.id && (this.sid = server_info.id);
        server_info.name && (this.name = server_info.name);
        server_info.ip && (this.net_ip = server_info.ip);
        server_info.port && (this.net_port = server_info.port);
        server_info.http_port && (this.http_port = server_info.http_port);
        server_info.num && (this.player_num = server_info.num);
        server_info.fake && (this.fake_ip = server_info.fake);
    }

    registered(pingtime:any){
        this.last_ping = pingtime;
        this.is_reg = true;
        this.UpdateState();
    }

    changePlayerNum(playernum:any){
        this.player_num = playernum;
        if (this.state != 0){
            if (this.player_num >= 300) {
                this.state = Global.serverState.high;
            } else {
                this.state = Global.serverState.lower;
            }
        }
    }

    UpdateState(){
        if (this.is_reg == false){
            return this.state;
        }
        if (this.player_num >= 300) {
            this.state = Global.serverState.high;
        } else {
            this.state = Global.serverState.lower;
        }
        return this.state;
    }

    getPlayerNum(){
        return this.player_num;
    }

    send(event:any, data:any, callback:any){
        Http.sendget(this.net_ip, this.http_port, event, data, callback);
    }
}