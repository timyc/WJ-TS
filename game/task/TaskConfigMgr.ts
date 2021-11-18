import Global from "../../game/core/Global";
import Task from "./Task";
import EventTalkNpc from "./EventTalkNpc";
import GatherNpc from "./GatherNpc";
import DoActionInArea from "./DoActionInArea";
import ArriveArea from "./ArriveArea";
import KillDynamicNpc from "./KillDynamicNpc";
import FailEventPlayerDead from "../event/FailEventPlayerDead";
import FailEventTimeOut from "../event/FailEventTimeOut";
import GiveNpcItem from "../event/GiveNpcItem";

export default class TaskConfigMgr{
    static shared=new TaskConfigMgr();
    mapConfigTask:any;

    constructor() {
        this.mapConfigTask = {};
    }

    GetTaskEventCreateNpc(vecString:any):any{
        let vecData = [];
        for (let it in vecString) {
            let strData = vecString[it];
            let vecTmp = strData.split(",");
            if (vecTmp.length != 4)
                continue;
            vecData.push({ nNpc: vecTmp[0], nMap: vecTmp[1], nX: vecTmp[2], nY: vecTmp[3] });  //zzzErr
        }
        return vecData;
    }


    GetDailyMaxCnt(nGrop:any):number{
        if (nGrop == 2 || nGrop == 3)
            return 20;

        if (nGrop == 4)
            return 15;

        if (nGrop == 5)
            return 5;

        if (nGrop == 6)
            return 120;

        if (nGrop == 7)
            return 40;

        return 0;

    }

    StringVecorToDataVector(vecString:any):any{
        let vecData = [];

        for (let it in vecString) {
            let strData = vecString[it];

            let vecTmp = strData.split(":");
            if (vecTmp.length != 2)
                continue;

            vecData.push({ nKey: vecTmp[0], nValue: vecTmp[1] });
        }

        return vecData;
    }

    AddTask(nKind:any, stTask:any) {
        if (this.mapConfigTask.hasOwnProperty(nKind) == false)
            this.mapConfigTask[nKind] = [];

        this.mapConfigTask[nKind].push(stTask);
    }

    init() {
        let mapData = Global.require_ex('../prop_data/prop_task');
        for (let itTask in mapData) {
            if (itTask == 'datatype')
                continue;
            const stData = mapData[itTask];
            let stTask = new Task();
            stTask.nTaskID = parseInt(itTask);
            stTask.nKind = stData.nKind;
            stTask.strTaskName = stData.strName;
            stTask.nTaskGrop = Global.getDefault(stData.nTaskGrop, 0);
            stTask.nDailyCnt = Global.getDefault(stData.nDailyCnt, 0);

            for (let nIndex in stData.vecEvent) {
                if (stData.vecEvent[nIndex].nEventType == Global.EEventType.PlayerTalkNpc)  //对话
                {
                    let stTalk = new EventTalkNpc();
                    stTalk.nEventType = Global.EEventType.PlayerTalkNpc;
                    stTalk.vecPrize = this.StringVecorToDataVector(stData.vecEvent[nIndex].vecPrize);
                    stTalk.strTip = stData.vecEvent[nIndex].strTip;
                    stTalk.vecCreateNpc = this.GetTaskEventCreateNpc(stData.vecEvent[nIndex].vecCreateNpc);
                    stTalk.vecNpc = stData.vecEvent[nIndex].vecNpc.slice(0);
                    stTalk.vecSpeak = this.StringVecorToDataVector(stData.vecEvent[nIndex].vecSpeak);
                    stTalk.bAutoTrigle = Global.getDefault(stData.vecEvent[nIndex].bAutoTrigle, 0);
                    stTask.vecEvent.push(stTalk);
                }

                if (stData.vecEvent[nIndex].nEventType == Global.EEventType.PlayerGatherNpc) {
                    let stGather = new GatherNpc();
                    stGather.nEventType = Global.EEventType.PlayerGatherNpc;
                    stGather.strTip = stData.vecEvent[nIndex].strTip;
                    stGather.vecPrize = this.StringVecorToDataVector(stData.vecEvent[nIndex].vecPrize);
                    stGather.vecCreateNpc = this.GetTaskEventCreateNpc(stData.vecEvent[nIndex].vecCreateNpc);
                    stGather.vecNpc = stData.vecEvent[nIndex].vecNpc.slice(0);
                    stTask.vecEvent.push(stGather);
                }

                if (stData.vecEvent[nIndex].nEventType == Global.EEventType.PlayerDoAction) {
                    let stAction = new DoActionInArea();
                    stAction.nEventType = Global.EEventType.PlayerDoAction;
                    stAction.vecPrize = this.StringVecorToDataVector(stData.vecEvent[nIndex].vecPrize);
                    stAction.strTip = stData.vecEvent[nIndex].strTip;
                    stAction.nMap = stData.vecEvent[nIndex].nMap;
                    stAction.nX = stData.vecEvent[nIndex].nX;
                    stAction.nY = stData.vecEvent[nIndex].nY;
                    stAction.strAction = stData.vecEvent[nIndex].strAction;
                    stAction.strTalk = stData.vecEvent[nIndex].strTalk;
                    stTask.vecEvent.push(stAction);
                }

                if (stData.vecEvent[nIndex].nEventType == Global.EEventType.PlayerArriveArea) {
                    let stAction = new ArriveArea();
                    stAction.nEventType = Global.EEventType.PlayerArriveArea;
                    stAction.vecPrize = this.StringVecorToDataVector(stData.vecEvent[nIndex].vecPrize);
                    stAction.strTip = stData.vecEvent[nIndex].strTip;
                    stAction.nMap = stData.vecEvent[nIndex].nMap;
                    stAction.nX = stData.vecEvent[nIndex].nX;
                    stAction.nY = stData.vecEvent[nIndex].nY;
                    stTask.vecEvent.push(stAction);
                }

                if (stData.vecEvent[nIndex].nEventType == Global.EEventType.PlayerGiveNpcItem) {
                    let stAction = new GiveNpcItem();
                    stAction.nEventType = Global.EEventType.PlayerGiveNpcItem;
                    stAction.vecPrize = this.StringVecorToDataVector(stData.vecEvent[nIndex].vecPrize);
                    stAction.strTip = stData.vecEvent[nIndex].strTip;
                    stAction.nItemID = stData.vecEvent[nIndex].nItemID;
                    stAction.nNum = stData.vecEvent[nIndex].nNum;
                    stAction.nFromNpc = stData.vecEvent[nIndex].nFromNpc;
                    stAction.nNpcConfigID = stData.vecEvent[nIndex].nToNpc;
                    stAction.strTip2 = stData.vecEvent[nIndex].strTip2;
                    stTask.vecEvent.push(stAction);
                }

                if (stData.vecEvent[nIndex].nEventType == Global.EEventType.PlayerKillNpc) {
                    let stEvent = new KillDynamicNpc();
                    stEvent.nEventType = Global.EEventType.PlayerKillNpc;
                    stEvent.vecPrize = this.StringVecorToDataVector(stData.vecEvent[nIndex].vecPrize);
                    stEvent.strTip = stData.vecEvent[nIndex].strTip;
                    stEvent.vecCreateNpc = this.GetTaskEventCreateNpc(stData.vecEvent[nIndex].vecCreateNpc);
                    stEvent.vecNpc = stData.vecEvent[nIndex].vecNpc.slice(0);
                    stEvent.bAutoTrigle = stData.vecEvent[nIndex].bAutoTrigle;
                    stTask.vecEvent.push(stEvent);
                }
            }

            for (let nIndex in stData.vecFailEvent) {
                if (stData.vecFailEvent[nIndex].nEventType == Global.EEventType.FailEventPlayerDead) {
                    let stEvent = new FailEventPlayerDead();
                    stTask.vecFailEvent.push(stEvent);
                }

                if (stData.vecFailEvent[nIndex].nEventType == Global.EEventType.FailEventTimeOut) {
                    let stEvent = new FailEventTimeOut();
                    stTask.vecFailEvent.push(stEvent);
                }
            }
            stTask.vecLimit = this.StringVecorToDataVector(stData.vecLimit);
            this.AddTask(stTask.nKind, stTask);
        }
    }

    GetTaskInfo(nTaskID:any):any{
        for (let nKind in this.mapConfigTask) {
            let vecTask = this.mapConfigTask[nKind];

            for (let nIndex in vecTask) {
                if (vecTask[nIndex].nTaskID == nTaskID)
                    return vecTask[nIndex];
            }
        }

        return null;
    }


    GetTaskStepInfo(nTaskID:any, nStep:any):any{
        let stTaskConfig = this.GetTaskInfo(nTaskID);
        if (null == stTaskConfig)
            return null;

        if (nStep < 0 || nStep >= stTaskConfig.vecEvent.length)
            return null;

        return stTaskConfig.vecEvent[nStep];
    }


    GetFailEventInfo(nTaskID:any, nStep:any) {
        let stTaskConfig = this.GetTaskInfo(nTaskID);
        if (null == stTaskConfig)
            return null;

        if (nStep < 0 || nStep >= stTaskConfig.vecFailEvent.length)
            return null;

        return stTaskConfig.vecFailEvent[nStep];
    }


    IsTeamTask(nTaskID:any):boolean{

        if (nTaskID >= 500)
            return true;

        return false;
    }

    IsTeamDaily(nGrop:any):boolean{
        if (Global.isDataInVecter(nGrop, [5, 6, 7]))
            return true;

        return false;
    }
}