/**
 * 微信小游戏的主要命名空间
 */
declare namespace wx {
    /**
     * 获取设备系统信息
     */
    export function getSystemInfo(opts?: { success?: Function, fail?: Function, complete?: Function }): void;
    /**
     * 获取设备系统信息，getSystemInfo的同步方法
     */
    export function getSystemInfoSync(): any;
    /**
     * 获得小游戏启动参数
     */
    export function getLaunchOptionsSync(): any;
    /**
     * 获取全局唯一对更新进行管理的对象
     */
    export function getUpdateManager(): {
        /** 强制小程序重启并使用新版本。在小程序新版本下载完成后（即收到 onUpdateReady 回调）调用 */
        applyUpdate(): void;
        /** 监听向微信后台请求检查更新结果事件。微信在小程序冷启动时自动检查更新，不需由开发者主动触发 */
        onCheckForUpdate(cb: Function): void;
        /** 监听小程序更新失败事件。小程序有新版本，客户端主动触发下载（无需开发者触发），下载失败（可能是网络原因等）后回调 */
        onUpdateFailed(cb: Function): void;
        /** 监听小程序有版本更新事件。客户端主动触发下载（无需开发者触发），下载成功后回调 */
        onUpdateReady(cb: Function): void;
    };
    /**
     * 退出小游戏
     */
    export function exitMiniProgram(opts?: { success?: Function, fail?: Function, complete?: Function }): void;
    /**
     * 监听小游戏回到前台
     */
    export function onShow(cb: Function): void;
    /**
     * 取消监听小游戏回到前台的事件 默认取消所有监听事件Z
     */
    export function offShow(cb?: Function): void;
    /**
    * 监听小游戏退到后台
    */
    export function onHide(cb: Function): void;

    /**
    * 取消监听微信小游戏回到前台的事件
    */
    export function offHide(cb: Function): void;

    /**
     * 调用接口获取登录凭证（code）进而换取用户登录态信息，包括用户的唯一标识（openid）及本次登录的 会话密钥（session_key）等。用户数据的加解密通讯需要依赖会话密钥完成
     */
    export function login(opts?: { success?: Function, fail?: Function, complete?: Function }): void;
    /**
     * 检测当前用户登录态是否有效，登录态过期后开发者可以再调用 swan.login() 获取新的用户登录态
     */
    export function checkSession(obj?: { success?: Function, fail?: Function, complete?: Function }): void;
    /**
     * 获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限。
     */
    export function getSetting(opts?: { success?: Function, fail?: Function, complete?: Function }): void;
    /**
     * 创建用户信息授权按钮
     */
    export function createUserInfoButton(opts: { withCredentials: boolean, type: string, style: object, text?: string, image?: string, lang?: string }): {
        /** 显示用户信息按钮 */
        show(): void;
        /** 隐藏用户信息按钮 */
        hide(): void;
        /** 销毁用户信息按钮 */
        destroy(): void;
        /** 监听用户信息按钮的点击事件 */
        onTap(cb: Function): void;
        /** 取消监听用户信息按钮的点击事件 */
        offTap(cb?: Function): void;
    };
    /**
     * 
     */
    export function getUserInfo(opts?: { withCredentials?: boolean, lang?: string, success?: Function, fail?: Function, complete?: Function })
    /**
     * 提前向用户发起授权请求。如果用户之前已经同意授权，则不会出现弹窗，直接返回成功。获取用户信息使用 wx.createUserInfoButton
     */
    export function authorize(opts: { scope: string, success?: Function, fail?: Function, complete?: Function });

    /**
     * 更新转发属性
     */
    export function updateShareMenu(opts?: { withShareTicket?: boolean, isUpdatableMessage?: boolean, activityId?: string, targetState?: number, templateInfo?: object, success?: Function, fail?: Function, complete?: Function }): void;

    /**
     * 主动拉起转发
     */
    export function shareAppMessage(opts?: { title?: string, imageUrl?: string, query?: string }): void;
    /**
     * 显示当前页面的转发按钮
     */
    export function showShareMenu(opts?: { success?: Function, fail?: Function, complete?: Function }): void;
    /**
     * 监听用户点击右上角菜单的“转发”按钮时触发的事件
     */
    export function onShareAppMessage(cb: Function): void;
    /**
    * 取消监听用户点击右上角菜单的“转发”按钮时触发的事件
    */
    export function offShareAppMessage(cb?: Function): void;
    /**
     * 显示模态对话框 opts.success 回调函数res:{confirm: boolean为true时，表示用户点击了确定按钮; cancel: boolean为true时，表示用户点击了取消按钮;}
     */
    export function showModal(opts: {
        title: string, content: string, showCancel?: boolean, cancelText?: string, cancelColor?: string, confirmText?: string, confirmColor?: string,
        success?: Function, fail?: Function, complete?: Function
    }): void;
    /**
     * 创建小游戏激励视频广告组件，createRewardedVideoAd 成功后会自动加载第一次的广告物料
     */
    export function createRewardedVideoAd(opts: { adUnitId: string }): any;
    /**
     * 创建插屏广告组件，每次调用该方法创建插屏广告都会返回一个全新的实例（小程序端的插屏广告实例不允许跨页面使用）
     */
    export function createInterstitialAd(opts: { adUnitId: string }): any;
    /**
     * 创建小游戏 banner 广告组件
     */
    export function createBannerAd(opts: { adUnitId: string, style: { top: number, left: number, width: number, height?: number } }): any;
    /**
     * 打开另一个小程序或小游戏
     */
    export function navigateToMiniProgram(opts: { appId: string, path?: string, extraData?: object, envVersion?: string, success?: Function, fail?: Function, complete?: Function })
    /**
     * 使手机发生较长时间的振动（400 ms）
     */
    export function vibrateLong(opts?: { success?: Function, fail?: Function, complete?: Function }): void;
    /**
     * 使手机发生较短时间的振动（15 ms）
     */
    export function vibrateShort(opts?: { success?: Function, fail?: Function, complete?: Function }): void;
    /**
     * 在新页面中全屏预览图片。预览的过程中用户可以进行保存图片、发送给朋友等操作
     */
    export function previewImage(opts: { urls: string[], current?: string, success?: Function, fail?: Function, complete?: Function });
    /**
    * 设置是否保持常亮状态。仅在当前小程序生效，离开小程序后设置失效。
    * @param opts {keepScreen 是否常亮 success	接口调用成功的回调函数  fail  接口调用失败的回调函数  complete  接口调用结束的回调函数（调用成功、失败都会执行）}
    */
    export function setKeepScreenOn(opts: { keepScreenOn: boolean, success?: Function, fail?: Function, complete?: Function }): void;
    /**
     * 创建打开意见反馈页面的按钮
     */
    export function createFeedbackButton(opts: { type: string, text: ?string, image: ?string, style: object })
    /**
     * 发起米大师支付
     * @param opts {mode:"game",env:0,currencyType:"CNY",platform:"android",buyQuantity:游戏币数量,zoneId:分区id}
     */
    export function requestMidasPayment(opts: {
        mode: string, env: number, offerId: string, currencyType: string, platform: string, buyQuantity: number,
        zoneId?: number, success?: Function, fail?: Function, complete?: Function
    }): void;
    /**
     * 更新实时语音静音设置
     */
    export function updateVoIPChatMuteConfig(opts: { muteConfig: { muteMicrophone: boolean, muteEarphone: boolean }, success?: Function, fail?: Function, complete?: Function });
    /**
     * 监听实时语音通话成员通话状态变化事件。有成员开始/停止说话时触发回调
     */
    export function onVoIPChatSpeakersChanged(cb: Function)
    /**
     * 监听实时语音通话成员在线状态变化事件。有成员加入/退出通话时触发回调
     */
    export function onVoIPChatMembersChanged(cb: Function)
    /**
     * 监听被动断开实时语音通话事件。包括小游戏切入后端时断开
     */
    export function onVoIPChatInterrupted(cb: Function)
    /**
     * 加入 (创建) 实时语音通话
     */
    export function joinVoIPChat(opts: {
        signature: string, nonceStr: string, timeStamp: number, groupId: string,
        roomType?: string, muteConfig?: object, success?: Function, fail?: Function, complete?: Function
    });
    /**
     * 退出（销毁）实时语音通话
     */
    export function exitVoIPChat(opts?: { success?: Function, fail?: Function, complete?: Function });
    /**
     * 监听内存不足告警事件
     */
    export function onMemoryWarning(cb: Function);
    /**
     * 加快出发垃圾回收，出发时机由JavaScriptCore控制
     */
    export function triggerGC();
}