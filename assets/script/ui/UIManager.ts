import UIBase from "./UIBase";
import { EventManager, GameEvent } from "../utils/EventManager";

export class UIManager {

    private constructor() { }
    private static _inst: UIManager = null;
    public static get inst() {
        if (!this._inst) {
            this._inst = new UIManager();
            this._inst.init();
        }
        return this._inst;
    }

    private uiDict: { [name: string]: UIBase } = {};
    private uiStack: UIBase[] = [];
    /** ui完全打开和关闭前，处于冷却中，避免重复操作 */
    private cooldown = false;
    /** 普通的ui页面 */
    private normalLayer: cc.Node = null;
    /** 比较上层的ui界面(如提示信息、引导、loading遮罩等)不参与ui堆栈 */
    private higherLayer: cc.Node = null;

    private shade: cc.Node = null;//半透明遮罩

    private init() {
        EventManager.on(GameEvent.OpenUI, this.openUI, this);
        EventManager.on(GameEvent.CloseUI, this.closeUI, this);

        let canvas = cc.find("Canvas");
        this.normalLayer = new cc.Node("normalLayer");
        this.normalLayer.setContentSize(cc.winSize);
        canvas.addChild(this.normalLayer);
        this.higherLayer = new cc.Node("higherLayer");
        this.higherLayer.setContentSize(cc.winSize);
        canvas.addChild(this.higherLayer);

        //上层ui直接在此初始化
        //this.higherLayer.addChild()

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
        this.cooldown = false;
        return ui;
    }

    public async closeUI(name: EUIName) {
        if (this.cooldown) return;
        if (this.isTop(name)) {
            this.cooldown = true;
            let ui = this.uiStack.pop();
            this.setShade();
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

    public isTop(name: EUIName) {
        let ui = this.uiDict[name];
        if (ui) {
            return ui == this.getTopUI();
        }
        return false;
    }

    public getTopUI() {
        let stackLen = this.uiStack.length;
        if (stackLen) {
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

    public setShade() {
        let callback = () => {
            this.shade.parent = null;
            let ui = this.getTopUI();
            if (ui && ui.showShade) {
                this.shade.zIndex = ui.node.zIndex - 1;
                this.shade.parent = this.normalLayer;
            }
        }
        if (!this.shade || !this.shade.isValid) {
            this.instUINode("ui/shade").then(node => {
                this.shade = node;
                callback();
            });
        } else {
            callback();
        }

    }



}

export enum EUIName {//字符串值为ui加载路径
    UI1 = "ui/ui1",
    UI2 = "ui/ui2",
}
