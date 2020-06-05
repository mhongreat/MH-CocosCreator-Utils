/** 
 * 提示信息工具类
 */
export class TipMessage {
    private constructor() { }
    private static _inst: TipMessage = null;
    public static get inst() {
        if (!TipMessage._inst) {
            TipMessage._inst = new TipMessage();
        }
        return TipMessage._inst;
    }

    /*  
     提示和提示框预制体要求
     1、提示：content子节点显示提示内容
     2、提示框： content子节点显示提示内容；btns子节点下包含两个按钮，名字分别为confirm和cancel
     */
    private tip: cc.Node = null;
    private tipBox: cc.Node = null;
    private cbConfirm = null;//提示框确认按钮回调
    private cbCancel = null;//提示框取消按钮回调
    private tipZindex = 101;
    private tipBoxZindex = 100;

    /**
     * 显示提示
     * @param content 提示内容
     * @param delay 延迟消失时间
     */
    showTip(content: string, delay = 1.2) {
        if (this.tip && this.tip.isValid) {
            this.tip.stopAllActions();
        }
        cc.resources.load("path",cc.Prefab,null,(err,prefab:cc.Prefab)=>{
            if(err){
                console.error(err);
            }else{
                if(!this.tip||!this.tip.isValid){
                    this.tip = cc.instantiate(prefab);
                }
                this.tip.opacity = 255;
                this.tip.zIndex = this.tipZindex;
                this.tip.getChildByName("content").getComponent(cc.Label).string = content;
                this.tip.stopAllActions();
                cc.tween(this.tip)
                    .delay(delay)
                    .to(0.2, { opacity: 0 })
                    .start();
            }
        });
    }

    /**
     * 显示提示框
     * @param content 提示内容
     * @param boxType 提示框类型 1：一个确认按钮 2：确认和取消按钮
     * @param opts 确认和取消按钮回调
     */
    showTipBox(content: string, boxType = 1, opts: { cbConfirm?: Function, cbCancel?: Function } = {}) {
        cc.resources.load("path",cc.Prefab,null,(err,prefab:cc.Prefab)=>{
            if(err){
                console.error(err);
            }else{
                if(!this.tipBox||!this.tipBox.isValid){
                    this.tipBox = cc.instantiate(prefab);
                }
                this.tipBox.zIndex = this.tipBoxZindex;
                this.tipBox.getChildByName("content").getComponent(cc.Label).string = content;
                let btns = this.tipBox.getChildByName("btns");
                let confirm = btns.getChildByName("confirm");
                let cancel = btns.getChildByName("cancel");
                confirm.once("click", this.Confirm);
                cancel.once("click", this.Cancel);
                cancel.active = boxType == 2;
                this.cbConfirm = opts.cbConfirm;
                this.cbCancel = opts.cbCancel;
            }
        });

    }

    Confirm() {
        this.cbConfirm && this.cbConfirm();
        this.tipBox.emit("close");
    }

    Cancel() {
        this.cbCancel && this.cbCancel();
        this.tipBox.emit("close");
    }

}

