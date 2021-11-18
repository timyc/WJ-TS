let netlist = {
    ['connect']: (lsocket:any, data:any) => {
        console.log('socket connect');
        lsocket.connected && lsocket.connected();
    },

    ['connection']: (lsocket:any, data:any) => {
        console.log('socket connection');
    },

    ['open']: (lsocket:any, data:any) => {
        console.log('socket open');
    },

    ['disconnect']: (lsocket:any, data:any) => {
        lsocket.disconnect && lsocket.disconnect();
    },

    ['ping']: (lsocket:any, data:any) => {
        lsocket.ping && lsocket.ping();
    },

    ['pong']: (lsocket:any, data:any) => {
        lsocket.pong && lsocket.pong();
    },

    ['close']: (lsocket:any, data:any) => {
        lsocket.close && lsocket.close();
    },

    ['error']: (lsocket:any, data:any) => {
        lsocket.error && lsocket.error();
    },

    ['reconnect']: (lsocket:any, data:any) => {
        console.log('socket reconnect');
    },

    ['connect_timeout']: (lsocket:any, data:any) => {
        console.log('socket connect_timeout');
    },

    ['connect_error']: (lsocket:any, data:any) => {
        if (lsocket.connect_error) {
            lsocket.connect_error();
        }
    },
};

module.exports = netlist;
// lsocket => {
//     for (let event in netlist) {
//         if (netlist.hasOwnProperty(event)) {
//             let func = netlist[event];
//             lsocket.socket.on(event, data => {
//                 if (event != "ping" && event != "pong") console.log("<receive data>", event, data);
//                 func(lsocket, data);
//             });
//         }
//     }
// }
