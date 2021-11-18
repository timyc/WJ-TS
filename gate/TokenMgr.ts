import crypto from "crypto";

export default class TokenMgr {
    static shared=new TokenMgr();
    login_token_list:any;
    secret:string;
    constructor(){
        this.login_token_list = {};
        this.secret = 'wodetianna';
    }

    makeSecret(accountid:any){
        let time = new Date();
        let t1 = accountid + '' + time.getTime() + Math.ceil(Math.random() * 999999);
        let t2 = Math.ceil(Math.random() * 999999) + this.secret;
        let a = crypto.createHash("md5").update(t1).digest("hex");
        let b = crypto.createHash("md5").update(t2).digest("hex");
        let ret = a + b.slice(0, 8);
        this.login_token_list[accountid] = ret;
        return ret;
    }

    getSecretByAccountId(accountid:any):any{
        return this.login_token_list[accountid];
    }

    getAllToken():any{
        return this.login_token_list;
    }
}
