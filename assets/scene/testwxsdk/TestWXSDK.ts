
const {ccclass, property} = cc._decorator;

@ccclass
export default class TestWXSDK extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    start(){
        cc.game.on("say",()=>{
            console.log("say i'm native platform");
            
        });
    }

    onclick(event,data){
        if(data==1){
            if(cc.sys.os==cc.sys.OS_ANDROID){
                jsb.reflection.callStaticMethod("cn/cnmou/smile/wxapi/WXSDK","Login","()V");
            }else if(cc.sys.os==cc.sys.OS_IOS){

            }
        }else{
            if(cc.sys.os==cc.sys.OS_ANDROID){
                jsb.reflection.callStaticMethod("cn/cnmou/smile/wxapi/WXSDK","Share","()V");
            }else if(cc.sys.os==cc.sys.OS_IOS){
                
            }
        }
    }
}
