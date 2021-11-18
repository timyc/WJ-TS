import Global from "../../game/core/Global";
import NpcConfigMgr from "./NpcConfigMgr";
import Npc from "./Npc";

export default class NpcMgr{
    static shared=new NpcMgr();

    mapNpc:any;

    constructor() {
        this.mapNpc = {};
    }

    InitNpcByMapId(mapid:any, nFuBenID:any) {
        for (let it in NpcConfigMgr.shared.mapConfig) {
            let stData = NpcConfigMgr.shared.mapConfig[it];
            if (stData.auto_create == null)
                continue;

            if (stData.auto_create.map == mapid) {
                this.CreateNpc(it, stData.auto_create.map, stData.auto_create.x, stData.auto_create.y, {
                    nKind: 0,
                    nID: 0
                }, nFuBenID);
            }

        }
    }

    init() {
        for (let it in NpcConfigMgr.shared.mapConfig) {
            let stData = NpcConfigMgr.shared.mapConfig[it];
            if (stData.auto_create == null)
                continue;

            this.CreateNpc(it, stData.auto_create.map, stData.auto_create.x, stData.auto_create.y, {
                nKind: 0,
                nID: 0
            }, 0)

        }
    }


    DeletePlayersNpc(nAcountID:any) {
        for (let it in this.mapNpc) {
            let stCreater = this.mapNpc[it].stCreater;
            if (stCreater.nKind != Global.ENpcCreater.EPlayer || stCreater.nID != nAcountID)
                continue;

            this.mapNpc[it].destroy();
            delete this.mapNpc[it];
        }
    }

    deleteTeamsNpc(nTeamID:any) {
        for (let it in this.mapNpc) {
            let stCreater = this.mapNpc[it].stCreater;
            if (stCreater.nKind != Global.ENpcCreater.ETeam || stCreater.nID != nTeamID)
                continue;

            this.mapNpc[it].destroy();
            delete this.mapNpc[it];
        }
    }

    GetMaxID():number{
        let nCurMax:any = 0;
        for (let it in this.mapNpc) {
            if (Number(it) > nCurMax)
                nCurMax = Number(it);
        }
        return Math.max(nCurMax, 1000000);
    }

    CreateNpc(nNpc:any, nMap:any, nX:any, nY:any, stCreater = {nKind: 0, nID: 0}, nFuBenID = 0):any{
        let stNpc = new Npc(nNpc);
        stNpc.x = nX;
        stNpc.y = nY;
        stNpc.mapid = nMap;
        stNpc.stCreater = stCreater;
        stNpc.nFuBenID = nFuBenID;
        this.mapNpc[stNpc.onlyid] = stNpc;
        stNpc.onEnterGame();
        return stNpc.onlyid;
    }

    FindNpc(nOnlyID:any):any{
        if (this.mapNpc.hasOwnProperty(nOnlyID) == false)
            return null;

        return this.mapNpc[nOnlyID];
    }

    FindNpcByConfigID(nConfigID:any):any{
        for (var it in this.mapNpc) {
            if (this.mapNpc[it].configid == nConfigID)
                return this.mapNpc[it];
        }
        return null;
    }

    CheckAndDeleteNpc(nOnlyID:any, pPlayer:any) {
        let pNpc = this.FindNpc(nOnlyID);
        if (null == pNpc)
            return;

        if (pNpc.stCreater.nKind == Global.ENpcCreater.ESystem)
            return;

        //        if (pPlayer.CanPlayerSeeNpc(pNpc))

        if ((pNpc.stCreater.nKind == Global.ENpcCreater.ETeam && pPlayer.isleader) || (pNpc.stCreater.nKind == Global.ENpcCreater.EPlayer && pNpc.stCreater.nID == pPlayer.accountid))
            this.DeleteNpc(nOnlyID);
    }

    DeleteNpc(nOnlyID:any) {
        if (this.mapNpc.hasOwnProperty(nOnlyID) == false)
            return;

        this.mapNpc[nOnlyID].destroy();
        delete this.mapNpc[nOnlyID];
    }


    deleteTeamsNpc2(nTeamID:any){
        let vecNpc = [];

        for (var it in this.mapNpc) {
            let pNpc = this.mapNpc[it];
            if (pNpc.stCreater.nKind == Global.ENpcCreater.ETeam && pNpc.stCreater.nID == nTeamID) {
                vecNpc.push(it);
            }
        }

        for (var it2 in vecNpc) {
            this.DeleteNpc(vecNpc[it2]);
        }

    }

}