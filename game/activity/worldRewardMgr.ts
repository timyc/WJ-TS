import PlayerMgr from "../object/PlayerMgr";


let hongbao_seed = 1000;

class WorldRewardMgr {

    rewardList:any;

    constructor() {
        this.rewardList = {};
        // this.listNum = [];
        // this.idList = [];
        // this.tagIDList = [];
    }

    
    sendReward(roleId:any, num:any, rewardNum:any) {
        let player:any = PlayerMgr.shared.getPlayerByRoleId(roleId);
        player.send('s2c_notice', {
        //     strRichText: '世界红包稍后开放',
        });
        // 扣除手续费后的数量
        let numYu = Math.floor(num - (num * 0.10));
        player = PlayerMgr.shared.getPlayerByRoleId(roleId);
        let str = player.CostFee(1, num, '发世界红包', false);
        if (str != '') {
            player.send('s2c_notice', {
                strRichText: str,
            });
        } else { // 成功
            let reward = new WorldRewardInfo(hongbao_seed);
            reward.role_name = player.name;
            reward.num = rewardNum;
            reward.jade_count = numYu;
            reward.init();

            this.rewardList[hongbao_seed] = reward;
            hongbao_seed++;
            //聊天框内  提示一下
            NoticeMgr.shared.sendNotice({
                type: 2,
                text: `${player.name} 发了一个世界红包，大家快来抢红包`,
            });
        }

    }

    
    getRewardList(player) {
        
        let rewardList = {};
        
        // let list = this.rewardList;
        rewardList.list = [];
        for (const rewardid in this.rewardList) {
            if (this.rewardList.hasOwnProperty(rewardid)) {
                const reward = this.rewardList[rewardid];
                let state = 0;
                if(reward.isVaild()){
                    if(reward.hasReward(player.roleid)){
                        state = 1;
                    }
                }else{
                    state =2;
                    //可进行移除已领取完的红包
                    setTimeout(()=>{
                        delete this.rewardList[rewardid];
                    },7200*1000);
                }
                rewardList.list.push({
                    count:reward.jade_count,
                    num:reward.num,
                    tagid:reward.tagid,
                    state:state,
                    rolename:reward.role_name,
                })
                
            }
        }

        player.send('s2c_world_reward_list',rewardList);
    }


    
    toReceive(tagID, roleId) {
        let player = PlayerMgr.shared.getPlayerByRoleId(roleId);
        if(!player){
            return;
        }

        let reward = this.rewardList[tagID];
        if(reward == null){
            return;
        }

        if(!reward.isVaild()){
            return;
        }

        if(reward.hasReward(roleId)){
            return;
        }
        
        let jade = reward.getReward(roleId);
        player.AddMoney(1, jade, '世界红包');
        // 

        let noticejade = Math.floor((reward.jade_count / reward.num) * 1.5);
        if(jade >= noticejade){
            NoticeMgr.sendNotice({
                type:2,
                text: `${player.name} 从 ${reward.role_name} 世界红包中获得, ${jade}仙玉`
            });
        }
        
        this.getRewardList(player)
    }

}


let instance = null;
module.exports = (() => {
    if (instance == null) {
        instance = new WorldRewardMgr();
    }
    return instance;
})();