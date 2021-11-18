export default class AgentData{
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