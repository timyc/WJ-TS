import WorldMonster from "./WorldMonster";
import Global from "../../game/core/Global";
import NpcMgr from "../core/NpcMgr";
import NpcConfigMgr from "../core/NpcConfigMgr";
import PlayerMgr from "./PlayerMgr";

export default class WorldMonsterMgr{
    mapName:any;
    vecMonster:any[];
    vecMstPos:any[];
    constructor() {
        this.mapName = { 1010: '东海渔村', 1012: '天宫', 1006: '万寿山', 1005: '方寸山', 1004: '大唐境内', 1007: '大唐边境' };
        this.vecMonster = [];
        this.vecMstPos = [];
        this.Init();
    }

    Init() {
        let mapLiveCnt:any = { 30301: 0, 30302: 0, 30017: 1 };
        for (var it in mapLiveCnt) {
            this.vecMonster.push(new WorldMonster(it, mapLiveCnt[it]));
        }
        this.vecMstPos = [
            { map: 1010, x: 150, y: 63 }, { map: 1010, x: 143, y: 29 }, { map: 1010, x: 125, y: 123 },
            { map: 1012, x: 44, y: 53 }, { map: 1012, x: 92, y: 37 }, { map: 1012, x: 108, y: 10 }, { map: 1012, x: 45, y: 95 },
            { map: 1006, x: 103, y: 45 }, { map: 1006, x: 60, y: 60 }, { map: 1006, x: 52, y: 77 }, { map: 1006, x: 102, y: 87 }, { map: 1006, x: 27, y: 121 },
            { map: 1005, x: 37, y: 20 }, { map: 1005, x: 25, y: 72 }, { map: 1005, x: 77, y: 84 }, { map: 1006, x: 102, y: 65 },
            { map: 1004, x: 150, y: 63 }, { map: 1004, x: 60, y: 24 }, { map: 1004, x: 30, y: 60 }, { map: 1004, x: 74, y: 81 },
            { map: 1007, x: 97, y: 26 }, { map: 1007, x: 63, y: 59 }, { map: 1007, x: 20, y: 81 }, { map: 1007, x: 15, y: 107 }
        ];
    }

    GetRemainPos() {
        let vecTmp = this.vecMstPos.slice(0);
        for (let it in this.vecMonster) {
            let pMonster:any = this.vecMonster[it];
            if (pMonster.nOnlyID == 0)
                continue;
            vecTmp.splice(pMonster.nInPos, 0);
        }
        return vecTmp;
    }

    FindMonster(nConfigID:any):any{
        for (let it in this.vecMonster) {
            if (this.vecMonster[it].nNpc == nConfigID)
                return this.vecMonster[it];
        }
        return null;
    }

    FindDeadMonster(nKind:any):any{
        let vecTmp = [];
        for (let it in this.vecMonster) {
            if (this.vecMonster[it].nOnlyID > 0)
                continue;

            vecTmp.push(it);
        }
        if (vecTmp.length <= 0)
            return null;
        let nRand = Global.random(0, vecTmp.length - 1);
        let nIndex = vecTmp[nRand];
        return this.vecMonster[Number(nIndex)];
    }

    GetMapName(nID:any):any{
        if (this.mapName.hasOwnProperty(nID))
            return this.mapName[nID];

        return '';
    }

    ReliveWorldMonster(nPlayerAccountID:any, nKind:any) {
        let pPlayer = PlayerMgr.shared.getPlayer(nPlayerAccountID);
        if (null == pPlayer)
            return;

        let pMst = this.FindDeadMonster(nKind);
        if (null == pMst)
            return;

        let vecTmp = this.GetRemainPos();
        if (vecTmp.length <= 0)
            return;

        let nRand = Global.random(0, vecTmp.length - 1);
        let stPos = vecTmp[nRand];

        pMst.nOnlyID = NpcMgr.shared.CreateNpc(pMst.nNpc, stPos.map, stPos.x, stPos.y, { nKind: 0, nID: 0 }, 0);
        pMst.nInPos = nRand;
        pMst.nCnt = pMst.nKind == 1 ? 10 : 1;

        let pConfigInfo = NpcConfigMgr.shared.GetConfig(pMst.nNpc);
        let strMapName = this.GetMapName(stPos.map);

        let strRichText = `<color=#00ff00 > ${pConfigInfo.name}</c > <color=#ffffff > 在</c ><color=#0ffff > ${strMapName}, ${stPos.x}, ${stPos.y} </color ><color=#ffffff > 出现了，快去击杀吧。</c >`;
        PlayerMgr.shared.broadcast('s2c_screen_msg', { strRichText: strRichText, bInsertFront: 1 });

    }


    CheckWorldMonsterDead(nOnlyID:any) {

        for (let it in this.vecMonster) {
            let pMonster = this.vecMonster[it];
            if (pMonster.nOnlyID != nOnlyID)
                continue;

            pMonster.nCnt -= 1;
            if (pMonster.nCnt > 0)
                break;

            pMonster.nOnlyID = 0;
            NpcMgr.shared.DeleteNpc(nOnlyID);
            break;
        }
    }

}



