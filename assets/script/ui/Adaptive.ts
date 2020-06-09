const { ccclass, property } = cc._decorator;

let EFitType = cc.Enum({
    Auto:0,
    FitWidth:1,
    FitHeight:2
})
/** Canvas和背景适配工具 */
@ccclass
export default class Adaptive extends cc.Component {

    @property({
        type:EFitType,
        tooltip:"背景适配方式，默认自动适配去除黑边",
        visible:function(){return this.getComponent(cc.Sprite)}
    })
    fitType = EFitType.Auto;

    onLoad() {
        //Canvas适配优先显示全部内容
        if (this.node.name == "Canvas") {
            let size = cc.view.getFrameSize();
            let canvas = this.node.getComponent(cc.Canvas);
            if (Math.max(size.width, size.height) / Math.min(size.width, size.height) < 1.77) {//平板比例
                canvas.fitWidth = size.width>size.height;//横屏适配宽度
                canvas.fitHeight = size.width<size.height;//竖屏适配高度
            } else {//手机比例
                canvas.fitWidth = size.width<size.height;//竖屏适配宽度
                canvas.fitHeight = size.width>size.height;//横屏适配高度
            }
        }
        let sprite = this.getComponent(cc.Sprite);
        if(sprite){
            //背景图适配根据所选适配方式，默认自动适配去除黑边
            let wRatio = cc.winSize.width/this.node.width;
            let hRatio = cc.winSize.height/this.node.height;
            switch (this.fitType) {
                case EFitType.Auto:
                    this.node.scale = Math.max(wRatio,hRatio);
                    break;
                case EFitType.FitWidth:
                    this.node.scale = wRatio;
                    break;
                case EFitType.FitHeight:
                    this.node.scale = hRatio;
                    break;
            }
        }
    }
}
