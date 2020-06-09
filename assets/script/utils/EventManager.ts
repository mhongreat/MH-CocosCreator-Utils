/** 全局事件管理 */
export class EventManager {

    private static eventMap: {
        [name: number]: { callback: Function, thisObj?: object, once?: boolean }[],
        [name: string]: { callback: Function, thisObj?: object, once?: boolean }[],
    } = {};

    /** 为事件注册一个回调,重复注册只保留第一次的事件,once仅触发一次 */
    public static on(name: number | string, callback: Function, thisObj?: object, once?: boolean) {
        let events = this.eventMap[name];
        if (!events) {
            events = [];
            this.eventMap[name] = events;
        }
        let index = events.findIndex(v => v.callback == callback && v.thisObj == thisObj);
        if (index < 0) {
            this.eventMap[name].push({ callback: callback, thisObj: thisObj, once: once });
        }
    }

    /** 取消事件的某个回调，callback不传值时取消事件所有回调*/
    public static off(name: number | string, callback?: Function, thisObj?: object) {
        let events = this.eventMap[name];
        if (events && events.length > 0) {
            if (callback) {
                let delIndex = events.findIndex(v => v.callback == callback && v.thisObj == thisObj);
                events.splice(delIndex, 1);
            } else {
                this.eventMap[name] = undefined;
            }
        }
    }

    /** 触发事件的回调，参数个数不固定 */
    public static emit(name: number | string, ...args) {
        let events = this.eventMap[name];
        if (events && events.length > 0) {
            let toDelArr: number[] = null;
            events.forEach((v, i) => {
                let { callback, thisObj, once } = v;
                if (typeof callback == "function") {
                    callback.call(thisObj, ...args);
                }
                if (once) {
                    toDelArr = toDelArr || [];
                    toDelArr.push(i);
                }
            })
            if (toDelArr && toDelArr.length > 0) {
                this.eventMap[name] = events.filter((v, i) => toDelArr.indexOf(i) < 0);
            }
        }
    }

}

export enum GameEvent {
    OpenUI = -10000,
    CloseUI,
    Test3,
    Test4 = 10000,
    Test5,
    Test6
}
