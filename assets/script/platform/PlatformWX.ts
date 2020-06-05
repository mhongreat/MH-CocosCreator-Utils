import { PlatformBase } from "./PlatformBase";

export class PlatformWX extends PlatformBase {

    systemInfo = null;//系统信息
    launchInfo = null;//启动游戏信息
    shareTitle = "【斗地主合集】好友约场永久免费，叫上朋友一起来吧~";//默认分享标题
    shareImageUrl = "https://web.bzw.cn/wechatgame/doudizhu/sharepic/share2.png";//默认分享图片

    adUnitId = { V_SIGN: "", B_LOTTERY: "" }
    constructor() {
        super();
        this.systemInfo = wx.getSystemInfoSync();
        this.launchInfo = wx.getLaunchOptionsSync();
        this.showShareMenu({});
        this.checkUpdate();
        cc.game.on(cc.game.EVENT_HIDE, this.shareResult, this);
    }

    /**
     * 微信登陆流程
     * @param obj.authorize 是否需要授权用户信息 默认false
     * @param obj.authIcon 授权提示图标
     */
    login(obj: { authorize?: boolean, authIcon?: cc.Node, success?: Function, fail?: Function }) {
        wx.login({
            success: loginRes => {
                if (obj.authorize) {
                    this.authorize({
                        scope: "scope.userInfo",
                        success: userRes => {
                            obj.success && obj.success(loginRes, userRes);
                        },
                        fail: obj.fail,
                        authIcon: obj.authIcon
                    });
                } else {
                    obj.success && obj.success(loginRes);
                }
            },
            fail: () => {
                console.log("wx.login fail");
                obj.fail && obj.fail();
            }
        });
    }

    /**
     * 请求授权
     * @param obj.scope 授权权限 例: scope.userLocation
     * @param obj.authIcon 请求授权用户信息时提示图标
     */
    authorize(obj: { scope: string, success?: Function, fail?: Function, authIcon?: cc.Node }) {
        wx.getSetting({
            success: settingRes => {
                let authSetting = settingRes.authSetting;
                if (authSetting[obj.scope]) {
                    if (obj.scope != "scope.userInfo") {
                        obj.success && obj.success();
                    } else {
                        obj.authIcon && (obj.authIcon.active = false);
                        wx.getUserInfo({
                            withCredentials: true,
                            lang: "zh_CN",
                            success: userRes => {
                                obj.success && obj.success(userRes);
                            }
                        });
                    }
                } else {
                    if (obj.scope != "scope.userInfo") {
                        wx.authorize({
                            scope: obj.scope,
                            success: () => {
                                obj.success && obj.success();
                            },
                            fail: () => {
                                obj.fail && obj.fail();
                            }
                        });
                    } else {//获取用户信息必须创建授权按钮
                        if (this.compareVersion("2.0.6") < 1) {
                            wx.showModal({
                                title: "温馨提示",
                                content: "当前微信版本过低，请升级到最新版微信后重试!",
                            });
                        } else {
                            obj.authIcon && (obj.authIcon.active = true);
                            let button = wx.createUserInfoButton({
                                withCredentials: true, type: 'text', text: "",
                                style: {
                                    left: 0, top: 0, width: cc.winSize.width, height: cc.winSize.height, backgroundColor: '#00000000',
                                    fontSize: 16, lineHeight: 20, color: '#000000', textAlign: 'center', borderRadius: 0
                                }
                            });
                            let emitTap = true;
                            button.onTap(authRes => {
                                if (authRes.userInfo) {
                                    console.log("用户授权");
                                    button.destroy();
                                    obj.authIcon && (obj.authIcon.active = false);
                                    if (emitTap) {
                                        emitTap = false;
                                        obj.success && obj.success(authRes);
                                    }
                                } else {
                                    console.log("拒绝授权用户信息");
                                }
                            });
                        }
                    }
                }
            },
            fail: () => {
                console.log("wx.getSetting fail");
                obj.fail && obj.fail();
            }
        });
    }

    // 分享相关
    shareTime: number = 0;
    shareSuccess: Function = null;
    shareFail: Function = null;
    shareComplete: Function = null;

    /**
     * 主动拉起转发，给好友分享信息
     * @param obj.shareType  number类型 不赋值默认普通分享, 1:截取屏幕中间5:4区域分享 2:分享obj.camera渲染的内容
     */
    async shareAppMessage(obj: {
        shareType?: number, title?: string, imageUrl?: string, query?: string, camera?: cc.Camera,
        dynamic?: { activityId?: string, count?: number, limit?: number }, success?: Function, fail?: Function, complete?: Function
    } = {}) {
        this.shareTime = Date.now();
        this.shareSuccess = obj.success;
        this.shareFail = obj.fail;
        this.shareComplete = obj.complete;
        obj.title = obj.title || this.shareTitle;
        //判断分享方式
        if (!obj.shareType) {//普通分享
            obj.imageUrl = obj.imageUrl || this.shareImageUrl;

        } else if (obj.shareType == 1) {//分享屏幕正中间
            obj.imageUrl = this.getImageUrlFromCanvasCenter();
        } else if (obj.shareType == 2) {//分享传入的camera渲染的内容
            if (!obj.camera) {
                console.warn("未传入camera参数，本次分享失败");
                return;
            }
            obj.imageUrl = this.getImageUrlByCamera(obj.camera);
        }
        //判断是否带动态参数
        let shareMenuArgs = null;
        if (obj.dynamic) {
            shareMenuArgs = {
                withShareTicket: true,
                isUpdatableMessage: true,
                activityId: obj.dynamic.activityId,
                targetState: 0,
                templateInfo: {
                    parameterList: [{
                        name: 'member_count',
                        value: obj.dynamic.count + ''
                    }, {
                        name: 'room_limit',
                        value: obj.dynamic.limit + ''
                    }]
                },
                success: () => {
                    share();
                }
            };
        } else {
            shareMenuArgs = {
                withShareTicket: false,
                success: () => {
                    share();
                }
            };
        }
        let share = () => {
            wx.shareAppMessage({
                title: obj.title,
                imageUrl: obj.imageUrl,
                query: obj.query
            });
        }
    }
    /**
     * 分享结果判断
     */
    shareResult() {
        let now = Date.now();
        if (now - this.shareTime > 3500) {//3.5s伪分享检测
            this.shareSuccess && this.shareSuccess();
        } else {
            this.shareFail && this.shareFail();
        }
        this.shareComplete && this.shareComplete();
        this.shareTime = 0;
        this.shareSuccess = null;
        this.shareFail = null;
        this.shareComplete = null;
    }

    /**
     * 获取屏幕正中间截屏图片URL 取屏幕正中间5:4区域,横屏适应屏幕高度,竖屏适应屏幕宽度
     */
    getImageUrlFromCanvasCenter() {
        let context: any = cc.game.canvas.getContext("2d") || cc.game.canvas.getContext("webgl", { preserveDrawingBuffer: true });
        let x, y, wid, hgt;
        if (cc.winSize.width > cc.winSize.height) {//横屏
            hgt = context.drawingBufferHeight;
            wid = hgt / 4 * 5;
        } else {//竖屏
            wid = context.drawingBufferWidth;
            hgt = wid / 5 * 4;
        }
        x = (context.drawingBufferWidth - wid) / 2;
        y = (context.drawingBufferHeight - hgt) / 2;
        return context.canvas.toTempFilePathSync({
            x: x,
            y: y,
            width: wid,
            height: hgt,
            destWidth: 500,
            destHeight: 400
        });
    }

    /**
     * 通过摄像机获取截屏图片的URl
     * @param camera 
     */
    getImageUrlByCamera(camera: cc.Camera) {
        let texture = new cc.RenderTexture();
        let gl = cc.game['_renderContext'];
        texture.initWithSize(500, 400, gl.STENCIL_INDEX8);
        camera.targetTexture = texture;
        camera.render(null);
        let data = texture.readPixels();

        let canvas: any = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        let width = canvas.width = texture.width;
        let height = canvas.height = texture.height;
        canvas.width = texture.width;
        canvas.height = texture.height;

        let rowBytes = width * 4;
        for (let row = 0; row < height; row++) {
            let srow = height - 1 - row;
            let imageData = ctx.createImageData(width, 1);
            let start = srow * width * 4;
            for (let i = 0; i < rowBytes; i++) {
                imageData.data[i] = data[start + i];
            }
            ctx.putImageData(imageData, 0, row);
        }
        return canvas.toTempFilePathSync();
    }

    /**
     * 显示右上角菜单里的转发按钮
     */
    showShareMenu(obj: { title?: string, imageUrl?: string }) {
        obj.title = obj.title || this.shareTitle;
        obj.imageUrl = obj.imageUrl || this.shareImageUrl;
        wx.showShareMenu();
        wx.onShareAppMessage(() => ({ title: obj.title, imageUrl: obj.imageUrl }));
    }

    // 广告相关
    bannerCache = {};//缓存banner及其显示次数
    /**
     * 添加banner
     * @param adKey  ad类型,具体unitId值在adUnitId中获取
     * @param posNode 跟随的节点 默认居中置底
     * @param width 宽度 默认300
     * @param sCnt 展示次数
     * @param preload 预加载banner 默认false直接展示banner
     */
    addBanner(obj:{adKey: string, posNode?: cc.Node, width?:number, sCnt?:number, preload?:number}) {
        let adUnitId = this.adUnitId[obj.adKey];
        let posNode = obj.posNode;
        let width = cc.misc.clampf(obj.width,300,this.systemInfo.screenHeight);
        let sCnt = obj.sCnt||2;
        let preload = obj.preload;
        this.hideAllBanner();
        let resetTop = banner => {
            if (posNode) {
                banner.style.top = this.systemInfo.screenHeight * (1 - posNode.getBoundingBoxToWorld().yMin / cc.winSize.height);
            } else {
                banner.style.top = this.systemInfo.screenHeight - Math.ceil(banner.style.realHeight)-2;
            }
        };
        if (!this.bannerCache[adUnitId] || this.bannerCache[adUnitId].sCnt <= 0) {//banner不存在或剩余显示次数为0
            this.bannerCache[adUnitId] && this.bannerCache[adUnitId].banner.destroy();
            let left = (this.systemInfo.screenWidth - width) / 2;
            let banner = wx.createBannerAd({
                adUnitId: adUnitId,
                style: {
                    left: left,
                    top: this.systemInfo.screenHeight,
                    width: width
                }
            });
            banner.onError(err => {
                console.log(err);
            });
            banner.onResize(() => {
                resetTop(banner);
            });
            this.bannerCache[adUnitId] = { banner: banner, sCnt: sCnt };
        } else {
            resetTop(this.bannerCache[adUnitId].banner);
        }
        if (!preload) {
            this.bannerCache[adUnitId].banner.show();
            this.bannerCache[adUnitId].sCnt -= 1;
        }
    }

    /**
     * 隐藏所有banner
     */
    hideAllBanner() {
        for (let bannerId in this.bannerCache) {
            let banner = this.bannerCache[bannerId].banner;
            banner.hide();
        }
    }

    interstitial = null;//插屏广告
    /**
     * 添加插屏广告   
     */
    addInterstitial(obj:{adKey: string}) {
        let adUnitId = this.adUnitId[obj.adKey]; 
        if (this.compareVersion("2.6.0")) {
            if (!this.interstitial) {
                this.interstitial = wx.createInterstitialAd({ adUnitId: adUnitId });
            }
            this.interstitial.show().catch(err => {
                console.log(err);
            });
        }
    }

    /**
     * 隐藏插屏广告
     */
    hideInterstitial() {
        this.interstitial && this.interstitial.destroy();
    }

    /**
     * 观看视频广告
     * @param obj.adKey 广告id @param obj.success 观看完成
     * @param obj.fail 未完整观看视频 @param obj.error 拉取视频出错
     */
    watchVideo(obj: { adKey: string, success?: Function, fail?: Function, error?: Function }) {
        let video = wx.createRewardedVideoAd({
            adUnitId: this.adUnitId[obj.adKey]
        });
        if (video) {
            video.offClose();
            video.offError();
            video.load().then(() => {
                video.show();
            });
            video.onClose(res => {
                if (res.isEnded) {
                    obj.success && obj.success();
                } else {
                    obj.fail && obj.fail();
                }
            });
            video.onError(err => {
                console.log(err);
            });
        }
    }
    
    /**
     *  判断系统SDK版本是否符合最低版本要求
     * @ver 最低SDK版本要求
     * @returns 符合返回1，不符合返回0
     */
    compareVersion(ver: string) {
        let sdkVer = this.systemInfo.SDKVersion;
        let pat = /\d+.\d+.\d+/;
        if (!pat.test(ver) || !pat.test(sdkVer)) {
            console.warn("SDKVersion取值异常");
            return 0;
        }
        let arr1 = sdkVer.split(".");
        let arr2 = ver.split(".");
        for (let i = 0; i < 3; i++) {
            let v1 = parseInt(arr1[i]);
            let v2 = parseInt(arr2[i]);
            if (v1 > v2) {
                return 1;
            } else if (v1 < v2) {
                return 0;
            }
        }
        return 1;
    }

    /**
     * 开启版本更新检测
     */
    checkUpdate() {
        let updateManager = wx.getUpdateManager();
        updateManager.onUpdateReady(() => {
            wx.showModal({
                title: "更新提示",
                content: "新版本已准备好，是否重启应用？",
                success: res => {
                    if (res.confirm) {
                        updateManager.applyUpdate();
                    }
                }
            })
        })
    }

    /**
     * 使手机发生震动
     * @param long 默认false较短时间震动  true较长时间震动
     */
    vibrate(long = false) {
        long && wx.vibrateLong();
        !long || wx.vibrateShort();
    }

}