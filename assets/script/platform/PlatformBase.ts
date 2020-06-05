/**
 * 针对不同平台间的差异，在基类中声明抽象方法，在不同平台的子类中实现方法
 */
export abstract class PlatformBase {
   
    private _orientation:number = 0;
    /** 屏幕旋转类型 1竖屏 2横屏 */
    public get orientation(){
        return this._orientation;
    };
    constructor() {
        this._orientation = cc.winSize.width < cc.winSize.height ? 1 : 2;
    }
    /** 枚举广告id,在子类中补充对应平台的广告id */
    abstract adUnitId = {
        V_SIGN: "",
        B_LOTTERY: ""
    }
    abstract login(obj);
}