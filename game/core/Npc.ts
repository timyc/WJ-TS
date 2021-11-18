import BattleObj from "../object/BattleObj";
import NpcConfigMgr from "./NpcConfigMgr";
import Global from "../../game/core/Global";
import MapMgr from "./MapMgr";
import PlayerMgr from "../object/PlayerMgr";

export default class Npc extends BattleObj {
    roleid: number;
    accountid: number;
    configid: any;
    kind: any;
    talk: any;
    monster_group: any;
    mapButton: any;
    stCreater: { nID: number; nKind: any; };
    race: any;
    sex: any;
    weapon: number;
    state: number;
    aoi_model: string;
    aoi_obj_list: {};
    battle_id: number;
    nFuBenID:any;
    
    constructor(nConfigID:any) {
        super();

        let stConfig = NpcConfigMgr.shared.GetConfig(nConfigID);
        if (null == stConfig)
            return;

        this.roleid = 0;
        this.accountid = 2;
        this.configid = nConfigID;
        this.resid = stConfig.resid;
        this.name = stConfig.name;
        this.kind = stConfig.kind;
        this.talk = stConfig.talk;
        this.monster_group = stConfig.monster_group;
        this.mapid = 0;
        this.mapButton = stConfig.mapButton
        this.stCreater = {
            nID: 0,
            nKind:Global.ENpcCreater.ESystem
        };

        this.race = Global.raceType.Unknow;
        this.sex = Global.sexType.Unknow;
        this.weapon = 0;
        this.state = 0;
        this.living_type = Global.livingType.NPC;
        this.aoi_model = "wm";
        this.aoi_obj_list = {};
        this.battle_id = 0;
    }

    destroy(callback?:any) {
        let pMap = MapMgr.shared.getMap(this);
        if (pMap) {
            pMap.exitMap(this);
        }
    }

    toObj() {
        let obj:any = super.toObj();
        obj.relive = this.relive;
        obj.level = this.level;
        obj.accountid = 0;
        obj.roleid = this.roleid;
        obj.resid = this.resid;
        obj.race = this.race;
        obj.sex = this.sex;
        obj.bangid = 0;
        obj.livingtype = this.living_type;
        obj.npcconfig = this.configid;
        obj.nFuBenID = 0;
        return obj;
    }

    getData() {
        let obj:any = {};
        obj.onlyid = this.onlyid;
        obj.hp = this.hp;
        obj.mp = this.mp;
        obj.maxhp = this.maxhp;
        obj.maxmp = this.maxmp;
        obj.atk = this.atk;
        obj.spd = this.spd;
        obj.qianneng = 0;
        obj.attr1 = '{}';
        obj.attr2 = '{}';
        obj.addattr1 = '{}';
        obj.addattr2 = '{}';
        obj.skill = '{}';
        return obj;
    }

    playerLogined() {
        PlayerMgr.shared.addPlayer(this);
    }
    
    aoi_enter(obj:any) {

    }

    aoi_update(obj:any) {
        
    }

    aoi_exit(obj:any) {

    }
    
    onEnterGame() {
        let pMap = MapMgr.shared.getMap(this);
        if (null == pMap)
            return;

        let mPlayers = pMap.enterMap(this, Global.livingType.NPC);
    }
}