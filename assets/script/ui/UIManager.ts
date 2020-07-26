import UIBase from "./UIBase";
import { EventUtil, GameEvent } from "../utils/EventUtil";
import UITipMessage from "./UITipMessage";
import UIGUide from "./UIGuide";

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
    private cooldown = false;//ui打开时进入冷却

    /** 半透明遮罩 */
    private shade: cc.Node = null;
    /** 普通的ui页面 */
    private normalLayer: cc.Node = null;
    /** 比较上层的ui界面(如提示信息、引导、loading遮罩等)不参与ui堆栈 */
    private higherLayer: cc.Node = null;

    public guide: UIGUide = null;
    public tipMseeage: UITipMessage = null;

    /** 场景加载后手动调用初始化 */
    public async init() {
        this.clear();
        EventUtil.on(GameEvent.OpenUI, this.openUI, this);
        EventUtil.on(GameEvent.CloseUI, this.closeUI, this);
        let canvas = cc.find("Canvas");
        this.normalLayer = new cc.Node("normalLayer");
        this.normalLayer.setContentSize(cc.winSize);
        this.normalLayer.parent = canvas;
        this.higherLayer = new cc.Node("higherLayer");
        this.higherLayer.setContentSize(cc.winSize);
        this.higherLayer.parent = canvas;

        this.shade = await this.instUINode("ui/shade");

        //添加上层ui
        let guideNode = await this.instUINode(EUIName.UIGuide);
        this.higherLayer.addChild(guideNode);
        this.guide = guideNode.getComponent(UIGUide);
        let tipMseeageNode = await this.instUINode(EUIName.UITipMessage);
        this.higherLayer.addChild(tipMseeageNode);
        this.tipMseeage = tipMseeageNode.getComponent(UITipMessage);
    }


    public async openUI<T extends UIBase>(name: EUIName, obj?: { args: any, action: boolean }) {
        if (this.cooldown) return;
        this.cooldown = true;
        let ui = await this.initUI(name);
        ui.setArgs(obj?.args);
        this.normalLayer.addChild(ui.node, this.getUIZIndex());
        this.uiStack.push(ui);
        this.setShade();
        await ui.open(obj?.action);
        this.setUIVisible();
        this.cooldown = false;
        return ui as T;
    }

    public async closeUI(name: EUIName, action?: boolean) {
        let ui = this.uiDict[name];
        let index = this.uiStack.indexOf(ui)
        if (index != -1) {
            this.uiStack.splice(index, 1);
            this.setShade();
            this.setUIVisible();
            await ui.close(action);
            ui.node.parent = null;
            if (ui.destroyNode) {
                ui.node.destroy();
                cc.resources.release(name);
                this.uiDict[name] = undefined;
            }
        }
    }

    public async initUI(name: EUIName) {
        let ui = this.uiDict[name];
        if (ui?.isValid) {
            let index = this.uiStack.indexOf(ui);
            if (index > -1) {
                this.uiStack.splice(index, 1);
            }
            ui.setActive(true);
            ui.setOpacity(255);
            return ui;
        }
        let node = await this.instUINode(name);
        ui = node.getComponent(UIBase);
        ui.init();
        ui.setUIName(name);
        this.uiDict[name] = ui;
        return ui;
    }

    private async instUINode(name: string) {
        let p = new Promise<cc.Node>((resolve, reject) => {
            cc.resources.load(name, cc.Prefab, (err, prefab: any) => {
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

    public getUI<T extends UIBase>(c: new () => T | EUIName): T {
        if (!c) return;
        if (typeof c === "string") {
            let ui = this.uiDict[c] as T;
            if (ui && ui.isValid) {
                return ui;
            }
        } else {
            for (let name in this.uiDict) {
                let ui = this.uiDict[name];
                if (ui instanceof c) return ui as T;
            }
        }
    }

    public getTopUI() {
        let stackLen = this.uiStack.length;
        if (stackLen > 0) {
            let ui = this.uiStack[stackLen - 1];
            return ui;
        }
    }

    public getUIZIndex() {
        let ui = this.getTopUI();
        if (ui) {
            return ui.node.zIndex + 2;
        }
        return 0;
    }

    private setShade() {
        this.shade.parent = null;
        let ui = this.getTopUI();
        if (ui?.showShade) {
            this.shade.zIndex = ui.node.zIndex - 1;
            this.shade.parent = this.normalLayer;
        }
    }

    private setUIVisible() {
        let isCover = false;
        for (let i = this.uiStack.length - 1; i >= 0; i--) {
            let ui = this.uiStack[i];
            if (i == this.uiStack.length - 1) {
                ui.setOpacity(255);
            }
            if (!isCover) {
                isCover = ui.cover;
            } else {
                ui.setOpacity(0);
            }
        }
    }

    /** 切换场景后清除资源 */
    private clear() {
        for (let name in this.uiDict) {
            let ui = this.uiDict[name];
            if (ui?.isValid) {
                ui.node.destroy();
            }
        }
        if (this.shade?.isValid) {
            this.shade.destroy();
        }
        this.uiDict = {};
        this.uiStack = [];
        this.cooldown = false;
    }

}

export enum EUIName {//字符串值为ui加载路径
    UIGuide = "ui/guide",
    UITipMessage = "ui/UITipMessage",
    UI1 = "ui/ui1",
    UI2 = "ui/ui2",
    UI3 = "ui/ui3",
    UI4 = "ui/ui4",
}
