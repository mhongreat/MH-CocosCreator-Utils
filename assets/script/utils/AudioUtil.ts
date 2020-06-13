/** 音频加载路径枚举 */
export enum EAudio {
	//音乐
	M_BGM = "bgm",
	//音效
	E_CLICK = "click"
}

/** 音频管理工具类 */
export class AudioUtil {

	public bMusic: boolean = true;
	public bEffect: boolean = true;
	private sMusicKey: string = "MusicSwitch";
	private sEffectKey: string = "EffectSwitch";

	private static _inst: AudioUtil = null;
	public static get inst() {
		if (!this._inst) {
			this._inst = new AudioUtil();
		}
		return this._inst;
	}

	private constructor() {
		this.bMusic = cc.sys.localStorage.getItem(this.sMusicKey) + "" != "false";
		this.bEffect = cc.sys.localStorage.getItem(this.sEffectKey) + "" != "false";
	}

	/** 播放背景音乐 */
	playMusic(clip: string | cc.AudioClip) {
		if (this.bMusic) {
			this.stopMusic();
			if (clip instanceof cc.AudioClip) {
				cc.audioEngine.playMusic(clip, true);
			} else if (typeof clip == "string") {
				cc.loader.loadRes(clip, cc.AudioClip, (err, audioClip) => {
					if (err) {
						console.log(err);
						return;
					}
					cc.audioEngine.playMusic(audioClip, true);
				});
			} else {
				console.warn("找不到音频资源");
			}
		}
	}

	/** 播放音效 */
	playEffect(clip: string | cc.AudioClip) {
		if (this.bEffect) {
			if (clip instanceof cc.AudioClip) {
				cc.audioEngine.playEffect(clip, false);
			} else if (typeof clip == "string") {
				cc.loader.loadRes(clip, cc.AudioClip, (err, audioClip) => {
					if (err) {
						console.log(err);
						return;
					}
					cc.audioEngine.playEffect(audioClip, false);
				});
			} else {
				console.warn("找不到音频资源");
			}
		}
	}

	/** 停止播放音乐 */
	stopMusic() {
		cc.audioEngine.stopMusic();
	}

	/** 停止播放音效 */
	stopEffect() {
		cc.audioEngine.stopAllEffects();
	}


	/** 设置音乐开关 */
	openMusic(open: boolean, clip?: string | cc.AudioClip) {
		if (this.bMusic == open) return;
		if (open) {
			cc.audioEngine.resumeMusic();
		} else {
			cc.audioEngine.pauseMusic();
		}
		this.bMusic = open;
		cc.sys.localStorage.setItem(this.sMusicKey, this.bMusic);
	}

	/** 设置音效开关 */
	openEffect(open: boolean) {
		if (this.bEffect == open) return;
		if (!open) {
			this.stopEffect();
		}
		this.bEffect = open;
		cc.sys.localStorage.setItem(this.sEffectKey, this.bEffect);
	}
}




