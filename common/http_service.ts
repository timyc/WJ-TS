import express = require("express");

const app:express.Application = express();

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});



exports.start = (config:any) => {
    let list = config.funclist;
    for (let reg in list) {
        if (list.hasOwnProperty(reg)) {
            let func = list[reg];
            app.get('/' + reg, func);
        }
    }
    app.listen(config.port);
}

exports.app = app;
