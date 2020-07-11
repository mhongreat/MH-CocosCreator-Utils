import { Utils } from "../utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Language extends cc.Component {
    @property({
        readonly: true,
        displayName: "警告",
        tooltip: "节点上必须有Label、RichText、Sprite其中一个组件",
        visible: function () {
            return !this.getComponent(cc.Label)
                && !this.getComponent(cc.RichText)
                && !this.getComponent(cc.Sprite);
        }
    })
    Tip = true;
    @property({
        tooltip: "显示内容在语言表中的ID"
    })
    ID = 0;

    onLoad() {
        let comps: cc.Component[] = this.node["_components"];
        for (let i = 0, len = comps.length; i < len; i++) {
            let comp = comps[i];
            if (comp instanceof cc.Label || comp instanceof cc.RichText) {
                comp.string = Language.getStringByID(this.ID);
                break;
            } else if (comp instanceof cc.Sprite) {
                Language.loadSpriteFrameByID(this.ID, comp);
                break;
            }
        }
    }

    static dict: { [ID: number]: string } = null;
    static initLanguageDict(dict: { [ID: number]: string }) {
        if (!this.dict) {
            this.dict = dict;
        }
    }

    static getStringByID(ID: number): string {
        return this.dict[ID] || "";
    }

    static loadSpriteFrameByID(ID: number, sprite: cc.Sprite) {
        let imgUrl = this.getStringByID(ID);
        Utils.loadLocalPic(sprite, imgUrl);
    }

}
