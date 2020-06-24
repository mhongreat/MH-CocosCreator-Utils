import ListView from "../../script/ui/ListView";

const { ccclass, property } = cc._decorator;
@ccclass
export default class TestListView extends cc.Component {

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;


    start() {
        this.scrollView.content.removeAllChildren();
        let listView = this.scrollView.getComponent(ListView);
        listView.renderItem = this.renderItem.bind(this);
        listView.itemNum = 1000;
    }

    renderItem(index:number, obj:cc.Node) {
        obj.getComponentInChildren(cc.Label).string = index+"";
        
    }

}
