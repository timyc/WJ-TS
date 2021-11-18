import Global from "../core/Global";
import PlayerMgr from "../object/PlayerMgr";
import ActivityBase from "./ActivityBase";
import ActivityDefine from "./ActivityDefine";
import NpcMgr from "../core/NpcMgr";

export default class LingHou extends ActivityBase {
    monkey_list:any;
    player_times:any;
    monkey_timer:any;
    constructor() {
        super();
        this.name = '天降灵猴';
        this.open_notice = `世界各地跑来好多偷钱的灵猴，请各位少侠前去驱赶`;
        this.activity_id = ActivityDefine.activityKindID.TianJiangLingHou;
        this.open_type = ActivityDefine.openType.EveryDay;
        this.is_ready_notice = false;
        this.open_type_list = [1200, 1800];

        this.monkey_list = {};
        this.player_times = {};

        this.monkey_timer = 0;
        this.init();
    }

    open() {
        super.open();
        PlayerMgr.shared.broadcast('s2c_game_chat', {
            scale: 3,
            msg: this.open_notice,
            name: '',
            resid: 0,
            teamid: 0,
        });

        this.player_list = {};
        this.checkMonkey();
        this.monkey_timer = setTimeout(() => {
            this.checkMonkey();
        }, 10 * 60 * 1000);
    }

    gmState(state:any){
        if(state == 1){
            let t1 = this.getActTime();
            let t2 = this.getActTime(60 * 60 * 1000);
            this.open_type_list = [t1, t2];
            this.init()
            this.open();
        }else if(state = 2){
            this.open_type_list = [1200, 1800];
            this.close();
        }
    }

    checkMonkey() {
        this.clearAllMonkey();
        if(this.activity_state == ActivityDefine.activityState.Close){
            return;
        }
        this.createAllMonkey();
    }

    onNewDay() {
        this.player_list = {};
    }

    playerFightMonkey(player:any, monkey_id:any) {
        if (player.teamid != 0) {
            return Global.msgCode.LINGHOU_NOT_TEAM;
        }
        if (player.money < Global.lingHouMinMoney) {
            return Global.msgCode.LINGHOU_MONEY_ENOUGH;
        }
        let monkey = this.monkey_list[monkey_id];
        if (monkey.times <= 0) {
            return Global.msgCode.LINGHOU_FIGHT_TOO_MACH;
        }
        let pDayTimes = this.player_list[player.roleid];
        if (pDayTimes == null) {
            this.player_list[player.roleid] = 0;
            pDayTimes = 0;
        }
        if (pDayTimes >= 50) {
            return Global.msgCode.LINGHOU_TODAY_TOO_MACH;
        }

        player.monsterBattle(10153, Global.battleType.LingHou, false);
        monkey.times--;
        pDayTimes++
        this.player_list[player.roleid] = pDayTimes;
        return Global.msgCode.SUCCESS;
    }

    createAllMonkey() {
        let maps =Global.MonkeyPos.slice(0);
        for (let i = 0; i < 50; i++) {
            let r = Global.random(0, maps.length - 1);
            let pos = maps[r];
            let monkey_id = NpcMgr.shared.CreateNpc(40100, pos.mapid, pos.x, pos.y);
            this.monkey_list[monkey_id] = {
                times: 5,
            }
            maps.splice(r, 1);
        }
    }

    clearAllMonkey() {
        for (const monkey_id in this.monkey_list) {
            if (this.monkey_list.hasOwnProperty(monkey_id)) {
                NpcMgr.shared.DeleteNpc(monkey_id);
            }
        }
        this.monkey_list = {};
    }

    close() {
        super.close();

        this.open_type_list = [1200, 1800];

        if (this.monkey_timer != 0) {
            clearTimeout(this.monkey_timer);
            this.monkey_timer = 0;
        }
        PlayerMgr.shared.broadcast('s2c_game_chat', {
            scale: 3,
            msg: '灵猴们在众少侠的努力下，被赶走了！世界恢复了平静祥和',
            name: '',
            resid: 0,
            teamid: 0,
        });

        this.clearAllMonkey();
    }
}
