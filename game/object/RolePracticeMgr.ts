import Global from "../../game/core/Global";

export default class RolePracticeMgr {
  static shared = new RolePracticeMgr();
  MaxPointKang: any = {
    [Global.attrTypeL1.DFENGYIN]: [16, 20, 24, 26],
    [Global.attrTypeL1.DHUNLUAN]: [16, 20, 24, 26],
    [Global.attrTypeL1.DHUNSHUI]: [16, 20, 24, 26],
    [Global.attrTypeL1.DYIWANG]: [16, 20, 24, 26],

    [Global.attrTypeL1.DFENG]: [10, 12, 14, 16],
    [Global.attrTypeL1.DSHUI]: [10, 12, 14, 16],
    [Global.attrTypeL1.DHUO]: [10, 12, 14, 16],
    [Global.attrTypeL1.DDU]: [10, 12, 14, 16],
    [Global.attrTypeL1.DLEI]: [10, 12, 14, 16],
    [Global.attrTypeL1.DGUIHUO]: [10, 12, 14, 16],
    [Global.attrTypeL1.DSANSHI]: [10, 12, 14, 16],

    [Global.attrTypeL1.PXISHOU]: [10, 15, 20, 25],
    [Global.attrTypeL1.PMINGZHONG]: [10, 15, 20, 25],
    [Global.attrTypeL1.PSHANBI]: [10, 15, 20, 25],
    [Global.attrTypeL1.PLIANJI]: [3, 3, 3, 3],
    [Global.attrTypeL1.PLIANJILV]: [10, 15, 20, 25],
    [Global.attrTypeL1.PKUANGBAO]: [10, 15, 20, 25],
    [Global.attrTypeL1.PPOFANG]: [10, 15, 20, 25],
    [Global.attrTypeL1.PPOFANGLV]: [10, 15, 20, 25],
    [Global.attrTypeL1.PFANZHENLV]: [10, 13, 16, 16],
    [Global.attrTypeL1.PFANZHEN]: [10, 13, 16, 19]
  }

  YinLiang: any = {
    [0]: 825,
    [1]: 2112,
    [2]: 3717,
    [3]: 7416,
    [4]: 10188,
    [5]: 16600,
    [6]: 25062,
    [7]: 30738,
    [8]: 36482,
    [9]: 43517,
    [10]: 48900,
    [11]: 53966,
    [12]: 54851,
    [13]: 55801,
    [14]: 56815,
    [15]: 57893,
    [16]: 59033,
    [17]: 60236,
    [18]: 61501,
    [19]: 62826,
    [20]: 64212,
    [21]: 65659,
    [22]: 67165,
    [23]: 68731,
    [24]: 70355,
    [25]: 76079,
    [26]: 78181,
    [27]: 80358,
    [28]: 82609,
    [29]: 84933,
    [30]: 87330,
    [31]: 89801,
    [32]: 92344,
    [33]: 94960,
    [34]: 97648,
    [35]: 100408,
    [36]: 103240,
    [37]: 107595,
    [38]: 114602,
    [39]: 121909,
    [40]: 129524,
    [41]: 137452,
    [42]: 145700,
    [43]: 154274,
    [44]: 163181,
    [45]: 172426,
    [46]: 182015,
    [47]: 191956,
    [48]: 202254,
    [49]: 212915,
    [50]: 286043,
    [51]: 301089,
    [52]: 326641,
    [53]: 342707,
    [54]: 359295,
    [55]: 376411,
    [56]: 394314,
    [57]: 418064,
    [58]: 447245,
    [59]: 466989,
    [60]: 487304,
    [61]: 508197,
    [62]: 529676,
    [63]: 551748,
    [64]: 574421,
    [65]: 594158,
    [66]: 621514,
    [67]: 646266,
    [68]: 671650,
    [69]: 697673,
    [70]: 754342,
    [71]: 781665,
    [72]: 829648,
    [73]: 838300,
    [74]: 907627,
    [75]: 1082194,
    [76]: 1283276,
    [77]: 1317827,
    [78]: 1334797,
    [79]: 1351800,
    [80]: 1368836,
    [81]: 1385907,
    [82]: 1403010,
    [83]: 1420148,
    [84]: 1437320,
    [85]: 1454526,
    [86]: 1471766,
    [87]: 1489040,
    [88]: 1506348,
    [89]: 1523691,
    [90]: 1541069,
    [91]: 1558481,
    [92]: 1575928,
    [93]: 1593410,
    [94]: 1610926,
    [95]: 1628478,
    [96]: 1646065,
    [97]: 1663687,
    [98]: 1681345,
    [99]: 1699037,
    [100]: 1719180,
    [101]: 1734290,
    [102]: 1749386,
    [103]: 1764470,
    [104]: 1779542,
    [105]: 1794601,
    [106]: 1809649,
    [107]: 1824685,
    [108]: 1839709,
    [109]: 1854722,
    [110]: 1869725,
    [111]: 1884716,
    [112]: 1899697,
    [113]: 1914667,
    [114]: 1929627,
    [115]: 1944577,
    [116]: 1959517,
    [117]: 1974447,
    [118]: 1989368,
    [119]: 2004279,
    [120]: 2019181,
    [121]: 2034074,
    [122]: 2048959,
    [123]: 2063834,
    [124]: 2078701,
    [125]: 0,
  }

  MaxPracticeLevel: any = {
    [0]: 25,
    [1]: 50,
    [2]: 75,
    [3]: 100
  }

  MaxPracticePoint: any = {
    [0]: 25,
    [1]: 50,
    [2]: 75,
    [3]: 100
  }

  attrTypeL1: any;
  constructor() {
    this.attrTypeL1 = Global.attrTypeL1;
  }

  Init() {
  }

  GetMaxAddPoint(relive: any, type: any): any {
    return this.MaxPointKang[type][relive];
  }

  GetUpdateYinLiang(level: any): any {
    return this.YinLiang[level];
  }

  GetMaxPriactiveLevel(relive: any): any {
    return this.MaxPracticeLevel[relive];
  }

  GetMaxPoint(relive: any): any {
    return this.MaxPracticePoint[relive];
  }

  GetLevelPoint(relive: any, level: any): any {
    if (level > this.MaxPracticePoint[relive]) {
      return this.MaxPracticePoint[relive];
    }
    return level;
  }
}