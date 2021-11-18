export default class BangMember {

    roleid:number;
    name:string;
    resid:number;
    relive:number;
    level:number;
    race:number;
    sex:number;

    constructor(player:any){
        this.roleid = player.roleid;
        this.name = player.name;
        this.resid = player.resid;
        this.relive = player.relive;
        this.level = player.level;
        this.race = player.race;
        this.sex = player.sex;
    }
}