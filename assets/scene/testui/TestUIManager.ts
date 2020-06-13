import { UIManager,EUIName } from "../../script/ui/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestUIManager extends cc.Component {

    start () {
        UIManager.inst.init();
    }
    
    openUI(){
      
        UIManager.inst.openUI(EUIName.UI1);
    }
    showTip(){
      
        UIManager.inst.tipMseeage.showTip("hello world");
    }
    showTipBox(){
      
        UIManager.inst.tipMseeage.showTipBox("hello world");
    }
    
}
