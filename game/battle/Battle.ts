import Global from "../../game/core/Global";
import BattleRole from "./BattleRole";
import BattleMgr from "./BattleMgr";
import PlayerMgr from "../object/PlayerMgr";
import SkillMgr from "../skill/core/SkillMgr";
import Buff from "../skill/core/buff";
import GoodsMgr from "../item/GoodsMgr";
import MonsterMgr from "../core/MonsterMgr";

export default class Battle {
	battle_id:any;
	plist:any;
	petlist:any;
	winteam:any;
	turnlist:any[];
	campA:any;
	campB:any;
	timer:any;
	cur_round:number;
	player_can_oper:boolean;
	monster_group_id:number;
	battle_type:any;
	source:number;
	destroyTimer:any;
	linghouInfo:any;

	constructor(id:any) {
		this.battle_id = id;
		this.plist = {};
		this.petlist = {};
		this.winteam = [];
		this.turnlist = [];

		this.campA = {
			effect: {}, // 1 强化悬刃 2 强化遗患
			broles: [],
		}
		this.campB = {
			effect: {}, // 1 强化悬刃 2 强化遗患
			broles: [],
		}
		this.timer = 0;

		this.cur_round = 0;
		this.player_can_oper = false;
		this.monster_group_id = 0;

		this.battle_type = Global.battleType.Normal;
		this.source = 0; // 战斗来源

		this.destroyTimer = setTimeout(() => {
			BattleMgr.shared.destroyBattle(this.battle_id);
		}, 30 * 60 * 1000);
	}

	destroy() {
		if (this.timer != 0) {
			clearTimeout(this.timer);
			this.timer = 0;
		}
		this.campA.broles = [];
		this.campB.broles = [];
		this.winteam = [];
		this.turnlist = [];
		for (const onlyid in this.plist) {
			if (this.plist.hasOwnProperty(onlyid)) {
				delete this.plist[onlyid];
			}
		}
	}

	setBattleType(bt:any) {
		this.battle_type = bt;
		if (this.battle_type == Global.battleType.LingHou) {
			this.linghouInfo = {
				steal_money: 0,
				wintype: 0, // 0 猴子死了 1 猴子跑了
			}
		}
	}

	setTeam(team1:any, team2:any) {
		let self = this;
		let team2brole = (team:any, teamtype:any) => {
			let t1 = [];
			for (const onlyid in team) {
				if (team.hasOwnProperty(onlyid)) {
					const role = team[onlyid];
					let brole = new BattleRole();
					brole.setRole(role);
					brole.team_id = teamtype;
					brole.battle_id = this.battle_id;
					brole.init();
					t1.push(brole);
					self.plist[onlyid] = brole;
				}
			}
			return t1;
		};
		this.campA.broles = team2brole(team1, 1);
		this.campB.broles = team2brole(team2, 2);
	}

	setTeamBRole(team1:any, team2:any) {
		this.campA.broles = team1;
		this.campB.broles = team2;

		for (const brole of this.campA.broles) {
			brole.battle_id = this.battle_id;
			brole.team_id = 1;

			if (brole.pos == 0) {
				this.petlist[brole.onlyid] = brole;
			}
			if (brole.pos > 0) {
				this.turnlist.push({
					spd: brole.getAttr(Global.attrTypeL1.SPD),
					onlyid: brole.onlyid,
				});
				this.plist[brole.onlyid] = brole;
			}
		}
		for (const brole of this.campB.broles) {
			brole.battle_id = this.battle_id;
			brole.team_id = 2;

			if (brole.pos == 0) {
				this.petlist[brole.onlyid] = brole;
			}
			if (brole.pos > 0) {
				this.turnlist.push({
					spd: brole.getAttr(Global.attrTypeL1.SPD),
					onlyid: brole.onlyid,
				});
				this.plist[brole.onlyid] = brole;
			}
		}
	}

	getTeamData(aorb?:any) {
		let team = this.campA.broles;
		let camp = 1;
		if (aorb == 2 || aorb == 'B' || aorb == 'b') {
			team = this.campB.broles;
			camp = 2;
		}

		let teamdata:any = {};
		teamdata.camp = camp;
		teamdata.list = [];
		for (const brole of team) {
			teamdata.list.push(brole.getData());
		}
		return teamdata;
	}

	
	getAPlayer():any{
		let pid:any = 0;
		for (const onlyid in this.plist) {
			const pinfo = this.plist[onlyid];
			if (pinfo.isPlayer()) {
				pid = onlyid;
				break;
			}
		}
		if (pid != 0) {
			return PlayerMgr.shared.getPlayerByOnlyId(pid);
		}
		return null;
	}

	hasBB():boolean{
		for (const onlyid in this.plist) {
			if (this.plist.hasOwnProperty(onlyid)) {
				const brole = this.plist[onlyid];
				if (!brole.isdead && brole.is_bb) {
					return true;
				}
			}
		}
		return false;
	}

	hasStageEffect(camp:any, effect:any):any{
		let eff = camp.effect[effect];
		if (eff) {
			return eff.hurt;
		}
		return 0;
	}

	setStageEffect(camp:any, effect:any, value:any){
		let eff = camp.effect[effect];
		if (eff) {
			eff.hurt = value;
			eff.role = value;
		}
	}

	getStageEffects():any{
		let ret:any = [];
		let effectinfo:any =(effect:any)=> {
			for (const skillid in effect) {
				if (effect.hasOwnProperty(skillid)) {
					const info = effect[skillid];
					if (info.hurt > 0) {
						ret.push({
							eff: skillid,
							role: info.roleid
						});
					}
				}
			}
		}
		effectinfo(this.campA.effect);
		effectinfo(this.campB.effect);
		return ret;
	}

	checkStageEffect() {
		let checkEffect = (camp:any) => {
			let team = camp.broles;
			if (camp.effect[Global.skillIds.HuaWu] == null) {
				camp.effect[Global.skillIds.HuaWu] = {
					hurt: 0,
					roles: [],
					role: 0
				};
			}
			if (camp.effect[Global.skillIds.XuanRen] == null) {
				camp.effect[Global.skillIds.XuanRen] = {
					hurt: 0,
					roles: [],
					role: 0
				};
			}
			if (camp.effect[Global.skillIds.YiHuan] == null) {
				camp.effect[Global.skillIds.YiHuan] = {
					hurt: 0,
					roles: [],
					role: 0
				};
			}
			for (const brole of team) {
				if (brole.pos > 0) {
					if (brole.hasPassiveSkill(Global.skillIds.HuaWu) && camp.effect[Global.skillIds.HuaWu].roles.indexOf(brole.onlyid) == -1) {
						camp.effect[Global.skillIds.HuaWu].roles.push(brole.onlyid);
						camp.effect[Global.skillIds.HuaWu].hurt = 1;
						camp.effect[Global.skillIds.HuaWu].roleid = brole.onlyid;
						// camp.effect[Global.skillIds.XuanRen] = null;
						// camp.effect[Global.skillIds.YiHuan] = null;
						camp.effect[Global.skillIds.XuanRen].roles.push(brole.onlyid);
						camp.effect[Global.skillIds.YiHuan].roles.push(brole.onlyid);
					}

					// 如果存在化无 就没有 遗患或者悬刃
					if (camp.effect[Global.skillIds.HuaWu].hurt == 0) {
						if ((brole.hasPassiveSkill(Global.skillIds.QiangHuaXuanRen) || brole.hasPassiveSkill(Global.skillIds.XuanRen)) &&
							(camp.effect[Global.skillIds.XuanRen] == null || camp.effect[Global.skillIds.XuanRen].roles.indexOf(brole.onlyid) == -1)) {
							let hurtbase = 100;
							if (brole.hasPassiveSkill(Global.skillIds.QiangHuaXuanRen)) {
								hurtbase = 150;
							}
							let hurt = brole.level * hurtbase;

							camp.effect[Global.skillIds.XuanRen].roles.push(brole.onlyid);
							if (hurt > camp.effect[Global.skillIds.XuanRen].hurt) {
								camp.effect[Global.skillIds.XuanRen].hurt = hurt;
								camp.effect[Global.skillIds.XuanRen].roleid = brole.onlyid;
							}
						}
						if ((brole.hasPassiveSkill(Global.skillIds.QiangHuaYiHuan) || brole.hasPassiveSkill(Global.skillIds.YiHuan)) &&
							(camp.effect[Global.skillIds.YiHuan] == null || camp.effect[Global.skillIds.YiHuan].roles.indexOf(brole.onlyid) == -1)) {
							let hurtbase = 100;
							if (brole.hasPassiveSkill(Global.skillIds.QiangHuaYiHuan)) {
								hurtbase = 150;
							}
							let hurt = brole.level * hurtbase;
							camp.effect[Global.skillIds.YiHuan].roles.push(brole.onlyid);
							if (hurt > camp.effect[Global.skillIds.YiHuan].hurt) {
								camp.effect[Global.skillIds.YiHuan].hurt = hurt;
								camp.effect[Global.skillIds.YiHuan].roleid = brole.onlyid;
							}
						}
					}
				}
			}
		}
		checkEffect(this.campA);
		checkEffect(this.campB);
	}

	delBattleRole(onlyid:any) {
		delete this.plist[onlyid];
		for (let i = 0; i < this.campA.broles.length; i++) {
			const teamrole = this.campA.broles[i];
			if (teamrole.onlyid == onlyid) {
				this.campA.broles.splice(i, 1);
				break;
			}
		}
		for (let i = 0; i < this.campB.broles.length; i++) {
			const teamrole = this.campB.broles[i];
			if (teamrole.onlyid == onlyid) {
				this.campB.broles.splice(i, 1);
				break;
			}
		}

		let index = this.turnlist.indexOf(onlyid);
		if (index != -1) {
			this.turnlist.splice(index, 1);
		}
	}

	playerAction(data:any) {
		let onlyid = data.onlyid;
		let acttype = data.action;
		let actionid = data.actionid;
		let targetid = data.targetid;

		if (this.player_can_oper == false) {
			return;
		}

		let brole = this.plist[onlyid];
		if (!brole) {
			return;
		}
		if (brole.isact) {
			return;
		}


		brole.act = {
			acttype: acttype,
			actionid: actionid,
			target: targetid,
		}
		brole.isact = true;

		this.broadcastCamp(brole.onlyid, 's2c_btl_act', {
			action: acttype, // 1 技能 2 道具 3 召唤
			actionid: actionid, // 随 action变化
			targetid: targetid, //目标 onlyid
			onlyid: onlyid, //行动者id
		});

		if (this.checkAllAct()) {
			let self = this;
			setTimeout(() => {
				self.round();
			}, 0.5 * 1000);
		}
	}

	petEnterEffect(pet_onlyid:any):any{
		let petdata = this.plist[pet_onlyid];
		if (petdata == null) {
			petdata = this.petlist[pet_onlyid];
		}

		if (petdata == null) {
			return null;
		}

		let enterinfo:any = null;
		let initEnterBuff = (skillid:any)=> {
			if (enterinfo == null) {
				enterinfo = {};
				enterinfo.buffs = {};
				enterinfo.act = {};
			}
			if (enterinfo.buffs[skillid] == null) {
				enterinfo.buffs[skillid] = [];
			}
		}

		for (let skillid in petdata.skill_list) {
			if (petdata.skill_list.hasOwnProperty(skillid)) {
				if (skillid == Global.skillIds.RuHuTianYi) {
					initEnterBuff(skillid);
					let skill = SkillMgr.shared.getSkill(skillid);
					let effect = skill.getEffect();
					let buff = new Buff(skill, effect);
					buff.source = pet_onlyid;
					buff.probability = 10000;
					petdata.addBuff(buff);
					enterinfo.buffs[skillid].push(pet_onlyid);

					let owner = this.plist[petdata.own_onlyid];
					if (owner && owner.isdead == false) {
						let buff = new Buff(skill, effect);
						buff.source = pet_onlyid;
						buff.probability = 10000;
						owner.addBuff(buff);
						enterinfo.buffs[skillid].push(petdata.own_onlyid);
					}
				}
				if (this.cur_round != 0) {
					if (skillid == Global.skillIds.YinShen) {
						initEnterBuff(skillid);
						let skill = SkillMgr.shared.getSkill(skillid);
						let effect = skill.getEffect();
						let buff = new Buff(skill, effect);
						buff.source = pet_onlyid;
						buff.probability = 10000;
						petdata.addBuff(buff);
						enterinfo.buffs[skillid].push(pet_onlyid);
					} else if (skillid == Global.skillIds.JiQiBuYi) {
						initEnterBuff(skillid);
						enterinfo.act = skillid;
					}
				}
			}
		}
		return enterinfo;
	}

	onBroleUseItem(targetid:any, itemid:any, tr:any) {
		// let iteminfo = goodsMgr.GetItemInfo(itemid);
		let effect = GoodsMgr.shared.getMedicineEffect(itemid);
		let target = this.plist[targetid];

		let tlist = [];
		let targetact = Global.deepClone(tr);
		targetact.respone = itemid;
		targetact.targetid = targetid;

		let acttype = 0; //Global.actNumType.HP;
		let num = 0;
		if (target && target.isPet() && target.isdead) {
			return null;
		}
		if (effect && target) {
			if (effect.huoyan) {
				let team = this.campA.broles;
				if (target.team_id == 1) {
					team = this.campB.broles;
				}

				for (const onlyid in team) {
					if (team.hasOwnProperty(onlyid)) {
						const brole = team[onlyid];
						let yinshen = brole.getBuffByEffect(Global.EMagicType.YinShen);
						if (yinshen) {
							brole.removeBuff(yinshen.buff_id);
							let tact = Global.deepClone(tr);
							tact.targetid = brole.onlyid;
							tact.isdead = brole.isdead;
							tact.hp = brole.getHp();
							tact.mp = brole.getMp();
							tact.bufflist = brole.getBuffsSkillId();
							tlist.push(tact);
						}
					}
				}
			}
			if (effect.addhp) {
				target.subHp(effect.addhp);
				Global.btlRespone.num = effect.addhp;
				num = effect.addhp;
			}
			if (effect.addmp) {
				target.subMp(effect.addmp);
				if (num == 0) {
					num = effect.addmp;
				}
			}
			if (effect.mulhp) {
				let basehp = target.getAttr(Global.attrTypeL1.MAXHP);
				let addhp = Math.ceil(basehp * effect.mulhp / 100);
				target.subHp(addhp);
				num = addhp;
			}
			if (effect.mulmp) {
				let basemp = target.getAttr(Global.attrTypeL1.MAXMP);
				let addmp = Math.ceil(basemp * effect.mulmp / 100);
				target.subMp(addmp);
				if (num == 0) {
					num = effect.addmp;
				}
			}
			if (effect.addhp != 0 || effect.mulhp) {
				acttype = Global.actNumType.HP;

				if (target.isdead) {
					target.isdead = false;
				}
			}
			if (effect.addmp != 0 || effect.mulmp) {
				if (acttype == 0) {
					acttype = Global.actNumType.MP;
				} else {
					acttype = Global.actNumType.HPMP;
				}
			}
			targetact.num = num;
			targetact.acttype = acttype;
		}

		if (target) {
			targetact.hp = target.getHp();
			targetact.mp = target.getMp();
			targetact.isdead = target.isDead() ? 1 : 0;
			targetact.bufflist = target.getBuffsSkillId();
		}
		tlist.unshift(targetact);
		return tlist;
	}

	onPetEnter(pet_onlyid:any, pos:any):any{
		let summon_pet = this.petlist[pet_onlyid];
		if (summon_pet && summon_pet.isPet() && summon_pet.isdead == false) {
			summon_pet.pos = pos;
			summon_pet.isroundact = true;
			delete this.petlist[pet_onlyid];
			this.plist[pet_onlyid] = summon_pet;

			let owner = this.plist[summon_pet.bindid];
			if (owner) {
				owner.bindid = pet_onlyid;
			}

			return pet_onlyid;
		}
		return 0;
	}

	onPetLeave(pet_onlyid:any):any{
		let pet = this.plist[pet_onlyid];
		if (pet && pet.isPet()) {
			for (let i = 0; i < this.turnlist.length; i++) {
				const turninfo = this.turnlist[i];
				if (turninfo.onlyid == pet_onlyid) {
					this.turnlist.splice(i, 1);
					break;
				}
			}
			pet.pos = -1;

			let owner = this.plist[pet.bindid];
			if (owner) {
				owner.bindid = 0;
			}

			this.petlist[pet_onlyid] = pet;
			delete this.plist[pet_onlyid];
			return pet_onlyid;
		}
		return 0;
	}

	summorBack(actid:any):any{
		let bplayer = this.plist[actid];
		let tpet = this.onPetLeave(bplayer.bindid);
		return tpet;
	}

	actSummor(actid:any, summonid:any):any{
		let bplayer = this.plist[actid];
		let ownpos = bplayer.pos;
		let tpet = this.onPetLeave(bplayer.bindid);
		let bpet = this.onPetEnter(summonid, ownpos + 5);

		return {
			tback_pet: tpet,
			battle_pet: bpet,
		};
	}

	checkAllAct():boolean{
		for (let onlyid in this.plist) {
			if (this.plist.hasOwnProperty(onlyid)) {
				let brole = this.plist[onlyid];
				if ((brole.isPlayer() || brole.isPet()) &&
					brole.pos > 0 &&
					!brole.isdead &&
					!brole.isact &&
					brole.online_state == 1) {
					return false;
				}
			}
		}
		return true;
	}

	checkEnd() {
	}

	// 战斗开始
	begin() {
		for (const t of this.turnlist) {
			let brole = this.plist[t.onlyid];

			if (!brole) {
				continue;
			}

			if (brole.isPet()) {
				this.petEnterEffect(brole.onlyid);
			}
		}
		this.roundBegin();
	}

	// findtype = 0 找同队中 非自己的 随机一个人
	// findtype = 1 找敌队中 随机一个人
	findRandomTeamTarget(onlyid:any, findtype:any = 0) {
		let role = this.plist[onlyid];
		let tid = role.team_id;
		let team = [];
		if (tid == 1) {
			team = this.campA.broles;
		} else if (tid == 2) {
			team = this.campB.broles;
		}

		if (team.length - 1 <= 0) {
			return null;
		}

		let tmpteam = [];
		for (let i = 0, len = team.length; i < len; i++) {
			let trole = team[i];
			if (trole.isdead || trole.hasBuff(Global.EMagicType.Seal)) {
				continue;
			}
			if (findtype == 0 && trole.onlyid == onlyid) {
				continue;
			}
			tmpteam.push(trole);
		}
		if (tmpteam.length <= 0) {
			return null;
		}
		// tmpteam.sort((a, b) => {
		// 	return Math.random() > .4 ? -1 : 1;
		// });
		let random = Math.floor(Global.random(0, tmpteam.length - 1));
		return tmpteam[random];
	}

	// mod == 1 敌人  2 自己人 3 全体
	findRandomTarge(onlyid:any, neednum:any, list:any, mod:any = 1, skill:any = null):any{
		if (list.length == neednum) {
			return list;
		}
		let role = this.plist[onlyid];
		let tid = 0;
		if (role) {
			tid = role.team_id;
		}
		let team = [];
		let enemy_team = [];
		let self_team = [];
		if (tid == 1) {
			enemy_team = this.campB.broles;
			self_team = this.campA.broles;
		} else if (tid == 2) {
			enemy_team = this.campA.broles;
			self_team = this.campB.broles;
		}
		if (mod == 1) {
			team = enemy_team;
		} else if (mod == 2) {
			team = self_team;
		} else if (mod == 3) {
			team = enemy_team.concat(self_team);
		}
		let tmplist = [];
		for (const brole of team) {
			if (brole.pos == 0 || brole.pos == -1) {
				continue;
			}
			if (mod == 1 || mod == 3) {
				// 不能选择自己为目标
				if (brole.onlyid == onlyid) {
					continue;
				}
				// 过滤已死的
				if (brole.isdead) {
					continue;
				}
				// 过滤 隐身的
				if (brole.hasBuff(Global.EMagicType.YinShen)) {
					continue;
				}
			}
			if (mod == 2) {
				if (skill && skill.skill_type != Global.EMagicType.Rrsume) {
					if (brole.isdead) {
						continue;
					}
				}
			}

			let find = list.indexOf(brole.onlyid);
			if (find == -1) {
				tmplist.push(brole);
			}
		}

		if (tmplist.length > 0) {
			if (mod == 2) {
				tmplist.sort((a, b) => {
					return a.spd - b.spd;
				});
			} else {
				tmplist.sort((a, b) => {
					return Math.random() > .4 ? -1 : 1;
				});
			}

			// 优先选择没有中 技能的人。
			for (let index = 0; index < tmplist.length; index++) {
				const tbrole = tmplist[index];
				if (tbrole.hasBuff(Global.EMagicType.Seal)) {
					continue;
				}
				if (skill && skill.skill_type != 0) {
					if (tbrole.hasBuff(skill.skill_type)) {
						continue;
					}
				}
				if (list.length < neednum) {
					list.push(tbrole.onlyid);
				} else {
					break;
				}
			}
			// 补选人数
			if (list.length < neednum) {
				for (let index = 0; index < tmplist.length; index++) {
					const tbrole = tmplist[index];
					if (tbrole.hasBuff(Global.EMagicType.Seal)) {
						continue;
					}
					if (list.length < neednum && list.indexOf(tbrole.onlyid) == -1) {
						list.push(tbrole.onlyid);
					} else {
						break;
					}
				}
			}
		}
		return list;
	}

	checkTeamAllDie(team:any):boolean{
		let alldie = true;
		for (const brole of team) {
			if (brole.pos == 0 || brole.pos == -1) {
				continue;
			}
			if (!brole.isdead) {
				alldie = false;
				break;
			}
		}
		return alldie;
	}

	isSameTeam(onlyidA:any, onlyidB:any):boolean{
		let arole = this.plist[onlyidA];
		let brole = this.plist[onlyidB];
		return arole.team_id == brole.team_id;
	}

	isPlayerWin(onlyid:any):number{
		if (this.winteam.length == 0) {
			return 2;
		}
		return this.winteam.indexOf(onlyid) == -1 ? 0 : 1;
	}

	teamWin(team:any) {
		let t = this.campA.broles;
		if (team == 2) {
			t = this.campB.broles;
		}
		for (const bobj of t) {
			this.winteam.push(bobj.onlyid);
		}

		if (this.battle_type == Global.battleType.LingHou) {
			let player = this.getAPlayer();
			if (player) {
				let money = this.linghouInfo.steal_money;
				let type = this.linghouInfo.wintype;
				if (type == 1) {
					// 猴子跑了
					money = 0;
					if (this.cur_round == 1) {
						money = Global.LingHouRetMoney;
					}
				} else if (type == 0) {
					money = money * 2;
				}
				if (money > 0) {
					player.AddMoney(Global.goldKind.Money, money, '天降灵猴');
				}
				if (money > 500000) {
					PlayerMgr.shared.broadcast('s2c_game_chat', {
						scale: 3,
						msg: `${player.name} 教训灵猴，获得了 ${money} 银两`,
						name: '',
						resid: 0,
						teamid: 0,
					});
				}
			}
		}
		BattleMgr.shared.destroyBattle(this.battle_id);
	}

	// 流局
	draw() {
		this.broadcast('s2c_btl_end', {
			btlid: this.battle_id,
			result: false,
		});
		BattleMgr.shared.destroyBattle(this.battle_id);
	}

	// 重新确定移速顺序
	reTurnList() {
		let turnlist = [];
		for (const onlyid in this.plist) {
			if (this.plist.hasOwnProperty(onlyid)) {
				const brole = this.plist[onlyid];
				turnlist.push({
					spd: brole.getAttr(Global.attrTypeL1.SPD),
					onlyid: brole.onlyid,
				})
			}
		}
		turnlist.sort((a, b) => {
			return b.spd - a.spd;
		});

		this.turnlist = turnlist;
	}

	checkWin() {
		if (this.checkTeamAllDie(this.campA.broles)) {
			return 2;
		}
		if (this.checkTeamAllDie(this.campB.broles)) {
			return 1;
		}
		return 0;
	}

	roundBegin() {
		// console.log('round beign');
		if (this.timer != 0) {
			clearTimeout(this.timer);
			this.timer = 0;
		}
		let winteam = this.checkWin();
		if (winteam != 0) {
			// console.log('battle end2');
			this.teamWin(winteam);
			return;
		}

		this.cur_round++;
		if (this.cur_round >= 20) {
			this.draw();
			return;
		}
		this.player_can_oper = true;
		// 先处理 buff
		let btlAct = [];
		for (const t of this.turnlist) {
			let brole = this.plist[t.onlyid];

			if (!brole || brole.isdead) {
				continue;
			}

			if (brole.isPet()) {

			}

			let addhp = 0;
			let bufflist = brole.getBuffList();
			for (let i = 0; i < bufflist.length; i++) {
				const buff = bufflist[i];
				addhp += buff.active(brole);
			}
			let act:any = {};
			act.targetid = brole.onlyid;
			act.acttype = addhp > 0 ? 2 : 1;
			act.num = addhp; // 对应acttype 伤害量 治疗量
			act.respone = 0; // 0 无响应，1 防御 2闪避 3暴击
			act.isdead = brole.isdead; // 0 未死亡 1 死亡
			act.hp = brole.getHp(); // 剩余生命值百分比
			act.mp = brole.getMp(); // 剩余法力值百分比
			act.bufflist = brole.getBuffsSkillId(); // buff列表
			act.param = 0;
			btlAct.push(act);
		}

		this.reTurnList();
		this.checkStageEffect();
		let eff = this.getStageEffects();

		this.broadcast('s2c_btl_roundbegin', {
			act: btlAct,
			effect: eff,
		});

		// 被buff烫死
		winteam = this.checkWin();

		if (winteam != 0) {
			console.log('battle end1');
			setTimeout(() => {
				this.teamWin(winteam);
			}, 5 * 1000);
			return;
		}

		let self = this;
		let t = 31;
		if (this.checkAllAct()) {
			t = 4;
		}
		this.timer = setTimeout(() => {
			self.round();
		}, t * 1000);

	}

	// 一回合开始
	round() {
		if (this.timer != 0) {
			clearTimeout(this.timer);
			this.timer = 0;
		}
		this.player_can_oper = false;
		let roundinfo:any = {};
		roundinfo.round = this.cur_round;
		roundinfo.acts = [];

		let replace_list:any = {};

		let tr:any = {
			targetid: 0, // 目标onlyid
			acttype: 0, // 1伤害 2治疗 3buff
			num: 0, // 对应acttype 伤害量 治疗量
			respone: 0, // 0 无响应，1 防御 2 闪避 3 暴击
			isdead: 0, // 0 未死亡 1 死亡
			hp: 0, // 剩余生命值百分比
			mp: 0, // 剩余法力值百分比
			bufflist: [], // buff列表
			param: 0,
			actaffix: '',
		};

		let protect_list:any = {}
		// 整理保护列表
		for (const t of this.turnlist) {
			let brole = this.plist[t.onlyid];
			if (brole.act && brole.act.acttype == Global.actType.Protect) {
				let target_id = brole.act.target;
				if (protect_list[target_id] == null) {
					protect_list[target_id] = brole.onlyid;
				}
			}
		}

		let addtime = 0;
		// let 
		// for (const t of this.turnlist) {
		for (let turnindex = 0; turnindex < this.turnlist.length; turnindex++) {
			let t = this.turnlist[turnindex];
			// 出手的角色
			let brole = this.plist[t.onlyid];
			if (!brole || brole.beCache) {
				continue;
			}
			if (brole.isdead) {
				brole.isroundact = true;
				continue;
			}
			if (brole.hasBuff(Global.EMagicType.Seal) || brole.hasBuff(Global.EMagicType.Sleep)) {
				continue;
			}
			if (brole.isPartner() && this.hasBB()) {
				continue;
			}

			// 修正内容
			if (brole.act.acttype == 0) {
				brole.act.acttype = Global.actType.Skill;
			}
			if (brole.hasBuff(Global.EMagicType.Chaos)) {
				brole.act.acttype = Global.actType.Skill;
			}
			if (this.battle_type == Global.battleType.LingHou && brole.isMonster()) {
				let player = this.getAPlayer();
				if (player && player.money < Global.lingHouMinMoney) {
					brole.act.acttype = Global.actType.RunAway;
				}
				let r = Global.random(0, 10000);
				if (r < 3500) {
					brole.act.acttype = Global.actType.RunAway;
				}
			}

			// 不是防御 都要破除隐身状态
			if (brole.act.acttype != Global.actType.Skill && brole.act.actionid != 0 && brole.act.actionid != Global.normalDefSkill) {
				let yinshen = brole.getBuffByEffect(Global.EMagicType.YinShen);
				if (yinshen) {
					brole.removeBuff(yinshen.buff_id);
				}
			}

			let btlAction:any = {};
			btlAction.actid = t.onlyid;
			btlAction.action = brole.act.acttype;
			let actbef:any = {};
			btlAction.act = [];
			brole.isroundact = true;

			let runaway = false;
			if (brole.act.acttype == Global.actType.RunAway) {
				// 逃跑
				btlAction.actionid = 0;
				let r = Global.random(1, 10000);
				if (this.battle_type == Global.battleType.ShuiLu) {
					r = 10001;
				}
				if (this.battle_type == Global.battleType.LingHou) {
					r = 0;
					this.linghouInfo.wintype = 1;
				}
				if (r < 8000) {
					runaway = true;
					btlAction.actionid = 1;
					let self = this;
					let winteamid = brole.team_id == 1 ? 2 : 1;
					setTimeout(() => {
						self.teamWin(winteamid);
					}, (roundinfo.acts.length + 1) * 1.8 * 1000);
				}
			} else if (brole.act.acttype == Global.actType.Item) {
				if (brole.hasBuff(Global.EMagicType.Forget) || brole.hasBuff(Global.EMagicType.Chaos)) {
					continue;
				}

				let itemid = brole.act.actionid;
				let target_id = brole.act.target;

				let targetact = this.onBroleUseItem(target_id, itemid, tr);
				if (targetact.length > 0) {
					btlAction.act = btlAction.act.concat(targetact);
					let player = PlayerMgr.shared.getPlayerByOnlyId(brole.onlyid);
					if (player) {
						player.AddBagItem(itemid, -1, false);
					}
				}
			} else if (brole.act.acttype == Global.actType.Catch) {
				let player = PlayerMgr.shared.getPlayerByOnlyId(brole.onlyid);
				if (player) {
					let target_id = brole.act.target;
					let trole = this.plist[target_id];
					let targetact = Global.deepClone(tr);
					targetact.targetid = target_id;
					targetact.respone = Global.btlRespone.NoCatch;
					while (true) {
						if (trole.is_bb == false) {
							targetact.respone = Global.btlRespone.NoCatch;
							break;
						}
						let rand = Global.random(0, 10000);
						if (rand > 6000) {
							targetact.respone = Global.btlRespone.CatchFail;
							break;
						}
						targetact.respone = Global.btlRespone.Catched;
						let mondata = MonsterMgr.shared.getMonsterData(trole.dataid);
						player.createPet({
							petid: mondata.petid
						});
						break
					}
					targetact.hp = trole.getHp();
					targetact.mp = trole.getMp();
					targetact.isdead = trole.isDead() ? 1 : 0;
					targetact.bufflist = trole.getBuffsSkillId();
					btlAction.act.push(targetact);
					if (targetact.respone == Global.btlRespone.Catched) {
						this.delBattleRole(target_id);
					}
				}
			} else if (brole.act.acttype == Global.actType.Protect) {
				// 保护
				let yinshen = brole.getBuffByEffect(Global.EMagicType.YinShen);
				if (yinshen) {
					brole.removeBuff(yinshen.buff_id);
				}
			} else if (brole.act.acttype == Global.actType.Summon) {
				// 召唤
				let petid = brole.act.actionid;
				let summorInfo = this.actSummor(brole.onlyid, petid);
				let targetact = Global.deepClone(tr);
				targetact.targetid = summorInfo.tback_pet;
				targetact.respone = Global.btlRespone.SummonBack;
				btlAction.act.push(targetact);

				let sumpet = this.plist[summorInfo.battle_pet];
				let targetact2 = Global.deepClone(tr);
				if (sumpet == null) {
					targetact2.respone = Global.btlRespone.SummonFaild;
					btlAction.act.push(targetact2);
				} else {
					targetact2.respone = Global.btlRespone.Summon;
					targetact2.targetid = sumpet.onlyid;
					targetact2.num = sumpet.pos;
					targetact2.hp = sumpet.getHp();
					targetact2.mp = sumpet.getMp();
					targetact2.isdead = sumpet.isDead() ? 1 : 0;
					targetact2.bufflist = sumpet.getBuffsSkillId();
					let sumenterinfo = this.petEnterEffect(sumpet.onlyid);
					if (sumenterinfo) {
						let actaffix:any = {}
						actaffix.petenter = sumenterinfo;
						targetact2.actaffix = JSON.stringify(actaffix);
						if (sumenterinfo.act == Global.skillIds.JiQiBuYi) {
							sumpet.act.acttype = Global.actType.Skill;
							sumpet.act.skill = Global.skillIds.NormalAtkSkill;
							sumpet.act.actionid = Global.skillIds.NormalAtkSkill;
							this.turnlist.splice(turnindex + 1, 0, { spd: sumpet.getAttr(Global.attrTypeL1.SPD), onlyid: sumpet.onlyid });
						}
					}
					btlAction.act.push(targetact2);
					replace_list[summorInfo.tback_pet] = sumpet.onlyid;
				}

			} else if (brole.act.acttype == Global.actType.SummonBack) {
				// 召还
				let backid = this.summorBack(brole.onlyid);
				let targetact = Global.deepClone(tr);
				targetact.targetid = backid;
				targetact.respone = Global.btlRespone.SummonBack;
				btlAction.act.push(targetact);
			} else if (brole.act.acttype == Global.actType.Skill) {
				// 确认技能
				let skillid = brole.act.actionid;
				if (skillid == null || skillid == 0) {
					skillid = brole.getAiSkill();
					brole.act.actionid = skillid;
				}

				if (this.battle_type == Global.battleType.LingHou && brole.isMonster()) {
					skillid = Global.skillIds.StealMoney;
				}

				// 如果中混乱 攻击改为普通攻击
				if (brole.hasBuff(Global.EMagicType.Chaos)) {
					skillid = Global.normalAtkSkill;
				}

				let skillinfo = brole.getSkillInfo(skillid);
				if (skillid != Global.normalAtkSkill && skillid != Global.normalDefSkill) {
					if (skillinfo == null || skillinfo.cooldown > 0) {
						skillid = Global.normalAtkSkill;
					}
				}

				let skill = SkillMgr.shared.getSkill(skillid);
				if (skill == null) {
					continue;
				}

				if (skillid == Global.normalDefSkill) {
					continue;
				}

				if (skill.limit_round > 0 && this.cur_round < skill.limit_round) {
					skillid = Global.normalAtkSkill;
					skill = SkillMgr.shared.getSkill(skillid);
					brole.act.actionid = skillid;
				}
				if (skill.limit_times > 0) {
					if (brole.used_skill[skillid] >= skill.limit_times) {
						skillid = Global.normalAtkSkill;
						skill = SkillMgr.shared.getSkill(skillid);
						brole.act.actionid = skillid;
					}
					if (skill.limit_times > 0) {
						brole.addLimitSkill(skillid);
					}
				}

				btlAction.actionid = skillid;
				if (brole.last_skill != skillid) {
					brole.last_skill = skillid;
					if (brole.source) {
						brole.source.default_btl_skill = skillid;
					}
				}

				let yinshen = brole.getBuffByEffect(Global.EMagicType.YinShen);
				if (yinshen) {
					brole.removeBuff(yinshen.buff_id);
				}

				// 是否可以使用 
				// 怪物 伙伴 忽略蓝耗
				// 兵临城下 必须计算蓝耗
				// 普通战斗不计算蓝耗
				let nexted = false;
				let forceMpSkill = [Global.skillIds.BingLinChengXia, Global.skillIds.TianMoJieTi, Global.skillIds.FenGuangHuaYing, Global.skillIds.QingMianLiaoYa, Global.skillIds.XiaoLouYeKu, Global.skillIds.HighTianMoJieTi, Global.skillIds.HighFenGuangHuaYing, Global.skillIds.HighQingMianLiaoYa, Global.skillIds.HighXiaoLouYeKu];
				while (true) {
					if (brole.isMonster() || brole.isPartner()) {
						break;
					}

					if (this.battle_type == Global.battleType.Normal && forceMpSkill.indexOf(skillid) == -1) {
						break;
					}

					let canuse = skill.useSkill(brole);
					if (canuse != 0) {
						brole.send('s2c_notice', {
							strRichText: canuse
						});
						nexted = true;
					}
					break;
				}
				if (nexted) {
					continue;
				}

				// 落日融金 血海深仇 技能计算
				let deadnum = 0;
				if (skillid == Global.skillIds.LuoRiRongJin || skillid == Global.skillIds.XueHaiShenChou) {
					let n = 0;
					let tid = brole.team_id;
					let team = [];
					if (tid == 1) {
						team = this.campA.broles;
					} else if (tid == 2) {
						team = this.campB.broles;
					}
					for (const r of team) {
						if ((r.isPlayer() || r.isPartner()) && r.isdead) {
							n++;
						}
					}
					deadnum = n;
				}

				// 技能效果
				let skilleffect = skill.getEffect({
					level: brole.level,
					relive: brole.relive,
					qinmi: brole.qinmi,
					profic: brole.getSkillProfic(skillid),
					atk: brole.getAttr(Global.attrTypeL1.ATK),
					deadnum: deadnum,
					maxmp: brole.getAttr(Global.attrTypeL1.MAXMP),
				});

				// 技能冷却
				if (skill.cooldown > 0) {
					let skillinfo = brole.getSkillInfo(skillid);
					if (skillinfo) {
						skillinfo.cooldown = skill.cooldown;
					}
				}

				let target_num = skilleffect.cnt;
				let tlist = [];

				// 确定主目标
				let main_target_id = brole.act.target;
				let main_role = this.plist[main_target_id];

				if (!brole.hasBuff(Global.EMagicType.Chaos)) {
					if (main_role && !main_role.isdead && !main_role.hasBuff(Global.EMagicType.YinShen)) {
						tlist.push(main_target_id);
					}
				}

				let fenlie = false;
				// 如果中混乱  改为 全体目标
				if (brole.hasBuff(Global.EMagicType.Chaos)) {
					// 判断混乱后 天罡战气 技能
					if (brole.hasPassiveSkill(Global.skillIds.TianGangZhanQi)) {
						tlist = this.findRandomTarge(brole.onlyid, target_num, tlist, 1, skill);
					} else {
						tlist = this.findRandomTarge(brole.onlyid, target_num, tlist, 3);
					}
				} else {
					// 如果是子虚乌有 就直接放入 目标和自己
					if (skillid == Global.skillIds.ZiXuWuYou) {
						tlist.push(brole.onlyid);
					} else {
						if (SkillMgr.shared.isSelfBuffSkill(skillid)) {
							tlist = this.findRandomTarge(brole.onlyid, target_num, tlist, 2, skill);
						} else {
							if (skillid == Global.normalAtkSkill) {
								fenlie = brole.fenLie();
								if (fenlie) {
									target_num += 1;
								}
							}
							tlist = this.findRandomTarge(brole.onlyid, target_num, tlist, 1, skill);
						}
					}
				}

				if (tlist.length == 0) {
					continue;
				}


				// 计算悬刃 遗患 等 出手前技能
				// btlAction.actbef = {};
				if (skillid != Global.skillIds.NormalAtkSkill && skillid != Global.skillIds.StealMoney) {
					let camp = this.campA;
					if (brole.team_id == 1) {
						camp = this.campB;
					}
					let huawu = this.hasStageEffect(camp, Global.skillIds.HuaWu);
					if (huawu > 0) {
						this.setStageEffect(camp, Global.skillIds.HuaWu, 0);
						actbef.huawu = true;
						btlAction.actbef = JSON.stringify(actbef);
						btlAction.act = [];
						roundinfo.acts.push(btlAction);
						continue;
					}

					let xuanren_hurt = this.hasStageEffect(camp, Global.skillIds.XuanRen);
					if (xuanren_hurt > 0) {
						this.setStageEffect(camp, Global.skillIds.XuanRen, 0);
						brole.subHp(-xuanren_hurt);
						actbef.xuanren = xuanren_hurt;
					}
					let yihuan_hurt = this.hasStageEffect(camp, Global.skillIds.YiHuan);
					if (yihuan_hurt > 0) {
						this.setStageEffect(camp, Global.skillIds.YiHuan, 0);
						brole.subMp(-yihuan_hurt);
						actbef.yihuan = yihuan_hurt;
					}

					if (brole.isdead) {
						actbef.hp = brole.getHp();
						actbef.mp = brole.getMp();
						actbef.isdead = brole.isDead() ? 1 : 0;
						btlAction.actbef = JSON.stringify(actbef);
						btlAction.act = [];
						roundinfo.acts.push(btlAction);
						continue;
					}
				}

				// 吸血池
				let hppool = [];

				let tgs = [];
				let bmingzhong = brole.getAttr(Global.attrTypeL1.PMINGZHONG) + 80;
				let actaffix:any = {} // 被攻击者后续
				let fenhuatimes = 0;
				for (let trindex = 0; trindex < tlist.length; trindex++) {
					let troleid = tlist[trindex];
					// for (const troleid of tlist) {
					let trole = this.plist[troleid];
					if (trole == null) {
						continue;
					}
					let ntr = Global.deepClone(tr);
					ntr.targetid = troleid;
					tgs.push(ntr);

					// 封印状态
					if (trole.hasBuff(Global.EMagicType.Seal)) {
						ntr.hp = trole.getHp();
						ntr.mp = trole.getMp();
						ntr.isdead = trole.isDead() ? 1 : 0;
						if (skill.skill_type == Global.EMagicType.Seal && skilleffect.round > 1) {
							trole.checkReplaceBuffRound(skillid, skilleffect.round);
						}
						ntr.bufflist = trole.getBuffsSkillId();
						continue;
					}
					let sattr = Global.skillTypeStrengthen[skill.skill_type] || 0;
					let dattr = Global.SKillTypeKangXing[skill.skill_type] || 0;
					let sattrnum = brole.getAttr(sattr); // 忽视
					let dattrnum = trole.getAttr(dattr); // 抗性
					let subattrnum = sattrnum - dattrnum;

					// 判断控制技能闪避
					if (SkillMgr.shared.isKongzhiSkill(skillid)) {
						let t = (subattrnum + 110) * 100;
						let rand = Global.random(0, 10000);
						if (t <= rand) {
							ntr.respone = Global.btlRespone.Dodge;
							ntr.hp = trole.getHp();
							ntr.mp = trole.getMp();
							ntr.isdead = trole.isDead() ? 1 : 0;
							ntr.bufflist = trole.getBuffsSkillId();
							continue;
						}
					}

					// 判断闪避命中
					if (SkillMgr.shared.isCanShanbiSkill(skillid)) {
						let shanbi = trole.getAttr(Global.attrTypeL1.PSHANBI);
						let rand = Global.random(0, 10000);
						if (rand > (bmingzhong - shanbi) * 100) {
							ntr.respone = Global.btlRespone.Dodge;
							ntr.hp = trole.getHp();
							ntr.mp = trole.getMp();
							ntr.isdead = trole.isDead() ? 1 : 0;
							ntr.bufflist = trole.getBuffsSkillId();
							continue;
						}
					}
					// 伤害
					let respone = Global.btlRespone.NoThing;
					let hurt = skilleffect.hurt;
					if (hurt == 0) {
						if (skilleffect.hurtpre != 0) {
							hurt = Math.floor(trole.getHp() * skilleffect.hurtpre / 100);
						}
					}
					// 狂暴率
					let kbpre = brole.getKuangBaoPre(skill.skill_type);
					if (hurt > 0 && kbpre > 0) {
						let randkb = Global.random(0, 10000);
						if (randkb < kbpre * 100) {
							let kbstr = brole.getKuangBaoStr(skill.skill_type);
							hurt = Math.floor(hurt * (1.5 + kbstr / 100));
							respone = Global.btlRespone.CriticalHit;
						}
					}

					// 没有混乱的时候 攻击自己人 掉1点血 非buff技能
					if (SkillMgr.shared.isAtkSkill(skillid) && !brole.hasBuff(Global.EMagicType.Chaos) && this.isSameTeam(brole.onlyid, trole.onlyid)) {
						hurt = 1;
					}

					if (hurt > 0) {
						// 查看保护
						let protect = false;
						let protect_id = protect_list[trole.onlyid];
						while (protect_id != null && skillid == Global.normalAtkSkill) {
							let protecter = this.plist[protect_id];
							if (protecter == null || protecter.isdead) {
								break;
							}

							let thurt = hurt;
							let pfpre = brole.getPoFangPre();
							let randkb = Global.random(0, 10000);
							if (randkb < pfpre * 100) {
								let pfstr = brole.getPoFang();
								let kwl = protecter.getKangWuLi();
								respone = Global.btlRespone.PoFang;
								thurt = Math.floor(thurt * (1 + (pfstr * 3 - kwl * 2) / 100));
							}

							if (thurt <= 0) {
								thurt = 1;
							}
							protecter.subHp(-thurt);
							protect = true;
							actaffix.protect = {
								roleid: protect_id,
								hurt: -thurt,
								isdead: protecter.isdead,
								hp: protecter.getHp(),
								mp: protecter.getMp(),
								respone: respone,
							};

							if (thurt > 0) {
								hppool.push(thurt * 3);
							}

							hurt = 0;
							break;
						}
						if (protect) {
							// 被保护了
							ntr.acttype = Global.actNumType.Hurt;
							ntr.respone = Global.btlRespone.Protect;
							ntr.num = hurt;
							// ntr.actaffix = JSON.stringify(protect);
						} else {
							let thurt = hurt;
							// 破防
							if (skillid == Global.skillIds.NormalAtkSkill) {
								let pf = brole.getPoFang();
								if (pf > 0) {
									sattrnum += pf;
								}
								thurt = Math.floor(thurt * (1 + (sattrnum * 3 - dattrnum) / 100));
							} else {
								thurt = Math.floor(thurt * (1 + (sattrnum * 3 - dattrnum * 2) / 100));
							}
							// 五行
							// 震慑不算五行
							if (skill.skill_type == Global.EMagicType.Frighten) {

							} else {
								let hurtWxPre = 0;
								for (const wuxing in Global.wuXingStrengthen) {
									if (Global.wuXingStrengthen.hasOwnProperty(wuxing)) {
										const kwuxing = Global.wuXingStrengthen[wuxing];
										let bWx = brole.getAttr(wuxing);
										let tWx = trole.getAttr(kwuxing);
										hurtWxPre += (bWx / 100) * (tWx / 100) * 0.4;
									}
								}
								for (const wuxing in Global.WuXingKeStrengthen) {
									if (Global.WuXingKeStrengthen.hasOwnProperty(wuxing)) {
										const kwuxing = Global.WuXingKeStrengthen[wuxing];
										let bWx = brole.getAttr(wuxing);
										let tWx = trole.getAttr(kwuxing);
										hurtWxPre += (bWx / 10) * (tWx / 100) * 0.4;
									}
								}
								thurt = Math.floor(thurt * (1 + hurtWxPre));
							}
							// 判断防御
							if (thurt > 0 && trole.act.acttype == Global.actType.Skill &&
								brole.act.actionid == Global.normalAtkSkill && trole.act.actionid == Global.normalDefSkill &&
								!trole.hasBuff(Global.EMagicType.Chaos)) {
								thurt = Math.floor(thurt * 0.5);
								ntr.respone = Global.btlRespone.Defense;
							}

							if (thurt <= 0) {
								thurt = 1;
							}
							if (thurt > 0) {
								// 如果中了睡眠
								if (trole.hasBuff(Global.EMagicType.Sleep)) {
									// 清理睡眠
									trole.cleanBuff(Global.EMagicType.Sleep);
									if (trole.isroundact == false) {
										let bindex = this.turnlist.indexOf(brole.onlyid);
										let tindex = this.turnlist.indexOf(trole.onlyid);
										if (tindex < bindex) {
											this.turnlist.splice(bindex + 1, 0, trole.onlyid);
											this.turnlist.splice(tindex, 1);
										}
									}
								}
							}

							trole.subHp(-thurt);
							if (skillid == Global.skillIds.NormalAtkSkill && thurt > 0) {
								let lianji = brole.getLianji();
								if (lianji > 0) {
									actaffix.lianji = {
										hurt: [],
									};

									actaffix.lianji.hurt.push(-thurt);

									let lianjihurt = thurt;
									for (let i = 0; i < lianji; i++) {
										lianjihurt = Math.ceil(lianjihurt * 0.5);
										actaffix.lianji.hurt.push(-lianjihurt);
										trole.subHp(-lianjihurt);
									}
									addtime += lianji * 0.16;
								}

								let geshan = brole.geShan();
								if (geshan > 0) {
									let trole2 = this.findRandomTeamTarget(trole.onlyid);
									if (trole2) {
										let atk = brole.getAttr(Global.attrTypeL1.ATK);
										let hurt = Math.floor(atk * geshan / 100);
										trole2.subHp(-hurt);
										actaffix.geshan = {
											roleid: trole2.onlyid,
											respone: respone,
											num: -hurt,
											hp: trole2.getHp(),
											mp: trole2.getMp(),
											isdead: trole2.isdead ? 1 : 0,
										};
										addtime += 0.8;
									}
								}
							}


							ntr.acttype = Global.actNumType.Hurt;
							ntr.respone = respone;
							ntr.num = -thurt;

							if (thurt > 0) {
								hppool.push(thurt * 3);
							}

							// 天降灵猴 
							if (skillid == Global.skillIds.StealMoney) {
								let player = this.getAPlayer();
								if (player) {
									let stealmoney = skilleffect.money;
									if (stealmoney > player.money) {
										stealmoney = player.money;
									}
									this.linghouInfo.steal_money = stealmoney;
									player.AddMoney(Global.goldKind.Money, -stealmoney, '天降灵猴偷走');
									// player.send('s2c_notice', {
									// 	strRichText: `灵猴偷走${stealmoney}银两`
									// });
								}
							}

							hurt = thurt;
						}
					}

					// 治疗
					let hp = skilleffect.hp;
					if (hp > 0) {
						trole.subHp(hp);
						ntr.acttype = Global.actNumType.HP;
						ntr.num = hp;
					}

					let smppre = skilleffect.smppre;
					if (smppre > 0) {
						let smp = -Math.ceil(trole.getMp() * smppre / 100);
						trole.subMp(smp);
					}

					let hpper = skilleffect.hppre;
					if (hpper > 0) {
						let maxhp = trole.getAttr(Global.attrTypeL1.MAXHP);
						let addhp = maxhp * hpper / 100;
						trole.subHp(addhp);
						ntr.acttype = Global.actNumType.HP;
						ntr.num = addhp;
					}

					let mpper = skilleffect.mppre;
					if (mpper > 0) {
						let maxmp = trole.getAttr(Global.attrTypeL1.MAXMP);
						let addmp = maxmp * mpper / 100;
						trole.subMp(addmp);
					}

					// 处理buff
					if (skilleffect.round > 0) {
						let mingzhong = 10000;
						// 抗性计算
						if (SkillMgr.shared.isAtkSkill(skillid)) {
							let sattr = Global.skillTypeStrengthen[skill.skill_type];
							let dattr = Global.SKillTypeKangXing[skill.skill_type];
							let sattrnum = brole.getAttr(sattr);
							let tattrnum = trole.getAttr(dattr);
							let attrnum = (sattrnum - tattrnum + 100) * 100;
							let r = Global.random(0, 10000);
							if (r < attrnum) {
								mingzhong = attrnum;
							} else {
								mingzhong = 0;
							}
						}

						if (mingzhong > 0) {
							let buffeffect = Global.deepClone(skilleffect);
							buffeffect.hurt = hurt;
							let buff = new Buff(skill, buffeffect);
							buff.source = brole.onlyid;
							buff.probability = mingzhong;
							trole.addBuff(buff);
						}
					}

					if (trole.isDead() == false) {
						// 修正普通攻击属性   混乱 封印
						let fix_atk_skill = 0;
						if (skillid == Global.normalAtkSkill) {
							let fixskill = null;
							if (brole.hasPassiveSkill(Global.skillIds.HunLuan)) {
								fixskill = SkillMgr.shared.getSkill(Global.skillIds.HunLuan);
							}
							if (brole.hasPassiveSkill(Global.skillIds.FengYin)) {
								fixskill = SkillMgr.shared.getSkill(Global.skillIds.FengYin);
							}
							if (fixskill) {
								let fixeffect = fixskill.getEffect({ level: brole.level, relive: brole.relive, qinmi: brole.qinmi });
								if (fixeffect != null) {
									fix_atk_skill = fixeffect;
								}
							}
						}

						if (fix_atk_skill != 0) {
							let buffskill = SkillMgr.shared.getSkill(fix_atk_skill);
							let buffskilleffect = buffskill.getEffect({});
							buffskilleffect.round = 1;
							let buff = new Buff(buffskill, buffskilleffect);
							buff.source = brole.onlyid;
							buff.probability = 10000;
							trole.addBuff(buff);
						}
					}

					let isdead = trole.isDead();
					ntr.hp = trole.getHp();
					ntr.mp = trole.getMp();
					ntr.isdead = isdead ? 1 : 0;
					ntr.bufflist = trole.getBuffsSkillId();
					if (isdead) {
						if (trole.isPet()) {
							if (trole.niepan()) {
								actaffix.niepan = {
									hp: trole.getHp(),
									mp: trole.getMp(),
									bufflist: [],
								}
								addtime += 2;
							} else {
								// 设置 死亡宠物不可被召唤
								// trole.pos = -1;
								let ppos = trole.pos;
								this.onPetLeave(trole.onlyid);
								// 寻找闪现宠物
								for (const oid in this.petlist) {
									const petbrole = this.petlist[oid];
									if (petbrole.isdead || oid == trole.onlyid) {
										continue;
									}

									if (petbrole.pos != -1 && petbrole.own_onlyid == trole.own_onlyid) {
										let shanxian_ret = petbrole.shanXian();
										// 没闪现，继续找闪现宠物
										if (shanxian_ret == 1) {
											continue;
										}
										// 有闪现没出来，跳出闪现逻辑
										if (shanxian_ret == 2) {
											break;
										}
										// 成功闪现
										if (shanxian_ret == 0) {
											let petid = this.onPetEnter(petbrole.onlyid, ppos);
											if (petid > 0) {
												let petenter = this.petEnterEffect(oid);
												actaffix.shanxian = {
													petoid: petid,
													hp: petbrole.getHp(),
													mp: petbrole.getMp(),
													pos: ppos,
													bufflist: petbrole.getBuffsSkillId(),
												};
												actaffix.petenter = petenter;

												if (petenter && petenter.act == Global.skillIds.JiQiBuYi) {
													let shanxianpet = this.plist[petid];
													if (shanxianpet) {
														shanxianpet.act.acttype = Global.actType.Skill;
														shanxianpet.act.skill = Global.skillIds.NormalAtkSkill;
														shanxianpet.act.actionid = Global.skillIds.NormalAtkSkill;
														this.turnlist.splice(turnindex + 1, 0, { spd: shanxianpet.getAttr(Global.attrTypeL1.SPD), onlyid: shanxianpet.onlyid });
													}
												}
												break;
											}
										}
									}
								}
							}
						}
						if (brole.fenhua()) {
							let trole2 = this.findRandomTeamTarget(trole.onlyid);
							if (trole2 && trindex == tlist.length - 1 && fenhuatimes < 3) {
								tlist.push(trole2.onlyid);
								fenhuatimes++;
							}
						}
					}

					ntr.actaffix = JSON.stringify(actaffix);
					// tgs.push(ntr);
				}

				// 吸血
				let aihp = skilleffect.aihp;
				if (aihp > 0) {
					// 智能加血，给队伍中血量最少的 几个人 加血。
					let tid = brole.team_id;
					let team = [];
					if (tid == 1) {
						team = this.campA.broles;
					} else if (tid == 2) {
						team = this.campB.broles;
					}
					team.sort((a:any, b:any) => {
						let t1 = a.getAttr(Global.attrTypeL1.HP) / a.getAttr(Global.attrTypeL1.MAXHP);
						let t2 = b.getAttr(Global.attrTypeL1.HP) / b.getAttr(Global.attrTypeL1.MAXHP);
						return t1 - t2;
					});
					hppool.sort((a, b) => {
						return b - a;
					});
					let index = 0;
					for (const addrole of team) {
						if (addrole.isPet() && addrole.isdead) {
							continue;
						}
						index++;
						if (index > hppool.length) {
							break;
						}
						let addhp = hppool[index - 1];
						// if (tgs[addrole.onlyid] == null) {
						let addntr = Global.deepClone(tr);

						addntr.targetid = addrole.onlyid;
						// }
						if (addrole.isdead) {
							addrole.isdead = false;
						}
						addntr.acttype = Global.actNumType.Suck;
						addrole.subHp(addhp);
						addntr.num = addhp;

						addntr.hp = addrole.getHp();
						addntr.mp = addrole.getMp();
						addntr.isdead = addrole.isDead() ? 1 : 0;
						addntr.bufflist = addrole.getBuffsSkillId();
						tgs.push(addntr);
					}
				}

				btlAction.act = tgs;
				skilleffect = null;
			}

			actbef.hp = brole.getHp();
			actbef.mp = brole.getMp();
			actbef.isdead = brole.isDead() ? 1 : 0;
			btlAction.actbef = JSON.stringify(actbef);
			btlAction.bufflist = brole.getBuffsSkillId();

			roundinfo.acts.push(btlAction);
			if (runaway) {
				break;
			}
		}

		let self = this;
		this.timer = setTimeout(() => {
			self.roundEnd();
		}, (roundinfo.acts.length * 1.83 + addtime + 1) * 1000);
		this.broadcast('s2c_btl_round', roundinfo);
	}

	// 回合结束
	roundEnd() {
		// console.log('round end');
		if (this.timer != 0) {
			clearTimeout(this.timer);
			this.timer = 0;
		}
		for (const t of this.turnlist) {
			let brole = this.plist[t.onlyid];
			if (!brole) {
				continue;
			}
			// 技能冷却减少
			for (const skillid in brole.skill_list) {
				if (brole.skill_list.hasOwnProperty(skillid)) {
					const skillinfo = brole.skill_list[skillid];
					if (skillinfo.cooldown > 0) {
						skillinfo.cooldown--;
					}
				}
			}

			let bufflist = brole.getBuffList();
			for (let i = 0; i < bufflist.length; i++) {
				const buff = bufflist[i];
				buff.addRound(brole);

				if (buff.effecttype == Global.EMagicType.Chaos ||
					buff.effecttype == Global.EMagicType.Sleep ||
					buff.effecttype == Global.EMagicType.Seal) {
					if (buff.probability != 10000) {
						let r = Global.random(0, 10000);
						if (buff.probability < r) {
							brole.removeBuff(buff.buff_id);
							continue;
						}
					}
				}
				if (buff.checkEnd()) {
					brole.removeBuff(buff.buff_id);
				}
			}
			brole.init();
		}
		this.roundBegin();
	}

	backToBattle(onlyid:any) {
		let brole = this.plist[onlyid];
		if (brole == null) {
			return;
		}
		brole.online_state = 1;
		let eteam = 2;
		let steam = 1;
		if (brole.team_id == 2) {
			eteam = 1;
			steam = 2;
		}
		let s2c_btl = {
			btlid: this.battle_id,
			teamS: this.getTeamData(steam),
			teamE: this.getTeamData(eteam),
		};
		brole.send('s2c_btl', s2c_btl);
	}

	setObjOffline(onlyid:any) {
		let brole = this.plist[onlyid];
		if (brole) {
			brole.online_state = 0;
			for (const bonlyid in this.plist) {
				const bobj = this.plist[bonlyid];
				if (bobj.own_onlyid == onlyid) {
					bobj.online_state = 0;
				}
			}
		}
	}

	setObjOnline(onlyid:any) {
		let brole = this.plist[onlyid];
		if (brole) {
			brole.online_state = 1;
			for (const onlyid in this.plist) {
				const bobj = this.plist[onlyid];
				if (bobj.own_onlyid == onlyid) {
					bobj.online_state = 1;
				}
			}
			if (brole.isact == false) {
				brole.isact = true;

				brole.act = {
					acttype: Global.actType.Skill,
					actionid: brole.last_skill,
					target: 0,
				}
			}
		}
	}

	checkOnlinePlayer() {
		for (const onlyid in this.plist) {
			if (this.plist.hasOwnProperty(onlyid)) {
				const brole = this.plist[onlyid];
				if (brole.isPlayer() && brole.online_state == 1) {
					return true;
				}
			}
		}
		return false;
	}

	broadcastCamp(onlyid:any, event:any, obj:any) {
		for (let oid in this.plist) {
			if (this.plist.hasOwnProperty(oid)) {
				let brole = this.plist[oid];
				if (brole.isPlayer() && this.isSameTeam(brole.onlyid, onlyid)) {
					brole.send(event, obj);
				}
			}
		}
	}

	broadcast(event:any, obj:any, exclude:any = 0) {
		for (let onlyid in this.plist) {
			if (this.plist.hasOwnProperty(onlyid)) {
				let brole = this.plist[onlyid];
				if (exclude != 0 && brole.onlyid == exclude) {
					continue;
				}
				if (brole.isPlayer()) {
					brole.send(event, obj);
				}
			}
		}
	}
}
