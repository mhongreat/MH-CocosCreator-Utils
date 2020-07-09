import { SocketConnect } from "../../script/network/SocketConnect";
import { EventUtil } from "../../script/utils/EventUtil";
import { HttpRequest } from "../../script/network/HttpRequest";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestNetwork extends cc.Component {
    @property(cc.Label)
    showText1: cc.Label = null;

    @property(cc.Label)
    showText2: cc.Label = null;

    @property(cc.EditBox)
    editBox: cc.EditBox = null;

    socketConn: SocketConnect = new SocketConnect("ws://echo.websocket.org");
    onLoad() {
        this.socketConn.openSocket();
        EventUtil.on(1000, content => {
            this.showText2.string = content;
        });
    }

    sendMessage() {
        this.socketConn.sendMessage(1000, this.editBox.string);
    }

    async httpRequest() {
        let content = await HttpRequest.inst.request("POST", "");
        this.showText1.string = content as string;
    }
}
