import Global from "./Global";

export default class ChargeConfig
{
	static shared=new ChargeConfig();
	
	charge_list:any;
	reward_list:any;

	constructor(){
		return;
		this.charge_list=Global.require_ex('./prop_charge');
		this.reward_list=Global.require_ex('./prop_charge_reward.json');
		for (let i = 1; this.charge_list[i]; ++i) {
			this.charge_list.push(this.charge_list[i]);
		}
		for (let i = 1; this.reward_list[i]; ++i) {
			let item:any = {
				id: this.reward_list[i].id,
				money: this.reward_list[i].money,
				reward:[],
			};
			if (this.reward_list[i].gid1 && this.reward_list[i].count1) {
				item.reward.push({
					gid: this.reward_list[i].gid1,
					count: this.reward_list[i].count1
				});
			}
			if (this.reward_list[i].gid2 && this.reward_list[i].count2) {
				item.reward.push({
					gid: this.reward_list[i].gid2,
					count: this.reward_list[i].count2
				});
			}
			this.reward_list.push(item);
		}
	}

}

