import TaskState from "../object/TaskState";
import Global from "../../game/core/Global";
import TaskConfigMgr from "../task/TaskConfigMgr";
import TeamMgr from "./TeamMgr";
import NpcMgr from "./NpcMgr";

export default class RoleTaskMgr {
    pPlayer:any;
    vecRecord:any;
    mapTaskState:any;
    nTimeCnt:any;
    mapDailyCnt:any;
    mapDailyStart:any;
    mapFuBenCnt:any;
    mapActiveScore:any;
    szBeenTake:any;
    szActivePrize:any;
    bCanAutoFight:any;

    constructor(pPlayer:any) {
        this.pPlayer = pPlayer;
        this.vecRecord = [];
        this.mapTaskState = {};
        this.nTimeCnt = 0;
        this.mapDailyCnt = {};
        this.mapDailyStart = {};
        this.mapFuBenCnt = {};
        this.mapActiveScore = {};
        this.szBeenTake = [0, 0, 0, 0, 0, 0];
        this.szActivePrize = ['10112,10', '10405,1', '10202,20', '10118,3', '90003,1000000', '50004,10'];
        this.bCanAutoFight = 0;
    }


    OnTimer(nIndex?:any) { //一秒一次
        this.nTimeCnt += 1;
        if (this.nTimeCnt % 2 == 0) {
            this.OnGameEvent(Global.EEventType.PlayerArriveArea, {
                mapid: this.pPlayer.mapid,
                x: this.pPlayer.x,
                y: this.pPlayer.y
            });
        }
        if (this.nTimeCnt % 5 == 0)
            this.OnFailEvent(Global.EEventType.FailEventTimeOut, Global.getTime());
    }


    OnNewDay() {
        this.mapDailyStart = {};

        let vecTask = [];

        for (var it in this.mapTaskState) {
            if (this.mapTaskState[it].nKind == Global.ETaskKind.EDaily || this.mapTaskState[it].nKind == Global.ETaskKind.EFuBen) {
                vecTask.push(this.mapTaskState[it].nTaskID)
            }
        }

        for (var it in vecTask) {
            this.AbortTask(vecTask[it]);
        }

        this.mapDailyCnt = {}; //放弃任务会增加计数，所以放到放弃后面
        this.mapFuBenCnt = {};

        this.mapActiveScore = {};
        this.szBeenTake = [0, 0, 0, 0, 0, 0];
        this.UpdateTaskStateToClient();
    }


    GetTaskStepState(nTaskID:any, nStep:any) {
        if (this.mapTaskState.hasOwnProperty(nTaskID) == false)
            return null;

        if (nStep < 0 || nStep >= this.mapTaskState[nTaskID].vecEventState.length)
            return null;

        return this.mapTaskState[nTaskID].vecEventState[nStep];
    }

    Init(vecDBTask:any, vecRecord:any, mapDailyCnt:any, mapFuBenCnt:any, mapDailyStart:any, mapActiveScore:any, szBeenTake:any) {
        this.vecRecord = vecRecord.slice(0);
        this.mapTaskState = {};
        this.mapDailyCnt = mapDailyCnt;
        this.mapFuBenCnt = mapFuBenCnt;
        this.mapDailyStart = mapDailyStart;
        this.mapActiveScore = mapActiveScore;
        this.szBeenTake = szBeenTake;
        this.LoadCurTaskFromDB(vecDBTask);
        this.CheckAndDeleteFinishedTask();
    }

    IsAlreadyDoneThisTask(nTaskID:any) {
        for (var it in this.vecRecord) {
            if (this.vecRecord[it] == nTaskID)
                return true;
        }
        return false;
    }

    IsMatchLimit(stTask:any) {
        for (var itLimit in stTask.vecLimit) {
            if (stTask.vecLimit[itLimit].nKey == 'nPreTask') //前置任务
            {
                let nPreTask = parseInt(stTask.vecLimit[itLimit].nValue);
                if (this.IsAlreadyDoneThisTask(nPreTask) == false)
                    return false;
            }

            if (stTask.vecLimit[itLimit].nKey == 'nBang') {
                if (this.pPlayer.bangid == 0)
                    return false;
            }

            if (stTask.vecLimit[itLimit].nKey == 'nRace') {
                let nNeedRace = parseInt(stTask.vecLimit[itLimit].nValue);
                if (this.pPlayer.race != nNeedRace)
                    return false;
            }

        }
        return true;
    }


    LoadCurTaskFromDB(vecData:any) {
        for (var it in vecData) {
            this.AddTaskState(vecData[it].nTaskID, parseInt(vecData[it].nCurStep));
        }
    }


    AddTaskState(nTaskID:any, nCurStep:any) {
        let stTaskConfig = TaskConfigMgr.shared.GetTaskInfo(nTaskID);
        if (null == stTaskConfig)
            return;

        if (TaskConfigMgr.shared.IsTeamTask(nTaskID) && this.pPlayer.teamid == 0)
            return;

        let stTaskState = new TaskState();
        stTaskState.pPlayer = this.pPlayer;
        stTaskState.InitState(stTaskConfig, nCurStep);

        this.mapTaskState[stTaskState.nTaskID] = stTaskState;
    }

    IsAlreadyHasThisKindDailyTask(nTaskGrop:any) {
        for (var it in this.mapTaskState) {
            let pConfig = TaskConfigMgr.shared.GetTaskInfo(it);
            if (null == pConfig)
                continue;

            if (pConfig.nTaskGrop == nTaskGrop)
                return true;
        }

        return false;
    }

    GetKindTaskCnt(nTaskGrop:any) {
        if (this.mapDailyCnt.hasOwnProperty(nTaskGrop) == false)
            return 0;

        return this.mapDailyCnt[nTaskGrop];
    }

    GetGroupTask():any{
        let vecDailyTask = TaskConfigMgr.shared.mapConfigTask[Global.ETaskKind.EDaily];
        if (null == vecDailyTask)
            return {};

        let mapTmp:any = {};

        for (var it in vecDailyTask) {
            let nGroup = vecDailyTask[it].nTaskGrop;

            if (mapTmp.hasOwnProperty(nGroup) == false)
                mapTmp[nGroup] = [];

            mapTmp[nGroup].push(vecDailyTask[it]);
        }

        return mapTmp;
    }


    GetEnableDailyTask(mapDailyTask:any, nGroup:any) {
        let vecGroupDaily = mapDailyTask[nGroup];

        let vecRaceDaily = [];

        for (var it in vecGroupDaily) {
            let pTaskInfo = vecGroupDaily[it];
            if (this.IsMatchLimit(pTaskInfo) == false)
                continue;

            vecRaceDaily.push(pTaskInfo);
        }

        return vecRaceDaily;
    }

    CheckAndInceptTask() {
        let vecStoryTask = Global.getDefault(TaskConfigMgr.shared.mapConfigTask[Global.ETaskKind.EStory], []);

        for (var itStory in vecStoryTask) {
            let pTaskConfig = vecStoryTask[itStory];
            if (this.IsAlreadyDoneThisTask(pTaskConfig.nTaskID))
                continue;

            if (this.mapTaskState.hasOwnProperty(pTaskConfig.nTaskID))
                continue;

            if (this.IsMatchLimit(pTaskConfig) == false)
                continue;

            this.AddTaskState(pTaskConfig.nTaskID, 0);
            break;
        }

        let mapDailyTask = this.GetGroupTask();

        for (var itGroup in mapDailyTask) {
            if (this.mapDailyStart.hasOwnProperty(itGroup) == false) //未开启
                continue;

            if (TaskConfigMgr.shared.IsTeamDaily(itGroup) && this.pPlayer.isleader == false)
                continue;

            if (this.IsAlreadyHasThisKindDailyTask(itGroup)) //已有该类型的每日的任务
                continue;

            let vecGroupTask = this.GetEnableDailyTask(mapDailyTask, itGroup);
            let nRand = Math.floor(Math.random() * 100) % vecGroupTask.length;
            let pTaskConfig = vecGroupTask[nRand];
            if (pTaskConfig) {

                if (this.GetKindTaskCnt(itGroup) >= pTaskConfig.nDailyCnt) //这个类型的每日任务做完了
                    continue;

                if (this.IsMatchLimit(pTaskConfig) == false)
                    continue;

                this.AddTaskState(pTaskConfig.nTaskID, 0);
            }

        }
    }


    StartGroupTask(nTaskGrop:any):any{
        if (this.GetKindTaskCnt(nTaskGrop) >= TaskConfigMgr.shared.GetDailyMaxCnt(nTaskGrop))
            return '次数已满';

        if (TaskConfigMgr.shared.IsTeamDaily(nTaskGrop) && this.pPlayer.teamid == 0 && this.pPlayer.isleader == false)
            return '只有队长才能接这个任务';

        if (this.mapDailyStart.hasOwnProperty(nTaskGrop))
            return '你已经领过这个任务了';

        this.mapDailyStart[nTaskGrop] = true;
        this.CheckAndInceptTask();
        this.UpdateTaskStateToClient();

        return '';
    }

    CheckAndInceptFuBenTask(nTaskID:any) {

        let pTaskConfig = TaskConfigMgr.shared.GetTaskInfo(nTaskID);
        if (null == pTaskConfig || pTaskConfig.nKind != Global.ETaskKind.EFuBen)
            return 'syserr';

        

        if (this.pPlayer.teamid == 0 || this.pPlayer.isleader == false)
            return '只有队长才能接这个任务';

        if (this.mapTaskState.hasOwnProperty(pTaskConfig.nTaskID))
            return '你已经有这个任务';

        if (this.IsMatchLimit(pTaskConfig) == false)
            return '不满足条件';

        this.AddTaskState(pTaskConfig.nTaskID, 0);
        this.UpdateTaskStateToClient();

        return '';
    }



    OnGameEvent(nEventType:any, stData:any) {

        if (this.pPlayer.teamid > 0 && this.pPlayer.isleader == false)
            return;


        let bChange = false;

        for (let it in this.mapTaskState) {
            if (this.mapTaskState[it].TaskOnGameEvent(nEventType, stData) == true)
                bChange = true;
        }

        if (bChange) {
            this.CheckAndDeleteFinishedTask();
            this.UpdateTaskStateToClient();
        }

    }



    OnTeamTaskState(mapLeaderTaskState:any) {
        for (var it in mapLeaderTaskState) {
            if (TaskConfigMgr.shared.IsTeamTask(it) == false)
                continue;

            if (this.mapTaskState.hasOwnProperty(it))
                delete this.mapTaskState[it];

            let pInfo = mapLeaderTaskState[it];

            let pTaskState = new TaskState();

            pTaskState.nTaskID = pInfo.nTaskID;
            pTaskState.nKind = pInfo.nKind;
            pTaskState.nTaskGrop = pInfo.nTaskGrop;
            pTaskState.nTaskFinish = pInfo.nTaskFinish;
            pTaskState.vecEventState = pInfo.vecEventState.slice(0);
            pTaskState.vecFailEvent = pInfo.vecFailEvent.slice(0);
            pTaskState.pPlayer = this.pPlayer;

            this.mapTaskState[it] = pTaskState

        }

        this.UpdateTaskStateToClient();

    }




    AbortTask(nTaskID:any) {

        let pTaskState = this.mapTaskState[nTaskID];
        if (null == pTaskState)
            return;

        let pTaskInfo = TaskConfigMgr.shared.GetTaskInfo(nTaskID);
        if (null == pTaskInfo)
            return;

        if (pTaskInfo.nKind == Global.ETaskKind.EStory) {
            this.pPlayer.send('s2c_notice', {
                strRichText: '剧情任务无法取消'
            });
            return;
        }

        pTaskState.nTaskFinish = Global.EState.EFaild;

        this.CheckAndDeleteFinishedTask();

        this.UpdateTaskStateToClient();

    }

    AbortAllTeamTaskWhileLeaveTeam() {
        if (this.pPlayer.teamid > 0)
            return;

        let vecID = [];

        for (var it in this.mapTaskState) {
            if (TaskConfigMgr.shared.IsTeamTask(it) == false)
                continue;

            vecID.push(it);
        }

        for (var nIndex in vecID) {
            this.AbortTask(vecID[nIndex]);
        }
    }


    OnFailEvent(nEventType:any, stData:any) {
        let bChange = false;

        for (let it in this.mapTaskState) {
            if (this.mapTaskState[it].TaskOnFialEvent(nEventType, stData) == true)
                bChange = true;
        }

        if (bChange) {
            this.CheckAndDeleteFinishedTask();
            this.UpdateTaskStateToClient();
        }

    }


    CheckAndDeleteFinishedTask() {
        for (let it in this.mapTaskState) {
            if (this.mapTaskState[it].nTaskFinish == Global.EState.EDone) {
                this.OnTaskFinish(this.mapTaskState[it], true);
                delete this.mapTaskState[it];
                continue;
            }

            if (this.mapTaskState[it].nTaskFinish == Global.EState.EFaild) {
                this.OnTaskFinish(this.mapTaskState[it], false);
                delete this.mapTaskState[it];
                continue;
            }

        }

        this.CheckAndInceptTask();
    }


    OnTaskFinish(pTaskState:any, bSuc:any) {

        let vecPlayer = [];

        if (this.pPlayer.teamid == 0) {
            vecPlayer.push(this.pPlayer);
        }

        if (this.pPlayer.teamid > 0 && this.pPlayer.isleader) {
            vecPlayer = TeamMgr.shared.getTeamPlayer(this.pPlayer.teamid);
        }

        let pTaskInfo = TaskConfigMgr.shared.GetTaskInfo(pTaskState.nTaskID);
        if (null == pTaskInfo)
            return;


        for (var it in vecPlayer) {
            let pMember = vecPlayer[it];
            if (null == pMember)
                continue;

            if (bSuc && pTaskInfo.nKind == Global.ETaskKind.EStory) {
                pMember.GetTaskMgr().vecRecord.push(pTaskState.nTaskID);
            }

            pMember.GetTaskMgr().OnDeleteTask(pTaskState, true);
            pMember.send('s2c_notice', {
                strRichText: bSuc ? `${pTaskInfo.strTaskName}   完成` : `${pTaskInfo.strTaskName}   失败`
            });
        }
    }

    OnDeleteTask(pTskState:any, bSuc:any) {

        let nNewStep = pTskState.vecEventState.length;

        for (var it in pTskState.vecEventState) {
            let pStepState = pTskState.vecEventState[it];
            if (pStepState.nState != Global.EState.EDoing)
                continue;

            nNewStep = it;

            if (typeof (pStepState.vecRemainNpc) == "undefined")
                continue;

            for (var itNpc in pStepState.vecRemainNpc) {
                NpcMgr.shared.CheckAndDeleteNpc(pStepState.vecRemainNpc[itNpc].nOnlyID, this.pPlayer);
            }
        }

        if (bSuc) {

            if (pTskState.nKind == Global.ETaskKind.EDaily) {
                this.mapDailyCnt[pTskState.nTaskGrop] = Global.getDefault(this.mapDailyCnt[pTskState.nTaskGrop], 0) + 1;
            }

            if (pTskState.nKind == Global.ETaskKind.EFuBen) {
                let nCurStep = Global.getDefault(this.mapFuBenCnt[pTskState.nTaskID], 0);
                this.mapFuBenCnt[pTskState.nTaskID] = Math.max(nCurStep, parseInt(nNewStep));
            }
        }
    }


    UpdateTaskStateToClient() {
        let vecData = [];

        for (let it in this.mapTaskState) {
            let stTask = this.mapTaskState[it];

            let vecJson = [];

            for (let itStep in stTask.vecEventState) {
                let strJson = JSON.stringify(stTask.vecEventState[itStep]);
                vecJson.push(strJson);
            }

            vecData.push({
                nTaskID: stTask.nTaskID,
                vecStep: vecJson
            });
        }

        this.pPlayer.send('s2c_role_task_list', {
            vecTask: vecData,
            strJsonDaily: JSON.stringify(this.mapDailyCnt)
        });

        if (this.pPlayer.teamid > 0 && this.pPlayer.isleader == true) {
            this.SynchroTaskToTeam();
        }
    }


    SynchroTaskToTeam() {
        let pTeamInfo = TeamMgr.shared.teamList[this.pPlayer.teamid];
        if (null == pTeamInfo) {
            return;
        }

        for (let index = 1; index < pTeamInfo.playerlist.length; index++) {
            let pMember = pTeamInfo.playerlist[index];
            if (null == pMember || pMember.roleid == this.pPlayer.roleid || pMember.isleader) {
                continue;
            }
            if (pMember.GetTaskMgr() == null) {
                continue;
            }
            pMember.GetTaskMgr().OnTeamTaskState(this.mapTaskState);
        }

    }

    AddActive(nKind:any, nNum:any) {

        if (this.mapActiveScore.hasOwnProperty(nKind) == false)
            this.mapActiveScore[nKind] = 0;

        this.mapActiveScore[nKind] = Math.min(this.mapActiveScore[nKind] + nNum, 140);
        this.SendDailyActive();
    }

    SendDailyActive() {
        let tmpData:any = {};
        tmpData.mapActiveScore = this.mapActiveScore;
        tmpData.szBeenTake = this.szBeenTake;
        tmpData.szActivePrize = this.szActivePrize;
        tmpData.mapDailyStart = this.mapDailyStart;
        tmpData.mapDailyCnt = this.mapDailyCnt;
        tmpData.mapFuBenCnt = this.mapFuBenCnt;
        this.pPlayer.send('s2c_daily_info', {
            strJson: JSON.stringify(tmpData)
        });
    }

    GetFuBenCnt(nTaskID:any) {
        if (this.mapFuBenCnt.hasOwnProperty(nTaskID) == false)
            return 0;

        return this.mapFuBenCnt[nTaskID];
    }
}