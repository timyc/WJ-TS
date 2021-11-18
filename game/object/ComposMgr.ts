
export default class ComposMgr
{
    static shared=new ComposMgr();
    mapExplan:any;
    constructor( )
    {
        this.Init();
    }

    Init()
    {
        this.mapExplan = {};
        this.mapExplan[30002] = ['30001:6'];
        this.mapExplan[30003] = ['30002:5'];
        this.mapExplan[30004] = ['30003:4'];
        this.mapExplan[30005] = ['30004:3'];
        this.mapExplan[30006] = ['30005:2'];

        this.mapExplan[30008] = ['30007:6'];
        this.mapExplan[30009] = ['30008:5'];
        this.mapExplan[30010] = ['30009:4'];
        this.mapExplan[30011] = ['30010:3'];
        this.mapExplan[30012] = ['30011:2'];

        this.mapExplan[30014] = ['30013:6'];
        this.mapExplan[30015] = ['30014:5'];
        this.mapExplan[30016] = ['30015:4'];
        this.mapExplan[30017] = ['30016:3'];
        this.mapExplan[30018] = ['30017:2'];

        this.mapExplan[30020] = ['30019:6'];
        this.mapExplan[30021] = ['30020:5'];
        this.mapExplan[30022] = ['30021:4'];
        this.mapExplan[30023] = ['30022:3'];
        this.mapExplan[30024] = ['30023:2'];

        this.mapExplan[30026] = ['30025:6'];
        this.mapExplan[30027] = ['30026:5'];
        this.mapExplan[30028] = ['30027:4'];
        this.mapExplan[30029] = ['30028:3'];
        this.mapExplan[30030] = ['30029:2'];

        this.mapExplan[50004] = ['10301:1', '10302:1', '10303:1'];

    }
}




