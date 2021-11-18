import Global from "../../game/core/Global";

export default class NpcConfigMgr {
    static shared=new NpcConfigMgr();

    mapConfig:any;

    constructor() {
        this.mapConfig = {};
    }

    init() {
        let mapData = Global.require_ex('../prop_data/prop_npc');
        for (let itNpc in mapData) {
            if (itNpc == 'datatype')
                continue;

            const stData = mapData[itNpc];
            let stNpc:any = {};
            stNpc.resid = stData.resid;
            stNpc.name = stData.name;
            stNpc.id = stData.id;
            stNpc.kind = stData.kind;
            stNpc.talk = Global.getAttribute(stData, 'talk', '');
            stNpc.auto_create = this.GetCreateNpc(Global.getDefault(stData.auto_create, ''));
            stNpc.monster_group = Global.getAttribute(stData, 'monster_group', 0);
            let strMap = stData.mapButton == "" ? '{}' : stData.mapButton;
            stNpc.mapButton = JSON.parse(strMap);
            this.mapConfig[itNpc] = stNpc;
        }
    }

    GetConfig(nID:any):any{
        if (this.mapConfig.hasOwnProperty(nID) == false)
            return null;
        return this.mapConfig[nID];
    }

    GetCreateNpc(strData:any):any{
        let vecTmp = strData.split(";");
        if (vecTmp.length != 4)
            return null;
        return { map: parseInt(vecTmp[0]), x: parseInt(vecTmp[1]), y: parseInt(vecTmp[2]), dir: parseInt(vecTmp[3]) };
    }

}