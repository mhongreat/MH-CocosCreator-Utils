import { EventUtil } from "../utils/EventUtil";

export class SocketConnect extends cc.Component{
    public constructor(url: string) {
        super();
        this.url = url;
    }
    private url: string = null;
    private ws: WebSocket = null;
    private autoConnect = false;
    private tick = 5;//当5s未收到服务器消息时，向服务器发一个心跳包，确保连接正常

    public openSocket() {
        if (!this.url) return;
        this.ws = new WebSocket(this.url);
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.tick = 5;
    }

    public closeSocket() {
        this.autoConnect = false;
        this.ws && this.ws.close();
    }

    private onOpen() {
        this.autoConnect = true;
        this.schedule(this.starTick, 1, cc.macro.REPEAT_FOREVER, 1);
        console.log(this.url + ": socket opened");
    }

    private onMessage(event: MessageEvent) {
        this.tick = 5;
        this.handlerMessage(event.data);
    }

    private onError() {
        console.log(this.url + ": socket fired an error");
    }

    private onClose(event) {
        if (this.autoConnect) {
            //auto connect
            console.log("auto connect");
            
        }
        this.unschedule(this.starTick);
        console.log(this.url + ": socket closed ",event.reason);
    }

    private starTick() {
        this.tick--;
        if (this.tick == 0) {
            this.sendMessage(0, "active");
        }
        if (this.tick == -6) {
            this.ws && this.ws.close();
            this.onClose({reason:"tick timeout"});
        }
    }

    private handlerMessage(data) {
        console.log(data);
        let obj = JSON.parse(data);
        let msgId = obj.msgId;
        let content = obj.content;
        EventUtil.emit(msgId, content);
    }

    public sendMessage(msgId, content) {
        this.ws.send(JSON.stringify({ msgId: msgId, content: content }));
    }


}