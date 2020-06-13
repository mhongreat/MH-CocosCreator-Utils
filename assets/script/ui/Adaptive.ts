import { platform } from "../platform/Platform";

const { ccclass, property } = cc._decorator;

let EFitType = cc.Enum({
    Auto: 0,
    FitWidth: 1,
    FitHeight: 2
})

/** Canvas、背景、widget(针对非全面屏)适配工具 */
@ccclass
export default class Adaptive extends cc.Component {

    @property({
        tooltip: "若当前节点为背景，是否需要适配屏幕",
        visible: function () { return this.getComponent(cc.Sprite) }
    })
    fitBackground = false;
    @property({
        type: EFitType,
        tooltip: "背景适配方式，默认自动适配去除黑边",
        visible: function () { return this.getComponent(cc.Sprite) && this.fitBackground }
    })
    fitType = EFitType.Auto;

    @property({
        tooltip: "是否需要让widget适配非全面屏，widget默认值为全面屏适配方案",
        visible: function () { return this.node.name != "Canvas" && this.getComponent(cc.Widget) }
    })
    fitWidget = false;
    @property({
        tooltip: "非全面屏时屏幕顶部的距离",
        visible: function () { return this.fitWidget && this.getComponent(cc.Widget).isAlignTop }
    })
    top = 0;
    @property({
        tooltip: "非全面屏时屏幕底部的距离",
        visible: function () { return this.fitWidget && this.getComponent(cc.Widget).isAlignBottom }
    })
    bottom = 0;
    @property({
        tooltip: "非全面屏时屏幕左部的距离",
        visible: function () { return this.fitWidget && this.getComponent(cc.Widget).isAlignLeft }
    })
    left = 0;
    @property({
        tooltip: "非全面屏时屏幕右部的距离",
        visible: function () { return this.fitWidget && this.getComponent(cc.Widget).isAlignRight }
    })
    right = 0;

    onLoad() {
        //Canvas适配优先显示全部内容
        if (this.node.name == "Canvas") {
            let size = cc.view.getFrameSize();
            let canvas = this.node.getComponent(cc.Canvas);
            if (Math.max(size.width, size.height) / Math.min(size.width, size.height) < 1.77) {//平板比例
                canvas.fitWidth = size.width > size.height;//横屏适配宽度
                canvas.fitHeight = size.width < size.height;//竖屏适配高度
            } else {//手机比例
                canvas.fitWidth = size.width < size.height;//竖屏适配宽度
                canvas.fitHeight = size.width > size.height;//横屏适配高度
            }
        }

        //背景图适配根据所选适配方式，默认自动适配去除黑边
        if (this.fitBackground) {
            let wRatio = cc.winSize.width / this.node.width;
            let hRatio = cc.winSize.height / this.node.height;
            switch (this.fitType) {
                case EFitType.Auto:
                    this.node.scale = Math.max(wRatio, hRatio);
                    break;
                case EFitType.FitWidth:
                    this.node.scale = wRatio;
                    break;
                case EFitType.FitHeight:
                    this.node.scale = hRatio;
                    break;
            }
        }

        //widget针对非全面屏适配
        if (this.fitWidget) {
            let widget = this.node.getComponent(cc.Widget);
            if (platform.screentype == 1) {
                if (widget.isAlignTop) {
                    widget.top = this.top;
                }
                if (widget.isAlignBottom) {
                    widget.bottom = this.bottom;
                }
                if (widget.isAlignLeft) {
                    widget.left = this.left;
                }
                if (widget.isAlignRight) {
                    widget.right = this.right;
                }
                widget.updateAlignment();
            }
        }

    }
}
