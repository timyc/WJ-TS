
let ByteBuffer = require('byte-buffer');
var ProtoBuf = require("protobufjs");
var root = ProtoBuf.loadSync(__dirname + "/c2s.proto");

export default class Packet {
    template:any;
    msg_type:string;
    msg:any;
    pack:any;
    buffer:any;

    constructor(template?:any) {
        this.msg_type = 'c2s';
        if (template) {
            this.template = template;
            this.msg = root.lookupType(`commander.${this.msg_type}.${this.template}`);
        }
        this.pack = null;
        this.buffer = null;
    }

    setTemplate(template:any) {
        this.template = template;
        this.msg = root.lookupType(`commander.${this.msg_type}.${this.template}`);
    }

    create(obj:any) {
        this.pack = this.msg.create(obj);
    }

    toBase64(content:any) {
        return Buffer.from(content).toString('base64');
    }

    fromBase64(content:any) {
        return Buffer.from(content, 'base64').toString();
    }

    formatBuffer(buffer:any) {
        var bufferArray = Object.keys(buffer).map(function (k) {
            return buffer[k];
        })
        return bufferArray
    }

    todata(buffer:any) {
        return this.msg.decode(buffer);
    }

    tobuffer(obj:any) {
        let pack = this.msg.create(obj);
        let buff = this.msg.encode(pack).finish();
        let buffer = new ByteBuffer(this.template.length + 2 + buff.length);
        buffer.writeShort(this.template.length);
        buffer.writeString(this.template);
        buffer.write(buff);
        this.buffer = buffer;
        return buffer.buffer;
    }

    clean(){
        this.buffer = null;
    }
}