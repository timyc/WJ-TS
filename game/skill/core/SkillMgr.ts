import Global from "../../../game/core/Global";
import NormalAttack from "../NormalAttack";
import NormalDefend from "../NormalDefend";
import HeDingHongFen from "../../../game/skill/HeDingHongFen";
import WanDuGongXin from "../WanDuGongXin";
import HanQingMoMo from "../HanQingMoMo";
import ZhangYinDongDu from "../ZhangYinDongDu";
import ChuiJinZhuanYu from "../ChuiJinZhuanYu";
import JieDaoShaRen from "../JieDaoShaRen";
import ShiXinKuangLuan from "../ShiXinKuangLuan";
import MiHunZui from "../MiHunZui";
import BaiRiMian from "../BaiRiMian";
import ZuoBiShangGuan from "../ZuoBiShangGuan";
import SiMianChuGe from "../SiMianChuGe";
import LieHuoJiaoYang from "../LieHuoJiaoYang";
import JiuYinChunHuo from "../JiuYinChunHuo";
import FengLeiYongDong from "../FengLeiYongDong";
import XiuLiQianKun from "../XiuLiQianKun";
import DianShanLeiMing from "../DianShanLeiMing";
import TianZhuDiMie from "../TianZhuDiMie";
import JiaoLongChuHai from "../JiaoLongChuHai";
import JiuLongBingFeng from "../JiuLongBingFeng";
import MoShenHuTi from "../MoShenHuTi";
import TianWaiFeiMo from "../TianWaiFeiMo";
import QianKunJieSu from "../QianKunJieSu";
import ShouWangShenLi from "../ShouWangShenLi";
import MoShenFuShen from "../MoShenFuShen";
import XiaoHunShiGu from "../XiaoHunShiGu";
import YanLuoZhuiMing from "../YanLuoZhuiMing";
import QinSiBingWu from "../QinSiBingWu";
import QianNvYouHun from "../QianNvYouHun";
import XueShaZhiGu from "../XueShaZhiGu";
import XiXingDaFa from "../XiXingDaFa";
import LuoRiRongJin from "../LuoRiRongJin";
import XueHaiShenChou from "../XueHaiShenChou";
import ShiXinFeng from "../ShiXinFeng";
import MengPoTang from "../MengPoTang";
import YuanQuanWanHu from "../YuanQuanWanHu";
import ShenGongGuiLi from "../ShenGongGuiLi";
import BeiDaoJianXing from "../BeiDaoJianXing";
import PanShan from "../PanShan";
import HighZhangYinDongDu from "../HighZhangYinDongDu";
import HighYuanQuanWanHu from "../HighYuanQuanWanHu";
import HighShenGongGuiLi from "../HighShenGongGuiLi";
import HighBeiDaoJianXing from "../HighBeiDaoJianXing";
import HighPanShan from "../HighPanShan";
import GongXingTianFa from "../GongXingTianFa";
import TianGangZhanQi from "../TianGangZhanQi";
import YiHuan from "../YiHuan";
import ShanXian from "../ShanXian";
import HighShanXian from "../HighShanXian";
import YinShen from "../YinShen";
import KuMuFengChun from "../KuMuFengChun";
import XiTianJingTu from "../XiTianJingTu";
import FengHuoLiaoYuan from "../FengHuoLiaoYuan";
import MiaoShouHuiChun from "../MiaoShouHuiChun";
import FenHuaFuLiu from "../FenHuaFuLiu";
import FenLieGongJi from "../FenLieGongJi";
import HighFenLieGongJi from "../HighFenLieGongJi";
import TianMoJieTi from "../TianMoJieTi";
import FenGuangHuaYing from "../FenGuangHuaYing";
import QingMianLiaoYa from "../QingMianLiaoYa";
import XiaoLouYeKu from "../XiaoLouYeKu";
import HighTianMoJieTi from "../HighTianMoJieTi";
import HighFenGuangHuaYing from "../HighFenGuangHuaYing";
import HighQingMianLiaoYa from "../HighQingMianLiaoYa";
import HighXiaoLouYeKu from "../HighXiaoLouYeKu";
import GeShanDaNiu from "../GeShanDaNiu";
import HighGeShanDaNiu from "../HighGeShanDaNiu";
import JiQiBuYi from "../JiQiBuYi";
import HunLuan from "../HunLuan";
import FengYin from "../FengYin";
import FeiLongZaiTian from "../FeiLongZaiTian";
import FeiLongZaiTian_Feng from "../FeiLongZaiTian_Feng";
import FeiLongZaiTian_Huo from "../FeiLongZaiTian_Huo";
import FeiLongZaiTian_Shui from "../FeiLongZaiTian_Shui";
import FeiLongZaiTian_Lei from "../FeiLongZaiTian_Lei";
import YouFengLaiYi from "../YouFengLaiYi";
import YouFengLaiYi_Jin from "../YouFengLaiYi_Jin";
import YouFengLaiYi_Mu from "../YouFengLaiYi_Mu";
import YouFengLaiYi_Shui from "../YouFengLaiYi_Shui";
import YouFengLaiYi_Huo from "../YouFengLaiYi_Huo";
import YouFengLaiYi_Tu from "../YouFengLaiYi_Tu";
import BingLinChengXia from "../BingLinChengXia";
import NiePan from "../NiePan";
import QiangHuaXuanRen from "../QiangHuaXuanRen";
import QiangHuaYiHuan from "../QiangHuaYiHuan";
import ChaoMingDianChe from "../ChaoMingDianChe";
import RuHuTianYi from "../RuHuTianYi";
import StealMoney from "../StealMoney";
import ZiXuWuYou from "../ZiXuWuYou";
import HuaWu from "../HuaWu";
import JueJingFengSheng from "../JueJingFengSheng";
import XuanRen from "../XuanRen";
import RuRenYinShui from "../RuRenYinShui";



export default class SkillMgr {
	static shared=new SkillMgr();

	SkillList:any;
	constructor() {
		this.SkillList = {}
	}

	init() {
		let list:any = [
			NormalAttack, NormalDefend,
			HeDingHongFen, WanDuGongXin, JieDaoShaRen, ShiXinKuangLuan, MiHunZui, BaiRiMian, ZuoBiShangGuan, SiMianChuGe,
			LieHuoJiaoYang, JiuYinChunHuo, FengLeiYongDong, XiuLiQianKun, DianShanLeiMing, TianZhuDiMie, JiaoLongChuHai, JiuLongBingFeng,
			MoShenHuTi, HanQingMoMo, TianWaiFeiMo, QianKunJieSu, ShouWangShenLi, MoShenFuShen, XiaoHunShiGu, YanLuoZhuiMing,
			QinSiBingWu, QianNvYouHun, XueShaZhiGu, XiXingDaFa, LuoRiRongJin, XueHaiShenChou, ShiXinFeng, MengPoTang,

			// 召唤兽技能
			ZhangYinDongDu, YuanQuanWanHu, ShenGongGuiLi, BeiDaoJianXing, PanShan,
			HighZhangYinDongDu, HighYuanQuanWanHu, HighShenGongGuiLi, HighBeiDaoJianXing, HighPanShan,
			GongXingTianFa, TianGangZhanQi, XuanRen, YiHuan, ShanXian, HighShanXian, YinShen,
			ChuiJinZhuanYu, KuMuFengChun, XiTianJingTu, RuRenYinShui, FengHuoLiaoYuan,
			MiaoShouHuiChun, FenHuaFuLiu, FenLieGongJi, HighFenLieGongJi,
			TianMoJieTi, FenGuangHuaYing, QingMianLiaoYa, XiaoLouYeKu,
			HighTianMoJieTi, HighFenGuangHuaYing, HighQingMianLiaoYa, HighXiaoLouYeKu,
			GeShanDaNiu, HighGeShanDaNiu, JiQiBuYi, HunLuan, FengYin,

			// 四圣兽技能
			FeiLongZaiTian, FeiLongZaiTian_Feng, FeiLongZaiTian_Huo, FeiLongZaiTian_Shui, FeiLongZaiTian_Lei,
			YouFengLaiYi, YouFengLaiYi_Jin, YouFengLaiYi_Mu, YouFengLaiYi_Shui, YouFengLaiYi_Huo, YouFengLaiYi_Tu,

			// 神兽技能
			BingLinChengXia, NiePan, QiangHuaXuanRen, QiangHuaYiHuan, ChaoMingDianChe, RuHuTianYi,

			// 特殊技能
			StealMoney,

			// 终极技能
			ZiXuWuYou, HuaWu, JueJingFengSheng,
		];
		for (const skilltemplate of list) {
			this.addSkill(new skilltemplate());
		}
	}

	addSkill(skill:any) {
		this.SkillList[skill.skill_id] = skill;
	}

	getSkill(skillid:any) {
		return this.SkillList[skillid];
	}

	isAtkSkill(skillid:any) {
		let skill = this.getSkill(skillid);
		if (skill) {
			if (skill.action_type == Global.BtlActionType.Passive) {
				return false;
			}
			return Global.atkSkills.indexOf(skill.skill_type) != -1;
		}
		return false;
	}
	isSelfBuffSkill(skillid:any):boolean{
		let skill = this.getSkill(skillid);
		if (skill) {
			if (skill.action_type == Global.BtlActionType.Passive) {
				return false;
			}
			return skill.act_on == Global.skillActOn.Self;
		}
		return false;
	}
	isEnemyBuffSkill(skillid:any):boolean{
		let skill = this.getSkill(skillid);
		if (skill) {
			if (skill.action_type == Global.BtlActionType.Passive) {
				return false;
			}
			return Global.debuffSkills.indexOf(skill.skill_type) != -1;
		}
		return false;
	}

	isKongzhiSkill(skillid:any):boolean{
		let skilllist = [
			Global.skillIds.JieDaoShaRen,
			Global.skillIds.MiHunZui,
			Global.skillIds.ZuoBiShangGuan,
			Global.skillIds.ShiXinKuangLuan,
			Global.skillIds.BaiRiMian,
			Global.skillIds.SiMianChuGe,
			Global.skillIds.MengPoTang,
			Global.skillIds.ShiXinFeng,
		]
		return skilllist.indexOf(skillid) != -1;
	}

	isCanShanbiSkill(skillid:any):boolean{
		let skilllist = [
			Global.skillIds.NormalAtkSkill,
		]
		return skilllist.indexOf(skillid) != -1;
	}

	validSkillId(skillid:any):boolean{
		for (let key in Global.skillIds) {
			let sid = Global.skillIds[key];
			if (sid == skillid) {
				return true;
			}
		}
		return false;
	}
}