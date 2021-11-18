import Global from "../../game/core/Global";
import PlayerMgr from "../object/PlayerMgr";
import ActivityBase from "./ActivityBase";
import ActivityDefine from "./ActivityDefine";
import NoticeMgr from "../core/NoticeMgr";

export default class HongBao extends ActivityBase {
    constructor(){
        super();

        this.activity_id = ActivityDefine.activityKindID.HongBao;
        this.open_type = ActivityDefine.openType.DateTime;
        this.is_ready_notice = false;
        this.open_type_list = [20190329, 20190401];

        this.player_list = {}; //已经领过的玩家列表
        
        this.init();
    }

    onNewHour(){
        if(this.activity_state != ActivityDefine.activityState.Opening){
            return;
        }
        this.player_list = {};
        PlayerMgr.shared.broadcast('s2c_hongbao_open');
    }

    playerOpenHongbao(roleid:any){
        let player = PlayerMgr.shared.getPlayerByRoleId(roleid);
        if(player == null){
            return;
        }
        if(this.player_list[roleid] != null){
            player.send('s2c_hongbao_result',{
                errorcode:Global.msgCode.HONGBAO_GET_YET,
            });
            return;
        }

        this.player_list[roleid] = 1;

        let maxjade = 88;
        let randjade = Global.random(1, maxjade);
        player.AddMoney(1, randjade, '愚人节红包');
        if(randjade > (maxjade / (3 * 2))){
            NoticeMgr.shared.sendNotice({
                type: 2,
                text: `${player.name} 获得了愚人节红包, ${randjade}仙玉`,
            })
        }

        player.send('s2c_hongbao_result',{
            errorcode:Global.msgCode.SUCCESS,
        });
    }
}