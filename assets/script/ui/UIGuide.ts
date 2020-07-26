import UIBase from "./UIBase";
import { UIManager, EUIName } from "./UIManager";
import { EventUtil } from "../utils/EventUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIGUide extends UIBase {

    @property(cc.JsonAsset)
    guideData: cc.JsonAsset = null;

    @property(cc.Node)
    mask: cc.Node = null;

    guideId: number = 0;
    pathArr: String[] = null;
    cbFinish: Function = null;


    onLoad() {
        this.mask.active = false;
    }

    public startGuide(guideId: number, cbFinish?: Function) {
        if (this.guideId != 0) return;
        this.mask.position = cc.v2(0, 0);
        this.mask.width = 0;
        this.mask.height = 0;
        let data: string = this.guideData.json[guideId];
        if (data) {
            this.pathArr = data.split(";");
            this.mask.active = true;
            this.guideId = guideId;
            this.cbFinish = cbFinish;
            this.bindClickEventByIndex(0);
        }
    }

    public bindClickEventByIndex(index: number) {
        let strs = this.pathArr[index].split(":");
        if (strs.length == 2) {
            let uiName = EUIName[strs[0]];
            let ui = UIManager.inst.getUI(uiName);
            let func = (uiData: UIBase) => {
                let btnNode = cc.find(strs[1], uiData.node);
                if (btnNode) {
                    this.showGuide1(btnNode);
                    btnNode.once("click", this.onClickGuideBtn.bind(this, index));
                }
            }
            if (ui && ui.node.parent) {
                func(ui);
            } else {
                EventUtil.once(uiName + "_open", (uiData: UIBase) => {
                    func(uiData);
                })
            }
        }
    }

    public onClickGuideBtn(index: number) {
        if (index < this.pathArr.length) {
            if (index == this.pathArr.length - 1) {
                this.mask.active = false;
                this.guideId = 0;
                this.cbFinish && this.cbFinish();
                this.cbFinish = null;
                console.log("guide over");
            } else {
                let newIndex = index + 1;
                this.bindClickEventByIndex(newIndex);
            }
        }
    }

    public showGuide1(btnNode: cc.Node) {
        let pos1 = btnNode.convertToWorldSpaceAR(cc.v2(0, 0));
        let pos2 = this.mask.parent.convertToNodeSpaceAR(pos1);
        cc.tween(this.mask)
            .to(0.35, {
                x: pos2.x, y: pos2.y,
                width: btnNode.width, height: btnNode.height
            }).start();
    }
}
