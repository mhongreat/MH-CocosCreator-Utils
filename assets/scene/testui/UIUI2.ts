const {ccclass,property} = cc._decorator;
import  UIBase from "../../script/ui/UIBase";
import { EventUtil, GameEvent } from "../../script/utils/EventUtil";
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
        EventUtil.emit(GameEvent.CloseUI,EUIName.UI1);
    }

}
