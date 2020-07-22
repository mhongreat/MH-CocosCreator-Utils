const { ccclass, property } = cc._decorator;

@ccclass
export default class UITipMessage extends cc.Component {
    
    @property(cc.Node)
    tip: cc.Node = null;
    @property(cc.Label)
    tipContent: cc.Label = null;
    @property(cc.Node)

    tipBox: cc.Node = null;
    @property(cc.Label)
    tipBoxContent: cc.Label = null;
    @property(cc.Button)
    btnConfirm: cc.Button = null;
    @property(cc.Button)
    btnCancel: cc.Button = null;

    cbConfirm: Function = null;
    cbCancel: Function = null;

    onLoad() {
        this.tip.opacity = 0;
        this.tip.zIndex = 2;
        this.tipBox.active = false;
        this.tipBox.zIndex = 1;
    }

    /**
     * 显示提示
     * @param content 提示内容
     * @param delay 延迟消失时间
     */
    showTip(content: string, delay = 1.2) {
        this.tip.stopAllActions();
        this.tip.opacity = 255;
        this.tipContent.string = content;
        this.tip.stopAllActions();
        cc.tween(this.tip)
            .delay(delay)
            .to(0.2, { opacity: 0 })
            .start();
    }

    

    /**
     * 显示提示框
     * @param content 提示内容
     * @param boxType 提示框类型 1：一个确认按钮 2：确认和取消按钮
     * @param opts 确认和取消按钮回调
     */
    showTipBox(content: string, boxType = 2, opts: { cbConfirm?: Function, cbCancel?: Function } = {}) {
        this.tipBox.active = true;
        this.tipBoxContent.string = content;
        this.btnConfirm.node.once("click", this.Confirm, this);
        this.btnCancel.node.once("click", this.Cancel, this);
        this.btnCancel.node.active = boxType == 2;
        this.cbConfirm = opts.cbConfirm;
        this.cbCancel = opts.cbCancel;
    }

    Confirm() {
        this.cbConfirm && this.cbConfirm();
        this.tipBox.active = false;
    }

    Cancel() {
        this.cbCancel && this.cbCancel();
        this.tipBox.active = false;
    }

}

