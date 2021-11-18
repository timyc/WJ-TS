import Global from "../../game/core/Global";
import DB from "../../utils/DB";

class Scheme{
    schemeItemList: any;
    schemeId: any;
    roleId: any;
    status: number;
    schemeName: any;
    player: any;
    content: any;
    isSave: boolean;

    constructor(player:any,schemeMgr:any,name:any){
        this.schemeItemList = {};
        this.schemeId = schemeMgr.localSchemeId;
        
        this.roleId = player.roleid;
        this.status = 0;    //-1 未开放，0，已开放未激活 1，已激活
       
        this.schemeName = name;
        this.player = player;
        this.content = {};
        this.isSave = false;
    }

    initDefaultData(){
        let partnerData = JSON.parse(JSON.stringify(this.player.stPartnerMgr.vecChuZhan))

        let xlevel = this.player.xiulevel;        
        for (const key in this.player.addattr1) {
			if (this.player.addattr1.hasOwnProperty(key)) {
				xlevel = xlevel - this.player.addattr1[key];
			}
		}

        this.content = {
            curEquips:{},
            attribute:{
                //baseQianNeng:this.player.qianneng,
                qianNeng:this.player.qianneng,//this.player.qianneng,
                addPoint:JSON.parse(JSON.stringify(this.player.addattr2))
            },
            defense:{
                //baseXiuLevel:this.player.xiulevel,
                xiuLevel:xlevel,
                xiuPoint:JSON.parse(JSON.stringify(this.player.addattr1))           

            },
            partner:partnerData
        };

        this.isSave = true;
    }

    changeSchemeName(data:any){
        this.schemeName = data;
        this.player.send('s2c_scheme_changeName',{
            ecode: Global.msgCode.SUCCESS,
            schemeId: this.schemeId,
            newName: this.schemeName
        });
        this.isSave = true;
        if(this.status == 1){
            this.checkEquipExist();
            this.player.activateScheme();
        }
    }


    syncPartner(){
        let partnerData = JSON.parse(JSON.stringify(this.player.stPartnerMgr.vecChuZhan))
        this.content.partner = partnerData

    }

    syncEquipsData(curEquipsData:boolean){
        this.content.curEquips = curEquipsData;
        this.isSave = true;
    }


    updateEquips(equipId:any,type:any){
        let equip = this.player.equipObjs[equipId];
        if(equip){

            let result = false;
            let curEquips = this.content.curEquips;     
            let unloadEquipId = -1;        
            if(curEquips.hasOwnProperty(equip.EIndex)){
                if(curEquips[equip.EIndex] == equipId){  
                    unloadEquipId = equipId;                  
                    delete curEquips[equip.EIndex];
                    result = true;
                }else{
                    unloadEquipId = curEquips[equip.EIndex];
                    if(this.checkEquips(equipId)){
                        curEquips[equip.EIndex] = equipId;
                        result = true;
                    }
                }
            }else{                
                if(this.checkEquips(equipId)){               
                    curEquips[equip.EIndex] = equipId;
                    result = true;   
                }
            }

            if(result){
                this.player.send('s2c_scheme_updateEquip',{
                    ecode: Global.msgCode.SUCCESS,
                    schemeId: this.schemeId,
                    curEquips: JSON.stringify(curEquips),
                    type: type,
                    unloadEquipId: unloadEquipId,
                });
                this.isSave = true;
                if(this.status == 1){
                    this.checkEquipExist();
                    this.player.activateScheme();
                }

            }
        }    
    }

    syncPoint(){
        if(this.status == 1){
            //激活，则同步所有加点数据
            this.content.attribute.qianNeng = this.player.qianneng;
            this.content.attribute.addPoint = JSON.parse(JSON.stringify(this.player.addattr2));
            this.content.defense.xiuPoint = JSON.parse(JSON.stringify(this.player.addattr1));
            this.content.defense.xiuLevel = this.player.xiulevel;
            for(var key in this.content.defense.xiuPoint){
                if(this.content.defense.xiuPoint.hasOwnProperty(key)){
                    this.content.defense.xiuLevel -= this.content.defense.xiuPoint[key];
                }
            }


        }else{
            //未激活，如果潜能和修炼点数据总值发生变化，则同步数据
            let curXLevel = this.content.defense.xiuLevel;
            for(var key in this.content.defense.xiuPoint){
                if(this.content.defense.xiuPoint.hasOwnProperty(key)){
                    curXLevel += this.content.defense.xiuPoint[key];
                }
            }

            let diffXiu = this.player.xiulevel - curXLevel;
            this.content.defense.xiuLevel += (diffXiu >= 0 ? diffXiu : 0);
            
            let curQianneng = this.content.attribute.qianNeng;
            for(var key in this.content.attribute.addPoint){
                if(this.content.attribute.addPoint.hasOwnProperty(key)){
                    curQianneng += this.content.attribute.addPoint[key];
                }
            }

            let diffValue = this.player.getTotalQianneng() - curQianneng;
            this.content.attribute.qianNeng += (diffValue >= 0 ? diffValue : 0);
        }
        this.isSave = true;

    }

    deleteEquips(delId:any){
        for(var it in this.content.curEquips){
            if(this.content.curEquips.hasOwnProperty(it)){
                let equipId = this.content.curEquips[it]
                if(equipId == delId)
                    delete this.content.curEquips[it]
            }
        }
    }

    checkEquips(checkId:any){
        let result = false;
        for(var it in this.content.curEquips){
            if(this.content.curEquips.hasOwnProperty(it)){
                let equipId = this.content.curEquips[it]
                if(equipId == checkId)
                    result = true;
            }
        }

        result = this.player.checkSchemeEquip(checkId);

        return result;
    }

    addCustomPoint(data:any){
        this.content.attribute.addPoint = JSON.parse(data.addPoint);
        this.content.attribute.qianNeng = data.qianNeng;
        this.isSave = true;
        if(this.status == 1){
            this.checkEquipExist();
            this.player.activateScheme();
        }
    }

    addXiulianPoint(data:any){
        this.content.defense.xiuPoint = JSON.parse(data.xiulianPoint);
        this.content.defense.xiuLevel = data.xiulevel;
        this.isSave = true;
        if(this.status == 1){
            this.checkEquipExist();
            this.player.activateScheme();
        }
    }

    resetXiulianPoint(data:any){  
        let strErr = this.player.CostFee(Global.goldKind.Money, 200000);
        if (strErr != "") {
            this.player.send('s2c_scheme_resetXiulianPoint',{
                ecode: Global.msgCode.FAILED,
                errorMsg: strErr
            })
            return;
        }    



        this.content.defense.xiuLevel = this.player.xiulevel;  
        for(var key in this.content.defense.xiuPoint){
            if(this.content.defense.xiuPoint.hasOwnProperty(key)){
                this.content.defense.xiuPoint[key] = 0;
            }
        }      
        this.isSave = true;  
        if(this.status == 1){
            this.checkEquipExist();
            this.player.activateScheme();
        }

        this.player.send('s2c_scheme_resetXiulianPoint',{
            ecode: Global.msgCode.SUCCESS,
            errorMsg: ''
        })
    }

    changePartner(data:any){
        this.content.partner[data.order] = data.partnerId;
        this.isSave = true;
        if(this.status == 1){
            this.checkEquipExist();
            this.player.activateScheme();
        }
    }


    checkEquipExist(){
        for(var key in this.content.curEquips){
            if(this.content.curEquips.hasOwnProperty(key)){
                if(!this.player.checkEquipExist(this.content.curEquips[key])){
                    delete this.content.curEquips[key];
                }
            }
        }
    }


    activateScheme(status:any){
        //如果方案里的装备已经不存在，则从方案中删除
        this.checkEquipExist();

        this.status = status;
        this.isSave = true;
        if(this.status == 1){
            let strErr = this.player.CostFee(Global.goldKind.Money, 100000);
			if (strErr != '') {
                this.status = 0;                
				return;
            }
            
            this.player.send('s2c_scheme_activate',{
                ecode: Global.msgCode.SUCCESS,
                schemeId: this.schemeId
            });
            this.player.activateScheme();

        }
    }

    onUse(){
        let strErr = this.player.CostFee(Global.goldKind.Money, 10000000);
        if (strErr != "") {
            return;
        }
        this.player.send('s2c_scheme_use',{
            ecode: Global.msgCode.SUCCESS,
            schemeId: this.schemeId
        });     
        this.status = 0;
        this.isSave = true;
    }


    toObj(){
        let obj:any = {};
        obj.schemeId = this.schemeId;
        obj.roleId = this.roleId;
        obj.status = this.status;
        obj.schemeName = this.schemeName;
        obj.content = JSON.stringify(this.content);
        return obj;
    }
}


export default class SchemeMgr {
    player: any;
    localSchemeId: number;
    schemeList: any;
    schemeDBTimer: any;
        
    constructor(player:any) { 
        this.player = player;
        this.localSchemeId = 0;          //用于属性方案在未入库时标识用
        this.schemeList = {};
    }

    init() {
        DB.getSchemesByRoleId(this.player.roleid,(errorcode:any, list:any) => {
            if (errorcode == Global.msgCode.SUCCESS) {
                for (const sItem of list) {
                    let scheme = new Scheme(this.player,this,sItem.schemeName);
                    scheme.content = JSON.parse(sItem.content);
                    scheme.status = sItem.status;
                    scheme.roleId = sItem.roleId;
                    scheme.schemeId = sItem.schemeId;
                    this.schemeList[scheme.schemeId] = scheme;
                    if(scheme.status == 1){
                        this.player.setActivateSchemeName(sItem.schemeName);
                    }
                }
            }
        });
        DB.getSchemeMaxId((errorcode:any, schemeId:any) => {
            if (errorcode == Global.msgCode.SUCCESS) {
                if(schemeId)
                    this.localSchemeId = schemeId;
                if(this.schemeDBTimer != null){
                    clearInterval(this.schemeDBTimer);
                    this.schemeDBTimer = null;
                }
                this.initDefaultScheme();
            }
        });
        this.schemeDBTimer = setInterval(() => {
			DB.getSchemeMaxId();
		}, 60 * 1000);
    }

    initDefaultScheme(){
        //每个玩家系统默认两个方案
        let that = this;
        DB.getSchemesByRoleId(this.player.roleid,(errorcode:any, list:any) => {
            if (errorcode == Global.msgCode.SUCCESS) {
                if(list.length == 0){
                    for(var i = 0;i < 2;i++){
                        that.localSchemeId++;
                        let name = `套装方案 ${i+1}`
                        let scheme = new Scheme(that.player,that,name);
                        scheme.initDefaultData();
                        if(i == 1){
                            scheme.status = -1;
                        }
                        if(scheme)
                            that.schemeList[scheme.schemeId] = scheme;
                    }
                }

            }
        });


        let a = 1;
    }

    
    getActivateScheme(){
        for (var it in this.schemeList){
            let scheme = this.schemeList[it];
            if(scheme && scheme.status == 1)
                return scheme;            
        }
        return null;
    }


    addScheme(name:any){
        
        let check = true;
        for(var it in this.schemeList){
            if(this.schemeList.hasOwnProperty(it) && this.schemeList[it].schemeName == name){
                check = false;
                break;
            }
        }
        if(check){
            this.localSchemeId++;
            let scheme = new Scheme(this.player,this,name);
            scheme.initDefaultData();
            if(scheme)
                this.schemeList[scheme.schemeId] = scheme;

            this.player.send('s2c_scheme_create',{
                ecode: Global.msgCode.SUCCESS,
                newSchemeInfo: JSON.stringify(scheme, function(key, val){
                    if(key == 'player')
                        return undefined;
                    return val;
                    
                })
            });
        }else{
            this.player.send('s2c_scheme_create',{
                ecode: Global.msgCode.FAILED,
                newSchemeInfo: ''
            });
        }
    }

    updateScheme(schemeId:any,data:any,type:any){
        if(this.schemeList.hasOwnProperty(schemeId)){
            let scheme = this.schemeList[schemeId];
            scheme.updateScheme(type,data);
        }
        
    }

    deleteScheme(schemeId:any){
        if (this.schemeList.hasOwnProperty(schemeId)) {            
            delete this.schemeList[schemeId];
        }
    }

    getSchemeNameList(){
        let schemeList = []; 
        for(var key in this.schemeList){
            if (this.schemeList.hasOwnProperty(key)) {
                let scheme = {schemeId:key,schemeName:this.schemeList[key].schemeName,status:this.schemeList[key].status}
                schemeList.push(scheme);
            }
        }

        this.player.send('s2c_scheme_List',{
            schemeList: JSON.stringify(schemeList)
        })
    }

    addCustomPoint(data:any){
        if (this.schemeList.hasOwnProperty(data.schemeId)) {
            let scheme = this.schemeList[data.schemeId];
            if(scheme){            
                scheme.addCustomPoint(data);     
            }
        }
    }

    addXiulianPoint(data:any){
        if (this.schemeList.hasOwnProperty(data.schemeId)) {
            let scheme = this.schemeList[data.schemeId];
            if(scheme){            
                scheme.addXiulianPoint(data);     
            }
        }
    }

    resetXiulianPoint(data:any){
        if (this.schemeList.hasOwnProperty(data.schemeId)) {
            let scheme = this.schemeList[data.schemeId];
            if(scheme){            
                scheme.resetXiulianPoint(data);     
            }
        }
    }

    changePartner(data:any){
        if (this.schemeList.hasOwnProperty(data.schemeId)) {
            let scheme = this.schemeList[data.schemeId];
            if(scheme){            
                scheme.changePartner(data);     
            }
            
        }
    }


    getSchemeInfo(schemeId:any){
        if (this.schemeList.hasOwnProperty(schemeId)) {
            let scheme = this.schemeList[schemeId];
            if(scheme){            
                this.player.send('s2c_scheme_info',{
                    ecode: Global.msgCode.SUCCESS,
                    schemeInfo: JSON.stringify(scheme, function(key, val){
                        if(key == 'player')
                            return undefined;
                        return val;
                        
                    })
                });
            }
        }
    }

    updateSchemeEquip(data:any){
        if (this.schemeList.hasOwnProperty(data.schemeId)) {
            let scheme = this.schemeList[data.schemeId];
            if(scheme){            
                scheme.updateEquips(data.equipId,data.type);                
            }
        }
    }

    deleteCurEquips(delId:any){
        for(var it in this.schemeList){
            if(this.schemeList.hasOwnProperty(it)){
                let scheme = this.schemeList[it];
                scheme.deleteEquips(delId);
            }
        }
    }

    activateScheme(data:any){
        if (this.schemeList.hasOwnProperty(data.schemeId)) {
            for(var it in this.schemeList){
                if(this.schemeList.hasOwnProperty(it)){
                    let scheme = this.schemeList[it];
                    if(scheme.status == 1)
                        scheme.status = 0;

                    if(scheme.schemeId == data.schemeId){
                        scheme.activateScheme(1); 
                        
                    }
                }
            }            
        }
    }

    changeScheneName(data:any){
        if (this.schemeList.hasOwnProperty(data.schemeId)) {
            let scheme = this.schemeList[data.schemeId];
            if(scheme){            
                scheme.changeSchemeName(data.name);                
            }            
        }            
        
    }

    useSchene(data:any){
        if (this.schemeList.hasOwnProperty(data.schemeId)) {
            let scheme = this.schemeList[data.schemeId];
            if(scheme){            
                scheme.onUse();    
     
            }            
        } 
    }


    syncSchemePoint(){
        for(var it in this.schemeList){
            if(this.schemeList.hasOwnProperty(it)){        
                let scheme = this.schemeList[it];
                if(scheme){          
                    scheme.syncPoint();        
                }
            }
        }
    }


    syncSchemeEquips(curEquipsData:any){
        for (var it in this.schemeList){
            let scheme = this.schemeList[it];
            if(scheme && scheme.status == 1){
                scheme.syncEquipsData(curEquipsData);
                break;
            }
        }
    }

    syncSchemePartner(){
        for (var it in this.schemeList){
            let scheme = this.schemeList[it];
            if(scheme && scheme.status == 1){
                scheme.syncPartner();
                break;
            }
        }
    }



    saveDBData(){
        let that = this;
        for(let it in this.schemeList){
            if(this.schemeList.hasOwnProperty(it)){        
                (function (it){
                    if(that.schemeList[it].isSave){
                        let scheme = that.schemeList[it];
                        let data = scheme.toObj();
    
                        DB.updateSchemeById(data,(errorcode:any, schemeId:any,type:any) => {
                            if (errorcode == Global.msgCode.SUCCESS) {
                                scheme.isSave = false;
                                // console.log(scheme.schemeName + `DB套餐方案更新成功`); 
                            }else{  
                                console.log(scheme.schemeName+`DB套餐方案更新失败`); 
                            }
                        });
                    }
                })(it);
               
            }
        }
    }
}
