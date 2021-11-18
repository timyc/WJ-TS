// 网关服务器
let SERVER_NAME = '网关服';
let ClientVersion = '1.0.0';

// http监听ip
let HTTP_IP = "127.0.0.1";
let NET_IP = '127.0.0.1';
let NET_PORT = 8561;
let HTTP_PORT = 8561;
let CLI_PORT = 8591;

exports.HTTP = {
    IP: HTTP_IP,
    LOCAL: "127.0.0.1",
    PORT: HTTP_PORT,
}

exports.NET = {
    IP: NET_IP,
    LOCAL:"127.0.0.1",
    PORT: NET_PORT,
}

exports.CLI = {
    PORT: CLI_PORT,
}

exports.guideServerId = 1000;

exports.ServerList = [{
    id: 1000,
    name: '测试区',
}, {
    id: 1001,
    name: '即将公测',
},]

exports.WhiteList = [];