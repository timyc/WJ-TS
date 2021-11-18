import Agent from "./Agent";

let c2s = {
    ['test']: (agent:Agent,data:any) => {
        console.log('socket disconnect');
    },

    // ['ping']: (agent:Agent,data:any) => {
    //     agent.ping && agent.ping(data);
    // },

    // ['disconnect']: (agent:Agent,data:any) => {
    //     agent.disconnect(data);
    // },

    ['gm_command']: (agent:Agent,data:any) => {
        agent.gm_command(data);
    },
    /////////////////////////////////////////////////
    ['c2s_login']: (agent:Agent,data:any) => {
        agent.c2s_login && agent.c2s_login(data);
    },
    ['c2s_relogin']: (agent:Agent,data:any) => {
        agent.c2s_relogin && agent.c2s_relogin(data);
    },
    ['c2s_enter_game']: (agent:Agent,data:any) => {
        agent.c2s_enter_game && agent.c2s_enter_game(data);
    },
    ['c2s_change_map']: (agent:Agent,data:any) => {
        agent.c2s_change_map && agent.c2s_change_map(data);
    },
    ['c2s_create_team']: (agent:Agent,data:any) => {
        agent.c2s_create_team && agent.c2s_create_team(data);
    },
    ['c2s_match_team']: (agent:Agent,data:any) => {
        agent.c2s_match_team && agent.c2s_match_team(data);
    },
    ['c2s_requst_team']: (agent:Agent,data:any) => {
        agent.c2s_requst_team && agent.c2s_requst_team(data);
    },
    ['c2s_leave_team']: (agent:Agent,data:any) => {
        agent.c2s_leave_team && agent.c2s_leave_team(data);
    },
    ['c2s_transfer_team']: (agent:Agent,data:any) => {
        agent.c2s_transfer_team && agent.c2s_transfer_team(data);
    },
    ['c2s_transfer_team_requst']: (agent:Agent,data:any) => {
        agent.c2s_transfer_team_requst && agent.c2s_transfer_team_requst(data);
    },
    ['c2s_team_list']: (agent:Agent,data:any) => {
        agent.c2s_team_list && agent.c2s_team_list(data);
    },
    ['c2s_team_requeslist']: (agent:Agent,data:any) => {
        agent.c2s_team_requeslist && agent.c2s_team_requeslist(data);
    },
    ['c2s_operteam']: (agent:Agent,data:any) => {
        agent.c2s_operteam && agent.c2s_operteam(data);
    },

    ['c2s_aoi_move']: (agent:Agent,data:any) => {
        agent.c2s_aoi_move && agent.c2s_aoi_move(data);
    },
    ['c2s_aoi_stop']: (agent:Agent,data:any) => {
        agent.c2s_aoi_stop && agent.c2s_aoi_stop(data);
    },
    ['c2s_player_upskill']: (agent:Agent,data:any) => {
        agent.c2s_player_upskill && agent.c2s_player_upskill(data);
    },
    ['c2s_player_addpoint']: (agent:Agent,data:any) => {
        agent.c2s_player_addpoint && agent.c2s_player_addpoint(data);
    },
    ['c2s_xiulian_point']: (agent:Agent,data:any) => {
        agent.c2s_xiulian_point && agent.c2s_xiulian_point(data);
    },
    ['c2s_xiulian_upgrade']: (agent:Agent,data:any) => {
        agent.c2s_xiulian_upgrade && agent.c2s_xiulian_upgrade(data);
    },
    ['c2s_game_chat']: (agent:Agent,data:any) => {
        agent.c2s_game_chat && agent.c2s_game_chat(data);
    },
    ['c2s_get_friends']: (agent:Agent,data:any) => {
        agent.c2s_get_friends && agent.c2s_get_friends(data);
    },
    ['c2s_update_friends']: (agent:Agent,data:any) => {
        agent.c2s_update_friends && agent.c2s_update_friends(data);
    },
    ['c2s_search_friends']: (agent:Agent,data:any) => {
        agent.c2s_search_friends && agent.c2s_search_friends(data);
    },
    ['c2s_add_friend']: (agent:Agent,data:any) => {
        agent.c2s_add_friend && agent.c2s_add_friend(data);
    },
    ['c2s_friend_chat']: (agent:Agent,data:any) => {
        agent.c2s_friend_chat && agent.c2s_friend_chat(data);
    },

    ['c2s_ask_partner_list']: (agent:Agent,data:any) => {
        agent.QueryPartner && agent.QueryPartner(data.nRoleID);
    },

    ['c2s_change_partner_state']: (agent:Agent,data:any) => {
        agent.ChangePartnerState && agent.ChangePartnerState(data);
    },

    ['c2s_partner_relive']: (agent:Agent,data:any) => {
        agent.PartnerRelive && agent.PartnerRelive(data);
    },

    ['c2s_partner_exchange_exp']: (agent:Agent,data:any) => {
        agent.PartnerExchangeExp && agent.PartnerExchangeExp(data);
    },

    ['c2s_ask_other_info']: (agent:Agent,data:any) => {
        if (agent.QueryOther != null)
            agent.QueryOther(data.nRoleID);
    },

    ['c2s_ask_role_task']: (agent:Agent,data:any) => {
        if (agent.QueryRoleTask != null)
            agent.QueryRoleTask();
    },

    ['c2s_create_test_npc']: (agent:Agent,data:any) => {
    },

    ['c2s_start_grop_task']: (agent:Agent,data:any) => {
        if (agent.StartGropTask != null)
            agent.StartGropTask(data.nNpcOnlyID, data.nTaskGrop);
    },


    ['c2s_incept_fuben_task']: (agent:Agent,data:any) => {

        if (agent.InceptFuBenTask != null)
            agent.InceptFuBenTask(data.nNpcOnlyID, data.nTaskID);
    },

    ['c2s_player_shutup']: (agent:Agent,data:any) => {
        agent.c2s_player_shutup && agent.c2s_player_shutup(data.nRoleID);
    },

    ['c2s_player_speak']: (agent:Agent,data:any) => {
        agent.c2s_player_speak && agent.c2s_player_speak(data.nRoleID);
    },

    ['c2s_kick_off']: (agent:Agent,data:any) => {
        agent.KickOffPlayer && agent.KickOffPlayer(data.nRoleID);
    },

    ['c2s_freeze_ip']: (agent:Agent,data:any) => {
        agent.FreezePlayerIP && agent.FreezePlayerIP(data.nRoleID);
    },

    ['c2s_freeze_mac']: (agent:Agent,data:any) => {
        agent.FreezePlayerMAC && agent.FreezePlayerMAC(data.nRoleID);
    },


    ['c2s_task_reset']: (agent:Agent,data:any) => {
        if (agent.TaskReset != null)
            agent.TaskReset();
    },


    ['c2s_abort_task']: (agent:Agent,data:any) => {
        if (agent.AbortTask != null)
            agent.AbortTask(data);
    },




    ['c2s_task_talk_npc']: (agent:Agent,data:any) => {
        if (agent.OnTaskTalkNpc != null)
            agent.OnTaskTalkNpc(data.nTaskID, data.nStep, data.nNpcConfigID, data.nNpcOnlyID);
    },

    ['c2s_trigle_npc_bomb']: (agent:Agent,data:any) => {
        if (agent.TrigleNpcBomb != null)
            agent.TrigleNpcBomb(data.nNpcConfigID, data.nNpcOnlyID);
    },

    ['c2s_ask_daily_info']: (agent:Agent,data:any) => {
        agent.AskDailyInfo && agent.AskDailyInfo();
    },

    ['c2s_take_active_prize']: (agent:Agent,data:any) => {
        agent.TakeActivePrize && agent.TakeActivePrize(data.nIndex);
    },


    ['c2s_enter_battle']: (agent:Agent,data:any) => {
        if (agent.PlayerEnterBattle != null)
            agent.PlayerEnterBattle(data.nGroupID);
    },

    ['c2s_challenge_npc']: (agent:Agent,data:any) => {
        if (agent.PlayerChallengeNpc != null)
            agent.PlayerChallengeNpc(data.nOnlyID, data.nConfigID);
    },

    ['c2s_act_npc']: (agent:Agent,data:any) => {
        if (agent.OnRoleActNpc != null)
            agent.OnRoleActNpc(data.nOnlyID, data.nNpcConfigID);
    },

    ['c2s_role_action']: (agent:Agent,data:any) => {
        if (agent.OnRoleAction != null)
            agent.OnRoleAction(data);
    },



    ['c2s_ask_paihang']: (agent:Agent,data:any) => {
        if (agent.QueryPaiHang != null)
            agent.QueryPaiHang(data.nByWhat);
    },

    ['c2s_get_shop_items']: (agent:Agent,data:any) => {
        agent.QueryItemGoods && agent.QueryItemGoods(data);
    },

    ['c2s_buymall_items']: (agent:Agent,data:any) => {
        agent.BuyMall && agent.BuyMall(data);
    },

    ['c2s_get_shop_equips']: (agent:Agent,data:any) => {
        agent.QueryEquipGoods && agent.QueryEquipGoods(data);
    },


    ['c2s_ask_roles_goods']: (agent:Agent,data:any) => {
        agent.QueryAndSendRolsGoods && agent.QueryAndSendRolsGoods(data.nRoleID);
    },

    ['c2s_add_goods']: (agent:Agent,data:any) => {
        agent.AddGoods && agent.AddGoods(data);
    },

    ['c2s_take_back_goods']: (agent:Agent,data:any) => {
        agent.TakeBackGoods && agent.TakeBackGoods(data);
    },

    ['c2s_buy_goods']: (agent:Agent,data:any) => {
        agent.BuyGoods && agent.BuyGoods(data);
    },

    ['c2s_buy_from_npc']: (agent:Agent,data:any) => {
        agent.BuyFromNpc && agent.BuyFromNpc(data.nConfigID, data.nItemID, data.nCnt);
    },



    ['c2s_get_bagitem']: (agent:Agent,data:any) => {
        agent.c2s_get_bagitem && agent.c2s_get_bagitem(data);
    },
    ['c2s_get_mall']: (agent:Agent,data:any) => {
        agent.c2s_get_mall && agent.c2s_get_mall(data);
    },

    ['c2s_ask_relive_list']: (agent:Agent,data:any) => {
        agent.c2s_ask_relive_list && agent.c2s_ask_relive_list(data);
    },

    ['c2s_change_relive_list']: (agent:Agent,data:any) => {
        agent.c2s_change_relive_list && agent.c2s_change_relive_list(data);
    },


    ['c2s_compose']: (agent:Agent,data:any) => {
        agent.c2s_compose && agent.c2s_compose(data);
    },


    ['c2s_ask_lottery_info']: (agent:Agent,data:any) => {
        agent.c2s_ask_lottery_info && agent.c2s_ask_lottery_info(data);
    },


    ['c2s_lottery_go']: (agent:Agent,data:any) => {
        agent.c2s_lottery_go && agent.c2s_lottery_go(data);
    },


    ['c2s_ask_npc_shop_item']: (agent:Agent,data:any) => {
        agent.c2s_ask_npc_shop_item && agent.c2s_ask_npc_shop_item(data);
    },
    ['c2s_use_bagitem']: (agent:Agent,data:any) => {
        agent.c2s_use_bagitem && agent.c2s_use_bagitem(data);
    },
    ['c2s_stop_incense']: (agent:Agent,data:any) => {
        agent.c2s_stop_incense && agent.c2s_stop_incense(data);
    },
    ['c2s_get_lockeritem']: (agent:Agent,data:any) => {
        agent.c2s_get_lockeritem && agent.c2s_get_lockeritem(data);
    },
    ['c2s_update_bagitem']: (agent:Agent,data:any) => {
        agent.c2s_update_bagitem && agent.c2s_update_bagitem(data);
    },
    ['c2s_update_lockeritem']: (agent:Agent,data:any) => {
        agent.c2s_update_lockeritem && agent.c2s_update_lockeritem(data);
    },
    ['c2s_createbang']: (agent:Agent,data:any) => {
        agent.c2s_createbang && agent.c2s_createbang(data);
    },
    ['c2s_operbang']: (agent:Agent,data:any) => {
        agent.c2s_operbang && agent.c2s_operbang(data);
    },
    ['c2s_requestbang']: (agent:Agent,data:any) => {
        agent.c2s_requestbang && agent.c2s_requestbang(data);
    },
    ['c2s_joinbang']: (agent:Agent,data:any) => {
        agent.c2s_joinbang && agent.c2s_joinbang(data);
    },
    ['c2s_leavebang']: (agent:Agent,data:any) => {
        agent.c2s_leavebang && agent.c2s_leavebang(data);
    },
    ['c2s_getbanglist']: (agent:Agent,data:any) => {
        agent.c2s_getbanglist && agent.c2s_getbanglist();
    },
    ['c2s_getbangrequest']: (agent:Agent,data:any) => {
        agent.c2s_getbangrequest && agent.c2s_getbangrequest(data);
    },
    ['c2s_getbanginfo']: (agent:Agent,data:any) => {
        agent.c2s_getbanginfo && agent.c2s_getbanginfo(data);
    },
    ['c2s_searchbang']: (agent:Agent,data:any) => {
        agent.c2s_searchbang && agent.c2s_searchbang(data);
    },
    ['c2s_bang_bid']: (agent:Agent,data:any) => {
        agent.c2s_bang_bid && agent.c2s_bang_bid(data);
    },
    ['c2s_relive_pet']: (agent:Agent,data:any) => {
        agent.c2s_relive_pet && agent.c2s_relive_pet(data);
    },
    ['c2s_wash_petproperty']: (agent:Agent,data:any) => {
        agent.c2s_wash_petproperty && agent.c2s_wash_petproperty(data);
    },
    ['c2s_save_petproperty']: (agent:Agent,data:any) => {
        agent.c2s_save_petproperty && agent.c2s_save_petproperty(data);
    },
    ['c2s_charge_reward']: (agent:Agent,data:any) => {
        agent.c2s_charge_reward && agent.c2s_charge_reward(data);
    },
    ['c2s_hecheng_pet']: (agent:Agent,data:any) => {
        agent.c2s_hecheng_pet && agent.c2s_hecheng_pet(data);
    },
    ['c2s_create_pet']: (agent:Agent,data:any) => {
        agent.c2s_create_pet && agent.c2s_create_pet(data);
    },
    ['c2s_get_petlist']: (agent:Agent,data:any) => {
        agent.c2s_get_petlist && agent.c2s_get_petlist(data);
    },
    ['c2s_change_pet']: (agent:Agent,data:any) => {
        agent.c2s_change_pet && agent.c2s_change_pet(data);
    },
    ['c2s_update_pet']: (agent:Agent,data:any) => {
        agent.c2s_update_pet && agent.c2s_update_pet(data);
    },
    ['c2s_level_reward']: (agent:Agent,data:any) => {
        agent.c2s_level_reward && agent.c2s_level_reward(data);
    },

    ['c2s_del_pet']: (agent:Agent,data:any) => {
        agent.c2s_del_pet && agent.c2s_del_pet(data);
    },
    ['c2s_pet_forgetskill']: (agent:Agent,data:any) => {
        agent.c2s_pet_forgetskill(data);
    },
    ['c2s_pet_lockskill']: (agent:Agent,data:any) => {
        agent.c2s_pet_lockskill(data);
    },
    
    ['c2s_pet_changeSskill']: (agent:Agent,data:any) => {
        agent.c2s_pet_changeSskill && agent.c2s_pet_changeSskill(data);
    },

    ['c2s_creat_equip']: (agent:Agent,data:any) => {
        agent.c2s_creat_equip && agent.c2s_creat_equip(data);
    },
    ['c2s_equip_list']: (agent:Agent,data:any) => {
        agent.c2s_equip_list && agent.c2s_equip_list(data);
    },
    ['c2s_equip_info']: (agent:Agent,data:any) => {
        agent.c2s_equip_info && agent.c2s_equip_info(data);
    },
    ['c2s_next_equip']: (agent:Agent,data:any) => {
        agent.c2s_next_equip && agent.c2s_next_equip(data);
    },
    ['c2s_equip_update']: (agent:Agent,data:any) => {
        agent.c2s_equip_update && agent.c2s_equip_update(data);
    },
    ['c2s_equip_upgrade']: (agent:Agent,data:any) => {
        agent.c2s_equip_upgrade && agent.c2s_equip_upgrade(data);
    },
    ['c2s_equip_inlay']: (agent:Agent,data:any) => {
        agent.c2s_equip_inlay && agent.c2s_equip_inlay(data);
    },
    ['c2s_equip_refine']: (agent:Agent,data:any) => {
        agent.c2s_equip_refine && agent.c2s_equip_refine(data);
    },
    ['c2s_equip_recast']: (agent:Agent,data:any) => {
        agent.c2s_equip_recast && agent.c2s_equip_recast(data);
    },
    ['c2s_xianqi_list']: (agent:Agent,data:any) => {
        agent.c2s_xianqi_list && agent.c2s_xianqi_list(data);
    },
    ['c2s_shenbing_upgrade']: (agent:Agent,data:any) => {
        agent.c2s_shenbing_upgrade && agent.c2s_shenbing_upgrade(data);
    },
    ['c2s_xianqi_upgrade']: (agent:Agent,data:any) => {
        agent.c2s_xianqi_upgrade && agent.c2s_xianqi_upgrade(data);
    },

    ['c2s_btl']: (agent:Agent,data:any) => {
        agent.c2s_btl && agent.c2s_btl(data);
    },

    ['c2s_btl_auto']: (agent:Agent,data:any) => {
        agent.c2s_btl_auto && agent.c2s_btl_auto(data);
    },

    ['c2s_btl_act']: (agent:Agent,data:any) => {
        agent.c2s_btl_act && agent.c2s_btl_act(data);
    },

    ['c2s_mall_buy']: (agent:Agent,data:any) => {
        agent.c2s_mall_buy(data);
    },
    // ['c2s_Get_WX']: (agent) => {
    //     agent.c2s_Get_WX();
    // },

    ['c2s_relive']: (agent:Agent,data:any) => {
        agent.c2s_relive(data);
    },

    ['c2s_changerace']: (agent:Agent,data:any) => {
        agent.c2s_changerace(data);
    },

    ['c2s_changename']: (agent:Agent,data:any) => {
        agent.c2s_changename(data);
    },

    ['c2s_pk']: (agent:Agent,data:any) => {
        agent.c2s_pk(data);
    },

    ['c2s_hongbao_open']: (agent:Agent,data:any) => {
        agent.c2s_hongbao_open(data);
    },
    ['c2s_shuilu_sign']: (agent:Agent,data:any) => {
        agent.c2s_shuilu_sign(data);
    },

    ['c2s_shuilu_unsign']: (agent:Agent,data:any) => {
        agent.c2s_shuilu_unsign(data);
    },

    ['c2s_resetgift']: (agent:Agent,data:any) => {
        agent.c2s_resetgift();
    },
    ['c2s_remunerate']: (agent:Agent,data:any) => {
        agent.c2s_remunerate(data);
    },

    ['c2s_getgift_info']: (agent:Agent,data:any) => {
        agent.c2s_getgift_info();
    },
    ['c2s_shuilu_info']: (agent:Agent,data:any) => {
        agent.c2s_shuilu_info();
    },

    ['c2s_world_reward']:(agent:Agent,data:any)=>{
        agent.c2s_world_reward(data);
    },
    ['c2s_world_reward_list']:(agent:Agent,data:any)=>{
        agent.c2s_world_reward_list();
    },
    ['c2s_world_reward_open']:(agent:Agent,data:any)=>{
        agent.c2s_world_reward_open(data);
    },

    ['c2s_title_change']:(agent:Agent,data:any)=>{
        agent.c2s_title_change(data);
    },

    ['c2s_title_info']:(agent:Agent,data:any)=>{
        agent.c2s_title_info(data);
    },

    ['c2s_linghou_fight']:(agent:Agent,data:any)=>{
        agent.c2s_linghou_fight(data);
    },

    ['c2s_palace_fight']:(agent:Agent,data:any)=>{
        agent.c2s_palace_fight(data);
    },

    ['c2s_palace_agree']:(agent:Agent,data:any)=>{
        agent.c2s_palace_agree(data);
    },

    ['c2s_palace_rolelist']:(agent:Agent,data:any)=>{
        agent.c2s_palace_rolelist(data);
    },
    
    ['c2s_relation_new']:(agent:Agent,data:any)=>{
        agent.c2s_relation_new(data);
    },

    ['c2s_relation_agree']:(agent:Agent,data:any)=>{
        agent.c2s_relation_agree(data);
    },

    ['c2s_relation_List']:(agent:Agent,data:any)=>{
        agent.c2s_relation_List(data);
    },
    
    ['c2s_relation_leave']:(agent:Agent,data:any)=>{
        agent.c2s_relation_leave(data);
    },
    
    ['c2s_relation_add']:(agent:Agent,data:any)=>{
        agent.c2s_relation_add(data);
    },

    ['c2s_relation_reject']:(agent:Agent,data:any)=>{
        agent.c2s_relation_reject(data);
    },

	['c2s_change_role_color']:(agent:Agent,data:any)=>{
		agent.c2s_change_role_color(data);
	},

    ['c2s_scheme_create']:(agent:Agent,data:any)=>{
        agent.c2s_scheme_create(data);
    },
    
    ['c2s_scheme_List']:(agent:Agent,data:any)=>{
        agent.c2s_scheme_List(data);
    },

    ['c2s_scheme_info']:(agent:Agent,data:any)=>{
        agent.c2s_scheme_info(data);
    },
   
    ['c2s_scheme_updateEquip']:(agent:Agent,data:any)=>{
        agent.c2s_scheme_updateEquip(data);
    },

    ['c2s_scheme_addCustomPoint']:(agent:Agent,data:any)=>{
        agent.c2s_scheme_addCustomPoint(data);
    },

    ['c2s_scheme_addXiulianPoint']:(agent:Agent,data:any)=>{
        agent.c2s_scheme_addXiulianPoint(data);
    },

    ['c2s_scheme_resetXiulianPoint']:(agent:Agent,data:any)=>{
        agent.c2s_scheme_resetXiulianPoint(data);
    },

    ['c2s_scheme_changePartner']:(agent:Agent,data:any)=>{
        agent.c2s_scheme_changePartner(data);
    }, 

    ['c2s_scheme_activate']:(agent:Agent,data:any)=>{
        agent.c2s_scheme_activate(data);
    },

    ['c2s_scheme_changeName']:(agent:Agent,data:any)=>{
        agent.c2s_scheme_changeName(data);
    },

    ['c2s_scheme_use']:(agent:Agent,data:any)=>{
        agent.c2s_scheme_use(data);
    },

    ['c2s_bell_msg']:(agent:Agent,data:any)=>{
        agent.c2s_bell_msg(data);
    },

    ['c2s_safepass_msg']:(agent:Agent,data:any)=>{
        agent.c2s_safepass_msg(data);
    },

    ['c2s_petfly_msg']:(agent:Agent,data:any)=>{
        agent.c2s_petfly_msg(data);
    },
    // 坐骑协议
    // 1.骑乘
    ["c2s_ride_msg"]:(agent:Agent,data:any)=>{
        agent.c2s_ride_msg(data);
    },
    // 2.下马
    ["c2s_dismount_msg"]:(agent:Agent,data:any)=>{
        agent.c2s_dismount_msg(data);
    }
}

module.exports = c2s;
// module.exports = (agent) => {
// 	for (const event of Object.keys(c2s)) {
// 		let func = c2s[event];
// 		agent.socket.on(event, buffer => {
// 			let data = null;
// 			if(c2s[event]){
// 				let pack = new packet(event);
// 				data = pack.todata(buffer);
// 			}
// 			try {
// 				func(agent:Agent,data:any);
// 				agent.ping(false);
// 			} catch (error) {
// 				console.error('proto_c func Error Catch!');
// 				console.error(error.stack);
// 			}
// 		});
// 	}
// }
