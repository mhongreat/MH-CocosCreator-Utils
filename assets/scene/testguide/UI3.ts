import UIBase from "../../script/ui/UIBase";
import { UIManager, EUIName } from "../../script/ui/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UI3 extends UIBase {

    startGuide(){
        UIManager.inst.guide.startGuide(1,()=>{
            UIManager.inst.tipMseeage.showTip("引导结束");
            
        });
    }


    openUI4(){
        UIManager.inst.openUI(EUIName.UI4);
    }
   
}
