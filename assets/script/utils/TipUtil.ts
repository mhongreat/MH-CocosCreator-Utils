import { PanelMgr, PanelEnum } from "../ui/PanelMgr";

/** 提示工具类 */
export default class TipUtil {
    /*  
     提示和提示框预制体要求
     1、提示：content子节点显示提示内容
     2、提示框： content子节点显示提示内容；btns子节点下包含两个按钮，名字分别为ok和cancel
     */
    static _tip: cc.Node = null;
    static _tipBox: cc.Node = null;
    static _cbOk = null;
    static _cbCancel = null;

    /**
     * 显示提示
     * @param content 提示内容
     */
    static showTip(content: string, delay = 1.2) {
        if (TipUtil._tip && TipUtil._tip.isValid) {
            TipUtil._tip.stopAllActions();
        }
        PanelMgr.addPanel(PanelEnum.Tip, true, 101).then(tip => {
            TipUtil._tip = tip;
            TipUtil._tip.opacity = 255;
            TipUtil._tip.getChildByName("content").getComponent(cc.Label).string = content;
            cc.tween(TipUtil._tip)
                .delay(delay)
                .to(0.2, { opacity: 0 })
                .call(() => {
                    TipUtil._tip.emit("close");
                })
                .start();
        });
    }

    /**
     * 显示提示框
     * @param content 提示内容
     * @param boxType 提示框类型 1：一个确认按钮 2：确认和取消按钮
     * @param opts 确认和取消按钮回调
     */
    static showTipBox(content: string, boxType = 1, opts: { cbOk?: Function, cbCancel?: Function } = {}) {
        PanelMgr.addPanel(PanelEnum.TipBox, true, 100).then(tipBox => {
            TipUtil._tipBox = tipBox;
            TipUtil._tipBox.getChildByName("content").getComponent(cc.Label).string = content;
            let btns = TipUtil._tipBox.getChildByName("btns");
            let ok = btns.getChildByName("ok");
            let cancel = btns.getChildByName("cancel");
            ok.once("click", TipUtil.OK);
            cancel.once("click", TipUtil.Cancel);
            cancel.active = boxType == 2;
            TipUtil._cbOk = opts.cbOk;
            TipUtil._cbCancel = opts.cbCancel;
        });

    }

    static OK() {
        TipUtil._cbOk && TipUtil._cbOk();
        this._tipBox.emit("close");
    }

    static Cancel() {
        TipUtil._cbCancel && TipUtil._cbCancel();
        this._tipBox.emit("close");
    }

}

