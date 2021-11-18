import Global from "../core/Global";

export default class MountModel{
    static shared=new MountModel();
    mount_json:any;
    currentId:number;
    mountListDB:any;
    allList:any[];

    constructor(){
        this.currentId=0;
        this.mount_json= Global.require_ex('../prop_data/prop_mount');
        this.allList=[];
        for(let race=0;race<=3;race++){
            let list:any[]=this.mount_json[race];
            for(let data of list){
                data.race=race;
                this.allList.push(data);
            }
        }
    }
    // 获得所有坐骑共16个
    getAllList():any[]{
        return this.allList;
    }
    // 获得指定种族的坐骑
    getListBy(race:string):any[]{
        let result=this.mount_json[race];
        return result;
    }
    // 转换输出
    toObj():any{
        let result:any={};
        result.mountId=this.currentId;
        result.mountList=this.mountListDB;
        return result;
    }
}