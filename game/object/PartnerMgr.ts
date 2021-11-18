import BattleObj from "./BattleObj";
import Global from "../../game/core/Global";
import PartnerConfigMgr from "./PartnerConfigMgr";
import ExpMgr from "../core/ExpMgr";

class Partner extends BattleObj {
    id:number;
    dingwei:any;
    race:any;
    mapZiZhi:any;
    owner:any;
    own_onlyid:number;
    nState:any;

    constructor(nID:any, nRelive:any, nLevel:any, nExp:any) {
        super();
        this.id = nID;
        this.relive = nRelive;
        this.level = Global.changeNumToRange(nLevel, this.GetLevelRange(nRelive, true), this.GetLevelRange(nRelive, false));

        let stPartnerInfo = PartnerConfigMgr.shared.GetPartnerInfo(this.id);
        let stPower = PartnerConfigMgr.shared.GetPower(this.id, this.relive, this.level);
        if (stPower) {
            this.InitAttr(stPower);
        }

        this.dingwei = stPartnerInfo.dingwei;
        this.race = stPartnerInfo.race;


        this.name = stPartnerInfo.name;
        this.resid = stPartnerInfo.resid;

        this.exp = nExp;
        this.maxexp = ExpMgr.shared.GetHuoBanUpgradeExp(this.relive, this.level);  //zzzErr     

        this.skill_list = stPartnerInfo.skills;
        this.mapZiZhi = Global.getDefault(stPartnerInfo.zizhi, {});

        this.living_type = Global.livingType.Partner;

        this.owner = null;
        this.own_onlyid = 0;
        //------------------------------------
    }

    InitAttr(stPower:any) {
        this.attr1 = stPower.attr;


        this.maxhp = this.getAttr1(Global.attrTypeL1.MAXHP);
        this.hp = this.maxhp;
        this.setAttr1(Global.attrTypeL1.HP, this.hp);

        this.maxmp = this.getAttr1(Global.attrTypeL1.MAXMP);
        this.mp = this.maxmp;
        this.setAttr1(Global.attrTypeL1.MP, this.mp);

        this.atk = this.getAttr1(Global.attrTypeL1.ATK);
        this.spd = this.getAttr1(Global.attrTypeL1.SPD);
    }

    setOwner(player:any) {
        this.owner = player;
    }

    GetLevelRange(nRelive:any, bMin:any):number{
        if (nRelive == 3) {
            return bMin ? 120 : 180;
        }

        if (nRelive == 2) {
            return bMin ? 100 : 140;
        }

        if (nRelive == 1) {
            return bMin ? 80 : 120;
        }

        return bMin ? 0 : 100;
    }



    levelup(issend:any) {
        let nextlevel = this.level + 1;

        if (this.relive == 0)
            nextlevel = Math.min(nextlevel, 100);

        if (this.relive == 1)
            nextlevel = Math.min(nextlevel, 120);

        if (this.relive == 2)
            nextlevel = Math.min(nextlevel, 140);

        if (this.relive == 3)
            nextlevel = Math.min(nextlevel, 180);


        this.setLevel(nextlevel, issend);
    }

    setLevel(level:any, issend:any) {
        this.level = level;
        if (this.owner) {
            this.level = Math.min(level, this.owner.level);
        }

        this.maxexp = ExpMgr.shared.GetHuoBanUpgradeExp(this.relive, this.level);

        let stPower = PartnerConfigMgr.shared.GetPower(this.id, this.relive, this.level);
        this.InitAttr(stPower);

        if (issend && this.owner) {
            let strJson = Global.getPartnerJson(this);
            this.owner.send('s2c_partner_info', {
                strJson: strJson
            });
        }
    }


    GetNextLevel() {
        let nNext = this.level + 1;

        if (this.relive == 0)
            nNext = Math.min(nNext, 100);

        if (this.relive == 1)
            nNext = Math.min(nNext, 120);

        if (this.relive == 2)
            nNext = Math.min(nNext, 140);

        if (this.relive == 3)
            nNext = Math.min(nNext, 180);

        return nNext;
    }

    checkOwnerLevel() {
        if (this.owner == null) {
            return false;
        }
        if (this.owner.relive > this.relive) {
            return true;
        }
        if (this.level >= this.owner.level && this.relive == this.owner.relive) {
            return false;
        }
        return true;
    }

    addExp(exp:any) {
        if (this.GetNextLevel() != this.level) {
            let fexp = this.exp + exp;

            while (fexp >= this.maxexp) {
                if (this.checkOwnerLevel() == false) {
                    this.setLevel(this.level, true);
                    break;
                }
                fexp -= this.maxexp;
                this.levelup(fexp < this.maxexp);
            }
            this.exp = fexp;

        }
        else {
            if (this.exp >= this.maxexp)
                return 1;

            this.exp = Math.min(this.exp + exp, this.maxexp);
        }

        if (this.owner) {
            let strJson = Global.getPartnerJson(this);
            this.owner.send('s2c_partner_info', {
                strJson: strJson
            });
        }

        return 0;
    }



    DoRelive() {
        let bSuc = false;

        if (this.relive >= 3)
            return '不能再转生了';

        if (this.checkOwnerLevel() == false) {
            return '伙伴等级无法超过人物等级';
        }

        if (this.relive == 0 && this.level == 100) {
            this.relive = 1;
            this.level = 80;
            bSuc = true;
        }

        if (this.relive == 1 && this.level == 120) {
            this.relive = 2;
            this.level = 100;
            bSuc = true;
        }

        if (this.relive == 2 && this.level == 140) {
            this.relive = 3;
            this.level = 120;
            bSuc = true;
        }

        if (bSuc == false)
            return '等级不够';


        this.maxexp = ExpMgr.shared.GetHuoBanUpgradeExp(this.relive, this.level);
        this.addExp(0);

        let stPower = PartnerConfigMgr.shared.GetPower(this.id, this.relive, this.level);
        this.InitAttr(stPower);
        return '';
    }

    toObj():any{
        let obj:any = {};
        obj.relive = this.relive;
        obj.level = this.level;
        obj.resid = this.resid;
        obj.race = this.race;
        obj.livingtype = this.living_type;
        obj.id = this.id;
        obj.exp = this.exp;
        obj.nState = this.nState;
        obj.name = this.name;
        obj.dingwei = this.dingwei;
        obj.mapZiZhi = this.mapZiZhi;
        obj.skill_list = this.skill_list;
        return obj;
    }
}


export default class PartnerMgr {
    static shared=new PartnerMgr();
    mapPartner:any;
    vecChuZhan:any;
    pPlayer:any;

    constructor(pPlayer?:any) {
        this.mapPartner = {};
        this.vecChuZhan = [0, 0, 0, 0];
        this.pPlayer = pPlayer;
    }

    init(partnerData:any) {
        // let partnerData = JSON.parse(strJson);
        for (var it in partnerData) {
            if (it == 'vecChuZhan') {
                this.vecChuZhan = partnerData[it].slice(0);
                continue;
            }
            let stData = partnerData[it];
            let nID = stData.nID;
            let nRelive = Global.getDefault(stData.nRelive, 0);
            let stPartner = new Partner(nID, nRelive, stData.nLevel, stData.nExp);
            stPartner.setOwner(this.pPlayer);

            this.mapPartner[nID] = stPartner
        }
        if (Global.getMapLen(this.mapPartner) == 0)  //zzzErr
            this.AddPartner(5051, 1);
    }


    AddPartner(nID:any, nLevel:any) {
        let stPartner = new Partner(nID,0,nLevel,0);
        stPartner.setOwner(this.pPlayer);
        this.mapPartner[nID] = stPartner
    }

    IsPartnerChuZhan(nPartnerID:any) {
        for (var it in this.vecChuZhan) {
            if (this.vecChuZhan[it] == nPartnerID)
                return true;
        }
        return false;
    }

    ChangeChuZhanPos(nPos:any, nPartnerID:any) {
        if (nPos < 0 || nPos > 3)
            return;
        if (nPartnerID > 0) {
            for (var it in this.vecChuZhan) {
                if (this.vecChuZhan[it] == nPartnerID)
                    return;
            }
        }
        this.vecChuZhan[nPos] = nPartnerID;
        this.ReplaceChuZhanPos();
    }

    ReplaceChuZhanPos() {
        let vecTmp = this.vecChuZhan.slice(0);
        this.vecChuZhan = [0, 0, 0, 0];
        let nPos = -1;
        for (var it in vecTmp) {
            if (vecTmp[it] == 0)
                continue;
            nPos++;
            this.vecChuZhan[nPos] = vecTmp[it];
        }
    }


    ToJson():any{
        let mapValue:any= {};
        for (let it in this.mapPartner) {
            let stPartner = this.mapPartner[it];
            mapValue[it] = { nID: stPartner.id, nRelive: stPartner.relive, nLevel: stPartner.level, nExp: stPartner.exp };
        }
        mapValue['vecChuZhan'] = this.vecChuZhan;
        let strJson = JSON.stringify(mapValue);
        return strJson;
    }


    GetPartner(nID:any):any{
        if (this.mapPartner.hasOwnProperty(nID) == false)
            return null;

        return this.mapPartner[nID];
    }

    GetActivePartnerCnt():any{
        let nCnt = 0;
        for (var it in this.vecChuZhan) {
            if (this.vecChuZhan[it] > 0)
                nCnt++;
        }
        return nCnt;
    }

    AddPartnerExp(nID:any, nExp:any):boolean{
        let pPartner = this.GetPartner(nID);
        if (null == pPartner)
            return false;

        if (pPartner.relive > this.pPlayer.relive) {
            return false;
        }

        if (pPartner.level >= this.pPlayer.level) {
            return false;
        }

        let nErr = pPartner.addExp(nExp);
        if (nErr == 2) {
            return true;
        }
        if (nErr != 0)
            return false

        return true;
    }


    SendPartnerInfoToClient(nPartnerID:any) {
        let pPartner = this.GetPartner(nPartnerID);
        if (null == pPartner)
            return;

        let strJson = Global.getPartnerJson(pPartner);
        this.pPlayer.send('s2c_partner_info', { strJson: strJson });
    }

    CheckAndAddPartner() {
        if (null == this.pPlayer)
            return;

        for (let it in PartnerConfigMgr.shared.mapPartner) {
            let pConfig = PartnerConfigMgr.shared.mapPartner[it];
            if (pConfig.unlock > this.pPlayer.level)
                continue;

            if (this.mapPartner.hasOwnProperty(pConfig.partnerid))
                continue;

            this.AddPartner(pConfig.partnerid, 1);
        }
    }

    UpdatePartnerLevelAsPlayer() {
        if (null == this.pPlayer)
            return;

        for (let it in this.mapPartner) {
            let pPartner = this.mapPartner[it];

            if (pPartner.relive > 0 || pPartner.level >= Global.limitPartnerLevel)
                continue;

            pPartner.level = Math.min(this.pPlayer.level, Global.limitPartnerLevel);
        }
    }
}