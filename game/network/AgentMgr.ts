import Global from "../core/Global";
import Agent from "./Agent";

let agent_seed_id = 1000;

export default class AgentMgr {
    static shared=new AgentMgr();
    io:any;
    agent_list:any;
    
    constructor(){
        this.io = null;
        this.agent_list = {};
    }

    addAgent(agent:any){
        agent.id = agent_seed_id;
        this.agent_list[agent.id] = agent;
        agent_seed_id++;
    }

    delAgent(agentid:any){
        delete this.agent_list[agentid];
    }

    getAgent(agentid:any){
        return this.agent_list[agentid];;
    }

    update(dt:number){
        for (const agent_id in this.agent_list) {
            if (this.agent_list.hasOwnProperty(agent_id)) {
                let agent = this.agent_list[agent_id];
                agent.update(dt);
            }
        }
    }
    start() {
        let websocket = require('ws').Server;
        console.log("8810",Global.serverConfig.GAME.PORT);
        let wss = new websocket({port: Global.serverConfig.GAME.PORT});
        wss.on('connection', (ws:any) => {
            let agent = new Agent(ws);
            agent.init();
            this.addAgent(agent);
        });

        wss.on('error', (ws:any) => {
            console.log('error');
        });

        this.io = wss;

        // let self = this;
        // this.io.sockets.on('connection', (socket) => {
        //     let agent = new lagent(socket);
        //     agent.init();
        //     self.addAgent(agent);
        // });
        console.log(`网关代理模块启动完毕，正在监听${Global.serverConfig.GAME.HOST}:${Global.serverConfig.GAME.PORT}`);
    }

    close(){
        for (const agentid in this.agent_list) {
            const agent = this.agent_list[agentid];
            agent.justDestroyAgent();
        }
        
        if (this.io){
            this.io.close();
        }
    }

    getAgentByAccountid(accountid:any):any{
        for (const agent_id in this.agent_list) {
            if (this.agent_list.hasOwnProperty(agent_id)) {
                const agent = this.agent_list[agent_id];
                if (agent.accountid == accountid) {
                    return agent;
                }
            }
        }
        return null;
    }
}
