import PlayerMgr from "../object/PlayerMgr";
import Battle from "../../game/battle/Battle";

export default class BattleMgr {
	static shared=new BattleMgr();
	battle_seed_id:number=10000;
	battle_list:any;
	constructor() {
		this.battle_list = {};
	}

	createBattle() {
		let battle = new Battle(this.battle_seed_id);
		this.battle_list[this.battle_seed_id] = battle;
		battle.battle_id = this.battle_seed_id;
		this.battle_seed_id++;
		return battle;
	}

	getBattle(battleid:any):any{
		return this.battle_list[battleid];
	}

	destroyBattle(battleid:any) {
		let battle = this.battle_list[battleid];
		if (battle) {
			for (const onlyid in battle.plist) {
				if (battle.plist.hasOwnProperty(onlyid)) {
					let player = PlayerMgr.shared.getPlayerByOnlyId(onlyid);
					if (player) {
						player.exitBattle(battle.isPlayerWin(player.onlyid));
					}
				}
			}
			battle.destroy();
		}
		delete this.battle_list[battleid];
	}

	playerOffline(battleid:any, onlyid:any) {
		let battle = this.battle_list[battleid];
		if (battle) {
			battle.setObjOffline(onlyid);

			if (battle.checkOnlinePlayer() == false) {
				this.destroyBattle(battleid);
			}
		}
	}

	playerBackToBattle(battleid:any, onlyid:any) {
		let battle = this.battle_list[battleid];
		if (battle) {
			battle.setObjOnline(onlyid);
			battle.backToBattle(onlyid);
		}
	}
}