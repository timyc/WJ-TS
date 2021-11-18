import Packet from "./Packet";
let ByteBuffer=require("byte-buffer");

export default class AgentBase{

    id:number;
    connected:boolean;
    socket:any;
    _buffer:any;
    lastPing:number;
    packet:Packet;
    dt:number;

    constructor(socket:any) {
        this.id = -1;
        this.connected = false;
        this.socket = socket;
        // this._buffer = Buffer.alloc(buffer_max_length); //new Buffer(buffer_max_length);
        this._buffer = new ByteBuffer(1024*2);
        this.lastPing = 0;
        this.packet = new Packet();
    }

    formatBuffer(buffer:any) {
        var bufferArray = Object.keys(buffer).map(function (k) {
            return buffer[k];
        })
        return bufferArray
    }

    init() {
        let list1 = require('./default_slist');
        let list2 = require('./proto_c');
        let msglist = Object.assign(list1, list2);

        this.socket.on('close', () => {
            this.close();
        });
        this.socket.onopen =  () => {
            this.connection=true;
        };
        this.socket.onerror = () => {
            this.error();
        };

        this.socket.on('message', (data:any) => {
            // let buffer = this._buffer;
            if(typeof data == 'string'){
                this.onStrMsg(data);
                return;
            }
            let arrbuffer = this.formatBuffer(data);
            let buffer = new ByteBuffer(arrbuffer);
            let headlen = buffer.readShort();
            let msgtype = buffer.readString(headlen);
            let func = msglist[msgtype];
            if (func) {
                this.packet.setTemplate(msgtype);
                buffer = buffer.slice(buffer._index, buffer.byteLength);
                let pdata = this.packet.todata(buffer.toArray());
                func(this, pdata);
            }
            buffer = null;
        });
    }

    onStrMsg(str:string){
        if(str == 'ping'){
            this.ping();
        }
    }

    send(event:any, obj:any) {
        if (this.socket == null || this.socket.readyState != 1) {
            return;
        }
        if (typeof (event) == "string") {
            // let pack = new packet(event);
            let pack = this.packet;
            pack.setTemplate(event);
            // pack.create(obj);
            let buffer = pack.tobuffer(obj);
            this.socket.send(buffer);
            pack.clean();
        } else {
            // let pack = event;
            // let head = pack.tobuffer();
            // console.log('send2:' + buffer.buffer);
            // this.socket.send(pack.tobuffer().buffer);
            // pack = null;
        }
    }

    update(dt:number) {
        this.dt = dt;
        // 超过60秒 没收到 ping 就断开连接
        if (this.lastPing != 0 && this.dt - this.lastPing > 60 * 1000) {
            this.destroy();
        }
    }

    set connection(value:boolean) {
        this.connected = value;
    }

    destroy() {
        this.socket = null;
    }

    disconnect(data?:any) {
        this.socket = null;
    }

    ping(send = true) {
        if (this.socket && send) {
            this.socket.send('pong',{ binary: false});
        }
        this.lastPing = this.dt; //Date.now();
    }

    close() {
        this.socket = null;
        console.log(`agent[${this.id}] socket, close`);
    }

    error() {
        this.socket = null;
        console.log(`agent[${this.id}] socket, error`);
    }
}