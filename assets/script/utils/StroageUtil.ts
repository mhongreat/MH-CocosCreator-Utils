/**
 * 本地存储键枚举
 */
export enum EStroageKey {
    TestObject = "TestObject"
}

/**
 * 本地存储工具类
 */
export class StroageUtil {

    private constructor() { }
    private static _inst: StroageUtil = null;
    public static get inst() {
        if (!this._inst) {
            this._inst = new StroageUtil();
        }
        return this._inst;
    }
    /**
     * 获取number类型的本地存储值
     */
    getNumber(key: EStroageKey, defaultValue: number): number {
        let value = parseFloat(cc.sys.localStorage.getItem(key));
        return isNaN(value) ? defaultValue : value;
    }

    /**
     * 获取string类型的本地存储值
     */
    getString(key: EStroageKey, defaultValue: string): string {
        let value = cc.sys.localStorage.getItem(key) + "";
        if (value) {
            return value;
        }
        return defaultValue;
    }

    /**
     * 获取boolean类型的本地存储值
     */
    getBoolean(key: EStroageKey, defaultValue: boolean): boolean {
        let value = cc.sys.localStorage.getItem(key) + "";
        if (value != "true" && value != "false") {
            return defaultValue;
        } else {
            return value != "false";
        }
    }

    /**
     * 获取object类型的本地存储值
     */
    getObject(key: EStroageKey, defaultValue: object): object {
        let value = cc.sys.localStorage.getItem(key);
        try {
            value = JSON.parse(value);
        } catch (err) {
            console.error(key, ": JSON.parse转化对象错误 ", value);
            value = defaultValue;
        }
        return value;
    }

    /**
     * 设置本地存储值
     */
    setValue(key: EStroageKey, value: number | string | boolean | object) {
        if (typeof value == "object") {
            value = JSON.stringify(value);
        }
        cc.sys.localStorage.setItem(key, value);
    }

}
