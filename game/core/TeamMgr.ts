import ActivityMgr from "../../game/activity/ActivityMgr";
import ActivityDefine from "../../game/activity/ActivityDefine";
import PlayerMgr from "../object/PlayerMgr";
import NpcMgr from "./NpcMgr";

export default class TeamMgr {
    static shared=new TeamMgr();
    teamList:any;
    team_id:number;
    constructor() {
        this.teamList = {};
        this.team_id = 100000;
    }

    init() {

    }

    creatTeam(p:any, info:any) {
        let team:any = {};
        team.teamid = ++this.team_id;
        team.relive = 0;
        team.level = 0;
        team.type = '';
        team.mapid = p.mapid;
        team.leader = p;
        team.playerlist = [];
        (info.relive) && (team.relive = info.relive);
        (info.level) && (team.level = info.level);
        (info.type) && (team.type = info.type);
        team.playerlist.push(p);
        team.partnerlist = p.getPartnerOnBattle();
        team.poslist = [];
        team.requestlist = [];
        this.teamList[this.team_id] = team;

        p.teamid = this.team_id;
        p.isleader = true;

        p.OnEnterTeam();

        this.sendInfoToMember(this.team_id);

        p.synInfoToWatcher();
    }

    requestTeam(p:any, teamid:any){
        if (p) {
            if (p.teamid > 0) {
                p.send('s2c_notice', {
                    strRichText: '您已经加入其它队伍，请刷新'
                });
                return;
            }
            let team = this.teamList[teamid];
            if (team == null) {
                p.send('s2c_notice', {
                    strRichText: '队伍已解散，请选择其他队伍'
                });
                return;
            }
            if (team.requestlist.length > 100) {
                p.send('s2c_notice', {
                    strRichText: '申请名额已满，请选择其他队伍'
                });
                return;
            }
            if (team.requestlist.indexOf(p.roleid) == -1) {
                team.requestlist.push(p.roleid);
                this.getTeamList(p, team.type);
            }
            p.send('s2c_notice', {
                strRichText: '已申请，请等待队长确认'
            });

            team.leader.send('s2c_team_join');
        }
    }

    joinTeam(p:any, teamid:any):boolean{
        if (p.teamid > 0) {
            return false;
        }

        let pTeamInfo = this.teamList[teamid];
        if (pTeamInfo == null || pTeamInfo.playerlist.length >= 5) {
            return false;
        }
        if (p.relive < pTeamInfo.relive || p.level < pTeamInfo.level) {
            return false;
        }
        // 水陆大会期间，不能入队
        let shuiludahui = ActivityMgr.shared.getActivity(ActivityDefine.activityKindID.ShuiLuDaHui);
        if (shuiludahui && shuiludahui.activity_state != ActivityDefine.activityState.Close
            && shuiludahui.checkSign(teamid) && shuiludahui.sldh_state > 1) {
            return false;
        }
        pTeamInfo.playerlist.push(p);
        p.teamid = teamid;
        p.isleader = false;
        this.sendInfoToMember(teamid);
        this.teamMove(pTeamInfo, true);
        // p.synPosToWatcher();
        pTeamInfo.leader.GetTaskMgr().SynchroTaskToTeam();
        return true;
    }

    matchTeam(p:any) {
        for (const key in this.teamList) {
            if (this.teamList.hasOwnProperty(key)) {
                let team = this.teamList[key];
                if (team.playerlist.length < 5 && p.relive >= team.relive && p.level >= team.level) {
                    this.joinTeam(p, team.teamid);
                    return;
                }
            }
        }
    }

    destroyTeam(teamid:any) {
        let team = this.teamList[teamid];
        if (team == null) return;
        for (let index = 0; index < team.playerlist.length; index++) {
            const p = team.playerlist[index];
            p.teamid = 0;
            p.isleader = false;
            p.OnLeaveTeam();

            let teamSend:any = {};
            teamSend.teamid = 0;
            teamSend.leader = 0;
            p.send('s2c_team_info', { info: JSON.stringify(teamSend) });
            p.synInfoToWatcher();
        }
        delete this.teamList[teamid];
        NpcMgr.shared.deleteTeamsNpc(teamid);
    }

    leaveTeam(p:any) {
        let teamid = p.teamid;
        p.teamid = 0;
        p.isleader = false;

        p.OnLeaveTeam();

        let teamSend:any = {};
        teamSend.teamid = 0;
        teamSend.leader = 0;
        p.send('s2c_team_info', { info: JSON.stringify(teamSend) });
        p.synInfoToWatcher();

        if (teamid == 0) return;

        let team = this.teamList[teamid];
        if (team == null) return;
        let pIndex = team.playerlist.indexOf(p);
        if (pIndex > -1) {
            team.playerlist.splice(pIndex, 1);
        }
        if (team.playerlist == 0) {
            delete this.teamList[teamid];
            NpcMgr.shared.deleteTeamsNpc(teamid);
            return;
        }
        if (pIndex == 0) {
            team.playerlist[0].isleader = true;
            team.leader = team.playerlist[0];
            team.partnerlist = team.playerlist[0].getPartnerOnBattle();

            team.leader.synInfoToWatcher();
        }

        this.sendInfoToMember(teamid);
    }

    teamMove(team:any, synpos = false) {
        if (team.mapid == 3002 || team.mapid == 4001) return;
        for (let index = 1; index < team.playerlist.length; index++) {
            let curPos = { x: team.leader.x, y: team.leader.y };
            if (team.poslist.length > index) {
                curPos = team.poslist[index];
            }
            const p = team.playerlist[index];
            if(p.isleader){
                continue;
            }
            if (p.mapid != team.mapid) {
                p.changeMap({ mapid: team.mapid });
                p.send('s2c_change_map', { mapid: team.mapid, pos: JSON.stringify(curPos) });
            }
            p.playerMove(curPos);
            if (synpos) {
                p.synPosToWatcher();
            }
        }
    }

    setTeamPath(teamid:any, path:any) {
        let team = this.teamList[teamid];
        if (team == null) return;
        team.poslist = path;

        this.teamMove(team);
    }

    updateTeamPos(teamid:any, pos:any) {
        let team = this.teamList[teamid];
        if (team == null) return;
        team.poslist.unshift(pos);
        if (team.poslist.length > 5) {
            team.poslist.splice(5, team.poslist.length - 5);
        }
        this.teamMove(team)
    }

    changeTeamMap(teamid:any, mapid:any) {
        let team = this.teamList[teamid];
        if (team == null) return;
        team.mapid = mapid;
        team.poslist = [];
        this.teamMove(team);
    }

    changePartner(teamid:any, p:any) {
        let team = this.teamList[teamid];
        if (team == null) return;
        if (p.teamid != team.teamid || !p.isleader) {
            return;
        }
        team.partnerlist = p.getPartnerOnBattle();
        this.sendInfoToMember(teamid);
    }
//zfy
    changeTeamLeader(p1:any,p2:any,id:any){
        if(p1.teamid != p2.teamid || !p1.isleader){
            return;
        }
        let team = this.teamList[id];
        if(team == null){
            return;
        }
        let index = team.playerlist.indexOf(p2);
        if(index < 0){
            return;
        }
        p1.isleader = false;
        p2.isleader = true;

        team.playerlist[0] = p2;
        team.playerlist[index] = p1;
        
        team.partnerlist = p2.getPartnerOnBattle();
        team.leader = p2;

        this.sendInfoToMember(id);
    }

    dealRequest(p:any, data:any) {
        let team = this.teamList[data.teamid];
        if (team == null) return;
        if (data.operation == 1) {
            if (p.inPrison) {
                team.leader.send('s2c_notice', {
                    strRichText: '此人正在天牢反省，暂时不能入队！'
                });
            }
            else {
                this.joinTeam(p, data.teamid);
            }
        }
        else {
            let pindex = team.requestlist.indexOf(p.roleid);
            if (pindex != -1) {
                team.requestlist.splice(pindex, 1);
            }
        }
    }

    broadcast(teamid:any, event:any, data:any, excludeid:any = 0) {
        let team = this.teamList[teamid];
        if (team == null) return;

        for (let index = 0; index < team.playerlist.length; index++) {
            const p = team.playerlist[index];
            if (p.roleid == excludeid) {
                continue;
            }
            p.send(event, data);
        }
    }

    sendInfoToMember(teamid:any, excludeid:any = 0) {
        let team = this.teamList[teamid];
        if (team == null) return;
        // let list = [];
        // for (let index = 0; index < team.playerlist.length; index++) {
        //     const p = team.playerlist[index];
        //     list.push(p.toObj());
        // }
        let teamSend:any = {};
        teamSend.teamid = team.teamid;
        teamSend.relive = team.relive;
        teamSend.level = team.level;
        teamSend.type = team.type;
        teamSend.mapid = team.mapid;
        teamSend.leader = team.leader.roleid;
        teamSend.teamcnt = team.playerlist.length;

        teamSend.objlist = this.getTeamMember(teamid);
        // for (let index = 0; index < team.playerlist.length; index++) {
        //     const p = team.playerlist[index];
        //     if (p.roleid == excludeid) {
        //         continue;
        //     }
        //     p.send('s2c_team_info', { info: JSON.stringify(teamSend) });
        // }
        this.broadcast(teamid, 's2c_team_info', {
            info: JSON.stringify(teamSend)
        }, excludeid);
    }

    getTeamMember(teamid:any):any{
        let team = this.teamList[teamid];
        if (team == null) return null;
        let objlist = [];//team.playerlist.slice(0);
        for (const player of team.playerlist) {
            objlist.push(player.toObj());
        }

        if (objlist.length < 5) {
            let needPartnerCnt = 5 - objlist.length;
            for (let index = 0; index < needPartnerCnt; index++) {
                if (team.partnerlist.length > index) {
                    objlist.push(team.partnerlist[index].toObj());
                } else {
                    break;
                }
            }
        }
        return objlist;
    }

    getTeamLeaderPartner(teamid:any):any{
        let team = this.teamList[teamid];
        if (team == null) return null;
        let teamPnum = team.playerlist.length;
        let objlist = []; //team.playerlist.slice(0);
        if (teamPnum < 5) {
            let needPartnerCnt = 5 - teamPnum;
            for (let index = 0; index < needPartnerCnt; index++) {
                if (team.partnerlist.length > index) {
                    objlist.push(team.partnerlist[index]);
                } else {
                    break;
                }
            }
        }
        return objlist;
    }

    getTeamPlayer(teamid:number) {
        let team = this.teamList[teamid];
        if (team == null)
            return [];
        return team.playerlist;
    }

    getTeamInfo(teamid:any):any{
        let team = this.teamList[teamid];
        if (team == null) return null;
        return team;
    }

    getTeamList(p:any, type:any) {
        let temlist = [];
        for (const key in this.teamList) {
            if (this.teamList.hasOwnProperty(key)) {
                const team = this.teamList[key];
                if (team.playerlist.length < 5 && team.type == type && team.requestlist.length < 100 && temlist.length < 100) {
                    let info:any = {};
                    info.cnt = team.playerlist.length;
                    info.resid = team.leader.resid;
                    info.relive = team.leader.relive;
                    info.level = team.leader.level;
                    info.name = team.leader.name;
                    info.teamid = team.teamid;
                    info.request = team.requestlist.indexOf(p.roleid) == -1 ? 0 : 1;
                    temlist.push(info);
                }
            }
        }
        p.send('s2c_team_list', { list: JSON.stringify(temlist) });
    }

    getRequestList(p:any, teamid:any) {
        if (p == null) return;
        let team = this.teamList[teamid];
        if (team == null) return;

        let temlist = [];
        for (let index = 0; index < team.requestlist.length; index++) {
            let rp = PlayerMgr.shared.getPlayerByRoleId(team.requestlist[index]);
            if (rp == null || rp.teamid > 0) {
                team.requestlist.splice(index, 1);
                index--;
                continue;
            }
            let info:any = {};
            info.resid = rp.resid;
            info.relive = rp.relive;
            info.level = rp.level;
            info.name = rp.name;
            info.roleid = rp.roleid;
            temlist.push(info);
        }
        p.send('s2c_team_requeslist', { list: temlist });
    }
}