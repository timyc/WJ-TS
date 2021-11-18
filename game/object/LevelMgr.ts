export default class LevelMgr {
	static shared=new LevelMgr();
	roleLevelData: any[];
	petLevelData: any[];
	partnerLevelData: any[];
	roleQianNengCount: number[];

	constructor() {
		this.roleLevelData = [];
		this.petLevelData = [];
		this.partnerLevelData = [];
		this.roleQianNengCount = [0];
	}

	init(){
		let propLevel = require ("../prop_data/prop_level");
		for (const id in propLevel) {
			if (propLevel.hasOwnProperty(id)) {
				const data = propLevel[id];
				if (data.kind == 1){
					this.roleLevelData[data.level] = data;
				}
				if (data.kind == 2) {
					this.petLevelData[data.level] = data;
				}
				if (data.kind == 3) {
					this.partnerLevelData[data.level] = data;
				}
			}
		}
		let role_qianneng = 0;
		let i = 0;
		for (const data of this.roleLevelData) {
			i++;
			role_qianneng += data.qianneng;
			this.roleQianNengCount[i] = role_qianneng;
		}
	}

	getRoleLevelData(level:any){
		return this.roleLevelData[level];
	}

	getRoleLevelQianneng(level:any){
		return this.roleQianNengCount[level];
	}
}