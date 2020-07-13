const { ccclass, property } = cc._decorator;

/** Toggle选中时隐藏背景 */
@ccclass
export default class ToggleAssist extends cc.Component {
    @property({
        type: cc.Node,
        displayName: "背景节点",
        tooltip: "按钮选中时隐藏背景",
        visible: function () { return this.getComponent(cc.Toggle) }
    })
    bg: cc.Node = null;

    onLoad() {
        this.node.on("toggle", this.onToggle, this);
        this.onToggle(this.getComponent(cc.Toggle));
    }

    onToggle(toggle: cc.Toggle) {
        if (!this.bg) return;
        this.bg.active = !toggle.isChecked;
    }
}



