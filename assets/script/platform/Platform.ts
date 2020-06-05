import { PlatformBase } from "./PlatformBase";
import { PlatformWX } from "./PlatformWX";

class PlatformDebug extends PlatformBase {
    adUnitId = {
        V_SIGN: "",
        B_LOTTERY: ""
    }

    login(obj) {
        return "mouhong";
    }
}
/** 根据对运行环境的检测，创建对应平台类的实例 */
const platform: PlatformBase = (function () {
    switch (cc.sys.platform) {
        case cc.sys.WECHAT_GAME:
            return new PlatformWX();
    }
    return new PlatformDebug();
}());
export { platform }