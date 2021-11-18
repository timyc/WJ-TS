import Global from "../../game/core/Global";
import Bang from "./Bang";
import GTimer from "../../common/GTimer";
import PlayerMgr from "../object/PlayerMgr";
import DB from "../../utils/DB";
import PaiHangMgr from "../core/PaiHangMgr";
import Launch from "../core/launch";

export default class BangMgr {
    static shared=new BangMgr();
    bangList:any;
    createList:any;
    biddingList:any[];
    allbid:number;
    bangMaxId:number;
    loadComplete:any;
    bangDBTimer:any;

    constructor() {
        this.bangList = {};
        this.createList = {};
        this.biddingList = [];
        this.allbid = 0;
        this.bangMaxId = 0;

        this.loadComplete = {
            brole : false,
            maxid : false,
        }
    }

    init() {
        let self = this;
        DB.getBangList((errorcode:any, list:any) => {
            if (errorcode == Global.msgCode.SUCCESS) {
                for (const info of list) {
                    let bang = new Bang();
                    bang.id = info.bangid;
                    bang.name = info.name;
                    bang.masterid = info.masterid;
                    bang.mastername = info.mastername;
                    bang.bidding = info.bidding;

                    this.bangList[info.bangid] = bang;
                }
                if (list.length > 0) {
                    self.checkBangRoles();
                    self.initBidding();
                } else {
                    this.initComplete();
                }
            }
        });

        this.bangDBTimer = setInterval(() => {
			this.getBangIDSeed();
        }, 60 * 1000);
        this.getBangIDSeed();
    }

    getBangIDSeed(){
        DB.getBangMaxId((errorcode:any, bangId:any) => {
            if (errorcode == Global.msgCode.SUCCESS) {
                let tmpid = this.makeBangId();
                let t = bangId - tmpid;
                if(t < 0){
                    //新的一天
                }
                if(t > 0 && t < 1000){
                    // 已经有帮派创建过了
                    let maxbangid = bangId % 1000;
                    tmpid += maxbangid;
                }

                this.bangMaxId = tmpid;
                console.log('帮派id种子为' + this.bangMaxId);
                if(this.bangDBTimer != null){
                    clearInterval(this.bangDBTimer);
                    this.bangDBTimer = null;
                }
                this.complete('maxid');
            }else{
                console.log('帮派最大值获取错误');
            }
        });
    }

    checkBangRoles() {
        DB.getBangRoles((errorcode:any, list:any) => {
            if (errorcode == Global.msgCode.SUCCESS) {
                for (const bid in list) {
                    if (list.hasOwnProperty(bid)) {
                        const memberlist = list[bid];
                        let bang = this.bangList[bid];
                        if (bang) {
                            for (const info of memberlist) {
                                bang.addMember(info)
                            }
                            bang.isinit = true;
                        } else {
                            // console.log(`帮派初始化，帮派缺失 id(${bid})`);
                            continue;
                        }
                    }
                }

                for (const bid in this.bangList) {
                    if (this.bangList.hasOwnProperty(bid)) {
                        const bang = this.bangList[bid];
                        if (bang.isinit == false) {
                            this.delBang(bid);
                            console.log(`帮派人数为0，帮派删除 id(${bid})`);
                        }
                    }
                }

                this.complete('brole');
            }
            list = null;
        });
    }

    complete(key:any){
        this.loadComplete[key] = true;
        if(this.loadComplete.maxid && this.loadComplete.brole){
            this.initComplete()
        }
    }

    onNewDay(){
        this.bangMaxId = this.makeBangId()
    }

    makeBangId(){
        // server id + 年（2019 = 0） + 月 + 日 + 自增数0~999
        let sid = Global.serverID % 1000 + 1;
        let nowdate = GTimer.getCurDate();
        // 1111111111
        // 11 0 05 10 000 
        let year = nowdate.getFullYear() - 2019;
        let month = nowdate.getMonth() + 1;
        let smonth=""+month;
        if(month < 10){
            smonth = '0' + month;
        }
        let day = nowdate.getDate();
        let sday=""+day;
        if(day < 10){
            sday = '0' + day;
        }
        let mbangid = '' + sid + year + smonth + sday + '000';
        let bid = parseInt(mbangid);
        return bid;
    }

    initComplete() {
        console.log('帮派模块加载完毕!');
        PaiHangMgr.shared.initBangRank();
        Launch.shared.complete('bangmgr');
    }

    createBang(player:any, createdata:any) {
        let t = this.bangMaxId % 1000;
        if(t >= 990){
            player.send('s2c_notice', {
                strRichText: '今天无法创建帮派，请明天再次尝试'
            });
            return;
        }

        let cost = 1000;
        if (player.bangid != 0) {
            player.send('s2c_notice', {
                strRichText: '请先退出帮派'
            });
            return;
        }

        let checkname = Global.checkLimitWord(createdata.name);
        if(!checkname){
            player.send('s2c_notice', {
                strRichText: '帮派已经存在，请换个名字'
            });
            return;
        }

        let b = this.getBangByName(createdata.name);
        if (b) {
            player.send('s2c_notice', {
                strRichText: '帮派已经存在，请换个名字'
            });
            return;
        }

        if (this.createList[player.roleid] != null) {
            return;
        }
        this.createList[player.roleid] = 1;

        let strErr = player.CostFee(1, cost, '创建帮派');
        if (strErr != '') {
            player.send('s2c_notice', {
                strRichText: strErr
            });
            return;
        }

        let bang = new Bang();
        bang.name = createdata.name;
        bang.masterid = player.roleid;
        bang.mastername = createdata.mastername;
        bang.rolelist = [];
        this.bangMaxId++;
        bang.id = this.bangMaxId;
        createdata.bangid = bang.id;
        
        this.bangList[bang.id] = bang;
        delete this.createList[player.roleid];

        bang.addMember(player);

        player.bangid = bang.id;
        player.bangname = bang.name;
        player.bangpost = Global.bangPost.BangZhu;

        player.addTitle(Global.titleType.CommonTitle,Global.titleBangType.BangZhu);

        player.GetTaskMgr().CheckAndInceptTask();
        player.GetTaskMgr().UpdateTaskStateToClient();

        this.playerGetBangInfo(player);
        player.save();

        DB.createBang(createdata, (ret:any, bangid:any) => {
            if (ret == Global.msgCode.SUCCESS) {
               console.log('创建帮派成功');
            } else {
                delete this.createList[player.roleid];
                console.log('创建帮派失败');
                
            }
        });
    }

    getBangList() {
        let templist = [];
        let allbid = this.allbid;
        for (let index = 0; index < this.biddingList.length; index++) {
            if (templist.length >= 10) {
                break;
            }

            const info = this.biddingList[index];
            if (index < 3) {
                let bang = this.getBang(info.bangid);
                if (bang) {
                    templist.push(bang.toObj());
                }
            } else {
                let r = Global.random(0, allbid);
                for (let k = index; k < this.biddingList.length; k++) {
                    const t = this.biddingList[k];
                    r -= t.bidding;
                    if (r <= 0) {
                        let bang = this.getBang(t.bangid);
                        templist.push(bang.toObj());
                        allbid -= t.bidding;
                    }
                }
            }
        }
        let keylist = Object.keys(this.bangList);
        for (let i = templist.length; i < 30; i++) {
            let r = Global.random(0, keylist.length - 1);
            let bang = this.bangList[keylist[r]];
            if (bang) {
                templist.push(bang.toObj());
                keylist.splice(r, 1);
            }
        }

        return templist;
    }

    getBang(bangid:any) {
        return this.bangList[bangid];
    }

    getBangByMasterid(masterid:any) {
        for (const key in this.bangList) {
            if (this.bangList.hasOwnProperty(key)) {
                let bang = this.bangList[key];
                if (bang.masterid == masterid) {
                    return bang;
                }
            }
        }
        return null;
    }

    getBangByName(name:any) {
        for (const key in this.bangList) {
            if (this.bangList.hasOwnProperty(key)) {
                let bang = this.bangList[key];
                if (bang.name == name) {
                    return bang;
                }
            }
        }
        return null;
    }

    playerGetBangInfo(player:any) {
        let bang = this.getBang(player.bangid);
        if (bang) {
            player.send('s2c_getbanginfo', bang.getBangInfo());
        } else {
            player.send('s2c_getbanglist', { list: this.getBangList() });
        }
    }

    searchBang(info:any) {
        let templist = [];
        for (const key in this.bangList) {
            if (this.bangList.hasOwnProperty(key)) {
                let bang = this.bangList[key];
                if (bang.name.indexOf(info.data) > -1 || bang.id == info.data) {
                    templist.push(bang.toObj());
                }
            }
        }
        return templist;
    }

    joinBang(roldid:any, bangid:any) {
        let bang = this.getBang(bangid);
        if (bang == null || bang.getMemberNum() >= 300) {
            return false; //帮派不存在或者帮派满员
        }

        let player = PlayerMgr.shared.getPlayerByRoleId(roldid);
        if (player) {
            player.bangid = bangid;
            player.bangname = bang.name;
            player.bangpost = Global.bangPost.BangZhong;
            player.addTitle(Global.titleType.CommonTitle,Global.titleBangType.BangZhong);
            bang.addMember(player);
        }

        return true;
    }

    leaveBang(leaveInfo:any):any{
        let bang = this.getBang(leaveInfo.bangid);
        if (bang == null) {
            return false; //帮派不存在
        }
        return bang.leave(leaveInfo.roleid);
    }

    delBang(bangid:any) {
        let bang = this.getBang(bangid);
        if (bang == null) {
            return; //帮派不存在
        }
        DB.deleteBang(bang.id);
        delete this.bangList[bangid];
        this.initBidding();
    }

    disbandBang(disbandinfo:any) {
        let bang = this.getBang(disbandinfo.bangid);
        if (bang == null) {
            return false; //帮派不存在
        }
        if (disbandinfo.roleid == bang.masterid) {
            let player = PlayerMgr.shared.getPlayerByRoleId(bang.masterid);
            console.log(`玩家[${player.name}(${player.roleid})]解散了帮派[${bang.name}(${bang.id})]`);

            let list = bang.rolelist;
            DB.deleteBang(bang.id);
            delete this.bangList[disbandinfo.bangid];
            for (let index = 0; index < list.length; index++) {
                const role = list[index];
                let player = PlayerMgr.shared.getPlayerByRoleId(role.roleid);
                if (player != null) {
                    player.bangid = 0;
                    player.bangname = '';
                    player.bangpost = 0;
                    player.send('s2c_notice', {
                        strRichText: '帮派已解散，请重新加入其它帮派！'
                    });
                    player.send('s2c_getbanglist', {
                        list: this.getBangList()
                    });
                }
            }
            this.initBidding();
            return true;
        }
        return false;
    }

    exitSave(callback:any) {
        let n = Object.keys(this.bangList).length;
        if (n == 0) {
            callback();
            return;
        }
        for (const key in this.bangList) {
            n--;
            if (this.bangList.hasOwnProperty(key)) {
                let bang = this.bangList[key];
                DB.updateBang({
                    bangid: bang.id,
                    rolenum: bang.rolelist.length
                }, (0 == n) ? callback : () => { });
            }
        }
    }

    requestBang(player:any, bangid:any, requestInfo?:any) {
        let bang = this.getBang(bangid);
        if (bang == null) {
            return false;
        }

        if (bang.getMemberNum() >= 300) {
            player.send('s2c_notice', {
                strRichText: '帮派满员，请选择其他帮派！'
            });
            return false; //帮派不存在或者帮派满员
        }
        if (bang.getRequestnum() >= 100) {
            player.send('s2c_notice', {
                strRichText: '申请人数过多，请选择其他帮派！'
            });
            return false; //申请入帮人数过多
        }
        for (const info of bang.requestlist) {
            if (info.roleid == player.roleid) {
                player.send('s2c_notice', {
                    strRichText: '已经申请过这个帮派，等待帮主确认！'
                });
                return false;
            }
        }

        bang.addRequest(player);

        player.send('s2c_notice', {
            strRichText: '申请成功，等待帮主确认！'
        });

        let master = PlayerMgr.shared.getPlayerByRoleId(bang.masterid);
        if (master) {
            master.send('s2c_join_bang');
        }
        return true;
    }

    initBidding() {
        this.biddingList = [];
        for (const bangid in this.bangList) {
            if (this.bangList.hasOwnProperty(bangid)) {
                const bang = this.bangList[bangid];
                if (bang.bidding > 0) {
                    this.biddingList.push({
                        bangid: bang.id,
                        bidding: bang.bidding,
                    })
                }
            }
        }

        this.biddingList.sort((a, b) => {
            return b.bidding - a.bidding;
        });

        let allbid = 0;
        for (let i = 0; i < this.biddingList.length; i++) {
            const info = this.biddingList[i];
            if (i > 3) {
                allbid += info.bidding;
            }
        }
        for (let i = 0; i < this.biddingList.length; i++) {
            const info = this.biddingList[i];
            let bang = this.getBang(info.bangid);
            if (i < 3) {
                bang.weight = 100;
            } else {
                bang.weight = Math.ceil(bang.bidding / allbid * 100);
            }
        }
        this.allbid = allbid;
    }
}