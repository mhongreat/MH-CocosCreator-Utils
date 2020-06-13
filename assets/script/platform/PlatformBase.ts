/**
 * 针对不同平台间的差异，在基类中声明抽象方法，在不同平台的子类中实现方法
 */
export abstract class PlatformBase {

    private _orientation: number = 0;
    /** 屏幕旋转类型 1(竖屏) 2(横屏) */
    public get orientation() {
        if (!this._orientation) {
            this._orientation = cc.winSize.width < cc.winSize.height ? 1 : 2;
        }
        return this._orientation;
    };

    private _screentype: number = 0;
    /** 屏幕类型 1(16:9) 2(>16:9的全面屏) */
    public get screentype() {
        if (!this._screentype) {
            this._screentype = Math.max(cc.winSize.width, cc.winSize.height) / Math.min(cc.winSize.width, cc.winSize.height) > 1.78 ? 2 : 1;
        }
        return this._screentype;
    }
    
    /** 枚举广告id,在子类中补充对应平台的广告id */
    abstract adUnitId = {
        V_SIGN: "",
        B_LOTTERY: ""
    }
    abstract login(obj);
}