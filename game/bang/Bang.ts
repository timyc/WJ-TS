import BangMember from "./BangMember";
import Global from "../../game/core/Global";
import PlayerMgr from "../object/PlayerMgr";
import DB from "../../utils/DB";
import BangMgr from "./BangMgr";

export default class Bang {
    id:number;
    name:string;
    aim:string;
    bidding:number;
    weight:number;
    rolelist:any[];
    masterid:number;
    mastername:string;
    requestlist:any[];
    isinit:boolean;
    constructor() {
        this.id = 0;
        this.name = '';
        this.aim = '';

        this.bidding = 0;
        this.weight = 0;

        this.rolelist = [];
        this.masterid = 0;// roleid
        this.mastername = '';

        this.requestlist = [];
        this.isinit = false;
    }

    toObj() {
        return {
            bangid: this.id,
            name: this.name,
            aim: this.aim,
            rolenum: this.rolelist.length,
            masterid: this.masterid,
            mastername: this.mastername,
            bidding: this.bidding,
            weight: this.weight,
        }
    }

    addMember(meminfo:any){
        let member = new BangMember(meminfo);
        this.rolelist.push(member);
    }

    delMember(roleid:any){
        for (let index = 0; index < this.rolelist.length; index++) {
            const member = this.rolelist[index];
            if(member.roleid == roleid){
                this.rolelist.splice(index, 1);
                break;
            }
        }
    }

    getMemberNum(){
        return this.rolelist.length;
    }

    getBangInfo() {
        let infoObj:any = {};
        infoObj.info = {};
        infoObj.rolelist = [];
        infoObj.info = this.toObj();
        for (const roleinfo of this.rolelist) {
            let p = PlayerMgr.shared.getPlayerByRoleId(roleinfo.roleid);
            infoObj.rolelist.push({
                roleid: roleinfo.roleid,
                name: roleinfo.name,
                resid: roleinfo.resid,
                relive: roleinfo.relive,
                level: roleinfo.level,
                race: roleinfo.race,
                sex: roleinfo.sex,
                online: p == null ? false : true
            });
        }
        return infoObj;
    }

    getBangPost(roleid:any):any{
        let post = Global.bangPost.BangZhong;
        if(roleid == this.masterid){
            post = Global.bangPost.BangZhu;
        }
        return post;
    }

    getBangRequest() {
        let tmplist = [];
        for (let index = 0; index < this.requestlist.length; index++) {
            const info = this.requestlist[index];
            let temp = PlayerMgr.shared.getPlayerByRoleId(info.roleid);
            if (temp == null || temp.bangid > 0) {
                tmplist.push(index);
            }
        }
        for (const index of tmplist) {
            this.requestlist.splice(index, 1);
        }
        return this.requestlist;
    }

    getRequestnum(){
        return this.requestlist.length;
    }

    addRequest(req:any){
        this.requestlist.push({
            roleid: req.roleid,
            name: req.name,
            resid: req.resid,
            relive: req.relive,
            level: req.level,
            race: req.race,
            sex: req.sex,
        });
    }

    operRequest(masterid:any, targetid:any, oper:any){
        if(this.masterid != masterid){
            return ;
        }

        let req = null;
        for (let index = 0; index < this.requestlist.length; index++) {
            const reqinfo = this.requestlist[index];
            if(reqinfo.roleid == targetid){
                req = reqinfo;
                this.requestlist.splice(index, 1);
                break;
            }
        }
        if(req == null){
            return;
        }

        if(oper == 1){
            this.addMember(req);

            let player = PlayerMgr.shared.getPlayerByRoleId(req.roleid);
            if (player) {
                player.bangid = this.id;
                this.sendBangInfo(player);
            }
        }
		let master = PlayerMgr.shared.getPlayerByRoleId(this.masterid);
		if (master) {
			master.send('s2c_getbangrequest', {requestlist: this.getBangRequest()});
			this.sendBangInfo(master);
		}
    }

    
    leave(roleid:any, type:any = 0) {
        let pname = '';
        let player = PlayerMgr.shared.getPlayerByRoleId(roleid);
        if(player){
            if (player.bangid == 0) {
                return true;
            }
            pname = player.name;
            player.bangid = 0;
            player.bangname = '';
            player.bangpost = 0;
            
            player.delTitle(Global.titleType.CommonTitle,Global.titleBangType.BangZhu);
            player.delTitle(Global.titleType.CommonTitle,Global.titleBangType.BangZhong);
        }else{
            DB.updatePlayerBangID(roleid, 0, null);
        }

        let roleindex = -1;
        let list = this.rolelist;
        for (let index = 0; index < list.length; index++) {
            const role = list[index];
            if (role.roleid == roleid) {
                roleindex = index;
                break;
            }
        }
        if (roleindex > -1) {
            this.rolelist.splice(roleindex, 1);
        }

        if(type == 0) {
            console.log(`玩家[${pname}(${roleid})] 离开了帮派[${this.name}(${this.id})]`);
        }else if(type == 1){
            console.log(`玩家[${pname}(${roleid})] 被帮主踢出帮派[${this.name}(${this.id})]`);
        }
        return true;
    }

    checkPlayer(roleid:any){
        for (let index = 0; index < this.rolelist.length; index++) {
            const role = this.rolelist[index];
            if (role.roleid == roleid) {
                return true;
            }
        }
        return false;
    }

    sendBangInfo(player:any){
        player.send('s2c_getbanginfo', this.getBangInfo());
    }

    addBidding(player:any, money:any){
        let strErr = player.CostFee(1, money, '帮派竞价');
        if (strErr != '') {
            player.send('s2c_notice', {
                strRichText: strErr
            });
            return;
        }
        this.bidding += money;
        DB.updateBangBidding(this.id, this.bidding);
        BangMgr.shared.initBidding();
        this.sendBangInfo(player);
    }

    broadcast(event:any, data:any) {
        let roleList = this.rolelist;
        for (const pinfo of roleList) {
            let to = PlayerMgr.shared.getPlayerByRoleId(pinfo.roleid);
            if (to) {
                to.send(event, data);
            }
        }
    }
}
