import Global from "../../game/core/Global";
import GTimer from "../../common/GTimer";
import BattleObj from "./BattleObj";
import RoleTaskMgr from "../core/RoleTaskMgr";
import PartnerMgr from "./PartnerMgr";
import RelationMgr from "./RelationMgr";
import BattleMgr from "../battle/BattleMgr";
import TeamMgr from "../core/TeamMgr";
import EquipMgr from "./EquipMgr";
import PlayerMgr from "./PlayerMgr";
import NpcMgr from "../core/NpcMgr";
import ExpMgr from "../core/ExpMgr";
import PaiHangMgr from "../core/PaiHangMgr";
import Equip from "./Equip";
import SchemeMgr from "./SchemeMgr";
import BangMgr from "../bang/BangMgr";
import ActivityMgr from "../activity/ActivityMgr";
import ActivityDefine from "../activity/ActivityDefine";
import PetMgr from "../core/PetMgr";
import ChargeSum from "../core/ChargeSum";
import BattleRole from "../battle/BattleRole";
import MonsterMgr from "../core/MonsterMgr";
import World from "./World";
import DB from "../../utils/DB";
import GoodsMgr from "../item/GoodsMgr";
import MapMgr from "../core/MapMgr";
import PetPracticeMgr from "./PetPracticeMgr";
import PalaceFight from "../activity/PalaceFight";
import ChargeConfig from "../../game/core/ChargeConfig";
import RolePracticeMgr from "./RolePracticeMgr";
import NpcConfigMgr from "../core/NpcConfigMgr";
import MountModel from "../mount/MountModel";

export default class Player extends BattleObj {
	accountid: number;
	roleid: number;
	agent: any;
	race: number;
	sex: number;
	weapon: string;
	state: number;
	equip_list: any;
	aoi_model: string;
	aoi_obj_list: any;
	battle_id: number;
	stTaskMgr: RoleTaskMgr;
	stPartnerMgr: PartnerMgr;
	money: number;
	jade: number;
	bindjade: number;
	rewardrecord: number;
	curPet: any;
	curPetId: number;
	lastonline: any;
	usingIncense: any;
	loaded: boolean;
	petsLoaded: boolean;
	gmlevel: number;
	teamid: number;
	isleader: boolean;
	lastWorldChatTime: number;
	lastWorldChatStr: string;
	nFlag: number;
	offline: boolean;
	offlineTimer: number;
	shape: number;
	inPrison: boolean;
	level_reward: string;
	getgift: number;
	getpet: number;
	shuilu: any;
	titleId: number;
	titleType: number;
	onLoad: boolean;
	bangid: number;
	bangname: string;
	bangpost: number;
	titles: any;
	schemeName: string;
	color1: any;
	color2: any;
	safe_password: string;
	safe_lock: number;
	friendList: any;
	applyFriendList: any;
	star: number;
	offlineTimmer: any;
	shane: any;
	titleVal: any;
	equipObjs: any;
	schemeMgr: any;
	xiulevel: any;
	curEquips: any;
	listEquips: any;
	incenseTimmer: any;
	petObjs: any;
	bag_list: any;
	locker_list: any;
	relivelist: any;
	lockerEquips: any[];
	tmpData: any;
	anleiCnt: any;

	mountModel: MountModel;

	constructor() {
		super();
		this.accountid = 0;
		this.roleid = 0;
		this.agent = null;

		this.race = Global.raceType.Unknow; // 种族
		this.sex = Global.sexType.Unknow;

		this.weapon = '';
		this.state = 0;

		// 装备列表
		this.equip_list = {};

		// dir 朝向   1		2
		// 4方向      3		4
		// this.dir = 4;

		this.living_type = Global.livingType.Player;
		this.aoi_model = "wm";
		this.aoi_obj_list = {};
		this.battle_id = 0;
		this.stTaskMgr = new RoleTaskMgr(this);
		this.stPartnerMgr = new PartnerMgr(this);
		this.money = 0;
		this.jade = 0;
		this.bindjade = 0;
		this.rewardrecord = 0;


		this.curPet = null;
		this.curPetId = 0;
		this.lastonline = null;
		this.usingIncense = false;

		this.loaded = false; // 是否加载完毕，玩家进入了场景
		this.petsLoaded = false; // 宠物从数据库加载完毕
		this.gmlevel = 0;

		this.teamid = 0;
		this.isleader = false;

		this.lastWorldChatTime = 0;
		this.lastWorldChatStr = '';
		this.nFlag = 0;

		this.offline = false;
		this.offlineTimmer = 0;

		this.shane = 0;
		this.inPrison = false;
		this.level_reward = '';
		this.getgift = 0;
		this.getpet = 1;

		this.shuilu = {
			season: 1,
			score: 0,
			gongji: 0,
			wtime: 0,
			ltime: 0,
		};
		//this.curtitle = 0;
		this.titleId = -1;
		this.titleType = -1;		//当前的称谓类型
		this.titleVal = '';			//当前称谓值
		this.onLoad = false;			//是否装载称谓

		this.bangid = 0;
		this.bangname = '';
		this.bangpost = 0;
		this.titles = [];

		this.schemeName = '套装方案';
		this.color1 = 0; // 染色部位1 
		this.color2 = 0; // 染色部位2
		this.safe_password = '';
		this.safe_lock = 0;

		this.friendList = {};// 好友列表
		this.applyFriendList = {};// 好友申请列表

		this.star = 1; // 击杀地煞星 星级

		this.mountModel = new MountModel();
	}

	update(dt: number) {
		if (this.shane > 0) {
			this.shane--;
			if (this.shane <= 0) {
				this.shane = 0;
				this.ShanEChange();
			}
		}

		if (dt % (1000 * 60 * 5) == 0) {
			this.save();
		}

		if (dt % (1000) == 0) {
			this.GetTaskMgr().OnTimer();
		}
	}

	GetFlag(nIndex: any): any {
		return Global.getFlag(this.nFlag, nIndex);
	}

	SetFlag(nIndex: any, bValue: any) {
		this.nFlag = Global.setFlag(this.nFlag, nIndex, bValue);
	}


	OnEnterTeam() {
		this.GetTaskMgr().CheckAndInceptTask();
		this.GetTaskMgr().UpdateTaskStateToClient();
	}

	OnLeaveTeam() {
		this.GetTaskMgr().AbortAllTeamTaskWhileLeaveTeam();
	}

	getTeamId() {
		return this.teamid;
	}

	isTeamLeader() {
		if (this.teamid == 0) {
			return false;
		}
		return this.isleader;
	}



	GetTaskMgr(): RoleTaskMgr {
		if (this.stTaskMgr == null) {
			this.stTaskMgr = new RoleTaskMgr(this);
		}
		return this.stTaskMgr;
	}

	CheckNewDay(lastonline: any) {
		if (lastonline == null) {
			return;
		}
		let cdate = new Date(Global.gTime);
		let ly = lastonline.getFullYear();
		let lm = lastonline.getMonth();
		let lw = GTimer.getYearWeek(lastonline);
		let ld = GTimer.getYearDay(lastonline);

		if (ly != cdate.getFullYear()) {
			this.OnNewYear();
		}
		if (lm != cdate.getMonth()) {
			this.OnNewMonth();
		}
		if (lw != GTimer.getYearWeek(cdate)) {
			this.OnNewWeek();
		}
		if (lw != GTimer.getYearWeek(cdate)) {
			this.OnNewWeek();
		}
		if (ld != GTimer.getYearDay(cdate)) {
			this.OnNewDay();
		}
	}

	OnNewYear() {
		// 这辈子估计不会调用
	}

	OnNewMonth() {

	}

	OnNewWeek() {

	}

	OnNewDay() {
		this.GetTaskMgr().OnNewDay();
		let time = GTimer.dateFormat(GTimer.getCurTime());
		console.log(`玩家[${this.name}(${this.roleid})], 任务刷新 于${time} `);
	}

	on5oclock() {
		if (this.GetTaskMgr() == null)
			return;
		this.GetTaskMgr().OnNewDay();
	}

	OnNewHour() {

	}

	setAgent(agent: any) {
		this.agent = agent;
	}

	playerOffline(callback?: Function) {
		this.offline = true;
		this.offlineTimmer = setTimeout(() => {
			this.destroy(callback);
		}, 30 * 60 * 1000);

		if (this.battle_id != 0) {
			BattleMgr.shared.playerOffline(this.battle_id, this.onlyid);
		}

		this.save(() => {
			if (callback) {
				callback();
			}
		});
		RelationMgr.shared.deleteTempRelationByPlayer(this.roleid);
		this.agent && this.agent.destroy();
		this.agent = null;
	}

	activateScheme() {
		let scheme = this.schemeMgr.getActivateScheme();
		if (scheme) {
			this.addattr2 = scheme.content.attribute.addPoint;
			this.qianneng = scheme.content.attribute.qianNeng;

			this.addattr1 = scheme.content.defense.xiuPoint;
			this.xiulevel = scheme.content.defense.xiuLevel;
			for (const key in this.addattr1) {
				if (this.addattr1.hasOwnProperty(key)) {
					this.xiulevel += this.addattr1[key];
				}
			}

			for (let index = 0; index < this.curEquips.length; index++) {
				this.curEquips[index].pos = Global.equipPos.BAG;
				this.listEquips.push(this.curEquips[index]);
			}


			this.curEquips = [];
			for (var it in scheme.content.curEquips) {
				let eid = scheme.content.curEquips[it];
				let equip = this.equipObjs[eid];
				if (equip) {
					equip.pos = Global.equipPos.USE;
					this.curEquips.push(equip);
					for (let index = 0; index < this.listEquips.length; index++) {
						if (this.listEquips[index].EquipID == eid) {
							this.listEquips.splice(index, 1);
							break;
						}
					}
					if (equip.EIndex == 1) {
						this.changeWeapon(equip);
					}
				}
			}
			this.sendEquipList();
			this.schemeName = scheme.schemeName;
			this.stPartnerMgr.vecChuZhan = JSON.parse(JSON.stringify(scheme.content.partner));
			this.calculateAttr();
			this.send('s2c_player_data', this.getData());
		}
	}

	checkSchemeEquip(equipid: any): boolean {
		//装备
		let equip: any = this.equipObjs[equipid];
		let fullEquipData = equip.getFullData(this.roleid);
		if (fullEquipData.OwnerRoleId > 0 && fullEquipData.OwnerRoleId != this.resid) {
			this.send('s2c_notice', {
				strRichText: '角色不匹配，不能使用！'
			});
			return false;
		} else if ((fullEquipData.Sex != 9 && fullEquipData.Sex != this.sex) || (fullEquipData.Race != 9 && fullEquipData.Race != this.race)) {
			this.send('s2c_notice', {
				strRichText: '角色不匹配，不能使用！'
			});
			return false;
		}
		// if (fullEquipData.NeedGrade > this.level || fullEquipData.NeedRei > this.relive) {
		// 	this.send('s2c_notice', {
		// 		strRichText: '角色等级不足，尚不能使用！'
		// 	});
		// 	return;//转生或等级不符合
		// }
		if (fullEquipData.Shuxingxuqiu) { //属性需求不符合
			for (const key in fullEquipData.Shuxingxuqiu) {
				if (this.getAttr1(key) < fullEquipData.Shuxingxuqiu[key]) {
					this.send('s2c_notice', {
						strRichText: '角色属性不足，尚不能使用！'
					});
					return false;
				}
			}
		}
		return true;
	}

	syncSchemePartner() {
		this.schemeMgr && this.schemeMgr.syncSchemePartner();
	}


	destroy(callback?: any) {
		if (this.incenseTimmer) {
			clearTimeout(this.incenseTimmer);
			this.incenseTimmer = 0;
		}
		if (this.offlineTimmer) {
			clearTimeout(this.offlineTimmer);
			this.offlineTimmer = 0;
		}
		this.save(() => {
			if (callback) {
				callback();
			}
		});
		if (this.teamid > 0) {
			TeamMgr.shared.leaveTeam(this);
		}

		if (this.agent) {
			this.agent.destroy();
		}
		for (const equipid in this.equipObjs) {
			EquipMgr.shared.delEquip(equipid);
		}

		let pMap = MapMgr.shared.getMap(this);
		if (pMap) {
			pMap.exitMap(this);
		}

		delete this.stTaskMgr;
		delete this.stPartnerMgr;

		PlayerMgr.shared.delPlayer(this.accountid);
		NpcMgr.shared.DeletePlayersNpc(this.accountid);
	}

	setDBdata(data: any) { //zzzHere 读档
		data.lastonline = new Date(data.lastonline);
		this.accountid = data.accountid;
		this.roleid = data.roleid;
		this.mapid = data.mapid;
		this.race = data.race;
		this.name = data.name;
		this.level_reward = data.level_reward;
		this.sex = data.sex;
		this.exp = data.exp;
		// 默认最低星 1星
		this.star = data.star;
		if (this.star < 1) {
			this.star = 1;
		}
		this.bag_list = Global.safeJson(data.bagitem) || {};
		// TODO 背包数据完毕

		// 设置称谓信息 
		// 称谓放在有关系统初始化之前，之后会操作称谓
		let titles: any = Global.safeJson(data.title);
		if (titles) {
			//this.curtitle = titles.curtitle;
			this.titles = titles.titles;
			this.onLoad = titles.onload;
			this.titles.filter((e: any) => {
				if (e.onload) {
					this.titleType = e.type;
					this.titleId = e.titleid;
					this.titleVal = e.value;
				}
			});
		}

		this.initBang(data.bangid);
		let partnerdata = Global.safeJson(data.partnerlist);
		this.stPartnerMgr.init(partnerdata); // = new CPartnerMgr(this, data.partnerlist ? data.partnerlist : '{}');
		this.locker_list = Global.safeJson(data.lockeritem) || {};

		this.money = data.money;
		this.jade = data.jade;
		this.bindjade = data.bindjade || 0;
		this.rewardrecord = data.rewardrecord;

		this.x = data.x;
		this.y = data.y;
		this.resid = data.resid;

		this.curPetId = data.pet;
		this.curPet = null;
		this.petObjs = [];

		this.lastonline = data.lastonline;
		this.nFlag = data.state;
		this.getgift = data.getgift;

		// 等级相关
		let relivelist = [
			[0, 0],
			[0, 0],
			[0, 0],
		];
		let relist = Global.safeJson(data.relivelist) || relivelist;
		this.relivelist = relist;
		this.relive = data.relive;
		this.level = data.level;
		if (data.color.length > 0) {
			let colors = JSON.parse(data.color);
			if (colors.c1) {
				this.color1 = colors.c1;
			}
			if (colors.c2) {
				this.color2 = colors.c2;
			}
		}
		if (data.safecode && data.safecode.length > 0) {
			let array = data.safecode.split(':');
			this.safe_password = array[1] || '';
			this.safe_lock = parseInt(array[0]) || 0;
		}
		else {
			this.safe_password = '';
			this.safe_lock = 0;
		}
		this.curEquips = [];
		this.listEquips = [];
		this.equipObjs = {};
		this.lockerEquips = [];
		for (const equipid in data.equipdata) {
			if (this.equipObjs[equipid] != null) {
				continue;
			}
			if (data.equipdata.hasOwnProperty(equipid)) {
				const equip_data = data.equipdata[equipid];
				let equip = new Equip(equip_data);
				if (equip) {
					switch (equip_data.pos) {
						case Global.equipPos.USE:
							{
								let find = false;
								for (const useequip of this.curEquips) {
									if (useequip.EIndex == equip.EIndex) {
										find = true;
										equip.pos = Global.equipPos.BAG;
										this.listEquips.push(equip);
									}
								}
								if (!find) {
									this.curEquips.push(equip);
								}
							}
							break;
						case Global.equipPos.BAG:
							{
								this.listEquips.push(equip);
							}
							break;
						case Global.equipPos.BANK:
							{
								this.lockerEquips.push(equip);
							}
							break;
						default:
							{
								equip.pos = Global.equipPos.BAG;
								this.listEquips.push(equip);
							}
					}
					this.equipObjs[equip.EquipID] = equip;
				}
			}
		}
		// 水陆大会信息
		this.initShuilu(data.shuilu);
		this.initRolePoint(data.addpoint);
		this.checkRolePoint();

		this.xiulevel = data.xiulevel;
		this.initXiuLianPoint(data.xiupoint);
		this.checkXiulianPoint();

		// 设置等级在属性设置 之后设置！
		this.setLevel(data.level);

		if (data.skill.length > 0 && (data.skill[0] == '{' || data.skill[0] == '[')) {
			let skilllist = JSON.parse(data.skill);
			this.skill_list = skilllist;
		} else {
			this.initSkill();
		}

		this.getpet = data.getpet;
		this.initPet();

		this.gmlevel = data.gmlevel;

		this.tmpData = data;

		this.shane = data.shane;
		if (this.shane > 0) {
			let curDate = new Date();
			let passtime = (curDate.getTime() - data.lastonline.getTime()) / 1000;
			if (passtime > 0) {
				this.shane -= Math.floor(passtime * 4);
			}
			if (this.shane <= 0) {
				this.shane = 0;
			}
		}

		let schemeMgr = new SchemeMgr(this);
		this.schemeMgr = schemeMgr;
		// this.schemeMgr.init();
		// this.schemeMgr.initDefaultScheme();

		// 好友相关
		let friendlist: any = Global.safeJson(data.friendlist) || {};
		if (friendlist.version == 1) {
			for (const roleid in friendlist) {
				if (roleid == 'version') {
					delete friendlist['version'];
					continue;
				}
				if (friendlist.hasOwnProperty(roleid)) {
					const finfo = friendlist[roleid];
					try {
						// BASE64 解码
						finfo.name = new Buffer(finfo.name, "hex").toString("utf8");
					} catch (error) {
					}
				}
			}
		}
		this.friendList = friendlist;

		// 坐骑
		this.mountModel.currentId = data.mountid;
		this.mountModel.mountListDB = data.mountList;
	}


	setActivateSchemeName(schemeName: any) {
		this.schemeName = schemeName;
		this.send('s2c_player_data', this.getData());
	}

	initScheme() {

	}

	checkEquipExist(equipId: any) {
		let checkRes = false;
		checkRes = this.curEquips.some((e: any) => {
			return e.EquipID == equipId;
		})

		if (!checkRes) {
			return this.listEquips.some((e: any) => {
				return e.EquipID == equipId;
			});
		}

		return checkRes;
	}

	initBang(bangid: any) {
		// 检查是否被踢
		this.bangid = bangid;
		if (this.bangid > 0 && BangMgr.shared.bangList[this.bangid] == null) {
			this.bangid = 0;
		}

		if (this.bangid != 0) {
			let bang = BangMgr.shared.getBang(this.bangid);
			if (bang == null) {
				this.bangid = 0;
			} else {
				if (bang.isinit == true) {
					if (bang.checkPlayer(this.roleid)) {
						if (bang.masterid == this.roleid) {
							bang.mastername = this.name;
						}
						this.bangname = bang.name;
						this.bangpost = bang.getBangPost();
						if (bang.masterid == this.roleid) {
							this.addTitle(Global.titleType.CommonTitle, Global.titleBangType.BangZhu, '', false);
						} else {
							this.addTitle(Global.titleType.CommonTitle, Global.titleBangType.BangZhong, '', false);
						}
					} else {
						this.bangid = 0;
						this.bangname = '';
						this.bangpost = 0;
						this.delTitle(Global.titleType.CommonTitle, Global.titleBangType.BangZhu);
						this.delTitle(Global.titleType.CommonTitle, Global.titleBangType.BangZhong);
					}
				}
			}
		}
	}

	initShuilu(shuiluinfo: any) {
		this.shuilu = {
			season: 1,
			score: 0,
			gongji: 0,
			wtime: 0,
			ltime: 0,
		};
		if (shuiluinfo) {
			let t = JSON.parse(shuiluinfo);
			this.shuilu.season = t.season ? t.season : 0;
			this.shuilu.score = t.score ? t.score : 0;
			this.shuilu.gongji = t.gongji ? t.gongji : 0;
			this.shuilu.wtime = t.wtime ? t.wtime : 0;
			this.shuilu.ltime = t.ltime ? t.ltime : 0;
		}
		let shuiludahui = ActivityMgr.shared.getActivity(ActivityDefine.activityKindID.ShuiLuDaHui);
		if (shuiludahui && this.shuilu.season != shuiludahui.season) {
			this.shuilu.season = shuiludahui.season;
			this.shuilu.score = 0;
			this.shuilu.wtime = 0;
			this.shuilu.ltime = 0;
		}
	}

	updateSkill(data: any) {
		let maxlevel = ExpMgr.shared.GetMaxSkillLevel(this.relive);
		if (this.skill_list[data.skillid] == null || this.skill_list[data.skillid] >= maxlevel) {
			return;
		}
		if (this.skill_list[data.skillid] != null) {
			this.skill_list[data.skillid] += 100;
			this.send('s2c_player_data', this.getData());
		}
	}

	addCustomPoint(data: any) {
		let addlist = JSON.parse(data.addattr);
		let alladd = 0;
		for (const key in addlist) {
			if (addlist.hasOwnProperty(key)) {
				alladd += addlist[key];
			}
		}
		if (alladd == 0) {
			return;
		}
		if (alladd <= this.qianneng) {
			for (const key in this.addattr2) {
				if (addlist.hasOwnProperty(key) && this.addattr2.hasOwnProperty(key)) {
					this.addattr2[key] += addlist[key];
				}
			}
			this.calQianNeng();
			this.calculateAttr();
			this.send('s2c_player_data', this.getData());
			this.schemeMgr && this.schemeMgr.syncSchemePoint();
		}
	}

	InitTaskMgr(taskstate: any) {
		let mapValue: any = Global.safeJson(taskstate) || {};
		let vecStateList = mapValue.hasOwnProperty('StateList') ? mapValue['StateList'] : [];
		let vecRecordList = mapValue.hasOwnProperty('RecordList') ? mapValue['RecordList'] : [];
		let mapDailyCnt = mapValue.hasOwnProperty('DailyCnt') ? mapValue['DailyCnt'] : {};
		let mapFuBenCnt = mapValue.hasOwnProperty('FuBenCnt') ? mapValue['FuBenCnt'] : {};
		let mapDailyStart = mapValue.hasOwnProperty('DailyStart') ? mapValue['DailyStart'] : {};
		let mapActiveScore = mapValue.hasOwnProperty('mapActiveScore') ? mapValue['mapActiveScore'] : {};
		let szBeenTake = mapValue.hasOwnProperty('szBeenTake') ? mapValue['szBeenTake'] : [0, 0, 0, 0, 0, 0];

		this.GetTaskMgr().Init(vecStateList, vecRecordList, mapDailyCnt, mapFuBenCnt, mapDailyStart, mapActiveScore, szBeenTake);
	}

	// InitPartnerMgr(strJson) {
	// 	if (null == this.stPartnerMgr)
	// 		this.stPartnerMgr = new CPartnerMgr(this, strJson);
	// }

	initPet() {
		PetMgr.shared.getPetListByRoleId(this.roleid, (ret: any, petlist: any) => {
			if (ret != Global.msgCode.SUCCESS) {
				return;
			}

			for (const pet of petlist) {
				pet.setOwner(this);

				this.petObjs.push(pet);
				if (this.curPetId == pet.petid) {
					this.curPet = pet;
					// break;
				}
			}
			this.petsLoaded = true;
			this.sendPetList();
		})
	}

	initSkill() {
		this.skill_list = Global.defineSkill[this.race][this.sex];
	}

	initRolePoint(rolepoints: any) {
		if (rolepoints.length > 0 && (rolepoints[0] == '{' || rolepoints[0] == '[')) {
			let setPonit2 = (key: any, num: any) => {
				if (typeof (num) == 'number' && !isNaN(num)) {
					this.addattr2[key] = num > 0 ? num : 0;
				}
			}
			let addpoint = JSON.parse(rolepoints);
			setPonit2(Global.attrTypeL2.GENGU, addpoint[Global.attrTypeL2.GENGU]);
			setPonit2(Global.attrTypeL2.LINGXING, addpoint[Global.attrTypeL2.LINGXING]);
			setPonit2(Global.attrTypeL2.MINJIE, addpoint[Global.attrTypeL2.MINJIE]);
			setPonit2(Global.attrTypeL2.LILIANG, addpoint[Global.attrTypeL2.LILIANG]);
		}
	}

	updateFriend(pInfo: any) {
		let friend = this.friendList[pInfo.roleid];
		if (friend) {
			this.friendList[pInfo.roleid].name = pInfo.name;
		}
	}

	getFriendNum() {
		let n = 0;
		for (const pid in this.friendList) {
			if (this.friendList.hasOwnProperty(pid)) {
				// const element = this.friendList[pid];
				n++;
			}
		}
		return n;
	}

	checkRolePoint() {
		let qncount = this.level * 4; // LevelMgr.getRoleLevelQianneng();
		let qn = 0;
		for (const key in this.addattr2) {
			if (this.addattr2.hasOwnProperty(key)) {
				qn += this.addattr2[key];
			}
		}
		if (qn > qncount) {
			this.resetRolePoint();
			this.calQianNeng();
		}
	}

	initXiuLianPoint(xiupoints: any) {
		if (xiupoints.length > 0 && (xiupoints[0] == '{' || xiupoints[0] == '[')) {
			let setPonit1 = (key: any, num: any) => {
				if (typeof (num) == 'number' && !isNaN(num)) {
					this.addattr1[key] = num > 0 ? num : 0;
				}
			}
			let xiupoint = JSON.parse(xiupoints);
			for (const attrtype in xiupoint) {
				if (xiupoint.hasOwnProperty(attrtype)) {
					const num = xiupoint[attrtype];
					setPonit1(attrtype, num);
				}
			}
		}
	}

	checkXiulianPoint() {
		let maxlevel = RolePracticeMgr.shared.GetMaxPriactiveLevel(this.relive);
		if (this.xiulevel > maxlevel) {
			this.xiulevel = maxlevel;
			this.resetXiulianPoint();
			return;
		}
		let xlpoint = 0
		for (const key in this.addattr1) {
			if (this.addattr1.hasOwnProperty(key)) {
				const p = this.addattr1[key];
				xlpoint += p;
			}
		}
		if (xlpoint > this.xiulevel) {
			this.resetXiulianPoint();
		}
	}

	getTotalQianneng() {
		return this.level * 4;
	}

	calQianNeng() {
		let qncount = this.level * 4; // LevelMgr.getRoleLevelQianneng();
		let qn = 0;
		for (const key in this.addattr2) {
			if (this.addattr2.hasOwnProperty(key)) {
				qn += this.addattr2[key];
			}
		}
		let left_qn = qncount - qn;
		this.qianneng = left_qn;
		//当潜能值发生变化时，同步方案潜能值
		this.schemeMgr && this.schemeMgr.syncSchemePoint();
	}

	calculatePointAttr() {
		this.calQianNeng();
		this.setAttr1(Global.attrTypeL1.GENGU, this.level + this.addattr2[Global.attrTypeL1.GENGU]);
		this.setAttr1(Global.attrTypeL1.LILIANG, this.level + this.addattr2[Global.attrTypeL1.LILIANG]);
		this.setAttr1(Global.attrTypeL1.LINGXING, this.level + this.addattr2[Global.attrTypeL1.LINGXING]);
		this.setAttr1(Global.attrTypeL1.MINJIE, this.level + this.addattr2[Global.attrTypeL1.MINJIE]);
	}

	calculateEquipAttr() {
		if (this.curEquips) {
			let list = [Global.attrTypeL1.HP, Global.attrTypeL1.MP, Global.attrTypeL1.MAXHP, Global.attrTypeL1.MAXMP, Global.attrTypeL1.ATK, Global.attrTypeL1.SPD,
			Global.attrTypeL1.PHP, Global.attrTypeL1.PMP, Global.attrTypeL1.PATK, Global.attrTypeL1.PSPD
			];
			for (const equip of this.curEquips) {
				for (const key in Global.attrTypeL1) {
					if (Global.attrTypeL1.hasOwnProperty(key)) {
						const id = Global.attrTypeL1[key];
						if (list.indexOf(id) != -1) {
							continue;
						}

						let equipattr = equip.getAttr(id);
						if (equipattr == null || equipattr == 0) {
							continue;
						}

						let addattr = Global.attrToBaseAttr[id];
						if (addattr != null) {
							let target_attr = addattr.target;
							if (addattr.cal == Global.attrCalType.ADD_PERCENT) {
								this.attr1[target_attr] = (1 + equipattr / 100) * this.attr1[target_attr];
							} else if (addattr.cal == Global.attrCalType.PERCENT) {
								this.attr1[target_attr] = (equipattr / 100) * this.attr1[target_attr];
							} else if (addattr.cal == Global.attrCalType.ADD_NUM) {
								this.attr1[target_attr] += equipattr;
							}
						} else {
							this.attr1[id] += equipattr;
						}
					}
				}
			}
		}
	}

	// 基础百分比气血等 属性放在 等级计算等级之后
	calculateEquipBaseAttr() {
		if (this.curEquips) {
			let list = [Global.attrTypeL1.AHP, Global.attrTypeL1.AMP]; //, Global.attrTypeL1.AATK, Global.attrTypeL1.ASPD
			for (const equip of this.curEquips) {
				for (const key in Global.attrTypeL1) {
					if (Global.attrTypeL1.hasOwnProperty(key)) {
						const id = Global.attrTypeL1[key];
						if (list.indexOf(id) == -1) {
							continue;
						}

						let equipattr = equip.getAttr(id);
						if (equipattr == null || equipattr == 0) {
							continue;
						}

						let addattr = Global.attrToBaseAttr[id];
						if (addattr != null) {
							let target_attr = addattr.target;
							if (addattr.cal == Global.attrCalType.ADD_PERCENT) {
								this.attr1[target_attr] = Math.floor((1 + equipattr / 100) * this.attr1[target_attr]);
							} else if (addattr.cal == Global.attrCalType.PERCENT) {
								this.attr1[target_attr] = Math.floor((equipattr / 100) * this.attr1[target_attr]);
							} else if (addattr.cal == Global.attrCalType.ADD_NUM) {
								this.attr1[target_attr] = Math.floor(this.attr1[target_attr] + equipattr);
							}
						} else {
							this.attr1[id] = Math.floor(this.attr1[id] + equipattr);
						}
					}
				}
			}
		}
	}


	addXiulianPoint(data: any) {
		if (!data) {
			return;
		}

		// 重置修炼点
		if (data.type == 0) {
			let strErr = this.CostFee(Global.goldKind.Money, 200000);
			if (strErr != '') {
				return;
			}


			this.resetXiulianPoint();
			this.calculateAttr();
			this.send('s2c_player_data', this.getData());

			this.schemeMgr && this.schemeMgr.syncSchemePoint();

			return;
		}

		if (data.type == 1) {
			let sumpoint = 0;
			let addpoint: any = {};
			addpoint = JSON.parse(data.info);
			for (const key in addpoint) {
				sumpoint += addpoint[key];
			}
			

			if (sumpoint > this.xiulevel) {
				return;
			}
			for (const key in addpoint) {
				if (this.addattr1[key] == null) {
					this.addattr1[key] = 0;
				}
				this.addattr1[key] += addpoint[key];
			}
		}

		this.checkXiulianPoint();
		this.calculateAttr();
		this.send('s2c_player_data', this.getData());


	}

	resetRolePoint() {
		//重置加点
		this.addattr2[Global.attrTypeL2.GENGU] = 0;
		this.addattr2[Global.attrTypeL2.LINGXING] = 0;
		this.addattr2[Global.attrTypeL2.MINJIE] = 0;
		this.addattr2[Global.attrTypeL2.LILIANG] = 0;

		for (const equip of this.curEquips) {
			this.listEquips.push(equip);
		}
		this.curEquips = [];
		this.changeWeapon(null);
	}

	resetXiulianPoint() {
		for (const key in this.addattr1) {
			this.addattr1[key] = 0;
		}
	}

	xiulianUpgrade() {
		let maxxiulian = RolePracticeMgr.shared.GetMaxPriactiveLevel(this.relive);
		if (this.xiulevel < maxxiulian) {
			this.xiulevel++;
			this.send('s2c_player_data', this.getData());
			this.send('s2c_notice', {
				strRichText: '获得1个修炼点'
			});
			this.schemeMgr && this.schemeMgr.syncSchemePoint();
		} else {
			this.send('s2c_notice', {
				strRichText: '修炼点已达到上限'
			});
		}
	}


	getEquipAttr(attrtype: any) {
		let tmp = 0;
		for (const equip of this.curEquips) {
			tmp += equip.getAttr(attrtype);
		}
		return tmp;
	}

	calculateLevel() {
		let int = Math.floor;
		let E = int((100 - this.level) / 5);
		let L = this.level;

		let Gs = Global.growPre[this.race];
		let P = this.getAttr1(Global.attrTypeL2.GENGU); // + this.getEquipAttr(Global.attrTypeL1.GENGU);
		let G = Gs[Global.attrTypeL2.GENGU];
		let base = Global.baseAttr[this.race][Global.attrTypeL1.HP];

		let Fs: any = this.getReliveFix();

		let F: any = (Fs[Global.attrTypeL1.HP] != null) ? Fs[Global.attrTypeL1.HP] : 1;
		let hp = int((int((L + E) * P * G + base) + this.getEquipAttr(Global.attrTypeL1.MAXHP)) * (1 + F / 100));
		P = this.getAttr1(Global.attrTypeL2.LINGXING); // + this.getEquipAttr(Global.attrTypeL1.LINGXING);
		G = Gs[Global.attrTypeL2.LINGXING];
		base = Global.baseAttr[this.race][Global.attrTypeL1.MP];
		F = (Fs[Global.attrTypeL1.MP] != null) ? Fs[Global.attrTypeL1.MP] : 1;
		let mp = int((int((L + E) * P * G + base) + this.getEquipAttr(Global.attrTypeL1.MAXMP)) * (1 + F / 100));

		P = this.getAttr1(Global.attrTypeL2.LILIANG); // + this.getEquipAttr(Global.attrTypeL1.LILIANG);
		G = Gs[Global.attrTypeL2.LILIANG];
		base = Global.baseAttr[this.race][Global.attrTypeL1.ATK];
		F = (Fs[Global.attrTypeL1.ATK] != null) ? Fs[Global.attrTypeL1.ATK] : 1;
		let atk = int((L + E) * P * G / 5 + base + this.getEquipAttr(Global.attrTypeL1.ATK) * (1 + F / 100));

		P = this.getAttr1(Global.attrTypeL2.MINJIE); // + this.getEquipAttr(Global.attrTypeL1.MINJIE);
		G = Gs[Global.attrTypeL2.MINJIE];
		base = Global.baseAttr[this.race][Global.attrTypeL1.SPD];
		F = (Fs[Global.attrTypeL1.SPD] != null) ? Fs[Global.attrTypeL1.SPD] : 1;
		let spd = int((int((10 + P) * G) + this.getEquipAttr(Global.attrTypeL1.SPD)) * (1 + F / 100))


		this.attr1[Global.attrTypeL1.HP] = hp;
		this.attr1[Global.attrTypeL1.MAXHP] = hp;
		this.attr1[Global.attrTypeL1.MP] = mp;
		this.attr1[Global.attrTypeL1.MAXMP] = mp;
		this.attr1[Global.attrTypeL1.ATK] = atk;
		this.attr1[Global.attrTypeL1.SPD] = spd;

		this.calculateEquipBaseAttr();

		this.hp = this.attr1[Global.attrTypeL1.HP];
		this.maxhp = this.attr1[Global.attrTypeL1.HP];
		this.mp = this.attr1[Global.attrTypeL1.MP];
		this.maxmp = this.attr1[Global.attrTypeL1.MP];
		this.atk = this.attr1[Global.attrTypeL1.ATK];
		this.spd = this.attr1[Global.attrTypeL1.SPD];
		this.attr1[Global.attrTypeL1.MAXHP] = this.attr1[Global.attrTypeL1.HP];
		this.attr1[Global.attrTypeL1.MAXMP] = this.attr1[Global.attrTypeL1.MP];

		if (this.race == Global.raceType.Humen) {
			// 抗混乱 封印 毒 昏睡 每4级 + 1
			this.attr1[Global.attrTypeL1.DHUNLUAN] += 0 + int(L / 4);
			this.attr1[Global.attrTypeL1.DFENGYIN] += 0 + int(L / 4);
			this.attr1[Global.attrTypeL1.DHUNSHUI] += 0 + int(L / 4);
			this.attr1[Global.attrTypeL1.DDU] += 0 + int(L / 4);
		} else if (this.race == Global.raceType.Sky) {
			this.attr1[Global.attrTypeL1.DSHUI] += 0 + int(L / 8);
			this.attr1[Global.attrTypeL1.DHUO] += 0 + int(L / 8);
			this.attr1[Global.attrTypeL1.DLEI] += 0 + int(L / 8);
			this.attr1[Global.attrTypeL1.DFENG] += 0 + int(L / 8);
		} else if (this.race == Global.raceType.Demon) {
			this.attr1[Global.attrTypeL1.DWULI] += 0 + int(L / 8);

			this.attr1[Global.attrTypeL1.DHUNLUAN] += 0 + int(L / 8);
			this.attr1[Global.attrTypeL1.DFENGYIN] += 0 + int(L / 8);
			this.attr1[Global.attrTypeL1.DHUNSHUI] += 0 + int(L / 8);
			this.attr1[Global.attrTypeL1.DDU] += 0 + int(L / 8);

			this.attr1[Global.attrTypeL1.DSHUI] += 0 + int(L / 12);
			this.attr1[Global.attrTypeL1.DHUO] += 0 + int(L / 12);
			this.attr1[Global.attrTypeL1.DLEI] += 0 + int(L / 12);
			this.attr1[Global.attrTypeL1.DFENG] += 0 + int(L / 12);
		} else if (this.race == Global.raceType.Ghost) {
			this.attr1[Global.attrTypeL1.DHUNLUAN] += 0 + int(L / 6);
			this.attr1[Global.attrTypeL1.DFENGYIN] += 0 + int(L / 6);
			this.attr1[Global.attrTypeL1.DHUNSHUI] += 0 + int(L / 6);
			this.attr1[Global.attrTypeL1.DDU] += 0 + int(L / 6);
			this.attr1[Global.attrTypeL1.DYIWANG] += 0 + int(L / 6);
			this.attr1[Global.attrTypeL1.DGUIHUO] += 0 + int(L / 6);
			this.attr1[Global.attrTypeL1.DSANSHI] += 0 + int(L / 6);

			this.attr1[Global.attrTypeL1.DSHUI] += 0 - int(L / 8);
			this.attr1[Global.attrTypeL1.DHUO] += 0 - int(L / 8);
			this.attr1[Global.attrTypeL1.DLEI] += 0 - int(L / 8);
			this.attr1[Global.attrTypeL1.DFENG] += 0 - int(L / 8);

			this.attr1[Global.attrTypeL1.PMINGZHONG] += 0 + int(L / 4);
			this.attr1[Global.attrTypeL1.PSHANBI] += 0 + int(L / 4);
		}
	}

	getReliveFix() {
		let Fs: any = {};
		let relivefixs = [Global.reliveFixAttr1, Global.reliveFixAttr2, Global.reliveFixAttr3]
		for (let index = 0; index < this.relive; index++) {
			let rerace = this.relivelist[index][0];
			let resex = this.relivelist[index][1];
			let tmp = relivefixs[index][rerace][resex];

			for (const attr1 in tmp) {
				const num = tmp[attr1];
				if (Fs[attr1] == null) {
					Fs[attr1] = 0;
				}
				Fs[attr1] += num;
			}
		}
		return Fs;
	}

	calculateReliveAttr() {
		if (this.relive == 0) {
			return;
		}
		let list = [Global.attrTypeL1.HP, Global.attrTypeL1.MAXHP, Global.attrTypeL1.MP, Global.attrTypeL1.MAXMP, Global.attrTypeL1.ATK, Global.attrTypeL1.SPD];
		let Fs = this.getReliveFix();

		for (const key in Fs) {
			if (Fs.hasOwnProperty(key)) {
				const addattr = Fs[key];
				const id = parseInt(key);
				if (list.indexOf(id) == -1) {
					this.attr1[key] += addattr;
				} else {
					// this.attr1[key] = Math.ceil(this.attr1[key] * (1 + addattr / 100));
				}
			}
		}
	}

	calculateXiuAttr() {
		this.attr1[Global.attrTypeL1.BFSWSHANGXIAN] = 100 + (this.addattr1[Global.attrTypeL1.BFSWSHANGXIAN] == null ? 0 : this.addattr1[Global.attrTypeL1.BFSWSHANGXIAN] * 2.5);
		this.attr1[Global.attrTypeL1.DFENGYIN] += (this.addattr1[Global.attrTypeL1.DFENGYIN] == null ? 0 : this.addattr1[Global.attrTypeL1.DFENGYIN] * 5);
		this.attr1[Global.attrTypeL1.DHUNLUAN] += (this.addattr1[Global.attrTypeL1.DHUNLUAN] == null ? 0 : this.addattr1[Global.attrTypeL1.DHUNLUAN] * 5);
		this.attr1[Global.attrTypeL1.DHUNSHUI] += (this.addattr1[Global.attrTypeL1.DHUNSHUI] == null ? 0 : this.addattr1[Global.attrTypeL1.DHUNSHUI] * 5);
		this.attr1[Global.attrTypeL1.DYIWANG] += (this.addattr1[Global.attrTypeL1.DYIWANG] == null ? 0 : this.addattr1[Global.attrTypeL1.DYIWANG] * 5);

		if (this.attr1[Global.attrTypeL1.DFENGYIN] > this.attr1[Global.attrTypeL1.BFSWSHANGXIAN]) {
			this.attr1[Global.attrTypeL1.DFENGYIN] = this.attr1[Global.attrTypeL1.BFSWSHANGXIAN];
		}
		if (this.attr1[Global.attrTypeL1.DHUNLUAN] > this.attr1[Global.attrTypeL1.BFSWSHANGXIAN]) {
			this.attr1[Global.attrTypeL1.DHUNLUAN] = this.attr1[Global.attrTypeL1.BFSWSHANGXIAN];
		}
		if (this.attr1[Global.attrTypeL1.DHUNSHUI] > this.attr1[Global.attrTypeL1.BFSWSHANGXIAN]) {
			this.attr1[Global.attrTypeL1.DHUNSHUI] = this.attr1[Global.attrTypeL1.BFSWSHANGXIAN];
		}
		if (this.attr1[Global.attrTypeL1.DYIWANG] > this.attr1[Global.attrTypeL1.BFSWSHANGXIAN]) {
			this.attr1[Global.attrTypeL1.DYIWANG] = this.attr1[Global.attrTypeL1.BFSWSHANGXIAN];
		}

		this.attr1[Global.attrTypeL1.DFENG] += (this.addattr1[Global.attrTypeL1.DFENG] == null ? 0 : this.addattr1[Global.attrTypeL1.DFENG] * 5);
		this.attr1[Global.attrTypeL1.DLEI] += (this.addattr1[Global.attrTypeL1.DLEI] == null ? 0 : this.addattr1[Global.attrTypeL1.DLEI] * 5);
		this.attr1[Global.attrTypeL1.DSHUI] += (this.addattr1[Global.attrTypeL1.DSHUI] == null ? 0 : this.addattr1[Global.attrTypeL1.DSHUI] * 5);
		this.attr1[Global.attrTypeL1.DHUO] += (this.addattr1[Global.attrTypeL1.DHUO] == null ? 0 : this.addattr1[Global.attrTypeL1.DHUO] * 5);

		this.attr1[Global.attrTypeL1.DGUIHUO] += (this.addattr1[Global.attrTypeL1.DGUIHUO] == null ? 0 : this.addattr1[Global.attrTypeL1.DGUIHUO] * 5);
		this.attr1[Global.attrTypeL1.DSANSHI] += (this.addattr1[Global.attrTypeL1.DSANSHI] == null ? 0 : this.addattr1[Global.attrTypeL1.DSANSHI] * 5);
		this.attr1[Global.attrTypeL1.DDU] += (this.addattr1[Global.attrTypeL1.DDU] == null ? 0 : this.addattr1[Global.attrTypeL1.DDU] * 5);
		this.attr1[Global.attrTypeL1.PXISHOU] += (this.addattr1[Global.attrTypeL1.PXISHOU] == null ? 0 : this.addattr1[Global.attrTypeL1.PXISHOU] * 4);
	}

	//zzzHere 存档
	save(callback?: any) {
		if (this.loaded == false) {
			if (callback) {
				callback(Global.msgCode.SUCCESS);
			}
			return;
		}
		this.schemeMgr && this.schemeMgr.saveDBData();
		for (let pet of this.petObjs) {
			pet.save();
		}

		// let equipInfo = {};
		// equipInfo.use = {};
		// equipInfo.list = [];
		// equipInfo.locker = [];
		let sqlequip = '';
		for (const equip of this.curEquips) {
			// equipInfo.use[equip.EIndex] = equip.EquipID;
			// equip.save();
			sqlequip += equip.saveStr();
		}
		for (const equip of this.listEquips) {
			// equipInfo.list.push(equip.EquipID);
			// equip.save();
			sqlequip += equip.saveStr();
		}
		for (const equip of this.lockerEquips) {
			// equipInfo.locker.push(equip.EquipID);
			// equip.save();
			sqlequip += equip.saveStr();
		}

		if (this.mapid == 3002) {
			this.mapid = 1011;
			this.x = 237;
			this.y = 19;
		}
		if (this.mapid == 1201 && !this.inPrison) {
			this.mapid = 1011;
			this.x = 112;
			this.y = 78;
		}
		let titles = JSON.stringify({
			//curtitle: this.curtitle,
			onload: this.onLoad,
			titles: this.titles,
		});

		let partnerlist = this.stPartnerMgr.ToJson();

		let color = { c1: this.color1, c2: this.color2, };

		let friendlist = Global.deepClone(this.friendList);
		for (const roleid in friendlist) {
			if (friendlist.hasOwnProperty(roleid)) {
				if (roleid == 'version') {
					continue;
				}
				const finfo = friendlist[roleid];
				finfo.name = new Buffer(finfo.name, "base64").toString();
			}
		}
		friendlist.version = 1;

		let dbinfo = {
			mapid: this.mapid,
			x: this.x,
			y: this.y,
			addpoint: this.addattr2,
			xiupoint: this.addattr1,
			xiulevel: this.xiulevel,
			pet: this.curPetId,
			friendlist: friendlist,
			equipinfo: sqlequip,
			bagitem: this.bag_list,
			bangid: this.bangid,
			taskstate: this.TaskStateToJson(),
			partnerlist: partnerlist,
			lockeritem: this.locker_list,
			skill: this.skill_list,
			money: this.money,
			jade: this.jade,
			exp: this.exp,
			level: this.level,
			level_reward: this.level_reward,
			resid: this.resid,
			race: this.race,
			sex: this.sex,
			relive: this.relive,
			relivelist: this.relivelist,
			shane: this.shane,
			flag: this.nFlag,
			rewardrecord: this.rewardrecord,
			getgift: this.getgift,
			shuilu: this.shuilu,
			titles: titles,
			active_scheme_name: this.schemeName,
			color: color,
			star: this.star,
		};
		DB.savePlayerInfo(this.roleid, dbinfo, callback);
	}

	toObj() {
		let teamPlayers = TeamMgr.shared.getTeamPlayer(this.teamid);
		let obj: any = super.toObj();
		obj.relive = this.relive;
		obj.xiulevel = this.xiulevel;
		obj.level = this.level;
		obj.accountid = this.accountid;
		obj.roleid = this.roleid;
		obj.resid = this.resid;
		obj.race = this.race;
		obj.sex = this.sex;
		obj.bangid = this.bangid;
		obj.livingtype = this.living_type;
		obj.teamid = this.teamid;
		obj.isleader = this.isleader;
		obj.teamcnt = teamPlayers == null ? 0 : teamPlayers.length;
		obj.weapon = this.getWeapon();
		obj.battleid = this.battle_id;
		// obj.shane = this.shane;
		// obj.title = this.getTitleStr();
		obj.bangname = this.bangname;
		obj.titletype = this.titleType;
		obj.titleid = this.titleId;
		obj.titleval = this.titleVal;
		obj.color1 = this.color1;
		obj.color2 = this.color2;
		obj.schemename = this.schemeName;
		obj.safepassword = this.safe_password;
		obj.safelock = this.safe_lock;
		obj.mountData = this.mountModel.toObj();
		return obj;
	}

	getWeapon() {
		for (const equip of this.curEquips) {
			if (equip.EIndex == 1) {
				let equipobj: any = {};
				equipobj.equipid = equip.EquipID;
				equipobj.gemcnt = equip.GemCnt;
				equipobj.type = equip.EquipType;
				equipobj.level = equip.Grade;
				return JSON.stringify(equipobj);
			}
		}
		return '';
	}

	getData() {
		let obj: any = {};
		obj.onlyid = this.onlyid;
		obj.qianneng = this.qianneng;
		obj.attr1 = JSON.stringify(this.attr1);
		obj.xiulevel = this.xiulevel;
		obj.addattr1 = JSON.stringify(this.addattr1);
		obj.addattr2 = JSON.stringify(this.addattr2);
		obj.skill = JSON.stringify(this.skill_list);
		obj.level = this.level;
		obj.exp = this.exp;
		obj.bangid = this.bangid;
		obj.race = this.race;
		obj.sex = this.sex;
		obj.maxexp = this.maxexp;
		obj.money = this.money;
		obj.jade = this.jade;
		obj.bindjade = this.bindjade;
		obj.gmlevel = this.gmlevel;
		obj.chargesum = ChargeSum.shared.getPlayerChargeSum(this.roleid);
		obj.rewardrecord = this.rewardrecord;
		obj.levelreward = this.level_reward;
		obj.shuilugj = this.shuilu.gongji;
		obj.titleval = this.titleVal;
		obj.titletype = this.titleType;
		obj.titleid = this.titleId;
		obj.color1 = this.color1;
		obj.color2 = this.color2;
		obj.schemename = this.schemeName;
		return obj;
	}


	setLevel(level: any, issend?: any) {
		let maxlevel = ExpMgr.shared.GetUserMaxGrade(this.relive);
		this.level = Math.min(level, maxlevel);
		console.log(`玩家[${this.name}${this.roleid}]等级改变，当前${this.level}级`);
		this.maxexp = ExpMgr.shared.GetPlayerUpgradeExp(this.relive, this.level);
		this.calQianNeng();
		this.calculateAttr();
		this.stPartnerMgr.CheckAndAddPartner();
		if (this.level <= Global.limitPartnerLevel) {
			this.stPartnerMgr.UpdatePartnerLevelAsPlayer();
		}
		PaiHangMgr.shared.CheckAndInsertLevelPaihang(this.roleid, this.name, this.relive, this.level, this.money);
		if (issend) {
			this.send('s2c_level_up', {
				onlyid: this.onlyid,
				curlevel: this.level,
			});
		}
	}

	TaskStateToJson() {
		let mapValue: any = {};
		let vecData = [];

		if (this.GetTaskMgr()) {
			if (this.GetTaskMgr().mapTaskState) {
				for (let it in this.GetTaskMgr().mapTaskState) {
					let stTaskState = this.GetTaskMgr().mapTaskState[it];
					let nCurStep = 0;

					for (let it2 in stTaskState.vecEventState) {
						if (stTaskState.vecEventState[it2].nState == 1)
							nCurStep = Number(it2);
					}
					vecData.push({
						nTaskID: stTaskState.nTaskID,
						nCurStep: nCurStep
					});
				}
			}

			mapValue['RecordList'] = this.GetTaskMgr().vecRecord;
			mapValue['DailyCnt'] = this.GetTaskMgr().mapDailyCnt;
			mapValue['FuBenCnt'] = this.GetTaskMgr().mapFuBenCnt;
			mapValue['DailyStart'] = this.GetTaskMgr().mapDailyStart;
			mapValue['mapActiveScore'] = this.GetTaskMgr().mapActiveScore;
			mapValue['szBeenTake'] = this.GetTaskMgr().szBeenTake;
		}
		mapValue['StateList'] = vecData;

		return mapValue;
	}





	//////////////////////////////  物品 相关   /////////////////////////////
	update_bagitem(data: any) {
		if (data.operation == 0) {
			if (this.bag_list[data.itemid] == null || this.bag_list[data.itemid] < data.count) {
				this.send('s2c_operation_result', {
					code: Global.msgCode.ITEM_OPERATION_ERROR
				});
			} else {
				this.bag_list[data.itemid] -= data.count;
				if (this.bag_list[data.itemid] <= 0) {
					delete this.bag_list[data.itemid];
				}
				this.send('s2c_bagitem', {
					info: JSON.stringify(this.bag_list)
				});
			}
		} else {
			if (this.bag_list[data.itemid] == null) {
				this.bag_list[data.itemid] = data.count;
			} else {
				this.bag_list[data.itemid] += data.count;
			}
			this.send('s2c_bagitem', {
				info: JSON.stringify(this.bag_list)
			});
		}
	}

	update_lockeritem(data: any) {
		if (data.operation == 1) {
			if (this.getLockerItemAllKindNum() >= Global.limitLockerKindNum) {
				this.send('s2c_notice', {
					strRichText: `背包已满`
				});
				return;
			}
		}
		if (data.type == 0) {
			if (data.operation == 0) {
				if (this.locker_list[data.operateid] > 0) {
					if (this.bag_list[data.operateid] == null) this.bag_list[data.operateid] = 0;
					this.bag_list[data.operateid] += this.locker_list[data.operateid];
				}
				delete this.locker_list[data.operateid];
			} else {
				if (this.bag_list[data.operateid] > 0) {
					if (this.locker_list[data.operateid] == null) this.locker_list[data.operateid] = 0;
					this.locker_list[data.operateid] += this.bag_list[data.operateid];
				}
				delete this.bag_list[data.operateid];
			}
		} else if (data.type == 1) {
			if (data.operation == 0) {
				for (let index = 0; index < this.lockerEquips.length; index++) {
					let equip = this.lockerEquips[index];
					if (data.operateid == equip.EquipID) {
						equip.pos = Global.equipPos.BAG;
						this.lockerEquips.splice(index, 1);
						this.listEquips.push(equip);
						break;
					}
				}
			} else {
				for (let index = 0; index < this.listEquips.length; index++) {
					let equip = this.listEquips[index];
					if (data.operateid == equip.EquipID) {
						equip.pos = Global.equipPos.BANK;
						this.listEquips.splice(index, 1);
						this.lockerEquips.push(equip);
						break;
					}
				}
			}
			this.sendEquipList();
		}

		// this.locker_list = JSON.parse(data.locker);
		// this.bag_list = JSON.parse(data.bag);

		// let equipInfo = JSON.parse(data.equip);
		// for (let index = 0; index < this.listEquips.length; index++) {
		// 	let equip = this.listEquips[index];
		// 	if (equipInfo.list.indexOf(equip.EquipID) == -1) {
		// 		this.listEquips.splice(index, 1);
		// 		this.lockerEquips.push(equip);
		// 		index--;
		// 	}
		// }
		// for (let index = 0; index < this.lockerEquips.length; index++) {
		// 	let equip = this.lockerEquips[index];
		// 	if (equipInfo.locker.indexOf(equip.EquipID) == -1) {
		// 		this.lockerEquips.splice(index, 1);
		// 		this.listEquips.push(equip);
		// 		index--;
		// 	}
		// }
		// this.sendEquipList();
	}

	getBagItemNum(itemid: any): any {
		if (this.bag_list.hasOwnProperty(itemid) == false)
			return 0;

		return this.bag_list[itemid];
	}

	addExp(exp: any) {
		if (exp == 0) {
			return;
		}
		super.addExp(exp);
		if (exp > 0) {
			this.send('s2c_add_exp', {
				onlyid: this.onlyid,
				curexp: this.exp,
				addexp: exp,
				maxexp: this.maxexp,
			});
		}
		this.send('s2c_player_data', this.getData());
	}

	AddItem(nItem: any, nNum: any, bNotice = false, source = ''): boolean {
		nNum = parseInt(nNum);
		let itemData = GoodsMgr.shared.GetItemInfo(nItem);
		if (null == itemData) {
			return false;
		}
		if (itemData.type < 4) {
			this.AddBagItem(nItem, nNum, bNotice);
		} else if (itemData.type == 4) {
			this.addExp(nNum);
		} else if (itemData.type == 5) {
			this.AddMoney(0, nNum, 'AddItem');
		} else if (itemData.type == 6) {
			this.AddMoney(1, nNum, 'AddItem');
		} else if (itemData.type == 7 || itemData.type == 8) {
			let info = itemData.json;
			info.roleid = this.roleid;
			this.addEquip(info);
		} else if (itemData.type == 9) {
			this.createPet(itemData.json);
		} else if (itemData.type == 10) {
			this.AddBagItem(nItem, nNum, bNotice);
		} else if (itemData.type == 11) {
			let itemlist = itemData.json;
			if (itemlist) {
				let r = Math.floor(Math.random() * itemlist.length);
				let itemid = itemlist[r];
				if (itemid != null) {
					nItem = itemid;
				}
				this.AddBagItem(nItem, 1, bNotice);
			}
		} else if (itemData.type == 12) {
			this.AddMoney(Global.goldKind.BindJade, nNum, 'AddItem');
		}
		console.log(`玩家[${this.name}(${this.roleid})]获得物品[${itemData.name}(${nItem})，${nNum}个]，${source}`);
		return true;
	}

	getBagItemAllKindNum() {
		return this.listEquips.length + Object.keys(this.bag_list).length;
	}

	getLockerItemAllKindNum() {
		return this.lockerEquips.length + Object.keys(this.locker_list).length;
	}

	AddBagItem(nItem: any, nNum: any, bNotice: any) {
		nNum = parseInt(nNum);
		if (isNaN(nNum)) {
			return;
		}

		if (this.bag_list[nItem] == null) {
			if (nNum > 0) {
				if (this.getBagItemAllKindNum() >= Global.limitBagKindNum) {
					this.send('s2c_notice', {
						strRichText: `背包已满`
					});
					return;
				}
			}
			this.bag_list[nItem] = 0;
		}

		let nNewNum = parseInt(this.bag_list[nItem]) + parseInt(nNum);
		if (nNewNum < 0) {
			return Global.msgCode.ITEM_OPERATION_ERROR;
		}

		let stItemInfo = GoodsMgr.shared.GetItemInfo(nItem);
		if (stItemInfo == null) {
			return;
		}

		this.bag_list[nItem] = nNewNum;

		if (this.bag_list[nItem] == 0) {
			delete this.bag_list[nItem];
		}

		this.send('s2c_bagitem', {
			info: JSON.stringify(this.bag_list)
		});

		if (bNotice) {
			this.send('s2c_you_get_item', {
				nItem: nItem,
				nNum: nNum
			});
		}

		if (stItemInfo.notice != 0 && nNum > 0) {
			let strRichText = `<color=#00ff00 > ${this.name}</c > <color=#ffffff > 获得了</c ><color=#0fffff > ${stItemInfo.name}</color >，<color=#ffffff > 真是太幸运了</c >`;
			PlayerMgr.shared.broadcast('s2c_screen_msg', {
				strRichText: strRichText,
				bInsertFront: 0
			});
		}

		return 0;
	}

	
	CostFee(nKind: any, nNum: any, strText?: any, usebind = true) {
		let vecMsg = ['银两不足', '仙玉不足', '', '水陆功绩不足'];

		let money = this.GetMoney(nKind);
		let bindjade = this.GetMoney(Global.goldKind.BindJade);
		if (nKind == Global.goldKind.Jade && usebind) {
			money += bindjade;
		}
		if (money < nNum) {
			return vecMsg[nKind];
		}
		if (nKind == Global.goldKind.Jade && usebind) {
			if (bindjade > 0) {
				if (bindjade >= nNum) {
					this.AddMoney(Global.goldKind.BindJade, -nNum, strText);
				} else {
					let left = nNum - bindjade;
					this.AddMoney(Global.goldKind.BindJade, -bindjade, strText);
					this.AddMoney(Global.goldKind.Jade, -left, strText);
				}
			} else {
				this.AddMoney(Global.goldKind.Jade, -nNum, strText);
			}
		} else {
			this.AddMoney(nKind, -nNum, strText);
		}
		return '';
	}

	GetMoney(nKind: any) {
		let money = 0;
		switch (nKind) {
			case Global.goldKind.Money:
				money = this.money;
				break;
			case Global.goldKind.Jade:
				money = this.jade;
				break;
			case Global.goldKind.BindJade:
				money = this.bindjade;
				break;
			case Global.goldKind.SLDH_Score:
				money = this.shuilu.gongji;
				break;
		}
		return money;
	}



	AddMoney(nKind: any, nNum: any, strText: string = "") {
		if (nKind == Global.goldKind.Money) {
			this.money += nNum;
			PaiHangMgr.shared.CheckAndInsertMoneyPaihang(this.roleid, this.name, this.relive, this.level, this.money);
			if (nNum != 0) {
				this.send('s2c_you_money', {
					nKind: nKind,
					nNum: this.money,
					nChange: nNum
				});
				console.log(`玩家[${this.name}(${this.roleid})]银两改变[${nNum}]，当前[${this.money}]`, strText);
			}
		}

		if (nKind == Global.goldKind.Jade) { // 仙玉 
			this.jade += nNum;
			if (nNum != 0) {
				this.send('s2c_you_money', {
					nKind: nKind,
					nNum: this.jade,
					nChange: nNum
				});

				console.log(`玩家[${this.name}(${this.roleid})]仙玉改变[${nNum}]，当前[${this.jade}]`, strText);
			}
		}

		if (nKind == Global.goldKind.BindJade) { // 绑定仙玉 
			this.bindjade += nNum;
			if (nNum != 0) {
				this.send('s2c_you_money', {
					nKind: nKind,
					nNum: this.bindjade,
					nChange: nNum
				});

				console.log(`玩家[${this.name}(${this.roleid})]绑定仙玉改变[${nNum}]，当前[${this.bindjade}]`, strText);
			}
		}

		if (nKind == Global.goldKind.SLDH_Score) { // 水陆大会功绩
			this.shuilu.gongji += nNum;
			if (nNum != 0) {
				this.send('s2c_you_money', {
					nKind: nKind,
					nNum: this.shuilu.gongji,
					nChange: nNum
				});
				console.log(`玩家[${this.name}(${this.roleid})]水陆大会功绩改变[${nNum}]，当前[${this.shuilu.gongji}]`, strText);
			}
		}
	}

	
	ChargeSuccess(jade: any, money: any) {
		this.AddMoney(1, jade, '仙玉充值');
		let money_n = Number(money);
		let chargesum = ChargeSum.shared.getPlayerChargeSum(this.roleid);
		this.send('s2c_charge', {
			money: money_n,
			jade: Number(this.jade),
			chargesum: chargesum,
		});
	}
	//////////////////////////////  物品 结束   /////////////////////////////
	//////////////////////////////  AOI 相关   /////////////////////////////
	aoi_enter(obj: any) {
		if (obj.isNpc() && this.CanPlayerSeeNpc(obj) == false)
			return;

		this.aoi_obj_list[obj.onlyid] = obj;
		this.send('s2c_aoi_pinfo', {
			list: [obj.toObj()]
		});
	}

	aoi_update(obj: any) {
		if (obj.isNpc() && this.CanPlayerSeeNpc(obj) == false)
			return;

		this.aoi_obj_list[obj.onlyid] = obj;
		this.send('s2c_aoi_pinfo', {
			list: [obj.toObj()]
		});
	}

	aoi_exit(obj: any) {
		delete this.aoi_obj_list[obj.onlyid];
		this.send('s2c_aoi_exit', {
			onlyid: obj.onlyid,
		});
	}
	//////////////////////////////  AOI 结束   /////////////////////////////
	send(event: string, obj: any) {
		if (this.agent) {
			this.agent.send(event, obj);
		}
	}

	playerLogined() {
		if (this.offline == true) {
			this.offline = false;
		} else {
			PlayerMgr.shared.addPlayer(this);
		}
		if (this.offlineTimmer) {
			clearTimeout(this.offlineTimmer);
			this.offlineTimmer = 0;
		}

		if (this.mapid == 1201) {
			this.inPrison = true;
		}

		this.send('s2c_login', {
			errorcode: Global.msgCode.SUCCESS,
			info: this.toObj(),
		});
	}

	playerRelogin() {
		if (this.offline == true) {
			this.offline = false;
		}

		if (this.offlineTimmer) {
			clearTimeout(this.offlineTimmer);
			this.offlineTimmer = 0;
		}
	}

	onEnterMap() {
		this.stopIncense();
		// 进入场景        
		let pMap = MapMgr.shared.getMap(this);
		if (pMap) {
			let mPlayers = pMap.enterMap(this, Global.livingType.Player);
			let mList = [];
			for (const oid in mPlayers) {
				if (mPlayers.hasOwnProperty(oid)) {
					const p = mPlayers[oid];

					if (p.isNpc() && this.CanPlayerSeeNpc(p) == false)
						continue;

					if (p.nFuBenID > 0 && p.nFuBenID != this.bangid)
						continue;

					this.aoi_obj_list[p.onlyid] = p;
					mList.push(p.toObj());
				}
			}
			this.send('s2c_aoi_pinfo', {
				list: mList
			});

			// 进入皇宫后 检查水路大会情况
			let activity = ActivityMgr.shared.getActivity(ActivityDefine.activityKindID.ShuiLuDaHui);
			if (activity && activity.activity_state != ActivityDefine.activityState.Close) {
				if (activity.checkSign(this.teamid) && activity.checkFinish(this.teamid) == false) {
					if (this.mapid == 1000 || this.mapid == 1206) {
						this.send('s2c_shuilu_sign', {
							errorcode: Global.msgCode.SUCCESS,
							shuilustate: activity.sldh_state,
						});
					} else {
						activity.playerUnsign(this);
						this.send('s2c_shuilu_unsign', {
							errorcode: Global.msgCode.SUCCESS,
						});
					}
				}
			}
		}
	}

	onEnterGame() {
		if (this.ShanEChange()) {
			return;
		}
		this.onEnterMap();
		// 发送角色数据
		this.send('s2c_player_data', this.getData());

		this.loaded = true;

		if (this.getpet == 0) {
			this.send('s2c_new_pet', {});
		} else {
			this.sendPetList();
		}

		// 任务系统初始化放置在进入场景之后进行！
		if (this.tmpData) {
			this.InitTaskMgr(this.tmpData.taskstate ? this.tmpData.taskstate : '{}');
			delete this.tmpData;
		}

		if (this.teamid > 0) {
			TeamMgr.shared.sendInfoToMember(this.teamid);
		}

		if (this.battle_id != 0) {
			BattleMgr.shared.playerBackToBattle(this.battle_id, this.onlyid);
		}

		let ltime = new Date(this.lastonline);
		this.CheckNewDay(ltime);

		DB.updateLastOnlineTime(this.roleid);
		this.lastonline = new Date(Global.gTime);

		this.checkFriendInfo();
	}

	// 整理被删除的好友
	checkFriendInfo() {
		for (const pid in this.friendList) {
			if (this.friendList.hasOwnProperty(pid)) {
				let target = PlayerMgr.shared.getPlayerByRoleId(pid);
				if (target) {
					if (target.friendList[this.roleid] == null) {
						delete this.friendList[target.roleid];
					}
				}
			}
		}
	}


	CanPlayerSeeNpc(pNpc: any) {
		if (pNpc.stCreater.nKind == Global.ENpcCreater.ESystem)
			return true;

		if (pNpc.stCreater.nKind == Global.ENpcCreater.EPlayer && pNpc.stCreater.nID == this.accountid)
			return true;

		if (pNpc.stCreater.nKind == Global.ENpcCreater.ETeam && pNpc.stCreater.nID == this.teamid && this.teamid > 0)
			return true;

		return false;
	}


	playerMove(data: any, stop = false) {
		if (this.usingIncense) {
			this.anleiCnt--;
			if (this.anleiCnt <= 0) {
				this.triggerAnLei();
				this.anleiCnt = Math.ceil(Math.random() * 15) + 15;
			}
		}
		if (this.teamid > 0 && this.isleader && !stop) {
			TeamMgr.shared.updateTeamPos(this.teamid, {
				x: data.x,
				y: data.y
			});
		}
		let pMap = MapMgr.shared.getMap(this);
		if (pMap) {
			let mPlayers = pMap.move(this.onlyid, data.x, data.y);
			let mList = [];
			if (mPlayers) {
				if (this.teamid > 0 && !this.isleader) {
					mPlayers.push(this);
				}
				for (const p of mPlayers) {
					if (p.isNpc() && this.CanPlayerSeeNpc(p) == false)
						continue;

					mList.push(p.toObj());
				};
			}
			this.send('s2c_aoi_pinfo', {
				list: mList
			});
		}
	}

	playerStop(data: any) {
		this.playerMove(data, true);
		if (this.teamid > 0 && this.isleader) {
			TeamMgr.shared.setTeamPath(this.teamid, JSON.parse(data.path));
		}
	}

	enterPrison() {
		this.inPrison = true;
		if (this.teamid > 0) {
			TeamMgr.shared.leaveTeam(this);
		}

		this.send('s2c_change_map', {
			mapid: 1201,
			pos: JSON.stringify({
				x: 59,
				y: 4
			})
		});
		this.changeMap({
			mapid: 1201,
			x: 59,
			y: 4
		});
	}

	leavePrison() {
		if (this.shane > 0) {
			return;
		}
		this.inPrison = false;
		this.send('s2c_change_map', {
			mapid: 1011,
			pos: JSON.stringify({
				x: 112,
				y: 78
			})
		});
		this.changeMap({
			mapid: 1011,
			x: 112,
			y: 78
		});
	}

	changeMap(data: any) {
		if (data.mapid == 1011 && this.shane > 0) {
			this.enterPrison();
			this.send('s2c_prison_time', {
				onlyid: this.onlyid,
				time: this.inPrison ? Math.ceil(this.shane / 4) : 0
			});
			return;
		}
		let pMap = MapMgr.shared.getMap(this);
		if (pMap) {
			pMap.exitMap(this);
		}
		this.mapid = data.mapid;
		this.x = data.x;
		this.y = data.y;
		this.onEnterMap();
		if (this.teamid > 0 && this.isleader) {
			TeamMgr.shared.changeTeamMap(this.teamid, this.mapid);
		}
	}

	useIncense(time: any) {
		this.stopIncense();
		// if (this.teamid > 0) {
		// 	return false;
		// }
		this.send('s2c_incense_state', {
			ltime: time
		});
		this.usingIncense = true;
		this.anleiCnt = Math.ceil(Math.random() * 20) + 20;
		this.incenseTimmer = setTimeout(() => {
			this.usingIncense = false;
			this.send('s2c_incense_state', {
				ltime: 0
			});
		}, time * 1000);
		return true;
	}

	stopIncense() {
		this.usingIncense = false;
		if (this.incenseTimmer) {
			clearTimeout(this.incenseTimmer);
			this.incenseTimmer = 0;
		}
	}

	triggerAnLei() { //触发暗雷怪
		let pMap = MapMgr.shared.getMap(this);
		if (pMap) {
			let groupid = pMap.getAnleiGroup();
			if (groupid) {
				this.monsterBattle(groupid, Global.battleType.Normal, true);
			}
		}
	}

	//////////////////////////////  宠物 相关   /////////////////////////////
	relivePet(data: any) {
		let operationPet = null;
		for (const pet of this.petObjs) {
			if (pet.petid == data.petid) {
				operationPet = pet;
				break;
			}
		}
		if (operationPet == null) {
			return;
		}
		operationPet.petRelive();
		this.send('s2c_update_pet', {
			info: operationPet.toObj()
		});
	}

	
	washProperty(data: any) {
		let jll_count = this.bag_list[10118] || 0; 
		if (jll_count < 3) {
			return;
		}
		let operationPet = null;
		for (const pet of this.petObjs) {
			if (pet.petid == data.petid) {
				operationPet = pet;
				break;
			}
		}
		if (operationPet == null) {
			return;
		}
		this.update_bagitem({
			itemid: 10118,
			count: 3,
			operation: 0
		});
		operationPet.washProperty();
	}

	savePetProperty(data: any) {
		let operationPet = null;
		for (const pet of this.petObjs) {
			if (pet.petid == data.petid) {
				operationPet = pet;
				break;
			}
		}
		if (operationPet == null) {
			return;
		}
		operationPet.saveProperty();
	}

	hechengPet(data: any) {
		if (data.petid == 1061) {
			this.send('s2c_notice', {
				strRichText: `该神兽即将开放`
			});
			return;
		}
		if (PetMgr.shared.canHeCheng(this, data.petid)) {
			this.createPet(data, '宠物合成');
			this.send('s2c_bagitem', {
				info: JSON.stringify(this.bag_list)
			});
		} else {
			this.send('s2c_notice', {
				strRichText: `超过最大数量或物品不足`
			});
		}
	}

	createPet(data: any, source = '') {
		// if (this.getpet == 1) {
		// 	return;
		// }
		PetMgr.shared.createPet(this, data.petid, (pet: any) => {
			this.addPet(pet, false);
			if (this.curPet == null) {
				this.changePet(pet.petid, false);
			}
			this.getPetlist();
			if (this.getpet != 1) {
				DB.getPet(this.roleid);
				this.getpet = 1;
			}

			console.log(`玩家[${this.name}${this.roleid}]获得宠物[${pet.name}(${pet.petid})] ${source}`);
			this.send('s2c_notice', {
				strRichText: `恭喜您获得了${pet.name}`
			});
		});
	}

	addPet(pet: any, issend = true) {
		pet.setOwner(this); //ownid = this.roleid;
		this.petObjs.push(pet);
		if (issend) {
			this.getPetlist();
		}
	}

	getPetByID(petid: any) {
		for (const pet of this.petObjs) {
			if (pet.petid == petid) {
				return pet;
			}
		}
		return null;
	}

	sendPetList() {
		if (this.petsLoaded == false || this.loaded == false) {
			return;
		}
		this.getPetlist();
	}

	getPetlist(data?: any) {
		let listinfo: any = {};
		listinfo.curid = 0;
		if (this.curPet != null)
			listinfo.curid = this.curPet.petid;
		listinfo.list = [];
		for (const pet of this.petObjs) {
			listinfo.list.push(pet.toObj());
		}
		this.send('s2c_get_petlist', listinfo);
	}

	updatePetPoint(data: any) {
		if (!data) {
			return;
		}
		let sumpoint = 0;
		let addpoint: any = {};
		if (data.type > 1) {
			addpoint = JSON.parse(data.info);
			for (const key in addpoint) {
				sumpoint += addpoint[key];
			}
		}
		let operationPet = null;
		for (const pet of this.petObjs) {
			if (pet.petid == data.petid) {
				operationPet = pet;
				break;
			}
		}
		if (operationPet == null) {
			return;
		}

		if (data.type == 0) {
			for (const key in operationPet.ppoint) {
				operationPet.ppoint[key] = 0;
			}
		} else if (data.type == 1) {
			for (const key in operationPet.dpoint) {
				operationPet.dpoint[key] = 0;
			}
		} else if (data.type == 2) {
			let curpoint = 0;
			for (const key in operationPet.ppoint) {
				curpoint += operationPet.ppoint[key];
			}
			if (sumpoint + curpoint > operationPet.level * 4) {
				return;
			}
			for (const key in addpoint) {
				if (!operationPet.ppoint[key]) {
					operationPet.ppoint[key] = 0;
				}
				operationPet.ppoint[key] += addpoint[key];
			}
		} else if (data.type == 3) {
			let curpoint = 0;
			for (const key in operationPet.dpoint) {
				curpoint += operationPet.dpoint[key];
			}
			if (sumpoint + curpoint > PetPracticeMgr.shared.GetLevelPoint(operationPet.relive, operationPet.xlevel)) { //超过最大修炼点
				return;
			}
			for (const key in addpoint) {
				if (!operationPet.dpoint[key]) {
					operationPet.dpoint[key] = 0;
				}
				operationPet.dpoint[key] += addpoint[key];
			}
		}
		operationPet.calculateAttribute();
		this.send('s2c_update_pet', {
			info: operationPet.toObj()
		});
	}

	petLockSkill(petid: any, skillid: any) {
		// this.send('s2c_notice', {
		// 	strRichText: '功能暂未开放'
		// });
		// return;

		let pet = this.getPetByID(petid);
		if (!pet) {
			return;
		}
		let skillinfo = pet.skill_list[skillid];
		if (!skillinfo) {
			return;
		}
		if (skillinfo.lck == 1) {
			this.send('s2c_notice', {
				strRichText: '技能已经被锁定，仙玉不变'
			});
			return;
		}

		let n = pet.getLockedSkillNum();
		let cost = Math.pow(2, n) * 1000;
		let strErr = this.CostFee(1, cost, '宠物技能锁定');
		if (strErr != '') {
			this.send('s2c_notice', {
				strRichText: strErr
			});
			return;
		}

		pet.lockSkill(skillid);
	}

	petForgetSkill(petid: any, skillid: any) {
		let pet = this.getPetByID(petid);
		if (pet) {
			pet.forgetSkill(skillid);
		}
	}

	petShenShouSkill(petid: any, skillid: any) {
		let pet = this.getPetByID(petid);
		if (!pet) {
			return;
		}
		if (pet.grade < Global.petGrade.Shen) {
			return;
		}
		// if (skillid == Global.skillIds.RuHuTianYi) {
		// 	this.send('s2c_notice', {
		// 		strRichText: '该技能稍后开放！'
		// 	});
		// 	return;
		// }

		let strErr = this.CostFee(Global.goldKind.Money, 50000000);
		if (strErr != '') {
			this.send('s2c_notice', {
				strRichText: strErr
			});
			return;
		}

		pet.changeShenShouSkill(skillid);

		this.send('s2c_pet_changeSskill', {
			errorcode: Global.msgCode.SUCCESS,
			petid: petid,
			skillid: skillid,
		});
	}

	levelReward(level: any) {
		if (level > this.level)
			return;
		if (this.level_reward.split(':').indexOf(level + '') != -1)
			return;
		let level_reward = Global.require_ex('../prop_data/prop_level.json');
		let item = level_reward[level];
		if (item) {
			if (this.level_reward == '') {
				this.level_reward += level;
			} else {
				this.level_reward += ':' + level;
			}

			let reward_list = item.reward_item.split(';');
			for (let item of reward_list) {
				let reward = item.split(':');
				this.AddItem(reward[0], reward[1], false, '等级奖励');
			}
			let send_data = {
				level: level,
			};
			this.send('s2c_level_reward', send_data);
		}
	}

	changePet(petid: any, issend = true) {
		for (const pet of this.petObjs) {
			if (pet.petid == petid) {
				this.curPet = pet;
				this.curPetId = petid;
				if (issend) {
					this.send('s2c_change_pet', {
						curid: this.curPet.petid
					});
				}
				break;
			}
		}
	}

	delPet(data: any) {
		if (this.curPet != null && this.curPet.petid == data.petid) {
			this.curPet.state = 0;
			this.curPet = null;
		}
		for (let index = 0; index < this.petObjs.length; index++) {
			let tmppet = this.petObjs[index];
			if (tmppet.petid == data.petid) {
				tmppet.state = 0;
				tmppet.save();
				this.petObjs.splice(index, 1);
				console.log(`玩家[${this.name}(${this.roleid})]放生召唤兽[${tmppet.name}(${tmppet.petid})]`);
				break;
			}
		}

		let delinfo: any = {};
		if (this.curPet == null) {
			delinfo.curid = -1;
		} else {
			delinfo.curid = this.curPet.petid;
		}
		delinfo.delid = data.petid;
		this.send('s2c_del_pet', delinfo);
	}
	//////////////////////////////  宠物 结束   /////////////////////////////

	//////////////////////////////  装备 相关   /////////////////////////////

	addEquip(data: any) {
		if (this.getBagItemAllKindNum() >= Global.limitBagKindNum) {
			this.send('s2c_notice', {
				strRichText: `背包已满`
			});
			return;
		}
		let equiparr = EquipMgr.shared.makeEquipAttr(data);
		if (equiparr == null) {
			this.send('s2c_operation_result', {
				code: 0,
			});
			return;
		}
		let equip = new Equip(equiparr);
		this.listEquips.push(equip);
		this.equipObjs[equip.EquipID] = equip;
		EquipMgr.shared.addEquip(equip);

		this.send('s2c_bagitem', {
			info: JSON.stringify(this.bag_list)
		});

		this.sendEquipList();
		let equipInfo = equip.toObj();
		this.send('s2c_equip_info', {
			equip: JSON.stringify(equipInfo)
		});

		this.send('s2c_notice', {
			strRichText: `恭喜您获得了${equipInfo.EDesc}${equipInfo.EName}`
		});

		
		if (data.type > 1) {
			if (data.type == 2) {
				console.log(`玩家[${this.name}${this.roleid}]获得装备 神兵[${equipInfo.EName}(${equiparr.EquipID})]`);
			} else if (data.type == 3) {
				console.log(`玩家[${this.name}${this.roleid}]获得装备 仙器[${equipInfo.EName}(${equiparr.EquipID})]`);
			}

			let strRichText = `<color=#00ff00 > ${this.name}</c > <color=#ffffff > 获得了</c ><color=#0fffff > ${equipInfo.EDesc}${equipInfo.EName}</color >，<color=#ffffff > 真是太幸运了</c >`;
			PlayerMgr.shared.broadcast('s2c_screen_msg', {
				strRichText: strRichText,
				bInsertFront: 0
			});
		}

		DB.createEquip(this.roleid, equiparr, (ret: any, info: any) => {
			if (ret == Global.msgCode.SUCCESS) { } else {
				console.log(`装备存储失败！[${this.name}(${this.roleid})], 装备属性[${equiparr}]`);
			}
		});
	}

	createEquip(data: any) {
		if (this.getBagItemAllKindNum() >= Global.limitBagKindNum) {
			this.send('s2c_notice', {
				strRichText: `背包已满`
			});
			return;
		}
		if (data.type == 2) {
			if (!this.bag_list[10408] || this.bag_list[10408] < 50) {
				return; //神兵碎片不足
			}
			this.bag_list[10408] -= 50;
			console.log(`玩家[${this.name}${this.roleid}]消耗 神兵碎片 50 个`);
		} else if (data.type == 3) {
			if (!this.bag_list[10406] || this.bag_list[10406] < 40) {
				return; //八荒遗风不足
			}
			this.bag_list[10406] -= 40;
			console.log(`玩家[${this.name}${this.roleid}]消耗 八荒遗风 40 个`);
		}

		this.addEquip(data);
	}

	sendEquipList() {
		let listinfo: any = {};
		listinfo.use = {};
		listinfo.score = 0;
		listinfo.list = [];
		listinfo.info = {};
		for (const equip of this.curEquips) {
			listinfo.score += Number(equip.BaseScore);
			listinfo.use[equip.EIndex] = equip.EquipID;

			// let fullEquipData = equip.getFullData(this.roleid);
			listinfo.info[equip.EquipID] = equip.getSendInfo();
		}
		for (const equip of this.listEquips) {
			listinfo.list.push(equip.EquipID);
			listinfo.info[equip.EquipID] = equip.getSendInfo();
		}
		this.send('s2c_equip_list', {
			list: JSON.stringify(listinfo)
		});
	}

	getLockerEquipInfo() {
		let rInfo: any = {};
		rInfo.locker = [];
		rInfo.list = [];
		for (const equip of this.listEquips) {
			rInfo.list.push(equip.getSendInfo());
		}
		for (const equip of this.lockerEquips) {
			rInfo.locker.push(equip.getSendInfo());
		}
		return rInfo;
	}

	sendEquipInfo(equipid: any) {
		if (this.equipObjs[equipid] != null) {
			this.send('s2c_equip_info', {
				equip: JSON.stringify(this.equipObjs[equipid].toObj())
			});
		}
	}

	changeWeapon(weapon: any) {
		if (weapon != null) {
			let fullEquipData = weapon.getFullData(this.roleid);
			let weaponstr = JSON.stringify({
				gemcnt: fullEquipData.GemCnt,
				type: fullEquipData.EquipType,
				level: fullEquipData.Grade
			});
			this.send('s2c_change_weapon', {
				weapon: weaponstr
			});
		} else {
			this.send('s2c_change_weapon', {
				weapon: ''
			});
		}
	}

	upgradeEquip(data: any) {
		let equip = this.equipObjs[data.equipid];
		if (equip == null) {
			return;
		}

		if (equip.EquipType > Global.EquipType.High) {
			return;
		}

		let itemid = 10405;
		if (this.bag_list[itemid] && this.bag_list[itemid] > 0) {
			let up = equip.upgrade(data);
			if (!up) return; //升级失败
			this.AddItem(itemid, -1, false, '装备升级消耗');
			if (this.bag_list[itemid] <= 0) {
				delete this.bag_list[itemid];
			}
		} else { //没有盘古精铁
			return;
		}

		this.send('s2c_bagitem', {
			info: JSON.stringify(this.bag_list)
		});
		this.sendEquipInfo(data.equipid);

		if (equip.EIndex == 1 && this.curEquips.indexOf(equip) != -1) {
			this.changeWeapon(equip);
		}
		this.send('s2c_notice', {
			strRichText: `升级成功`
		});
	}

	shenbignUpgrade(data: any) {
		let equip = this.equipObjs[data.equipid];
		if (equip == null) {
			return;
		}

		if (equip.EquipType > Global.EquipType.ShenBing) {
			return;
		}

		if (data.use > 0 && this.equipObjs[data.use] == null) return;
		if (equip.canUpgrade() == false) {
			return;
		}
		// 是否失败
		if (equip.checkUpgradeBroke() == false) {
			if (equip.Grade == 1) {
				this.delEquip(data.equipid, true, '神兵升级破碎');
			} else {
				this.delEquip(data.use, true, '神兵升级破碎');
			}

			this.sendEquipList();
			// 神兵破碎 给 神兵碎片
			this.AddItem(10408, 5, false, '神兵升级破碎');
			this.send('s2c_notice', {
				strRichText: `神兵升级失败`
			});
		} else {
			equip.upgrade(data);
			this.delEquip(data.use, true, '神兵升级');
			this.sendEquipList();
			this.sendEquipInfo(data.equipid);

			if (equip.EIndex == 1 && this.curEquips.indexOf(equip) != -1) {
				this.changeWeapon(equip);
			}
			this.send('s2c_notice', {
				strRichText: `神兵升级成功`
			});
		}
	}

	xianqiUpGrade(data: any) {
		let equip = this.equipObjs[data.equipid];
		if (equip == null) {
			return;
		}

		if ((data.use1 > 0 && this.equipObjs[data.use1] == null) ||
			(data.use2 > 0 && this.equipObjs[data.use2] == null)) {
			return;
		}

		let up = equip.canUpgrade(data);
		if (!up) return; //升级失败

		this.delEquip(data.use1, true, `仙器[${equip.name}(${equip.EquipID})](${equip.Grade}阶)升级`);
		this.delEquip(data.use2, true, `仙器[${equip.name}(${equip.EquipID})](${equip.Grade}阶)升级`);

		equip.upgrade(data);

		this.sendEquipList();
		this.sendEquipInfo(data.equipid);

		if (equip.EIndex == 1 && this.curEquips.indexOf(equip) != -1) {
			this.changeWeapon(equip);
		}
		this.send('s2c_notice', {
			strRichText: `仙器升级成功`
		});
	}

	delEquip(equipid: any, uninlay = true, source = '') {
		if (!equipid || equipid <= 0) {
			return;
		}
		let delequip = null;
		for (let index = 0; index < this.curEquips.length; index++) { //已经装备的不能删，所以注释掉以下代码
			if (this.curEquips[index].EquipID == equipid) {
				delequip = this.curEquips[index];
				this.curEquips.splice(index, 1);
				break;
			}
		}
		for (let index = 0; index < this.listEquips.length; index++) {
			if (this.listEquips[index].EquipID == equipid) {
				delequip = this.listEquips[index];
				this.listEquips.splice(index, 1);
				break;
			}
		}
		if (delequip != null) {
			delequip.pos = Global.equipPos.UNKNOW;
			let equipfulldata = delequip.getFullData();
			console.log(`玩家[${this.name}(${this.roleid})] 装备[${equipfulldata.EName}(${delequip.EquipID})]删除 ${source}`);
			if (uninlay) {
				this.unInLay(delequip);
				this.send('s2c_bagitem', {
					info: JSON.stringify(this.bag_list)
				});
			}
			delequip.state = 0;
			delequip.save();
			delete this.equipObjs[delequip.EquipID];
			EquipMgr.shared.delEquip(delequip.EquipID);
			this.schemeMgr.deleteCurEquips(delequip.EquipID);
		}
	}

	updateEquip(data: any) {
		if (!data) {
			return;
		}
		let ret = false;
		if (data.operation == 0) {
			this.delEquip(data.equipid, true, '装备删除');
			this.sendEquipList();
			return;
		} else if (data.operation == 1 && this.equipObjs[data.equipid]) {
			//装备
			let equip = this.equipObjs[data.equipid];
			let fullEquipData = equip.getFullData(this.roleid);
			if (fullEquipData.OwnerRoleId > 0 && fullEquipData.OwnerRoleId != this.resid) {
				this.send('s2c_notice', {
					strRichText: '角色不匹配，不能使用！'
				});
				return;
			} else if ((fullEquipData.Sex != 9 && fullEquipData.Sex != this.sex) || (fullEquipData.Race != 9 && fullEquipData.Race != this.race)) {
				this.send('s2c_notice', {
					strRichText: '角色不匹配，不能使用！'
				});
				return;
			}
			// if (fullEquipData.NeedGrade > this.level || fullEquipData.NeedRei > this.relive) {
			// 	this.send('s2c_notice', {
			// 		strRichText: '角色等级不足，尚不能使用！'
			// 	});
			// 	return;//转生或等级不符合
			// }
			if (fullEquipData.Shuxingxuqiu) { //属性需求不符合
				for (const key in fullEquipData.Shuxingxuqiu) {
					if (this.getAttr1(key) < fullEquipData.Shuxingxuqiu[key]) {
						this.send('s2c_notice', {
							strRichText: '角色属性不足，尚不能使用！'
						});
						return;
					}
				}
			}

			for (let index = 0; index < this.curEquips.length; index++) {
				if (this.curEquips[index].EIndex == equip.EIndex) {
					this.curEquips[index].pos = Global.equipPos.BAG;
					this.listEquips.push(this.curEquips[index]);
					this.curEquips.splice(index, 1);
				}
			}
			equip.pos = Global.equipPos.USE;
			this.curEquips.push(equip);
			for (let index = 0; index < this.listEquips.length; index++) {
				if (this.listEquips[index].EquipID == data.equipid) {
					this.listEquips.splice(index, 1);
					break;
				}
			}
			this.sendEquipList();
			if (equip.EIndex == 1) {
				this.changeWeapon(equip);
			}
			ret = true;
		} else if (data.operation == 2 && this.equipObjs[data.equipid]) {
			//卸下
			let equip = this.equipObjs[data.equipid];
			let finduse = false;
			for (let index = 0; index < this.curEquips.length; index++) {
				if (this.curEquips[index].EquipID == data.equipid) {
					this.curEquips[index].pos = Global.equipPos.BAG;
					this.curEquips.splice(index, 1);
					finduse = true;
					break;
				}
			}
			if (finduse) {
				this.listEquips.push(equip);
				this.sendEquipList();
				if (equip.EIndex == 1) {
					this.changeWeapon(null);
				}
				ret = true;
			}
		}
		if (ret) {
			this.calculateAttr();
			this.send('s2c_player_data', this.getData());

			//将通过背包修改的装备信息，同步修改方案装备信息
			let curEqupsData: any = {}
			this.curEquips.forEach((e: any) => {
				curEqupsData[e.EIndex] = e.EquipID;
			});

			if ((data.operation == 1 || data.operation == 2) && this.schemeMgr) {
				this.schemeMgr.syncSchemeEquips(curEqupsData);
			}


		} else {
			this.send('s2c_operation_result', {
				code: Global.msgCode.FAILED
			});
		}
	}

	unInLay(equip: any) {
		if (equip == null) {
			return;
		}
		let itemlist = equip.getGemList();
		for (const itemid in itemlist) {
			if (itemlist[itemid] <= 0) {
				continue;
			}
			if (!this.bag_list[itemid]) {
				this.bag_list[itemid] = itemlist[itemid];
			} else {
				this.bag_list[itemid] += itemlist[itemid];
			}
		}
		equip.GemCnt = 0;
	}

	// 宝石镶嵌
	equipInlay(data: any) {
		let equip = this.equipObjs[data.equipid];
		if (equip == null) {
			return;
		}
		if (data.operation == 0) {
			this.unInLay(equip);
			if (equip.EIndex == 1 && this.curEquips.indexOf(equip) != -1) {
				this.changeWeapon(equip);
			}
		} else {
			if (equip.GemCnt >= equip.MaxEmbedGemCnt) {
				return;
			}
			let itemid = equip.getInlayGemID();
			if (this.bag_list[itemid] && this.bag_list[itemid] > 0) {
				this.bag_list[itemid] -= 1;
				if (this.bag_list[itemid] <= 0) {
					delete this.bag_list[itemid];
				}
				equip.GemCnt += 1;
				let item = GoodsMgr.shared.GetItemInfo(itemid);
				let itemname = '';
				if (item) {
					itemname = item.name;
				}
				console.log(`玩家[${this.name}(${this.roleid})] 装备[${equip.name}(${equip.EquipID})]镶嵌宝石[${itemname}(${itemid})]`);

				equip.calculateAttribute();

				if (equip.EIndex == 1 && this.curEquips.indexOf(equip) != -1) {
					this.changeWeapon(equip);
				}
			} else {
				return;
			}
		}
		equip.calculateAttribute();
		this.send('s2c_bagitem', {
			info: JSON.stringify(this.bag_list)
		});
		this.sendEquipInfo(data.equipid);
		this.calculateAttr();
		this.send('s2c_player_data', this.getData());
	}

	equipRefine(data: any) {
		let equip = this.equipObjs[data.equipid];
		if (equip == null) {
			return;
		}
		if (data.operation == 1) {
			if (equip.refineData == null) {
				return;
			}
			equip.LianhuaAttr = equip.refineData.slice(0);
			equip.refineData = null;
			equip.calculateAttribute();
			this.sendEquipInfo(data.equipid);
			this.calculateAttr();
			this.send('s2c_player_data', this.getData());

			this.send('s2c_notice', {
				strRichText: `炼化成功`
			});
		} else {
			let needitem = 10402;
			if (data.level == 1) needitem = 10403;
			if (data.level == 2) needitem = 10404;
			if (this.bag_list[needitem] && this.bag_list[needitem] > 0) {
				this.bag_list[needitem] -= 1;
				if (this.bag_list[needitem] <= 0) {
					delete this.bag_list[needitem];
				}
			} else { //
				this.send('s2c_notice', {
					strRichText: `材料不足`
				});
				return;
			}

			this.send('s2c_bagitem', {
				info: JSON.stringify(this.bag_list)
			});
			equip.refineData = null;
			equip.refineData = EquipMgr.shared.getLianhuaData(equip.EIndex, data.level);
			this.send('s2c_equip_property', {
				property: JSON.stringify(equip.refineData)
			});
		}
	}

	equipRecast(data: any) {
		let equip = this.equipObjs[data.equipid];
		if (equip == null) {
			return;
		}
		if (equip.EquipType == 0 || equip.EquipType == 2) {
			return;
		}
		if (data.operation == 1) {
			if (equip.recastData == null) {
				return;
			}
			equip.setDBdata(equip.recastData);
			// equip.BaseAttr = equip.recastData;
			equip.calculateAttribute();
			equip.recastData = null;
			this.sendEquipInfo(data.equipid);
			this.calculateAttr();
			this.send('s2c_player_data', this.getData());

			this.send('s2c_notice', {
				strRichText: `重铸成功`
			});
		} else {
			let itemid = 10405;
			if (equip.EquipType == 3) {
				itemid = 10401;
			}
			let itemnum = this.getBagItemNum(itemid);
			if (itemnum == 0) {
				this.send('s2c_notice', {
					strRichText: `缺少重铸材料`
				});
				return;
			}

			equip.recastData = null;
			equip.recastData = EquipMgr.shared.getRecastData({
				type: equip.EquipType,
				grade: equip.Grade,
				role: this,
				ower: equip.OwnerRoleId,
				pos: equip.EIndex,
				resid: equip.Type
			});
			if (equip.recastData) {
				this.AddBagItem(itemid, -1, false);
				this.send('s2c_equip_property', {
					// property: JSON.stringify(equip.recastData.BaseAttr)
					property: equip.recastData.BaseAttr
				});
			}
		}

	}

	buyEquip(info: any) {

	}

	sellEquip(info: any) {

	}
	//////////////////////////////  装备 结束   /////////////////////////////

	getPartnerOnBattle(): any {
		let battlelist: any = [];
		if (this.stPartnerMgr == null) {
			return battlelist;
		}

		for (var it in this.stPartnerMgr.vecChuZhan) {
			let nPartnerID = this.stPartnerMgr.vecChuZhan[it];
			if (0 == nPartnerID)
				continue;

			let pPartner = this.stPartnerMgr.mapPartner[nPartnerID];
			if (null == pPartner)
				continue;

			battlelist.push(pPartner);
		}

		return battlelist;
	}

	getBtlPet(pos: any) {
		let pets = [];
		let btlpet = null;
		for (const petid in this.petObjs) {
			const pet = this.petObjs[petid];
			let bpet = new BattleRole();
			bpet.setRole(pet);
			bpet.bindid = this.onlyid;

			if (this.curPet && pet.onlyid == this.curPet.onlyid) {
				bpet.pos = pos;
				btlpet = bpet;
			} else {
				bpet.pos = 0;
			}
			pets.push(bpet);
		}
		return {
			pets: pets,
			btlpet: btlpet
		};
	}

	
	getBtlTeam(type = Global.battleType.Normal) {
		let btlteam: any = [];
		let teamid = this.teamid;
		if (teamid != 0) {
			let team_players = TeamMgr.shared.getTeamPlayer(teamid);
			for (let i = 0; i < team_players.length; i++) {
				const pPlayer = team_players[i];
				let brole = new BattleRole();
				brole.pos = i + 1;
				brole.setRole(pPlayer);

				let pPets = pPlayer.getBtlPet(i + 6);
				if (pPets.btlpet) {
					brole.bindid = pPets.btlpet.onlyid;
				}
				btlteam.push(brole);
				btlteam = btlteam.concat(pPets.pets);
			}
			if (type == Global.battleType.Normal || type == Global.battleType.PK) {
				let partnerlist = TeamMgr.shared.getTeamLeaderPartner(teamid);
				let index = 1;
				for (const partner of partnerlist) {
					let bpartner = new BattleRole();
					bpartner.pos = team_players.length + index;
					bpartner.setRole(partner);
					btlteam.push(bpartner);
					index++;
				}
			}
		} else {
			let brole = new BattleRole();
			brole.pos = 1;
			brole.setRole(this);
			let pPets = this.getBtlPet(6);
			if (pPets.btlpet) {
				brole.bindid = pPets.btlpet.onlyid;
			}
			btlteam.push(brole);
			btlteam = btlteam.concat(pPets.pets);
			if (type == Global.battleType.Normal || type == Global.battleType.PK) {
				let partnerlist = this.getPartnerOnBattle();
				let index = 1;
				for (const partner of partnerlist) {
					let bpartner = new BattleRole();
					bpartner.pos = 1 + index;
					bpartner.setRole(partner);
					btlteam.push(bpartner);
					index++;
				}
			}
		}
		return btlteam;
	}

	forcedBattle(p1: any, battle: any) {
		if (this.teamid != 0) {
			let plist = TeamMgr.shared.getTeamPlayer(this.teamid);
			for (const pPlayer of plist) {
				pPlayer.send('s2c_btl', {
					btlid: battle.battle_id,
					teamS: battle.getTeamData(2),
					teamE: battle.getTeamData(),
				});
				pPlayer.battle_id = battle.battle_id;
			}
		} else {
			this.send('s2c_btl', {
				btlid: battle.battle_id,
				teamS: battle.getTeamData(2),
				teamE: battle.getTeamData(),
			});
			this.battle_id = battle.battle_id;
		}
	}

	// type 0 正常 1 pk 2 切磋
	playerBattle(onlyid: any, type = Global.battleType.Normal) {
		if (this.battle_id != 0 || this.onlyid == onlyid) {
			return null;
		}
		let p2 = PlayerMgr.shared.getPlayerByOnlyId(onlyid);
		if (p2 == null || p2.battle_id != 0) {
			return null;
		}
		if (this.teamid != 0 && this.isleader == false) {
			return null;
		}
		if (p2.teamid != 0 && this.teamid == p2.teamid) {
			return null;
		}
		if (type == Global.battleType.Force) {
			if (this.level < Global.PKLevelLimit || p2.level < Global.PKLevelLimit) {
				return null;
			}

			let mapsi = Global.cantPKMaps.indexOf(this.mapid);
			let mapti = Global.cantPKMaps.indexOf(p2.mapid);
			if (mapsi != -1 || mapti != -1) {
				return null;
			}
		}

		let t1 = this.getBtlTeam(type);
		let t2 = p2.getBtlTeam(type);

		let battle = BattleMgr.shared.createBattle();
		battle.setTeamBRole(t1, t2);
		battle.setBattleType(type);
		battle.source = this.onlyid;

		let senddata = {
			btlid: battle.battle_id,
			teamS: battle.getTeamData(),
			teamE: battle.getTeamData(2),
		};
		if (this.teamid != 0) {
			let plist = TeamMgr.shared.getTeamPlayer(this.teamid);
			for (const pPlayer of plist) {
				pPlayer.battle_id = battle.battle_id;
				pPlayer.send('s2c_btl', senddata);
				pPlayer.synInfoToWatcher();
			}
		} else {
			this.battle_id = battle.battle_id;
			this.send('s2c_btl', senddata);
			this.synInfoToWatcher();
		}

		p2.forcedBattle(this.onlyid, battle);

		setTimeout(() => {
			battle.begin();
		}, 1 * 1000);
		return battle;
	}

	monsterBattle(mongroupid?: any, battletype = Global.battleType.Normal, yewai = false) {
		if (this.battle_id != 0)
			return null;

		if (mongroupid == null || isNaN(mongroupid)) {
			mongroupid = 10048;
		}
		let mongroup = MonsterMgr.shared.getGroupData(mongroupid);
		if (mongroup == null) {
			return null;
		}

		let monsterlist = MonsterMgr.shared.getMonGroup(mongroupid);
		if (monsterlist == null) {
			return null;
		}
		if (this.teamid != 0 && this.isleader == false) {
			return null;
		}

		if (this.mapid == 1003) { //北俱芦洲 没有宝宝
			yewai = false;
		}
		let t1 = this.getBtlTeam(mongroup.partner);
		let t2 = [];
		for (let i = 0; i < monsterlist.length; i++) {
			const monster = monsterlist[i];
			let brole = new BattleRole();
			brole.pos = parseInt(monster.pos);
			brole.setRole(monster);
			t2.push(brole);
		}
		if (yewai && t2.length < 10) {
			let r = Global.random(1, 10000);
			if (r < 10000) {
				let list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
				for (const key in t2) {
					const brole = t2[key];
					let t = list.indexOf(brole.pos);
					list.splice(t, 1);
				}
				if (list.length > 0) {
					let bb = MonsterMgr.shared.getRandomBB();
					let brole = new BattleRole();
					brole.is_bb = true;
					brole.pos = list[Global.random(0, list.length - 1)];
					brole.setRole(bb);
					t2.push(brole);
				}
			}
		}

		let battle = BattleMgr.shared.createBattle();
		battle.setTeamBRole(t1, t2);
		battle.setBattleType(battletype);
		battle.monster_group_id = mongroupid;
		let senddata = {
			btlid: battle.battle_id,
			teamS: battle.getTeamData(),
			teamE: battle.getTeamData(2),
		};
		if (this.teamid != 0) {
			let plist = TeamMgr.shared.getTeamPlayer(this.teamid);
			for (const pPlayer of plist) {
				pPlayer.battle_id = battle.battle_id;
				pPlayer.send('s2c_btl', senddata);
				pPlayer.synInfoToWatcher();
			}
		} else {
			this.battle_id = battle.battle_id;
			this.send('s2c_btl', senddata);
			this.synInfoToWatcher();
		}

		setTimeout(() => {
			battle.begin();
		}, 1 * 1000);

		return battle;
	}

	// 战斗结束
	exitBattle(iswin: any) {
		this.send('s2c_btl_end', {
			btlid: this.battle_id,
			result: iswin,
		});

		let battle = BattleMgr.shared.getBattle(this.battle_id);
		if (battle == null) {
			this.battle_id = 0;
			return;
		}

		// 奖励相关
		let mgdata = MonsterMgr.shared.getGroupData(battle.monster_group_id);
		if (iswin == 1 && mgdata) {
			this.addExp(mgdata.exp);
			this.AddMoney(0, mgdata.gold, '战斗奖励');
			if (this.curPet) {
				this.curPet.addExp(mgdata.exp);
			}

			let itemlist = MonsterMgr.shared.makeGroupDrop(battle.monster_group_id);
			for (const iteminfo of itemlist) {
				this.AddItem(iteminfo.itemid, iteminfo.itemnum, true, '战斗奖励');
			}
		}

		// 任务相关
		if (iswin == 1) {
			if (battle.battle_type == Global.battleType.Force && battle.source == this.onlyid) {
				if (this.teamid > 0) {
					let team_players = TeamMgr.shared.getTeamPlayer(this.teamid);
					// TeamMgr.shared.destroyTeam(this.teamid);
					for (let i = 0; i < team_players.length; i++) {
						const pPlayer = team_players[i];
						pPlayer.shane += 3600 * 4;
						pPlayer.ShanEChange();
					}
				} else {
					this.shane += 3600 * 4;
					this.ShanEChange();
				}
			}

			if (battle.battle_type == Global.battleType.Normal) {
				let pNpc = NpcMgr.shared.FindNpc(battle.source);
				if (pNpc) {
					this.OnKillNpc(pNpc.configid, pNpc.onlyid);
				}
			}
			
			if (this.teamid > 0) {
				let team_players = TeamMgr.shared.getTeamPlayer(this.teamid);
				for (let player of team_players) {
					if (player && player.curPet) {
						player.curPet.addQinmi(1);
					}
				}
			} else {
				if (this.curPet) {
					this.curPet.addQinmi(1);
				}
			}
		} else {
			// 战斗失败了
			this.GetTaskMgr().OnFailEvent(Global.EEventType.FailEventPlayerDead, 0);
			let pNpc = NpcMgr.shared.FindNpc(battle.source);
			if (pNpc) {
				World.shared.pStarMgr.ChallengeFail(pNpc.onlyid);
			}
		}

		if (battle.battle_type == Global.battleType.ShuiLu) {
			let activity = ActivityMgr.shared.getActivity(ActivityDefine.activityKindID.ShuiLuDaHui);
			if (activity) {
				let matchteam = activity.getMatchTeamInfo(this.teamid);
				if (matchteam) {
					activity.battleEnd(this.teamid, iswin);
				}
			}
		} else if (battle.battle_type == Global.battleType.PALACE) {
			if (iswin && ((this.teamid != 0 && this.isleader) || this.teamid == 0)) {
				PalaceFight.shared.pkWin(this.roleid);
			}
		}

		this.battle_id = 0;
		this.synInfoToWatcher();
	}

	ShanEChange() {
		let change = false;
		if (this.mapid == 1201 && this.shane <= 0) {
			this.leavePrison();
			change = true;
		}
		if (this.mapid == 1011 && this.shane > 0) {
			this.enterPrison();
			change = true;
		}
		this.send('s2c_prison_time', {
			onlyid: this.onlyid,
			time: this.inPrison ? Math.ceil(this.shane / 4) : 0
		});
		return change;
	}

	getWorldStar() {
		return this.star;
	}

	OnKillNpc(nConfigID: any, nOnlyID: any) {
		let pNpc = NpcMgr.shared.FindNpc(nOnlyID);
		if (null == pNpc)
			return;

		let pConfig = NpcConfigMgr.shared.GetConfig(nConfigID);
		if (null == pConfig)
			return;

		this.GetTaskMgr().OnGameEvent(Global.EEventType.PlayerKillNpc, nOnlyID);

		if (pNpc.stCreater.nKind != Global.ENpcCreater.ESystem) {
			NpcMgr.shared.CheckAndDeleteNpc(nOnlyID, this);
		}
		if (World.shared.pStarMgr.IsStar(nOnlyID)) {
			this.star++;
		}
		World.shared.OnKillNpc(this.accountid, nOnlyID);
	}

	playerRelive(data: any) {
		let nextlive = this.relive + 1;
		if (nextlive > 3) {
			this.send('s2c_relive', {
				result: Global.msgCode.RELIVE_LEVEL_TOO_HIGH,
				info: this.toObj(),
				data: this.getData()
			});
			return;
		}

		let relivedata = Global.reliveLimit[nextlive];
		if (relivedata == null) {
			this.send('s2c_relive', {
				result: Global.msgCode.FAILED,
				info: this.toObj(),
				data: this.getData()
			});
			return;
		}
		if (this.level < relivedata.level) {
			return;
		}
		// if (this.jade < relivedata.price) {
		// 	return;
		// }

		// this.jade = this.jade - relivedata.jade;

		//处理装备
		for (const equip of this.curEquips) {
			this.listEquips.push(equip);
		}
		this.curEquips = [];
		this.sendEquipList();
		this.changeWeapon(null);

		//清理加点
		for (const key in this.addattr2) {
			this.addattr2[key] = 0;
		}

		this.relivelist[this.relive] = [this.race, this.sex];

		this.relive = nextlive;
		this.resid = data.resid;
		this.race = data.race;
		this.sex = data.sex;

		this.setLevel(relivedata.tolevel);

		this.initSkill();
		this.addExp(0);

		this.calculateAttr();

		this.send('s2c_relive', {
			result: Global.msgCode.SUCCESS,
			info: this.toObj(),
			data: this.getData()
		});
	}

	playerChangeRace(data: any) {
		if (this.jade < 300) {
			this.send('s2c_notice', {
				strRichText: '仙玉不足'
			});
			return;
		}
		this.AddMoney(1, -300, '玩家改变种族');

		for (const equip of this.curEquips) {
			this.listEquips.push(equip);
		}
		this.curEquips = [];
		this.sendEquipList();
		this.changeWeapon(null);

		this.resid = data.resid;
		this.race = data.race;
		this.sex = data.sex;

		//重置加点
		this.addattr2[Global.attrTypeL2.GENGU] = 0;
		this.addattr2[Global.attrTypeL2.LINGXING] = 0;
		this.addattr2[Global.attrTypeL2.MINJIE] = 0;
		this.addattr2[Global.attrTypeL2.LILIANG] = 0;

		let preaddpoint = [];
		for (const key in this.skill_list) {
			preaddpoint.push(this.skill_list[key]);
		}

		this.initSkill();
		for (const key in this.skill_list) {
			if (preaddpoint.length > 0) {
				this.skill_list[key] = preaddpoint[0];
				preaddpoint.splice(0, 1);
			} else {
				break;
			}
		}

		this.addExp(0);

		this.calculateAttr();
		this.send('s2c_changerace', {
			result: Global.msgCode.SUCCESS,
			info: this.toObj(),
			data: this.getData()
		});
	}


	GetNameLength(strName: any) {
		let nCnt = 0;

		let nLen = strName.length;

		for (let i = 0; i < nLen; i++) {
			if (/[a-zA-Z0-9]/.test(strName[i]))
				nCnt += 1;
			else
				nCnt += 2;
		}

		return nCnt;

	}



	playerChangeName(data: any) {
		if (this.jade < 600) {
			this.send('s2c_notice', {
				strRichText: '仙玉不足'
			});
			return;
		}

		let namelen = this.GetNameLength(data.name);
		if (namelen > 12 || namelen < 2) {
			this.send('s2c_notice', {
				strRichText: '名字长度错误(2~12位)'
			});
			return;
		}
		let callback = (ret: any) => {
			if (ret == Global.msgCode.SUCCESS) {
				this.AddMoney(1, -600, '玩家改变名字');
				this.send('s2c_notice', {
					strRichText: `改名成功，江湖欢迎您重新归来！`
				});
				this.name = data.name;
				this.send('s2c_aoi_pinfo', {
					list: [this.toObj()]
				});
				this.synInfoToWatcher();
			} else {
				this.send('s2c_notice', {
					strRichText: `再想一个独一无二的名字吧，仙玉未扣除！`
				});
			}
			callback = null;
		}
		DB.changeName(data, callback);
	}

	resetPoint() {
		//重置加点
		this.resetRolePoint();
		this.sendEquipList();

		this.calculateAttr();
		this.send('s2c_player_data', this.getData());
		this.send('s2c_notice', {
			strRichText: '角色加点重置成功！'
		});
	}

	sendReliveList() {
		this.send('s2c_relive_list', {
			strJson: JSON.stringify(this.relivelist)
		});
	}

	changeReliveList(data: any) {
		if (this.getBagItemNum(10201) <= 0) {
			this.send('s2c_notice', {
				strRichText: '回梦丹不足'
			});
			return;
		}

		this.AddItem(10201, -1, false, '转生修正消耗');
		let vecLiveInfo = JSON.parse(data.strJson);
		if (vecLiveInfo.length != 3)
			return;

		this.relivelist = [];
		for (var nLive in vecLiveInfo) {
			let stLive = vecLiveInfo[nLive];
			let vecInfo = [Global.getDefault(stLive.nRace, 0), Global.getDefault(stLive.nSex, 0)];
			this.relivelist.push(vecInfo);
		}

		this.calculateAttr();
		this.send('s2c_player_data', this.getData());
		this.send('s2c_notice', {
			strRichText: '修改成功'
		});
	}

	getWatcherPlayer() {
		let pMap = MapMgr.shared.getMap(this);
		if (pMap == null) return;
		return pMap.getWatcher(this.onlyid);
	}

	synPosToWatcher() {
		let mPlayers = this.getWatcherPlayer();
		if (mPlayers) {
			mPlayers[this.onlyid] = this;
			for (const key in mPlayers) {
				let p = mPlayers[key];
				if (p.isPlayer())
					p.send('s2c_player_pos', {
						onlyid: this.onlyid,
						x: this.x,
						y: this.y
					});
			}
		}
	}

	addShuiluScore(jifen: any, gongji: any, iswin: any) {
		this.shuilu.gongji += parseInt(gongji);
		this.shuilu.score += parseInt(jifen);
		if (iswin == 1) {
			this.shuilu.wtime++;
		} else {
			this.shuilu.ltime++;
		}
	}

	synInfoToWatcher() {
		let mPlayers = this.getWatcherPlayer();
		if (mPlayers) {
			for (const key in mPlayers) {
				let p = mPlayers[key];
				if (p.isPlayer())
					p.send('s2c_aoi_pinfo', {
						list: [this.toObj()]
					});
			}
		}
	}

	
	chargeReward(data: any) {
		let rewardid = data.rewardid;
		let choose_item = null;
		let num = 1 << (rewardid - 1);
		if ((num & this.rewardrecord) != 0)
			return;
		for (let item of ChargeConfig.shared.reward_list) {
			if (item.id == rewardid)
				choose_item = item;
		}
		let chargesum = ChargeSum.shared.getPlayerChargeSum(this.roleid);
		if (!choose_item || chargesum < choose_item.money)
			return;
		for (let item of choose_item.reward) {
			this.AddItem(item.gid, item.count, true, '充值奖励');
		}
		this.rewardrecord |= num;
	}

	reGetGift() {
		if (this.getgift == 0) {
			return Global.msgCode.GIFT_HAS_GOT;
		}
		let gift = Global.libao;
		if (gift) {
			for (let gitem of gift) {
				let itemid = gitem.itemid;
				let itemnum = gitem.num;
				this.AddItem(itemid, itemnum, true, '补偿礼包');
			}
		}
		this.getgift = 0;
		return Global.msgCode.SUCCESS;
	}

	getBang() {
		if (this.bangid == 0) {
			return null;
		}
		return BangMgr.shared.getBang(this.bangid);
	}
	// 称谓相关
	addTitle(type: any, titleId: any, value = '', onload = false) {
		let titlesList = this.getTitleItemByTitleId(type, titleId, value)
		if (titlesList.length <= 0) {
			//添加称谓
			let title: any = '';
			//if(type > 0 && type < 3){
			title = { "type": type, "titleid": titleId, "value": value, "onload": onload }
			this.titles.push(title);
		}
	}

	delTitle(type: any, titleId: any, value = '') {
		let delIndex = -1;
		let delItem = this.titles.find((e: any, index: any): boolean => {
			if (e.type == type && e.titleid == titleId && e.value == value) {
				delIndex = index;
				return true;
			}
			return false;
		});
		if (delIndex >= 0 && delItem) {
			if (delItem.onload) {
				this.titleId = -1;
				this.titleType = -1;
				this.titleVal = '';
			}
			this.titles.splice(delIndex, 1);
		}
	}

	getTitles() {
		this.send('s2c_title_info', {
			titles: JSON.stringify(this.titles),
		});
	}

	//通过titleID获取title信息
	getTitleItemByTitleId(type: any, titleId: any, value: any): any {
		return this.titles.filter((e: any) => {
			if (e.type == type && e.titleid == titleId && e.value == value) {
				return true;
			}
			return false;
		});
	}

	changeTitle(data: any) {
		if (data.operatetype == 1) {
			let res = this.titles.some((e: any) => {
				e.onload = false;
				return true;
			});

			if (res) {


				this.titleId = -1;
				this.titleType = -1;
				this.titleVal = '';

				this.onLoad = false;
				this.send('s2c_title_change', {
					ecode: Global.msgCode.SUCCESS,
					titleid: 0,
					type: -1,
					value: '',
					operatetype: data.operatetype
				});
			}
			return;
		} else {
			this.titles.forEach((e: any) => {

				if (e.type == data.type && e.titleid == data.titleid) {
					if ((data.type == Global.titleType.BroTitle || data.type == Global.titleType.CoupleTitle) && e.value == data.value) {
						e.onload = !e.onload;
						this.onLoad = true;
						this.titleVal = e.value;
					} else {
						this.onLoad = false;
						e.onload = !e.onload;
						this.titleVal = '';
					}

					this.titleId = e.titleid;
					this.titleType = e.type;

				}
			});



			this.send('s2c_title_change', {
				ecode: Global.msgCode.SUCCESS,
				title: this.titles,
				titleid: this.titleId,
				type: this.titleType,
				value: this.titleVal,
				operatetype: data.operatetype
			});

		}



	}

	
	canPalaceFight() {
		return (this.mapid == 1206 && this.battle_id == 0);
	}

	getIsOnline() {
		return !this.offline;
	}

	setRoleColor(index1: any, index2: any) {
		let rolecolor = Global.require_ex('../prop_data/prop_rolecolor.json');
		if (!rolecolor[this.resid]) {
			console.log(`prop_rolecolor 未找到${this.resid}`);
			return;
		}
		let data1, data2;
		let canset = true;
		if (index1 != 0) {
			data1 = rolecolor[this.resid]['color1_' + index1];
			if (data1 && parseInt(data1.color, 16) != this.color1) {
				if (!this.bag_list[data1.itemid] || this.bag_list[data1.itemid] < data1.count) {
					canset = false;
				}
			}
		}

		if (index2 != 0) {
			data2 = rolecolor[this.resid]['color2_' + index2];
			if (data2 && parseInt(data2.color, 16) != this.color2) {
				if (!this.bag_list[data2.itemid] || this.bag_list[data2.itemid] < data2.count) {
					canset = false;
				}
			}
		}

		if (canset) {
			if (data1) {
				this.update_bagitem({
					itemid: data1.itemid,
					count: data1.count,
					operation: 0,
				});
				this.color1 = parseInt(data1.color, 16);
			}
			else {
				this.color1 = 0;
			}

			if (data2) {
				this.update_bagitem({
					itemid: data2.itemid,
					count: data2.count,
					operation: 0,
				});
				this.color2 = parseInt(data2.color, 16);
			}
			else {
				this.color2 = 0;
			}
			console.log(`玩家${this.roleid}成功的进行了染色color1:${this.color1},color2:${this.color2}`);
			this.send('s2c_change_role_color', { color1: this.color1, color2: this.color2, });
			this.send('s2c_notice', { strRichText: '玩家染色成功' });
		}
	}

	clone() {
		let p: any = new Player();
		for (const key in this) {
			if (this.hasOwnProperty(key)) {
				const info = this[key];
				p[key] = info;
			}
		}
		p.accountid = -1;
		p.roleid = -1;
		return p;
	}

	
	costBell(str: any) {
		let bell_count = this.getBagItemNum(10205);
		if (bell_count <= 0) {
			return;
		}
		this.update_bagitem({
			operation: 0,
			count: 1,
			itemid: 10205,
		});
		PlayerMgr.shared.broadcast('s2c_bell_msg', {
			msg: str,
			name: this.name,
			roleid: this.roleid,
		});
		PlayerMgr.shared.broadcast('s2c_game_chat', {
			roleid: this.roleid,
			onlyid: this.onlyid,
			scale: 0,
			msg: str,
			name: this.name,
			resid: this.resid,
		});
	}

	
	setSafePassword(pass: any, lock: any) {
		this.safe_password = pass;
		this.safe_lock = lock;
		let safecode = this.safe_lock + ':' + this.safe_password;
		DB.setSafecode(this.accountid, safecode, (ret: any) => {
			if (ret == Global.msgCode.SUCCESS) {
				this.send('s2c_safepass_msg', {
					pass: this.safe_password,
					lock: this.safe_lock,
				});
			}
			else {
				this.safe_password = '';
				this.safe_lock = 0;
			}
		});
	}
	// 骑乘
	ride(mountId: number) {
		if (this.mountModel.currentId == mountId) {
			return;
		}
		this.mountModel.currentId = mountId;
		DB.ride(this.roleid, mountId,(msgCode:number,mountId: number) => {
			if(msgCode==Global.msgCode.SUCCESS){
				this.syncRide(mountId);
			}
		});
	}

	syncRide(mountId: number) {
		let mPlayers = this.getWatcherPlayer();
		if (mPlayers) {
			for (const key in mPlayers) {
				let p = mPlayers[key];
				if (p.isPlayer()) {
					p.send('s2c_sync_ride', {
						onlyId:this.onlyid,
						mountId:mountId
					});
				}
			}
		}
	}
	// 下马
	dismount() {
		if (this.mountModel.currentId == 0) {
			return;
		}
		this.mountModel.currentId = 0;
		DB.dismount(this.roleid, (msgCode:number) => {
			if(msgCode==Global.msgCode.SUCCESS){
				this.syncDismount();
			}
		});
	}
	// 同步下马
	syncDismount() {
		let mPlayers = this.getWatcherPlayer();
		if (mPlayers) {
			for (const key in mPlayers) {
				let p = mPlayers[key];
				if (p.isPlayer()) {
					p.send('s2c_sync_dismount', {
						onlyId:this.onlyid,
					});
				}
			}
		}
	}
}
