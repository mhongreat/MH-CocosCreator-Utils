import { UIManager, EUIName } from "./ui/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    start () {
    }
    
    onclick(){
        console.log("onclick");
        UIManager.inst.openUI(EUIName.UI1);
        
    }
    
}
