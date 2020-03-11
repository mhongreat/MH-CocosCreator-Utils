/** 二级界面管理类 */
export class PanelMgr {

    static _ctor = PanelMgr.clear();
    static _cache: Map<string, cc.Node> = new Map();//panel节点的缓存
    static _suffer = "";//动态加载预制体的路径前缀

    /** 添加panel */
    static addPanel(prefabName: PanelEnum, active = true, zIndex = 0) {
        let p = new Promise<cc.Node>((resovle, reject) => {
            let url = PanelMgr._suffer + prefabName;
            let node = PanelMgr._cache.get(url);
            let success = () => {
                node.active = active;
                node.zIndex = zIndex;
                node.parent = PanelMgr.getPanelParent();
                resovle(node);
            }
            if (node && node.isValid) {
                success();
            } else {
                cc.loader.loadRes(url, cc.Prefab, (err, prefab) => {
                    if (err) {
                        console.error(err);
                        reject();
                    } else {
                        node = cc.instantiate(prefab);
                        PanelMgr._cache.set(url, node);
                        success();
                    }
                });
            }
        });
        return p;
    }

    /** 获取panel节点  */
    static getPanel(prefabName: PanelEnum) {
        let url = PanelMgr._suffer + prefabName;
        let node = PanelMgr._cache.get(url);
        if (!node || !node.isValid) {
            node = null;
        }
        return node;
    }

    /** 获取panel父节点 */
    static getPanelParent() {
        let node = cc.find("Canvas/Panel");
        if (!node) {
            node = new cc.Node("Panel");
            node.zIndex = 50;
            node.parent = cc.find("Canvas");
        }
        return node;
    }

    /** 切换场景销毁所有panel */
    static clear() {
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, () => {
            PanelMgr._cache.forEach(v => {
                v.isValid && v.destroy();
            });
            PanelMgr._cache.clear();
        });
    }

}

/** 枚举Panel,值为预制体名字 */
export enum PanelEnum {
    Tip = "Tip",
    TipBox = "TipBox"
}



