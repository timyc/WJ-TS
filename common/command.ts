import Global from "../game/core/Global";

var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', function (line:any) {
    switch (line.trim()) {
        case 'hello':
            console.log('hello commander!');
            break;
        case 'mem':
            let rss = process.memoryUsage().rss;
            let rssf = (rss / (1024 * 1024)).toFixed(2) + 'm';
            console.log('memory usage:', rss, rssf);
            break;
        case 'close':
            console.log('ServerType', Global.serverType);
            console.log('请等待，服务器关闭入口，保存数据');
            if (Global.serverType == 'game'){
                let lauch = require('../game/launch');
                lauch.close(() => {
                    console.log('服务器即将关闭');
                    rl.close();
                })
            }
            if (Global.serverType == 'gate') {
                rl.close();
            }
            break;
        default:
            console.log('invail command!');
            break;
    }
});

rl.on('close', function () {
    console.log('bye bye');
    process.exit(0);
});