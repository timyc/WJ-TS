import WorldStar from "./WorldStar";
import GTimer from "../../common/GTimer";
import NpcMgr from "../core/NpcMgr";
import PlayerMgr from "./PlayerMgr";

export default class WorldStarMgr {
    vecStar:any[];
    refresh_timer:any;
    constructor() {
        this.vecStar = [];
        this.Init();
        this.refresh_timer = 0;
    }

    Init() {
        //地狗星-大唐边境
        this.vecStar.push(new WorldStar(30168, 1007, 1));
        this.vecStar.push(new WorldStar(30169, 1007, 1));
        this.vecStar.push(new WorldStar(30170, 1007, 1));
        this.vecStar.push(new WorldStar(30169, 1007, 1));
        this.vecStar.push(new WorldStar(30170, 1007, 1));
        //地平星-方寸山
        this.vecStar.push(new WorldStar(30171, 1005, 2));
        this.vecStar.push(new WorldStar(30172, 1005, 2));
        this.vecStar.push(new WorldStar(30173, 1005, 2));
        this.vecStar.push(new WorldStar(30172, 1005, 2));
        this.vecStar.push(new WorldStar(30173, 1005, 2));
        //地悠星-普陀山
        this.vecStar.push(new WorldStar(30174, 1001, 3));
        this.vecStar.push(new WorldStar(30175, 1001, 3));
        this.vecStar.push(new WorldStar(30176, 1001, 3));
        this.vecStar.push(new WorldStar(30175, 1001, 3));
        this.vecStar.push(new WorldStar(30176, 1001, 3));
        //地异星-地府
        this.vecStar.push(new WorldStar(30177, 1002, 4));
        this.vecStar.push(new WorldStar(30178, 1002, 4));
        this.vecStar.push(new WorldStar(30179, 1002, 4));
        //地微星-大唐境内
        this.vecStar.push(new WorldStar(30180, 1004, 5));
        this.vecStar.push(new WorldStar(30181, 1004, 5));
        this.vecStar.push(new WorldStar(30182, 1004, 5));
        //地奇星-天宫
        this.vecStar.push(new WorldStar(30183, 1012, 6));
        this.vecStar.push(new WorldStar(30184, 1012, 6));
        this.vecStar.push(new WorldStar(30184, 1012, 6));
        //地查星-天宫
        this.vecStar.push(new WorldStar(30186, 1012, 7));
        this.vecStar.push(new WorldStar(30187, 1012, 7));
        this.vecStar.push(new WorldStar(30188, 1012, 7));
        //地稽星-东海渔村
        this.vecStar.push(new WorldStar(30189, 1010, 8));
        this.vecStar.push(new WorldStar(30190, 1010, 8));
        this.vecStar.push(new WorldStar(30191, 1010, 8));
        //地慧星-长安
        this.vecStar.push(new WorldStar(30192, 1011, 9));
        this.vecStar.push(new WorldStar(30193, 1011, 9));
        this.vecStar.push(new WorldStar(30194, 1011, 9));
        //地魁星-大唐境内
        this.vecStar.push(new WorldStar(30195, 1004, 10));
        this.vecStar.push(new WorldStar(30196, 1004, 10));
        this.vecStar.push(new WorldStar(30197, 1004, 10));
        //地灵星-方寸山
        this.vecStar.push(new WorldStar(30198, 1005, 11));
        this.vecStar.push(new WorldStar(30199, 1005, 11));
        this.vecStar.push(new WorldStar(30200, 1005, 11));
        //地隐星-普陀山
        this.vecStar.push(new WorldStar(30201, 1001, 12));
        this.vecStar.push(new WorldStar(30202, 1001, 12));
        this.vecStar.push(new WorldStar(30203, 1001, 12));

        //地佑星-白骨山
        this.vecStar.push(new WorldStar(70001, 1008, 12));
        this.vecStar.push(new WorldStar(70001, 1008, 12));
        this.vecStar.push(new WorldStar(70001, 1008, 12));
        this.onCreateWorldStart();
    }

    IsStar(nOnlyID:any):boolean{
        for (var it in this.vecStar) {
            let pStar = this.vecStar[it];
            if (pStar.nOnlyID == nOnlyID)
                return true;
        }
        return false;
    }

    onCreateWorldStart() {
        let date = GTimer.getCurDate();
        let cur_m = date.getMinutes();
        let cur_s = date.getSeconds();
        if (cur_m >= 30) {
            cur_m = cur_m - 30;
        }
        let t = (29 - cur_m) * 60 + (60 - cur_s) ;

        this.refresh_timer = setTimeout(() => {
            this.refresh_timer = 0;
            this.CheckAndCreateWordStar();
        }, t * 1000);

        this.CheckAndCreateWordStar();
    }

    FindStar(nOnlyID:any):any{
        for (let it in this.vecStar) {
            if (this.vecStar[it].nOnlyID == nOnlyID)
                return this.vecStar[it];
        }
        return null;
    }

    ApplyChallenge(nNpcOnlyID:any, nAccountID:any, starlevel:any):number{
        let pBomb = this.FindStar(nNpcOnlyID);
        if (null == pBomb) {
            return 1;
        }
        if (pBomb.vecApply.length > 0) {
            return 2;
        }
        
        if (pBomb.level > starlevel) {
            return 3;
        }

        pBomb.vecApply.push(nAccountID);
        let pSelf = this;
        setTimeout(() => {
            pSelf.TrigleStarBattle(nNpcOnlyID, nAccountID);
        }, 5000);
        return 0;
    }

    ChallengeFail(npc_onlyid:any){
        let pBomb = this.FindStar(npc_onlyid);
        if (null == pBomb) {
            return;
        }
        pBomb.Reset();//.push(nAccountID);
    }

    CheckAndCreateWordStar() {
        if(this.refresh_timer == 0){
            this.refresh_timer = setTimeout(() => {
                this.refresh_timer = 0
                this.CheckAndCreateWordStar();
            }, 1800 * 1000);
        }
        for (let it in this.vecStar) {
            let pWBomb = this.vecStar[it];
            pWBomb.Reset();

            if (pWBomb.nOnlyID > 0) {
                continue;
            }
            let stPos = pWBomb.GetPos();

            pWBomb.nOnlyID = NpcMgr.shared.CreateNpc(pWBomb.nNpc, stPos.map, stPos.x, stPos.y, {
                nKind: 0,
                nID: 0
            }, 0);
        }
    }


    TrigleStarBattle(nNpcOnlyID:any, nAccountID:any) {
        let pStar = this.FindStar(nNpcOnlyID);
        if (null == pStar)
            return;

        if (pStar.vecApply.length <= 0)
            return;

        let pNpc = NpcMgr.shared.FindNpc(nNpcOnlyID);
        if (null == pNpc)
            return;

        let pPlayer = PlayerMgr.shared.getPlayer(nAccountID);
        if (null == pPlayer)
            return;

        let pBattle = pPlayer.monsterBattle(pNpc.monster_group);
        if (null == pBattle)
            return;

        pBattle.source = nNpcOnlyID;
    }

    CheckWorldStarDead(nOnlyID:any) {
        for (let it in this.vecStar) {
            let pWBomb = this.vecStar[it];
            if (pWBomb.nOnlyID != nOnlyID)
                continue;

            pWBomb.nOnlyID = 0;
            NpcMgr.shared.DeleteNpc(nOnlyID);
            break;
        }
    }
}