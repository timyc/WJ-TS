import Global from "../../game/core/Global";

export default class PartnerConfigMgr
{
    static shared=new PartnerConfigMgr();
    mapPartner:any;

    constructor()
    {
        this.mapPartner = {}; // <  nPartnerID,<nAtrib,nAtribValue> >
    }

    init(){
        this.LoadPartner('prop_partner.json');
        this.LoadPower('prop_partner_power.json');
    }

    ReadFile(strFile:string):any
    {
        return Global.require_ex('../prop_data/' + strFile);
    }

    LoadPartner(strFile:string)
    {
        let mapData = this.ReadFile(strFile);
        for (const partnerid in mapData) {
            if (mapData.hasOwnProperty(partnerid)) {
                const partnerdata = mapData[partnerid];
                partnerdata.levelInfo = [];
                
                let skilllist = partnerdata.skill.split(';');

                partnerdata.skills = {};
                for (const t of skilllist) {
                    if(t.length > 0){
                        partnerdata.skills[t] = 0;
                    }
                }

                this.mapPartner[partnerid] = partnerdata;
            }
        }
        
    }
    

    LoadPower( strFile:string)
    {
        let mapData = this.ReadFile(strFile);
        for (const _ in mapData) {
            if (mapData.hasOwnProperty(_)) {
                const PowerData = mapData[_];
                let pdata = null;
                try {
                    pdata = JSON.parse(PowerData.Attribute);
                } catch (error) {
                    console.log('Parent[' + PowerData.id + '] Attr Load Error');
                }
                PowerData.Attribute = pdata;

                // 附加一级属性
                let attr1:any = {};
                for (const key in Global.attrTypeL1) {
                    if (Global.attrTypeL1.hasOwnProperty(key)) {
                        attr1[Global.attrTypeL1[key]] = 0;
                    }
                }
                for (const key in pdata) {
                    if (pdata.hasOwnProperty(key)) {
                        let okey = Global.attrEquipTypeStr[key];
                        attr1[okey] = pdata[key];
                        if (Global.equipTypeNumerical.indexOf(okey) == -1) {
                            attr1[okey] = attr1[okey] / 10;
                        }
                    }
                }
                PowerData.attr = attr1;
                
                let partner = this.mapPartner[PowerData.partner_id];
                if(partner){
                    partner.levelInfo[PowerData.level] = PowerData;
                    this.mapPartner[PowerData.partner_id] = partner;
                }
            }
        }
    }

    GetPartnerInfo(nID:any)
    {
        if (this.mapPartner.hasOwnProperty(nID) == false)
            return null;

        return this.mapPartner[nID];
    } 

    GetPower(nID:any, nRelive:any, nLevel:any)
    {
        let partner = this.mapPartner[nID];
        if (partner == null )
            return null;

        let nLevelIndex = nRelive * 1000 + nLevel;
        return partner.levelInfo[nLevelIndex];
    }
}