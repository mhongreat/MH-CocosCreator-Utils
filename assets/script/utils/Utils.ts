/**
 * 常用的一些方法集合
 */
export class Utils {
    /**
    * 加载远程图片
    * @param sprite 目标Sprite组件 
    * @param url 远程图片路径（带扩展名）
    */
    static loadRemotePic(sprite: cc.Sprite, url: string) {
        cc.assetManager.loadRemote(url, (err, texture) => {
            if (err) {
                console.error(err);
            } else {
                let spFrame = new cc.SpriteFrame(texture);
                sprite.spriteFrame = spFrame;
            }
        });
    }

    /**
     * 加载本地图片
     * @param sprite 目标Sprite组件
     * @param url 本地图片路径（不带扩展名）
     */
    static loadLocalPic(sprite: cc.Sprite, url: string) {
        cc.resources.load(url, cc.SpriteFrame, (err, texture: any) => {
            if (err) {
                console.error(err);
            } else {
                sprite.spriteFrame = texture;
            }
        });
    }

    /** 
     * 为按钮绑定事件,重复的事件不会再次绑定
     */
    static bindButtonEvent(button: cc.Button, target: cc.Node, component: string, handler: string, customData?: any) {
        let clickEvents = button.clickEvents;
        let eventHandler = clickEvents.find(v => {
            return v.target == target && v.component == component &&
                v.handler == v.handler && v.customEventData == customData;
        });
        if (!eventHandler) {
            eventHandler = new cc.Component.EventHandler();
            eventHandler.target = target;
            eventHandler.component = component;
            eventHandler.handler = handler;
            eventHandler.customEventData = customData;
            button.clickEvents.push(eventHandler);
        }
    }

    /**
     * 返回今天的日期,格式20000101
     */
    static getToDay() {
        let lt10 = v => {
            return v < 10 ? "0" + v : "" + v;
        }
        let date = new Date();
        let str = date.getFullYear() + lt10(date.getMonth() + 1) + lt10(date.getDate());
        return parseInt(str);
    }

    /**
     * 将事件戳转化为日期格式,适用于显示倒计时
     * @param timeMS 倒计时的时间戳(MS)
     * @param template 模板 1(HH:MM:SS) 2(HH时MM分SS秒) 3(HH?:MM:SS) 4(HH?时MM分SS秒)
     * @param separator 分隔符 默认(:)
     */
    static formatTimeMS(timeMS: number, template: 1 | 2 | 3 | 4, separator = ":") {
        let str: string;
        let lt10 = v => {
            return v < 10 ? "0" + v : v;
        }
        let date = new Date();
        let offset = date.getTimezoneOffset();//时区差异 minutes
        date.setTime(timeMS + offset * 60 * 1000);
        let days = date.getDate() - 1;
        let hours = date.getHours() + days * 24;
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        if (template == 1) {
            str = `${lt10(hours)}${separator}${lt10(minutes)}${separator}${lt10(seconds)}`;
        } else if (template == 2) {
            str = `${lt10(hours)}时${lt10(minutes)}分${lt10(seconds)}秒`;
        } else if (template == 3) {
            str = hours > 0 ? `${lt10(hours)}${separator}` : "";
            str += `${lt10(minutes)}${separator}${lt10(seconds)}`
        } else if (template == 4) {
            str = hours > 0 ? `${lt10(hours)}时` : "";
            str += `${lt10(minutes)}分${lt10(seconds)}秒`
        }
        return str;
    }

    /**
     * 格式化字符串,用args的内容替换str中的{i},i从0开始
     */
    static formatString(str: string, ...args) {
        args.forEach((v, i) => {
            str = str.replace(`{${i}}`, v);
        });
        return str;
    }

}
