import ListView from "../../script/component/ListView";

const { ccclass, property } = cc._decorator;
@ccclass
export default class TestListView extends cc.Component {

    @property(cc.ScrollView)
    hSrollView: cc.ScrollView = null;
    @property(cc.ScrollView)
    vSrollView: cc.ScrollView = null;
    @property(cc.ScrollView)
    fSrollView: cc.ScrollView = null;


    start() {
        this.hSrollView.content.removeAllChildren();
        let listView1 = this.hSrollView.getComponent(ListView);
        listView1.renderItem = this.renderItem.bind(this);
        listView1.itemNum = 1000;

        this.vSrollView.content.removeAllChildren();
        let listView2 = this.vSrollView.getComponent(ListView);
        listView2.renderItem = this.renderItem.bind(this);
        listView2.itemNum = 1000;
        
    }

    renderItem(index:number, obj:cc.Node) {
        obj.getComponentInChildren(cc.Label).string = index+"";
        
    }

    loadList(event,data){
        this.fSrollView.content.removeAllChildren();
        this.fSrollView.scrollToTop();
        if(data==6) return;
        let listView = this.fSrollView.getComponent(ListView);
        listView.mode= parseInt(data);
        listView.renderItem = this.renderItem.bind(this);
        listView.itemNum = 1000;
    }

}
