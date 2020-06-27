import { PathFind } from "../../script/utils/PathFind";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestPathFind extends cc.Component {


    start() {
      
        let cocos = cc.find("Canvas/HelloWorld");
        PathFind.inst.setGridPassable(false,[111,22,32]);
        console.time("findpath");
        let path = PathFind.inst.getPath(cocos.position,cc.v2(360,-240));
        console.timeEnd("findpath");
        console.log(path);
    }

    // update (dt) {}
}
