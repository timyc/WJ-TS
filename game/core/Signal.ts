import Global from "../../game/core/Global";
import PlayerMgr from "../object/PlayerMgr";
import Http from "../../utils/Http";

export default class Signal {
    static shared=new Signal();
    registed:boolean;
    token_list:any;
    constructor() {
        this.registed = false;
        this.token_list = {};
    }

    sendToGate(event:any, data:any, callback:any) {
        if(!callback){
            callback = ()=>{}
        }
        console.log("向网关服务器发起HTTP请求:",event,data,callback);
        Http.sendget(Global.serverConfig.GAME.GATE_IP, Global.serverConfig.GAME.GATE_PORT, event, data, callback);
    }
    // 向网关注册游戏服务器
    ServerRegister(){
        let params:any={
            id: Global.serverID,
            name: Global.serverName,
            ip: Global.serverConfig.GAME.IP,
            fake: Global.serverConfig.GAME.FAKE,
            port: Global.serverConfig.GAME.PORT,
            http_port: Global.serverConfig.HTTP.PORT,
        };
        this.sendToGate("/S_Register",params,(isconnect:any, data:any) => {
            if (isconnect) {
                if (data.result == Global.msgCode.SUCCESS) {
                    this.registed = true;
                    console.log(`游戏服[${Global.serverName}(${Global.serverID})], 已经连接`);
                    for (const accountid in data.tokens) {
                        if (data.tokens.hasOwnProperty(accountid)) {
                            const token = data.tokens[accountid];
                            this.addLoginToken(accountid, token);
                        }
                    }
                }
            }
        });
    }

    update(dt:number) {
        if (dt % (1000 * 15) == 0) {
            if (this.registed == false) {
                this.ServerRegister();
                return;
            }

            this.checkToken();

            this.sendToGate('/S_Ping', {
                id: Global.serverID,
                num: PlayerMgr.shared.getPlayerNum(),
            }, (isconnect:any, data:any) => {
                if (!isconnect) {
                    this.registed = false;
                }
                if (data.result != Global.msgCode.SUCCESS){
                    this.registed = false;
                }
            });
        }
    }

    addLoginToken(accountid:any, token:any){
        let time = new Date();
        let pToken = {
            accountid: accountid,
            token: token,
            islogin: false,
            time: time.getTime(),
        };
        this.token_list[accountid] = pToken;
    }

    checkToken(){
        let time = new Date();
        for (const accountid in this.token_list) {
            if (this.token_list.hasOwnProperty(accountid)) {
                const tokeninfo = this.token_list[accountid];
                if (tokeninfo.islogin == false && time.getTime() - tokeninfo.time > 5 * 60 * 1000){
                    delete this.token_list[accountid];
                }
            }
        }
    }

    DeleteTocken(nAccountID:any)
    {
        if (this.token_list.hasOwnProperty(nAccountID) == false)
            return;

        delete this.token_list[nAccountID];
    }

    getLoginToken(accountid:any){
        if (this.token_list[accountid]){
            return this.token_list[accountid].token
        }
        return 'notoken';
    }
}