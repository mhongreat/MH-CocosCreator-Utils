import { UIManager, EUIName } from "./ui/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    async start () {
        UIManager.inst.init();
    }
    
    onclick(){
        console.log("onclick");
         
        UIManager.inst.tipMseeage.showTipBox("你好啊啊  啊啊啊啊啊");
        
    }
    
}
