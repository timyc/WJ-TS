import WorldStarMgr from "./WorldStarMgr";
import WorldMonsterMgr from "./WorldMonsterMgr";
import Global from "../../game/core/Global";
import PlayerMgr from "./PlayerMgr";
import BangMgr from "../bang/BangMgr";
import PaiHangMgr from "../core/PaiHangMgr";

export default class World {
    private static _shared:World;
    pStarMgr:WorldStarMgr;
    pWorldMonsterMgr:WorldMonsterMgr;
    nTimeCnt:number;
    logTime:any;
    m_timer:NodeJS.Timeout;

    static get shared():World{
        if(!this._shared){
            this._shared=new World();
        }
        return this._shared;
    }

    constructor() {
        this.pStarMgr = new WorldStarMgr();
        this.pWorldMonsterMgr = new WorldMonsterMgr();
        this.ResetTimer(1000);
        this.nTimeCnt = -1;
        this.logTime = null;
    }

    init() {
        let nCurTime = Global.getTime();
        let nDay = Math.floor(nCurTime / 86400);
        let nHour = Math.floor(nCurTime / 3600);
        this.logTime = {
            nCurDay: nDay,
            nCurHour: nHour,
        }
    }

    OnKillNpc(nAccountID:any, nNpcOnlyID:any) {
        // this.pStarMgr.playerAddStar(nAccountID);
        this.pStarMgr.CheckWorldStarDead(nNpcOnlyID);
        this.pWorldMonsterMgr.CheckWorldMonsterDead(nNpcOnlyID);
    }

    ResetTimer(nValue:any) {
        let pSelf = this;
        clearInterval(this.m_timer);
        this.m_timer = setInterval(function () {
            pSelf.OnTimer();
        }, nValue);
    }

    OnTimer() { //每秒一次
        this.nTimeCnt += 1;
        if (this.nTimeCnt % 60 == 0) {
            this.CheckTimeChange();
        }

        // this.pStarMgr.OnUpdate(this.nTimeCnt);
    }

    CheckTimeChange() {
        let nCurTime = Global.getTime();
        let nDay = Math.floor(nCurTime / 86400);
        let nHour = Math.floor(nCurTime / 3600);

        if (this.logTime.nCurDay != nDay) {
            this.OnNewDay();
            this.logTime.nCurDay = nDay;
        }

        if (this.logTime.nCurHour != nHour) {
            this.OnNewHour();
            this.logTime.nCurHour = nHour;
        }
    }

    OnNewDay() {
        PlayerMgr.shared.OnNewDay();
        PaiHangMgr.shared.onNewDay();
        BangMgr.shared.onNewDay();
    }

    OnNewHour() {
        PlayerMgr.shared.OnNewHour();
    }
}