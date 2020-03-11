
/** 微信小游戏工具类 */
export class WXUtil {
    static systemInfo = null;//系统信息
    static launchInfo = null;//启动游戏信息
    static onShowCb: Map<string, Function> = new Map();//onshow回调函数Map,使用map避免重复注册回调函数
    static onHideCb: Map<string, Function> = new Map();//onhide回调函数Map,使用map避免重复注册回调函数
    static shareTitle = "【斗地主合集】好友约场永久免费，叫上朋友一起来吧~";//默认分享标题
    static shareImageUrl = "https://web.bzw.cn/wechatgame/doudizhu/sharepic/share2.png";//默认分享图片
    static _ctor = WXUtil.init();//加载脚本时初始化

    /**
     * 初始化小游戏基本功能
     */
    static init() {
        WXUtil.enableOnShowAndHide();
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return;
        WXUtil.systemInfo = wx.getSystemInfoSync();
        WXUtil.launchInfo = wx.getLaunchOptionsSync();
        WXUtil.showShareMenu();
        WXUtil.checkUpdate();
        WXUtil.checkMemory();
        WXUtil.disableMultTouch();
        WXUtil.onShowCb.set("shareResult", WXUtil.shareResult);
    }

    /**
     * 微信登陆流程
     * @param obj.authorize 是否需要授权用户信息 默认false
     * @param obj.authIcon 授权提示图标
     */
    static login(obj: { authorize?: boolean, authIcon?: cc.Node, success?: Function, fail?: Function } = {}) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return;
        wx.login({
            success: loginRes => {
                if (obj.authorize) {
                    WXUtil.authorize({
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
    static authorize(obj: { scope: string, success?: Function, fail?: Function, authIcon?: cc.Node }) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return;
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
                        if (WXUtil.compareVersion("2.0.6") < 1) {
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

    /**
     * 开启后台切换监听
     */
    static enableOnShowAndHide() {
        cc.game.on(cc.game.EVENT_SHOW, res => {
            WXUtil.onShowCb.forEach(cb => {
                cb(res);
            });
        });
        cc.game.on(cc.game.EVENT_HIDE, res => {
            WXUtil.onHideCb.forEach(cb => {
                cb(res);
            });
        });
    }

    // 分享相关
    static shareTime: number = 0;
    static shareSuccess: Function = null;
    static shareFail: Function = null;
    static shareComplete: Function = null;

    /**
     * 主动拉起转发，给好友分享信息
     * @param obj.shareType  number类型 不赋值默认普通分享, 1:截取屏幕中间5:4区域分享 2:分享obj.camera渲染的内容
     */
    static async shareAppMessage(obj: {
        shareType?: number, title?: string, imageUrl?: string, query?: string, camera?: cc.Camera,
        dynamic?: { activityId?: string, count?: number, limit?: number }, success?: Function, fail?: Function, complete?: Function
    } = {}) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            obj.success && obj.success();
            obj.complete && obj.complete();
            return;
        };
        WXUtil.shareTime = Date.now();
        WXUtil.shareSuccess = obj.success;
        WXUtil.shareFail = obj.fail;
        WXUtil.shareComplete = obj.complete;
        obj.title = obj.title || WXUtil.shareTitle;
        //判断分享方式
        if (!obj.shareType) {//普通分享
            obj.imageUrl = obj.imageUrl || WXUtil.shareImageUrl;

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
    static shareResult() {
        let now = Date.now();
        if (now - WXUtil.shareTime > 3500) {//3.5s伪分享检测
            WXUtil.shareSuccess && WXUtil.shareSuccess();
        } else {
            WXUtil.shareFail && WXUtil.shareFail();
        }
        WXUtil.shareComplete && WXUtil.shareComplete();
        WXUtil.shareTime = 0;
        WXUtil.shareSuccess = null;
        WXUtil.shareFail = null;
        WXUtil.shareComplete = null;
    }

    /**
     * 获取屏幕正中间截屏图片URL 取屏幕正中间5:4区域,横屏适应屏幕高度,竖屏适应屏幕宽度
     */
    static getImageUrlFromCanvasCenter() {
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
    static getImageUrlByCamera(camera: cc.Camera) {
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
    static showShareMenu(obj: { title?: string, imageUrl?: string } = {}) {
        obj.title = obj.title || WXUtil.shareTitle;
        obj.imageUrl = obj.imageUrl || WXUtil.shareImageUrl;
        wx.showShareMenu();
        wx.onShareAppMessage(() => ({ title: obj.title, imageUrl: obj.imageUrl }));
    }

    // 广告相关
    static bannerCache = {};//缓存banner及其显示次数
    /**
     * 添加banner
     * @param adUnitId  由ADEnum枚举,使用相同adUnitId需保持width一致
     * @param posNode 跟随的节点 默认居中置底
     * @param width 宽度 默认300
     * @param sCnt 展示次数
     * @param preload 预加载banner 默认false直接展示banner
     */
    static addBanner(adUnitId: ADEnum, posNode?: cc.Node, width = 300, sCnt = 3, preload = false) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return;
        WXUtil.hideAllBanner();
        let resetTop = banner => {
            if (posNode) {
                banner.style.top = WXUtil.systemInfo.screenHeight * (1 - posNode.getBoundingBoxToWorld().yMin / cc.winSize.height);
            } else {
                banner.style.top = WXUtil.systemInfo.screenHeight - Math.ceil(banner.style.realHeight);
            }
        };
        if (!WXUtil.bannerCache[adUnitId] || WXUtil.bannerCache[adUnitId].sCnt <= 0) {//banner不存在或剩余显示次数为0
            WXUtil.bannerCache[adUnitId] && WXUtil.bannerCache[adUnitId].banner.destroy();
            width < 300 && (width = 300);
            width > WXUtil.systemInfo.screenWidth && (width = WXUtil.systemInfo.screenWidth);
            let left = (WXUtil.systemInfo.screenWidth - width) / 2;
            let banner = wx.createBannerAd({
                adUnitId: adUnitId,
                style: {
                    left: left,
                    top: WXUtil.systemInfo.screenHeight,
                    width: width
                }
            });
            banner.onError(err => {
                console.log(err);
            });
            banner.onResize(() => {
                resetTop(banner);
            });
            WXUtil.bannerCache[adUnitId] = { banner: banner, sCnt: sCnt };
        } else {
            resetTop(WXUtil.bannerCache[adUnitId].banner);
        }
        if (!preload) {
            WXUtil.bannerCache[adUnitId].banner.show();
            WXUtil.bannerCache[adUnitId].sCnt -= 1;
        }
    }

    /**
     * 隐藏所有banner
     */
    static hideAllBanner() {
        for (let bannerId in WXUtil.bannerCache) {
            let banner = WXUtil.bannerCache[bannerId].banner;
            banner.hide();
        }
    }

    static interstitial = null;//插屏广告
    /**
     * 添加插屏广告
     * @param adUnitId    
     */
    static addInterstitial(adUnitId: ADEnum) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return;
        if (window["qq"]) return;
        if (WXUtil.compareVersion("2.6.0")) {
            if (!WXUtil.interstitial) {
                WXUtil.interstitial = wx.createInterstitialAd({ adUnitId: adUnitId });
            }
            WXUtil.interstitial.show().catch(err => {
                console.log(err);
            });
        }
    }

    /**
     * 隐藏插屏广告
     */
    static hideInterstitial() {
        WXUtil.interstitial && WXUtil.interstitial.destroy();
    }

    /**
     * 观看视频广告
     * @param obj.adUnitId 广告id @param obj.success 观看完成
     * @param obj.fail 未完整观看视频 @param obj.error 拉取视频出错
     */
    static watchVideo(obj: { adUnitId: ADEnum, success?: Function, fail?: Function, error?: Function }) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            obj.success && obj.success();
            return;
        };
        let video = wx.createRewardedVideoAd({
            adUnitId: obj.adUnitId
        });
        if (video) {
            video.offClose();
            video.offError();
            video.load().then(() => {
                cc.audioEngine.pauseMusic();
                video.show();
            });
            video.onClose(res => {
                cc.audioEngine.resumeMusic();
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
     * 创建小游戏图片按钮
     * @param image 图片路径(带扩展名)
     * @param node 与按钮对应的节点，按钮使用节点的位置和大小
     * @param cb 回调用于创建按钮,回调参数包含按钮所有属性,例:opts=>{wx.createFeedbackButton(opts);}
     */
    static createImageButton(image: string, node: cc.Node, cb: Function) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return;
        new cc.Component().scheduleOnce(() => {
            let wid = WXUtil.systemInfo.screenWidth / cc.winSize.width * node.width * node.scaleX;
            let hgt = WXUtil.systemInfo.screenHeight / cc.winSize.height * node.height * node.scaleX;
            let x = node.getBoundingBoxToWorld().xMin;
            let y = node.getBoundingBoxToWorld().yMax;
            let left = x / cc.winSize.width * WXUtil.systemInfo.screenWidth;
            let top = (1 - y / cc.winSize.height) * WXUtil.systemInfo.screenHeight;
            let opts = {
                type: "image",
                image: image,
                style: {
                    left: left,
                    top: top,
                    width: wid,
                    height: hgt,
                    backgroundColor: "#00000000",
                    borderColor: "#00000000",
                    borderWidth: 0,
                    borderRadius: 0,
                    textAlign: "center",
                    fontSize: 0,
                    lineHeight: 0
                }
            }
            cb(opts);
        }, 0.05);
    }

    /**
     *  判断系统SDK版本是否符合最低版本要求
     * @ver 最低SDK版本要求
     * @returns 符合返回1，不符合返回0
     */
    static compareVersion(ver: string) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return;
        if (window["qq"]) return 1;
        let sdkVer = WXUtil.systemInfo.SDKVersion;
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
    static checkUpdate() {
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
     * 监听内存不足告警事件
     */
    static checkMemory() {
        if (WXUtil.compareVersion("2.0.2")) {
            wx.onMemoryWarning(() => {
                wx.triggerGC();
            });
        }
    }

    /**
     * 使手机发生震动
     * @param long 默认false较短时间震动  true较长时间震动
     */
    static vibrate(long = false) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return;
        long && wx.vibrateLong();
        !long || wx.vibrateShort();
    }

    static touchMap: Map<string, cc.Button> = new Map();
    static touchTime = 0;
    /**
     * 关闭按钮多点响应
     */
    static disableMultTouch() {
        cc.Button.prototype["_onTouchBegan"] = function (event) {
            if (!this.interactable || !this.enabledInHierarchy || Date.now() - WXUtil.touchTime < 100) return;
            WXUtil.touchTime = Date.now();
            WXUtil.touchMap.set(this.uuid, this);
            this._pressed = true;
            this._updateState();
            event.stopPropagation();
        }

        cc.Button.prototype["_onTouchEnded"] = function (event) {
            if (!this.interactable || !this.enabledInHierarchy) return;
            if (this._pressed) {
                cc.Component.EventHandler.emitEvents(this.clickEvents, event);
                this.node.emit('click', this);
                WXUtil.touchMap.forEach(btn => btn["_pressed"] = false);
                WXUtil.touchMap.clear;
            }
            this._pressed = false;
            this._updateState();
            event.stopPropagation();
        }
    }

}
/** 枚举广告id */
export enum ADEnum {
    //横幅
    B_SHOWAWARD = "adunit-97d3451d799c6dbf",//展示奖励
    B_ENDLAYER = "adunit-12d82dbe11a6e8ea",//展示奖励
    //视频
    V_SIGN = "adunit-1edad93d83a1e4e7",//签到
    V_DIAMOND = "adunit-741163e97c655f0d",//商城钻石
    V_WINSTREAK = "adunit-67e063e5d818a4dd",//连胜中断
    V_BENEFIT = "adunit-b4fdbbd86818c578",//救济金
    V_DAILYTASK = "adunit-0d7dc5c73ec7db25",//每日任务
    V_CHALLENGETASK = "adunit-8f7e855bbd2abd2e",//挑战任务
    V_LUCKYTURN = "adunit-8b9ca34520c21cdb",//幸运转盘
    V_LUCKYBOX = "adunit-8bb6c07d49f899bd",//幸运宝箱

    //插屏
    I_AD = "adunit-45e8f64c7d0367aa"//插屏广告
}
