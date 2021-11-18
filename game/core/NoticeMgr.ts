import Global from "../../game/core/Global";
import DB from "../../utils/DB";
import PlayerMgr from "../object/PlayerMgr";

export default class NoticeMgr{
	static shared=new NoticeMgr();
	notice_list:any[];
	notice_max_count:number;
	loop_tm:number;
	all_loop_tm:number;
	notice_index:number;
	refrush_tm:number;
	gm_notice_list:any[];
	
	constructor () {
		this.notice_list      = [];
		this.notice_max_count = 30;
		this.loop_tm          = 0;
		this.all_loop_tm      = 30 * 20 * 1000;
		this.notice_index     = 0;
		this.refrush_tm       = 60 * 60 * 1000;
		this.gm_notice_list   = [];
	}

	init(){
		this.loadNoticeFromDB();
	}

	loadNoticeFromDB () {
		DB.getScrollNotice(Global.serverID, this.notice_max_count, (ret:any, rows:any) => {
			if (ret) {
				this.notice_list = [];
				for (let item of rows) {
					this.notice_list.push(item);
				}
				this.notice_index = 0;
			}
		});
	}

	addNewNotice (notice:any) {
		console.log('add notice', notice.id);
		notice.tm = notice.interval * 1000;
		notice.isgm = true;
		this.gm_notice_list.push(notice);
		this.sendNotice(notice);
	}

	sendNotice (notice:any) {
		if (! notice)
			return;
		if (notice.isgm)
			notice.tm = notice.interval * 1000;
		if (notice.times && notice.times > 0) {  
			-- notice.times;
			if (notice.times == 0) {
				this.gm_notice_list.splice(this.gm_notice_list.indexOf(notice), 1);
			}
		}
		console.log(notice.text, notice.times);
		if (notice.type == 1 || notice.type == 3) {
			PlayerMgr.shared.broadcast('s2c_screen_msg', {
				strRichText: notice.text
			});
		}
		if (notice.type == 2 || notice.type == 3) {
			PlayerMgr.shared.broadcast('s2c_game_chat', {
				scale: 3,
				msg: notice.text,
				name: '',
				resid: 0,
				teamid: 0,
			});
		}
	}

	delNotice (id:any) {
		for (let item of this.gm_notice_list)
			if (item.id == id)
				this.gm_notice_list.splice(this.gm_notice_list.indexOf(item), 1);
	}

	getNotice () {
		if (this.notice_index >= this.notice_list.length)
			this.notice_index = 0;
		let notice = this.notice_list[this.notice_index];
		++ this.notice_index;
		return notice;
	}

	resetNoticeIndex () {
		this.notice_index = 0;
	}

	update (dt:number) {
		this.loop_tm -= dt;
		this.refrush_tm -= dt;
		if (this.loop_tm <= 0) {
			this.loop_tm = this.all_loop_tm/this.notice_max_count;
			this.sendNotice(this.getNotice()); 
		}
		
		for (let notice of this.gm_notice_list) {
			if (notice.interval && notice.tm) {
				notice.tm -= dt;
				if (notice.tm <= 0) {
					this.sendNotice(notice);
				}
			}
		}
	}
}
