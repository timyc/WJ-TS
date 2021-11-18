import DB from "../utils/DB";

class GateAgent{

    nID:any;
    nAccount:any;
    strPwd:any;
    strName:any;
    nAddTime:any;
    strInviteCode:any;
    nState:any;

    constructor(nID:any, nAccount:any, strPwd:any, strName:any, nAddTime:any, strInviteCode:any, nState:any) {
        this.nID = nID;
        this.nAccount = nAccount;
        this.strPwd = strPwd;
        this.strName = strName;
        this.nAddTime = nAddTime;
        this.strInviteCode = strInviteCode;
        this.nState = nState;
    }
}

export default class GateAgentMgr{
    static shared=new GateAgentMgr();
    mapAgent:any;

    constructor() {
        this.mapAgent = {};
        this.Init();
    }

    Init() {
        this.ReadItemFromDB();
    }

    ReadItemFromDB() {
        let strSql = `select * from qy_agent`;
        DB.query(strSql, (err:any, rows:any) => {
            if (err != null)
                return;

            for (let i = 0; i < rows.length; i++) {
                let stAgent = new GateAgent(rows[i].id, rows[i].account, rows[i].password, rows[i].name, rows[i].addtime, rows[i].invitecode, rows[i].state);
                this.mapAgent[stAgent.nID] = stAgent;
            }
        });
    }


    IsCodeEnable(strInviteCode:any):boolean{
        for (var it in this.mapAgent) {
            if (this.mapAgent[it].strInviteCode == strInviteCode)
                return true;
        }
        return false;
    }
}