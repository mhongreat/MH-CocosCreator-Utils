export abstract class PlatformBase {
    /** 屏幕旋转类型 1竖屏 2横屏 */
    orientation:number = 0;
    constructor(){
        this.orientation = cc.winSize.width<cc.winSize.height?1:2;
    }
    /** 枚举广告id,在子类中补充对应平台的广告id */
    abstract adUnitId = {
        V_SIGN: "",
        B_LOTTERY: ""
    }
    abstract login(obj);
}