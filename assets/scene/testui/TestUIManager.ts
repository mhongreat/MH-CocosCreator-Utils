import { UIManager,EUIName } from "../../script/ui/UIManager";
// import ButtonAssist from "../../script/component/ButtonAssist";
// import ButtonAssist from "../../script/component/ButtonAssist";
// import ButtonAssist from "../../script/component/ButtonAssist";

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
      
        UIManager.inst.tipMseeage.showTipBox("hello world 666");
    }
    
    closeBottom(){
        UIManager.inst.closeUI(EUIName.UI1);
    }
}
