import UIBase from "./UIBase";
import { EventManager, GameEvent } from "../utils/EventManager";
import UITipMessage from "./UITipMessage";

export class UIManager {

    private constructor() { }
    private static _inst: UIManager = null;
    public static get inst() {
        if (!this._inst) {
            this._inst = new UIManager();
        }
        return this._inst;
    }

    private uiDict: { [name: string]: UIBase } = null;
    private uiStack: UIBase[] = null;
    private cooldown = false;//ui打开和关闭时进入冷却
    /** 半透明遮罩 */
    private shade: cc.Node = null;
    /** 普通的ui页面 */
    private normalLayer: cc.Node = null;
    /** 比较上层的ui界面(如提示信息、引导、loading遮罩等)不参与ui堆栈 */
    private higherLayer: cc.Node = null;

    public tipMseeage: UITipMessage = null;

    /** 场景加载后手动调用初始化 */
    public async init() {
        this.clear();

        EventManager.on(GameEvent.OpenUI, this.openUI, this);
        EventManager.on(GameEvent.CloseUI, this.closeUI, this);

        let canvas = cc.find("Canvas");
        this.normalLayer = new cc.Node("normalLayer");
        this.normalLayer.setContentSize(cc.winSize);
        this.normalLayer.parent = canvas;
        this.higherLayer = new cc.Node("higherLayer");
        this.higherLayer.setContentSize(cc.winSize);
        this.higherLayer.parent = canvas;

        this.shade = await this.instUINode("ui/shade");

        //添加上层ui
        let tipMseeageNode = await this.instUINode("ui/UITipMessage");
        this.higherLayer.addChild(tipMseeageNode)
        this.tipMseeage = tipMseeageNode.getComponent(UITipMessage);
    }


    public async openUI(name: EUIName, args?: any) {
        if (this.cooldown) return;
        this.cooldown = true;
        let ui = await this.initUI(name);
        ui.setUIName(name);
        ui.setArgs(args);
        ui.setZIndex(this.getTopUIZIndex() + 2);
        this.normalLayer.addChild(ui.node);
        this.uiStack.push(ui);
        this.setShade();
        await ui.open();
        this.setUIVisible(ui.cover, false);
        this.cooldown = false;
        return ui;
    }

    public async closeUI(name: EUIName) {
        if (this.cooldown) return;
        if (this.isTopUI(name)) {
            this.cooldown = true;
            let ui = this.uiStack.pop();
            this.setShade();
            this.setUIVisible(ui.cover, true);
            await ui.close();
            if (ui.destroyNode) {
                ui.destroy();
                this.uiDict[name] = undefined;
            } else {
                ui.node.parent = null;
            }
            this.cooldown = false;
        } else {
            console.warn("请根据UI栈的规则,先进后出");
        }
        return true;
    }

    public async initUI(name: EUIName) {
        let ui = this.uiDict[name];
        if (ui && ui.isValid) {
            return ui;
        }
        let node = await this.instUINode(name);
        ui = node.getComponent(UIBase);
        ui.init();
        this.uiDict[name] = ui;
        return ui;
    }

    private async instUINode(path: string) {
        let p = new Promise<cc.Node>((resolve, reject) => {
            cc.resources.load(path, cc.Prefab, (err, prefab: any) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    let node = cc.instantiate(prefab);
                    resolve(node);
                }
            });
        });
        return p;
    }

    public isTopUI(name: EUIName) {
        let ui = this.uiDict[name];
        if (ui) {
            return ui == this.getTopUI();
        }
        return false;
    }

    public getTopUI() {
        let stackLen = this.uiStack.length;
        if (stackLen > 0) {
            let ui = this.uiStack[stackLen - 1];
            return ui;
        }
    }

    public getTopUIZIndex() {
        let ui = this.getTopUI();
        if (ui) {
            return ui.node.zIndex;
        }
        return -1;
    }

    private setShade() {
        this.shade.parent = null;
        let ui = this.getTopUI();
        if (ui && ui.showShade) {
            this.shade.zIndex = ui.node.zIndex - 1;
            this.shade.parent = this.normalLayer;
        }
    }

    private setUIVisible(cover: boolean, show: boolean) {
        if (!cover) return;
        let stackLen = this.uiStack.length;
        if (show) {//关闭UI时显示下层UI
            let ui = this.getTopUI();
            ui && ui.setOpacity(255);
        } else {//打开UI时隐藏下层UI
            if (stackLen >= 2) {
                let ui = this.uiStack[stackLen - 2];
                ui.setOpacity(0);
            }
        }
    }

    /** 切换场景后清除资源 */
    private clear() {
        if (this.uiDict) {
            for (let name in this.uiDict) {
                let ui = this.uiDict[name];
                if (ui && ui.isValid && ui.node.isValid) {
                    ui.node.destroy();
                }
            }
        }
        if (this.shade && this.shade.isValid) {
            this.shade.destroy();
        }
        this.uiDict = {};
        this.uiStack = [];
        this.cooldown = false;
    }

}

export enum EUIName {//字符串值为ui加载路径
    UI1 = "ui/ui1",
    UI2 = "ui/ui2",
}
