/**
 * 常用的一些方法集合
 */
export default class Utils {
    /**
    * 加载远程图片
    * @param sprite 目标Sprite组件 
    * @param url 远程图片路径（带扩展名）
    */
    static loadRemotePic(sprite: cc.Sprite, url: string) {
        cc.loader.load({ url: url, type: "png" }, (err, texture) => {
            if (err) {
                console.error(err);
                return;
            }
            let spFrame = new cc.SpriteFrame(texture);
            sprite.spriteFrame = spFrame;
        });
    }

    /**
     * 加载本地图片
     * @param sprite 目标Sprite组件
     * @param url 本地图片路径（不带扩展名）
     */
    static loadLocalPic(sprite: cc.Sprite, url: string) {
        cc.loader.loadRes(url, cc.SpriteFrame, function (err, spFrame) {
            if (err) {
                console.error(err);
                return;
            }
            sprite.spriteFrame = spFrame;
        });
    }

    /** 
     * 为目标组件绑定事件 
     * @param targetComp 目标组件
     * @param target 节点
     * @param component 组件名
     * @param handler 方法名
     * @param customData 附带参数
     * @param clear 是否清除原有事件,默认true
     */
    static bindEvents(targetComp: cc.Button | cc.Toggle | cc.ScrollView, target: cc.Node, component: string, handler: string, customData: any, clear = true) {
        let eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        eventHandler.customEventData = customData;
        if (targetComp instanceof cc.Button && !(targetComp instanceof cc.Toggle)) {
            if (clear) (targetComp as cc.Button).clickEvents = [];
            (targetComp as cc.Button).clickEvents.push(eventHandler);
        } else if (targetComp instanceof cc.Toggle) {
            if (clear) (targetComp as cc.Toggle).clickEvents = [];
            (targetComp as cc.Toggle).clickEvents.push(eventHandler);
        } else if (targetComp instanceof cc.ScrollView) {
            if (clear) (targetComp as cc.ScrollView).scrollEvents = [];
            (targetComp as cc.ScrollView).scrollEvents.push(eventHandler);
        }
    }

    /**
     * 分帧加载 
     * @param gen 生成器对象
     * @param dt 每帧用于加载的耗时,单位：ms
     */
    static frameLoad(gen: Generator, dt = 3) {
        let p = new Promise((resolve, reject) => {
            let execute = () => {
                let d1 = Date.now();
                for (let e = gen.next(); ; e = gen.next()) {
                    if (!e || e.done) {
                        resolve();
                        break;
                    }
                    if (typeof e.value == "function") {
                        e.value();
                    } else {
                        console.warn("表达式异常");
                    }
                    let d2 = Date.now();
                    if (d2 - d1 >= dt) {
                        new cc.Component().scheduleOnce(execute);
                        break;
                    }
                }
            }
            execute();
        });
        return p;
    }

    /**
     * 返回今天的日期,格式20000101
     */
    static nowDate(): number {
        let lt10 = v => {
            return v < 10 ? "0" + v : v;
        }
        let date = new Date();
        let str = "" + date.getFullYear() + lt10(date.getMonth() + 1) + lt10(date.getDate());
        return parseInt(str);
    }

}
