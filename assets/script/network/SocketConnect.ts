import { EventManager } from "../utils/EventManager";

export class SocketConnect {
    private constructor() { }
    private static _inst: SocketConnect = null;
    public static get inst() {
        if (!this._inst) {
            this._inst = new SocketConnect();
        }
        return this._inst;
    }

    private ws: WebSocket = null;
    private autoConnect = false;

    public openSocket() {
        this.ws = new WebSocket("ws://echo.websocket.org");
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
        this.ws.onclose = this.onClose.bind(this);
    }

    public closeSocket() {
        this.autoConnect = false;
        this.ws && this.ws.close();
    }

    private onOpen() {
        this.autoConnect = true;
        console.log("socket opened");
    }

    private onMessage(event: MessageEvent) {
        this.handlerMessage(event.data);
    }

    private onError() {
        console.log("socket fired an error");
    }

    private onClose(event: CloseEvent) {
        if (this.autoConnect) {
            //auto connect
        }
        console.log("socket closed,", event.reason);
    }

    private handlerMessage(data) {
        console.log(data);
        let obj = JSON.parse(data);
        let msgId = obj.msgId;
        let content = obj.content;
        EventManager.emit(msgId,content);
    }

    public sendMessage(msgId, content) {
        this.ws.send(JSON.stringify({ msgId: msgId, content: content }));
    }


}