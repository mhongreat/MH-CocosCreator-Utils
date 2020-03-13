const { ccclass, property } = cc._decorator;

/** 
 * 面板的一些通用功能
 */
@ccclass
export default class Panel extends cc.Component {
    @property({
        displayName: "销毁",
        tooltip: "面板关闭时是否销毁节点"
    })
    destroyNode: boolean = false;
    @property({
        tooltip: "显示时是否开启动画",
        displayName: "显示动画"
    })
    showAct: boolean = true;
    @property({
        tooltip: "关闭时是否开启动画",
        displayName: "关闭动画"
    })
    closeAct: boolean = true;

    closeBtn: cc.Node = null;//关闭按钮，按钮所在节点名字必须为closeBtn

    onLoad() {
        this.bindCloseBtnEvent();
        this.node.on("close", this.closePanel, this);
    }

    onEnable() {
        this.showPanel();
    }

    showPanel() {
        this.node.emit("show_start")
        this.node.scale = 0.85;
        this.node.pauseSystemEvents(true);
        cc.tween(this.node)
            .to(0.3, { scale: 1 }, { easing: "elasticOut" })
            .call(() => {
                this.node.resumeSystemEvents(true);
                this.node.emit("show_end")
            })
            .start();
    }

    closePanel(closeAct) {
        this.node.emit("close_start");
        if (typeof closeAct != "boolean") closeAct = this.closeAct;
        let close = () => {
            if (this.destroyNode) {
                this.node.destroy();
            } else {
                this.node.active = false;
            }
            this.node.emit("close_end");
        }
        if (closeAct) {
            this.node.pauseSystemEvents(true);
            cc.tween(this.node)
                .to(0.3, { scale: 0.5 }, { easing: "elasticIn" })
                .call(close)
                .start();
        } else {
            close();
        }
    }

    bindCloseBtnEvent() {
        this.closeBtn = this.node.getChildByName("closeBtn");
        if (this.closeBtn) {
            let ev = new cc.Button.EventHandler();
            ev.target = this.node;
            ev.component = "Panel";
            ev.handler = "closePanel";
            let button = this.closeBtn.getComponent(cc.Button);
            if (button) {
                button.clickEvents.push(ev);
            } else {
                console.warn("closeBtn节点上没有Button组件");
            }
        }
    }

}

