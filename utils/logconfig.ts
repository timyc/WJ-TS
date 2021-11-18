module.exports = (gametype:any) =>{
    var log4js = require('log4js');
    log4js.configure({
        appenders: [{
            type: "console",
            category: "console"
        },
        {
            type: "dateFile",
            filename: __dirname + '/../logs/' + gametype,
            alwaysIncludePattern: true,
            pattern: "-yyyy-MM-dd-hh.log",
            category: "console"
        }
        ],
        replaceConsole: true,
        levels: {
            "console": "ALL",
        }
    });
}