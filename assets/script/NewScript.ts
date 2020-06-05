import { platform } from "./platform/Platform";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    widget:cc.Widget = null;
    /**
     *
     */
    onLoad() {
       
        let frameSize = cc.view.getFrameSize();
        let canvas = cc.find("Canvas").getComponent(cc.Canvas);
        this.widget = cc.find("Canvas").getComponent(cc.Widget);
        if(frameSize.width/frameSize.height<1.77){//paid
            canvas.fitWidth=true;
            canvas.fitHeight=false;
        }else{
            canvas.fitWidth=false;
            canvas.fitHeight=true;
        }
    }
    start(){
        this.scheduleOnce(()=>{
            console.log("winsize ",cc.winSize);
            console.log("visablesize ",cc.view.getVisibleSize());
            console.log("frameSize ",cc.view.getFrameSize());

        },0)
    }
}
