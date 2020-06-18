const {ccclass, property} = cc._decorator;

@ccclass
export default class TestListView extends cc.Component {

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;


    start () {
        console.log("ScrollView Node Height",this.scrollView.node.height);
        console.log("ScrollView Node Rect",this.scrollView.node.getBoundingBoxToWorld());
        
    }


}
