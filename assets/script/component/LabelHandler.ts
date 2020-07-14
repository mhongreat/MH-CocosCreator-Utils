const { ccclass, property } = cc._decorator;
/**
 * 将使用系统字体的label、richtext移动到当前组件所在节点到末尾，注意不要影响显示的层级
 */
@ccclass
export default class LabelHandler extends cc.Component {

    @property(cc.Label)
    labels: cc.Label[] = [];
    @property(cc.Label)
    richTexts: cc.Label[] = [];

    onLoad() {
        this.scheduleOnce(() => {//widget生效后进行处理
            this.labels.forEach(label => {
                this.setParent(label.node);
            });
            this.richTexts.forEach(richText => {
                this.setParent(richText.node);
            });
        }, 0);
    }

    setParent(node: cc.Node) {
        let worldPos = node.convertToWorldSpaceAR(cc.v2(0, 0));
        let nodeSpace = this.node.convertToNodeSpaceAR(worldPos);
        node.position = nodeSpace;
        node.parent = this.node;
    }
}
