import Global from "../core/Global";
import GTimer from "../../common/GTimer";
import PlayerMgr from "../object/PlayerMgr";
import DB from "../../utils/DB";
import ActivityBase from "./ActivityBase";
import ActivityDefine from "./ActivityDefine";
import TeamMgr from "../core/TeamMgr";
import PaiHangMgr from "../core/PaiHangMgr";

export default class ShuiLuDaHui extends ActivityBase {

    SLDHState: any = {
        Sign: 1,
        CalTeam: 2,
        Match: 3,
        Result: 4,
        Close: 5,
    }

    FightState: any = {
        Wait: 1,
        FightEnd: 2,
        Fighting: 3,
    }

    defaultOpenTime = [2000, 2100];
    season: number;
    lunci: number;
    match_team: any[];
    sldh_state: any;
    constructor() {
        super();
        this.name = '水陆大会';
        this.open_notice = `${this.name}开启，前往金銮殿魏征处报名！`;
        this.season = 1;
        this.lunci = 1;
        this.activity_id = ActivityDefine.activityKindID.ShuiLuDaHui;
        this.open_type = ActivityDefine.openType.EveryDay;
        this.is_ready_notice = true;
        this.open_type_list = this.defaultOpenTime;

        this.player_list = {};
        this.match_team = [];

        this.sldh_state = this.SLDHState.Close;

        this.init();
    }

    init() {
        super.init();
        DB.getConfigInfo((rows: any) => {
            if (rows == null || Array.isArray(rows) == false || rows.length == 0) {
                return;
            }
            let info = rows[0];
            let sid = parseInt(info.shuilusid);
            if (!isNaN(sid)) {
                this.season = sid;
            }
            let lid = parseInt(info.shuilulid);
            if (!isNaN(lid)) {
                this.lunci = lid;
            }
        })
    }

    update(dt:number) {
        super.update(dt);
        if (this.sldh_state == this.SLDHState.Sign) {
            this.checkSignTeam();

            let st = this.getActTime();
            if (st >= this.open_type_list[0] + 20) {
                this.allotFigthTeam();
            }
        }

        if (this.sldh_state == this.SLDHState.Match) {
            this.checkFightTime();
            this.checkMatch();
        }
    }

    playerSign(player: any) {
        if (this.activity_state != ActivityDefine.activityState.Opening) {
            return Global.msgCode.SLDH_NOT_OPEN;
        }
        if (this.sldh_state > this.SLDHState.Sign) {
            return Global.msgCode.SLDH_NOT_SIGN_TIME;
        }

        let team = TeamMgr.shared.getTeamInfo(player.teamid);
        if (team == null || team.playerlist.length < 3) {
            return Global.msgCode.SLDH_SIGN_TEAM;
        }
        for (let i = 0; i < team.playerlist.length; i++) {
            const mem = team.playerlist[i];
            if (mem.level < 80) {
                return Global.msgCode.SLDH_SIGN_LEVEL_80;
            }
        }
        if (team.leader.roleid != player.roleid) {
            return Global.msgCode.SLDH_SIGN_TEAM_LEADER;
        }

        if (this.player_list[player.teamid] != null) {
            return Global.msgCode.SLDH_SIGN_ALREADY;
        }

        let allscore = 0;
        for (const teammember of team.playerlist) {
            let tshuilu = teammember.shuilu;
            allscore += tshuilu.score ? tshuilu.score : 0;
        }

        this.player_list[player.teamid] = {
            name: player.name + '的队伍',
            pid: player.roleid,
            teamid: player.teamid,
            score_count: allscore,
            num: team.playerlist.length,
        }
        return Global.msgCode.SUCCESS;
    }

    playerUnsign(player: any) {
        let team = this.player_list[player.teamid];
        if (team == null) {
            return Global.msgCode.SLDH_NOT_SIGN;
        }
        this.player_list[player.teamid] = null;
        return Global.msgCode.SUCCESS;
    }

    checkSignTeam() {
        for (const teamid in this.player_list) {
            if (this.player_list.hasOwnProperty(teamid)) {
                const teaminfo = this.player_list[teamid];
                let team = TeamMgr.shared.getTeamInfo(teamid);
                if (team && teaminfo) {
                    let allscore = 0;
                    for (const teammember of team.playerlist) {
                        let tshuilu = teammember.shuilu;
                        allscore += tshuilu.score ? tshuilu.score : 0;
                    }
                    teaminfo.score = allscore;
                    teaminfo.num = team.playerlist.length;
                } else {
                    delete this.player_list[teamid];
                }
            }
        }
    }

    
    open() {
        if (this.activity_state == ActivityDefine.activityState.Opening) {
            return;
        }
        super.open();
        this.player_list = {};
        this.match_team = [];
        this.sldh_state = this.SLDHState.Sign;
        console.log(`水陆大会状态改变 当前状态：开始报名`);
    }

    gmState(state: any) {
        if (state == 1) {
            super.open();
            this.is_gm_open = true;
            this.activity_state = ActivityDefine.activityState.Opening;
            this.sldh_state = this.SLDHState.Sign;
            this.player_list = {};
            this.match_team = [];
            let t1 = this.getActTime();
            let t2 = this.getActTime(40 * 60 * 1000);

            this.open_type_list = [t1, t2];
            this.init()
        } else if (state == 2) {
            this.allotFigthTeam();
        } else if (state == 3) {
            this.matching();
            this.checkMatch();
        } else if (state == 4) {
            this.close();
        }
    }

    close() {
        if (this.activity_state == ActivityDefine.activityState.Close) {
            return;
        }
        super.close();
        this.activity_state = ActivityDefine.activityState.Close;

        this.open_type_list = this.defaultOpenTime;
        this.sldh_state = this.SLDHState.Close;
        this.sendShuiLuState();

        if (GTimer.getWeekDay() == 7) {
            this.seasonEnd();
        }
    }

    // 重新计算队伍分数
    reCalTeam() {
        this.match_team = [];
        for (const teamid in this.player_list) {
            if (this.player_list.hasOwnProperty(teamid)) {
                let team = TeamMgr.shared.getTeamInfo(teamid);
                if (team) {
                    let teamdata: any = {};
                    teamdata.teamid = team.teamid;
                    let scorecount = 0;
                    for (const member of team.playerlist) {
                        let score = member.shuilu.score ? member.shuilu.score : 0;
                        scorecount += score;
                    }
                    teamdata.fight_list = [
                        { teamid: 0, iswin: 2 },
                        { teamid: 0, iswin: 2 },
                        { teamid: 0, iswin: 2 },
                        { teamid: 0, iswin: 2 },
                        { teamid: 0, iswin: 2 }
                    ];
                    teamdata.score_count = scorecount;
                    teamdata.wtime = 0;
                    teamdata.ltime = 0;
                    teamdata.fight_state = this.FightState.Wait;
                    teamdata.fight_end_time = 0;
                    teamdata.battle_index = 0;

                    this.match_team.push(teamdata);
                }
            }
        }

        this.match_team.sort((a: any, b: any) => {
            return b.score_count - a.score_count;
        });
    }

    calFightPlayer() {
        // if (this.match_team.length <= 6) {
        //     return false;
        // }

        for (let i = 0; i < this.match_team.length; i++) {
            const teaminfo = this.match_team[i];
            for (let changci = 0; changci < 5; changci++) {
                let fighter = teaminfo.fight_list[changci];
                if (fighter.teamid == 0) {
                    let next = 0;
                    while (next < this.match_team.length) {
                        if (next == i) {
                            next++;
                            continue;
                        }
                        let nt = this.match_team[next];

                        let find = false;
                        for (const fteam of teaminfo.fight_list) {
                            if (fteam.teamid == nt.teamid) {
                                find = true;
                                break;
                            }
                        }
                        if (find) {
                            next++;
                            continue;
                        }

                        if (nt.fight_list[changci].teamid == 0) {
                            nt.fight_list[changci] = { teamid: teaminfo.teamid, iswin: 2 };
                            teaminfo.fight_list[changci] = { teamid: nt.teamid, iswin: 2 };
                            break;
                        }
                        next++;
                    }
                }
            }
        }
    }

    // 分配不同的队伍
    allotFigthTeam() {
        this.reCalTeam();
        this.calFightPlayer();
        this.sldh_state = this.SLDHState.CalTeam;
        console.log(`水陆大会状态改变 当前状态：计算对阵队伍`);
        this.sendShuiLuState();
        // this.sendShuiLuInfo();

        setTimeout(() => {
            this.matching();
        }, 60 * 1000);
    }

    // 开始比赛
    matching() {
        this.sldh_state = this.SLDHState.Match;
        console.log(`水陆大会状态改变 当前状态：开始比赛`);
        this.sendShuiLuState();
    }

    // 战斗开始之前的 10秒
    beforeFight(t1: any, t2: any) {
        let team = TeamMgr.shared.getTeamInfo(t1.teamid);
        let eteam = TeamMgr.shared.getTeamInfo(t2.teamid);
        // TODO 还没有考虑 轮空 回头写在else 里面
        if (team && eteam) {
            let selfteam = [];
            for (let index = 0; index < team.playerlist.length; index++) {
                let member = team.playerlist[index];
                let ShuiluRole: any = {};
                ShuiluRole.onlyid = member.onlyid;
                ShuiluRole.roleid = member.roleid;
                ShuiluRole.resid = member.resid;
                ShuiluRole.level = member.level;
                ShuiluRole.name = member.name;
                selfteam.push(ShuiluRole);
            }
            let enemyteam = [];
            for (let index = 0; index < eteam.playerlist.length; index++) {
                let member = eteam.playerlist[index];
                let ShuiluRole: any = {};
                ShuiluRole.onlyid = member.onlyid;
                ShuiluRole.roleid = member.roleid;
                ShuiluRole.resid = member.resid;
                ShuiluRole.level = member.level;
                ShuiluRole.name = member.name;
                enemyteam.push(ShuiluRole);
            }

            TeamMgr.shared.broadcast(t1.teamid, 's2c_shuilu_match', {
                teamS: selfteam,
                teamE: enemyteam,
            });
            TeamMgr.shared.broadcast(t2.teamid, 's2c_shuilu_match', {
                teamS: enemyteam,
                teamE: selfteam,
            });

            t1.fight_state = this.FightState.Fighting;
            t2.fight_state = this.FightState.Fighting;

            setTimeout(() => {
                this.startFight(t1, t2);
            }, 11 * 1000);
        }
    }

    // 进入战斗
    startFight(t1: any, t2: any) {
        let team = TeamMgr.shared.getTeamInfo(t1.teamid);
        let eteam = TeamMgr.shared.getTeamInfo(t2.teamid);
        if (team && eteam) {
            let eonlyid = eteam.leader.onlyid;
            team.leader.playerBattle(eonlyid, Global.battleType.ShuiLu);
        }
    }

    checkSign(teamid: any): boolean {
        for (const teaminfo of this.match_team) {
            if (teaminfo.teamid == teamid) {
                return true;
            }
        }
        return false;
    }

    checkFinish(teamid: any): boolean {
        for (const teaminfo of this.match_team) {
            if (teaminfo.teamid == teamid) {
                for (const fighter of teaminfo.fight_list) {
                    if (fighter.iswin == 2) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }

    // 战斗休息1分钟，1分钟后 继续匹配战斗
    checkFightTime() {
        let nowtime = Date.now();
        for (const teaminfo of this.match_team) {
            if (teaminfo.fight_state == this.FightState.FightEnd) {
                if (nowtime - teaminfo.fight_end_time > 1 * 60 * 1000) {
                    teaminfo.fight_end_time = 0;
                    teaminfo.fight_state = this.FightState.Wait;
                }
            }
        }
    }

    getMatchTeamInfo(teamid: any): any {
        for (const teaminfo of this.match_team) {
            if (teaminfo.teamid == teamid) {
                return teaminfo;
            }
        }
        return null;
    }

    // 检查战斗队伍是否都进入了战斗
    checkMatch() {
        for (const teaminfo of this.match_team) {
            if (teaminfo.fight_state == this.FightState.Fighting) {
                continue;
            }

            let team = TeamMgr.shared.getTeamInfo(teaminfo.teamid);
            if (team == null) {
                continue;
            }
            if (teaminfo.battle_index >= 5) {
                continue;
            }

            if (teaminfo.fight_state == this.FightState.Fighting || teaminfo.fight_state == this.FightState.FightEnd) {
                continue;
            }

            let eteaminfo_s = teaminfo.fight_list[teaminfo.battle_index];
            if (eteaminfo_s == null || eteaminfo_s.teamid == 0) {
                // team 轮空，直接获得积分
                this.lunkong(teaminfo.teamid, 1, true);
                continue;
            }

            let eteaminfo = this.getMatchTeamInfo(eteaminfo_s.teamid);
            if (eteaminfo == null) {
                // team 轮空，直接获得积分
                this.lunkong(teaminfo.teamid, 1, true);
                continue;
            }

            let eteam = TeamMgr.shared.getTeamInfo(eteaminfo_s.teamid);
            if (eteam == null) {
                // team 轮空，直接获得积分
                this.lunkong(teaminfo.teamid, 1, true);
                this.lunkong(eteaminfo_s.teamid, 0, false);
            } else {
                // 检查 敌队 在皇宫 或 金銮殿
                let smapid = eteam.mapid;
                if (smapid != 1206 && smapid != 1000) {
                    // team 轮空，直接获得积分
                    this.lunkong(teaminfo.teamid, 1, true);
                    this.lunkong(eteaminfo_s.teamid, 0, false);
                    continue;
                }
                // 如果队伍不在战斗等待状态
                if (eteaminfo.fight_state == this.FightState.Fighting) {
                    // 通知 team 等待其他队伍战斗完毕
                    // TODO
                    continue;
                } else if (eteaminfo.fight_state == this.FightState.FightEnd) {
                    // 通知 team 等待其他队伍战斗准备开始
                    // TODO
                    continue;
                } else {
                    // 判断是否 是相同战斗场次
                    if (eteaminfo.battle_index == teaminfo.battle_index) {
                        // 两队开战
                        this.beforeFight(teaminfo, eteaminfo);
                    } else {
                        // 通知 team 等待其他队伍战斗完毕
                        // TODO
                    }
                }
            }
        }
    }

    getSignList(teamid: any) {
        let teaminfo = this.player_list[teamid];
        if (teaminfo == null) {
            return null;
        }

        let signlist = [];
        for (const teamid in this.player_list) {
            if (this.player_list.hasOwnProperty(teamid)) {
                const teaminfo = this.player_list[teamid];
                if (teaminfo) {
                    signlist.push({
                        teamid: teaminfo.teamid,
                        name: teaminfo.name,
                        rolenum: teaminfo.num,
                        score: teaminfo.score_count,
                    });

                }
            }
        }
        return signlist;
    }

    getFightList(teamid: any): any {
        let teaminfo = null;
        for (const team of this.match_team) {
            if (team.teamid == teamid) {
                teaminfo = team;
                break;
            }
        }
        if (teaminfo == null) {
            return null;
        }

        let temp: any[] = [null, null, null, null, null];
        for (let k = 0; k < 5; k++) {
            let fteam = teaminfo.fight_list[k];
            temp[k] = { iswin: fteam.iswin, elist: [], };
            if (fteam && fteam.teamid != 0) {
                temp[k].iswin = fteam.iswin;
                let pteam = TeamMgr.shared.getTeamInfo(fteam.teamid);
                if (pteam) {
                    for (let t = 0; t < pteam.playerlist.length; t++) {
                        const ep = pteam.playerlist[t];
                        temp[k].elist.push({
                            onlyid: ep.onlyid,
                            roleid: ep.roleid,
                            resid: ep.resid,
                            level: ep.level,
                            name: ep.name,
                        });
                    }
                }
            }
        }
        return temp;
    }

    getShuiLuInfo(player: any): any {
        let team = TeamMgr.shared.getTeamInfo(player.teamid);
        if (team) {
            let teamlist = [];
            for (let index = 0; index < team.playerlist.length; index++) {
                const p = team.playerlist[index];
                teamlist.push({
                    onlyid: p.onlyid,
                    roleid: p.roleid,
                    resid: p.resid,
                    level: p.level,
                    name: p.name,
                });
            }
            let pshuilu = player.shuilu;
            return {
                gamestate: this.sldh_state,
                lunci: this.lunci,
                issign: true,
                score: pshuilu.score ? pshuilu.score : 0,
                gongji: pshuilu.gongji ? pshuilu.gongji : 0,
                wtime: pshuilu.wtime ? pshuilu.wtime : 0,
                ltime: pshuilu.ltime ? pshuilu.ltime : 0,
                selfteam: teamlist,
                sign: this.sldh_state == this.SLDHState.Sign ? this.getSignList(player.teamid) : null,
                fight: this.sldh_state >= this.SLDHState.CalTeam ? this.getFightList(player.teamid) : null,
            }
        }
        return null;
    }

    sendTeamReward(teamid: any, iswin: any) {
        let team = TeamMgr.shared.getTeamInfo(teamid);
        if (team) {
            for (const member of team.playerlist) {
                let exp = member.level * 100000;
                let pexp = Math.floor(exp * 1.5);
                let jifen = iswin == 1 ? 100 : 50;
                let gongji = iswin == 1 ? 10 : 5;

                member.addShuiluScore(jifen, gongji, iswin);
                member.addExp(exp);
                member.curPet && (member.curPet.addExp(pexp));

                PaiHangMgr.shared.ShuiLuRankUpdate(member.roleid, member.name, member.shuilu.wtime, member.shuilu.score);
                member.send('s2c_shuilu_battleres', {
                    iswin: iswin, // 1 胜利 0 失败
                    exp: exp,
                    petexp: pexp,
                    score: jifen,
                    gongji: gongji,
                });
            }
        }
    }

    lunkong(teamid: any, iswin: any, gotreward = true) {
        let teaminfo = this.getMatchTeamInfo(teamid);
        teaminfo.fight_state = this.FightState.Wait;
        let target = teaminfo.fight_list[teaminfo.battle_index];
        target.iswin = true;
        if (gotreward) {
            this.sendTeamReward(teamid, true);
        }
        teaminfo.battle_index++;
    }

    battleEnd(teamid: any, iswin: any, gotreward = true) {
        let teaminfo = this.getMatchTeamInfo(teamid);
        if (teaminfo.fight_state == this.FightState.Fighting) {
            teaminfo.fight_state = this.FightState.FightEnd;
            teaminfo.fight_end_time = Date.now();
            let target = teaminfo.fight_list[teaminfo.battle_index];
            target.iswin = iswin ? 1 : 0;
            if (gotreward) {
                this.sendTeamReward(teamid, iswin);
            }
            teaminfo.battle_index++;
        }
    }

    sendShuiLuState() {
        this.broadcast('s2c_shuilu_state', {
            slstate: this.sldh_state,
        })
    }

    broadcast(event: any, data: any) {
        for (const teaminfo of this.match_team) {
            TeamMgr.shared.broadcast(teaminfo.teamid, event, data);
        }
    }

    seasonEnd() {
        let playerMgr = require('../object/player_mgr');
        let list = PlayerMgr.shared.player_list;
        for (const account in list) {
            const player = list[account];
            player.shuilu.score = 0;
            player.shuilu.wtime = 0;
            player.shuilu.ltime = 0;
        }
        let db = require('../../utils/db');
        this.season++;
        this.lunci = 1;
        db.setShuilu(this.season, this.lunci);
    }
}