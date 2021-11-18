export default class ActivityDefine {

    static activityKindID:any={
        HongBao: 1001,
        ShuiLuDaHui: 1002,
        TianJiangLingHou: 1003,
        Zhenbukui: 1004,
        ChongZhi: 1005,
    }

    // 1 每天开放 2 每周周几 3 每月定时 4 固定时段每天开放 5 固定时段全天开放
    static openType:any = {
        EveryDay: 1,
        EveryWeek: 2,
        EveryMonth: 3,
        DayTime: 4,
        DateTime: 5,
    }

    static activityState:any = {
        Close: 0,
        ReadyOpen: 1,
        Opening: 2,
        ReadyClose: 3,
    }
}
