
/**
 * 本地存储工具类
 */
export class StroageUtil {

    /**
     * 获取number类型的本地存储值
     */
    static getNumber(key: StroageEnum, defaultValue: number): number {
        let value = parseFloat(cc.sys.localStorage.getItem(key));
        return isNaN(value) ? defaultValue : value;
    }

    /**
     * 获取boolean类型的本地存储值
     */
    static getBoolean(key: StroageEnum, defaultValue: boolean): boolean {
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
    static getObject(key: StroageEnum, defaultValue: object): object {
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
    static setValue(key: StroageEnum, value: any) {
        if (typeof value == "object") {
            value = JSON.stringify(value);
        }
        cc.sys.localStorage.setItem(key, value);
    }

}

/**
 * 本地存储键枚举
 */
export enum StroageEnum {
    AudioSwitch = "AudioSwitch",
    MusicSwitch = "MusicSwitch",
    EffectSwitch = "EffectSwitch",
    TestObject = "TestObject"
}
