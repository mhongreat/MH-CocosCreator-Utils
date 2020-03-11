import TipUtil from "./utils/TipUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Test extends cc.Component {
    click() {
        TipUtil.showTip("hahhahhah");
    }


}
