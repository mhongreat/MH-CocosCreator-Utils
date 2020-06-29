const {ccclass,property} = cc._decorator;
import  UIBase from "../../script/ui/UIBase";
import { EventManager, GameEvent } from "../../script/utils/EventManager";
import { EUIName } from "../../script/ui/UIManager";


@ccclass
export default class UIUI2 extends UIBase {

    onLoad(){
        // super.onLoad();
    }


    start () {
        // let {ak,bk} = this.args;
        // super..start();
        
    }

    close1(){
        EventManager.emit(GameEvent.CloseUI,EUIName.UI1);
    }

}
