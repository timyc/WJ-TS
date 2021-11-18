import Global from "../../game/core/Global";
import TalkEventState from "../../game/event/TalkEventState";
import GatherNpcState from "../../game/event/GatherNpcState";
import KillDynamicNpcState from "../../game/event/KillDynamicNpcState";
import ActionAreaEventState from "../../game/event/ActionAreaEventState";
import ArriveAreaState from "../../game/event/ArriveAreaState";
import GatherItemToNpcEventState from "../../game/event/GatherItemToNpcEventState";
import FailEventPlayerDeadState from "../../game/event/FailEventPlayerDeadState";
import FailEventTimeOutState from "../../game/event/FailEventTimeOutState";
import TaskConfigMgr from "../../game/task/TaskConfigMgr";
import NpcMgr from "../../game/core/NpcMgr";
import DynamicNpc from "../../game/core/DynamicNpc";
import TeamMgr from "../../game/core/TeamMgr";

export default class TaskState {
    nTaskID:any;
    nKind:any;
    nTaskGrop :any;
    nTaskFinish:any;
    vecEventState:any;
    vecFailEvent:any;
    pPlayer:any;
    constructor() {
        this.nTaskID = 0;
        this.nKind = 0;
        this.nTaskGrop = 0;
        this.nTaskFinish = 0;
        this.vecEventState = [];
        this.vecFailEvent = [];
        this.pPlayer = null;
    }

    InitState(stConfig:any, nCurStep:any) {
        this.nTaskID = stConfig.nTaskID;
        this.nKind = stConfig.nKind;
        this.nTaskGrop = stConfig.nTaskGrop;


        for (let it = 0; it < stConfig.vecEvent.length; it++) {
            let stEventState = null;

            if (stConfig.vecEvent[it].nEventType == Global.EEventType.PlayerTalkNpc) {
                stEventState = new TalkEventState();
                stEventState.vecRemainNpc = [];
            }

            if (stConfig.vecEvent[it].nEventType == Global.EEventType.PlayerGatherNpc) {
                stEventState = new GatherNpcState();
                stEventState.vecRemainNpc = [];
            }

            if (stConfig.vecEvent[it].nEventType == Global.EEventType.PlayerKillNpc) {
                stEventState = new KillDynamicNpcState();
                stEventState.vecRemainNpc = [];
            }

            if (stConfig.vecEvent[it].nEventType == Global.EEventType.PlayerDoAction) {
                stEventState = new ActionAreaEventState();
            }

            if (stConfig.vecEvent[it].nEventType == Global.EEventType.PlayerArriveArea) {
                stEventState = new ArriveAreaState();
                stEventState.nMap = stConfig.vecEvent[it].nMap;
                stEventState.nX = stConfig.vecEvent[it].nX;
                stEventState.nY = stConfig.vecEvent[it].nY;
            }

            if (stConfig.vecEvent[it].nEventType == Global.EEventType.PlayerGiveNpcItem) {
                stEventState = new GatherItemToNpcEventState();
            }

            if (stEventState) {
                stEventState.nEventType = stConfig.vecEvent[it].nEventType;
                stEventState.nState = Global.EState.ELock;

                if (it < nCurStep)
                    stEventState.nState = Global.EState.EDone;

                this.vecEventState.push(stEventState);
            }
        }

        for (let it = 0; it < stConfig.vecFailEvent.length; it++) {
            let stFailEvent = null;

            if (stConfig.vecFailEvent[it].nEventType == Global.EEventType.FailEventPlayerDead) {
                stFailEvent = new FailEventPlayerDeadState();
                stFailEvent.nDeadCnt = 0;
            }

            if (stConfig.vecFailEvent[it].nEventType == Global.EEventType.FailEventTimeOut) {
                stFailEvent = new FailEventTimeOutState();
                stFailEvent.nStartTime = Global.getTime();
            }

            if (stFailEvent) {
                this.vecFailEvent.push(stFailEvent);
            }
        }

        this.ReconCurEvent();
    }


    BuildCreaterInfo() {
        if (TaskConfigMgr.shared.IsTeamTask(this.nTaskID))
            return {
                nKind: Global.ENpcCreater.ETeam,
                nID: this.pPlayer.teamid
            }
        else
            return {
                nKind: Global.ENpcCreater.EPlayer,
                nID: this.pPlayer.accountid
            }
    }

    IsBangMap(nMap:any) {
        if (nMap == 3002)
            return true;

        return false;
    }

    ReconCurEvent() {
        for (let i = 0; i < this.vecEventState.length; i++) {
            if (this.vecEventState[i].nState == Global.EState.EDone)
                continue;

            if (this.vecEventState[i].nState == Global.EState.EDoing)
                break;

            this.vecEventState[i].nState = Global.EState.EDoing;

            let stStepConfig = TaskConfigMgr.shared.GetTaskStepInfo(this.nTaskID, i);
            if (stStepConfig.hasOwnProperty('vecCreateNpc') && stStepConfig.vecCreateNpc.length > 0) {
                for (let itCreate in stStepConfig.vecCreateNpc) {
                    let stData = stStepConfig.vecCreateNpc[itCreate];
                    let nOnlyID = NpcMgr.shared.CreateNpc(stData.nNpc, stData.nMap, stData.nX, stData.nY, this.BuildCreaterInfo(), this.IsBangMap(stData.nMap) ? this.pPlayer.bangid : 0);
                    this.vecEventState[i].vecRemainNpc.push(new DynamicNpc(nOnlyID, stData.nNpc));
                }
            } else {
                for (let itCreate in stStepConfig.vecNpc) {
                    let pWorldNpc = NpcMgr.shared.FindNpcByConfigID(stStepConfig.vecNpc[itCreate]);
                    if (null == pWorldNpc)
                        continue;

                    this.vecEventState[i].vecRemainNpc.push(new DynamicNpc(pWorldNpc.onlyid, pWorldNpc.configid));
                }

            }

            if (stStepConfig.nEventType == Global.EEventType.PlayerKillNpc &&
                stStepConfig.bAutoTrigle == 1 &&
                this.vecEventState[i].vecRemainNpc.length > 0 &&
                this.pPlayer.GetTaskMgr().bCanAutoFight == 1) {

                let pNpc = NpcMgr.shared.FindNpc(this.vecEventState[i].vecRemainNpc[0].nOnlyID);
                if (null == pNpc)
                    return;

                let pBattle = this.pPlayer.monsterBattle(pNpc.monster_group);
                if (null == pBattle)
                    return;
                pBattle.source = this.vecEventState[i].vecRemainNpc[0].nOnlyID;
            }
            break;
        }
    }

    OnEventDone(nStep:any) {
        let stTaskInfo = TaskConfigMgr.shared.GetTaskInfo(this.nTaskID);
        let vecPrize = stTaskInfo.vecEvent[nStep].vecPrize;

        let vecPlayer = [];

        if (TaskConfigMgr.shared.IsTeamTask(this.nTaskID) && this.pPlayer.isleader) {
            vecPlayer = TeamMgr.shared.getTeamPlayer(this.pPlayer.teamid);
        } else {
            vecPlayer.push(this.pPlayer);
        }

        for (var it in vecPlayer) {
            let pMember = vecPlayer[it];
            if (null == pMember || pMember.GetTaskMgr() == null)
                continue;

            if (stTaskInfo.nKind == Global.ETaskKind.EFuBen && pMember.GetTaskMgr().GetFuBenCnt(this.nTaskID) > nStep) {
                pMember.send('s2c_notice', {
                    strRichText: '此关卡已完成，无法再次获得奖励'
                });
                continue;
            }

            if (stTaskInfo.nKind == Global.ETaskKind.EDaily && pMember.GetTaskMgr().GetKindTaskCnt(stTaskInfo.nTaskGrop) >= TaskConfigMgr.shared.GetDailyMaxCnt(stTaskInfo.nTaskGrop)) {
                pMember.send('s2c_notice', {
                    strRichText: '你的次数已满，无法再次获得奖励'
                });
                continue;
            }

            for (let it in vecPrize) {
                if (vecPrize[it].nKey == 'exp') {
                    pMember.addExp(parseInt(vecPrize[it].nValue));
                } else if (vecPrize[it].nKey == 'petexp') {
                    if (pMember.curPet) {
                        let nExp = parseInt(vecPrize[it].nValue);
                        if (nExp > 0) {
                            pMember.curPet.addExp(nExp);
                            pMember.send('s2c_notice', {
                                strRichText: `获得  ${nExp} 宠物经验`
                            });
                        }
                    }
                } else if (vecPrize[it].nKey == 'money') {
                    pMember.AddMoney(0, parseInt(vecPrize[it].nValue), '任务奖励');
                } else if (vecPrize[it].nKey == 'active') {
                    pMember.GetTaskMgr().AddActive(this.GetThisTaskActiveScoreKind(), parseFloat(vecPrize[it].nValue));
                } else {
                    pMember.AddItem(vecPrize[it].nKey, vecPrize[it].nValue, true, '任务奖励');
                }
            }
        }

        this.vecEventState[nStep].nState = Global.EState.EDone;


        if (this.nKind == Global.ETaskKind.EFuBen) {
            if (this.pPlayer.GetTaskMgr()) {
                let nCurStep = Global.getDefault(this.pPlayer.GetTaskMgr().mapFuBenCnt[this.nTaskID], 0);
                this.pPlayer.GetTaskMgr().mapFuBenCnt[this.nTaskID] = Math.max(nCurStep, parseInt(nStep) + 1);
            }
        }


    }

    GetThisTaskActiveScoreKind() {
        let pTaskConfig = TaskConfigMgr.shared.GetTaskInfo(this.nTaskID);
        if (null == pTaskConfig)
            return 0;

        if (pTaskConfig.nKind == Global.ETaskKind.EDaily) {
            return pTaskConfig.nTaskGrop;
        }

        if (pTaskConfig.nKind == Global.ETaskKind.EFuBen) {
            return pTaskConfig.nTaskID;
        }
    }

    TaskOnFialEvent(nEventType:any, stData:any):boolean{
        for (let it in this.vecFailEvent) {
            if (this.vecFailEvent[it].nEventType != nEventType)
                continue;

            let pInfo = TaskConfigMgr.shared.GetFailEventInfo(this.nTaskID, it);
            if (null == pInfo)
                continue;

            if (this.vecFailEvent[it].nEventType == Global.EEventType.FailEventPlayerDead) {
                this.vecFailEvent[it].nDeadCnt += 1;
                if (this.vecFailEvent[it].nDeadCnt >= pInfo.nDeadCnt) {
                    this.nTaskFinish = Global.EState.EFaild;
                    return true;
                }
            }

            if (this.vecFailEvent[it].nEventType == Global.EEventType.FailEventTimeOut) {
                if (stData - this.vecFailEvent[it].nStartTime > pInfo.nMaxTime) {
                    this.nTaskFinish = Global.EState.EFaild;
                    return true;
                }
            }
        }

        return false;
    }


    TaskOnGameEvent(nEventType:any, stData:any):boolean{
        let bStepChange = false;

        for (let it in this.vecEventState) {
            if (this.vecEventState[it].nState != Global.EState.EDoing)
                continue;

            if (this.vecEventState[it].nEventType != nEventType)
                continue;

            if (this.vecEventState[it].nEventType == Global.EEventType.PlayerTalkNpc && stData.nTaskID == this.nTaskID && stData.nStep == it) {
                this.OnEventDone(it);
                bStepChange = true;
            }
            if (this.vecEventState[it].nEventType == Global.EEventType.PlayerGatherNpc) {
                for (let nIndex in this.vecEventState[it].vecRemainNpc) {
                    if (this.vecEventState[it].vecRemainNpc[nIndex].nOnlyID == stData) {
                        this.vecEventState[it].vecRemainNpc.splice(nIndex, 1);
                        bStepChange = true;
                        break;
                    }
                }
                if (this.vecEventState[it].vecRemainNpc.length == 0) {
                    this.OnEventDone(it);
                    bStepChange = true;
                }
            }
            if (this.vecEventState[it].nEventType == Global.EEventType.PlayerDoAction) {
                this.OnEventDone(it);
                bStepChange = true;
            }

            if (this.vecEventState[it].nEventType == Global.EEventType.PlayerArriveArea) {
                if (stData.mapid == this.vecEventState[it].nMap && Global.getDistance({
                    x: stData.x,
                    y: stData.y
                }, {
                        x: this.vecEventState[it].nX,
                        y: this.vecEventState[it].nY
                    }) < 10) {
                    this.OnEventDone(it);
                    bStepChange = true;
                }
            }

            if (this.vecEventState[it].nEventType == Global.EEventType.PlayerGiveNpcItem) {
                this.OnEventDone(it);
                bStepChange = true;
            }

            if (this.vecEventState[it].nEventType == Global.EEventType.PlayerKillNpc) {

                for (let nIndex in this.vecEventState[it].vecRemainNpc) {
                    if (this.vecEventState[it].vecRemainNpc[nIndex].nOnlyID == stData) {
                        this.vecEventState[it].vecRemainNpc.splice(nIndex, 1);
                        bStepChange = true;
                        break;
                    }
                }

                if (this.vecEventState[it].vecRemainNpc.length == 0) {
                    this.OnEventDone(it);
                    bStepChange = true;
                }
            }
        }

        if (bStepChange == false)
            return false;

        this.pPlayer.GetTaskMgr().bCanAutoFight = 1;
        this.ReconCurEvent();
        this.CheckAndFinish();

        return true;
    }


    CheckAndFinish() {
        let bAllOK = true;

        for (let it in this.vecEventState) {
            if (this.vecEventState[it].nState != Global.EState.EDone) {
                bAllOK = false;
                break;
            }
        }
        if (bAllOK == true) {
            this.nTaskFinish = Global.EState.EDone;
        }
        return bAllOK;
    }

}