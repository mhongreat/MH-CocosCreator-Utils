/** 音频管理工具类 */
export class AudioUtil {
    static localKey = { audio: "audioSwitch", music: "musicSwitch", effect: "effectSwitch" };//本地缓存key
    static audio = true;//音频总开关
    static music = true;//音乐开关
    static effect = true;//音效开关
    static _ctor = AudioUtil.init();

    static init() {
        this.audio = cc.sys.localStorage.getItem(this.localKey.audio) + "" != "false";
        this.music = cc.sys.localStorage.getItem(this.localKey.music) + "" != "false";
        this.effect = cc.sys.localStorage.getItem(this.localKey.effect) + "" != "false";
    }

    /** 播放背景音乐 */
    static playMusic(clip: string | cc.AudioClip) {
        if (this.audio && this.music) {
            this.stopMusic();
            if (clip instanceof cc.AudioClip) {
                cc.audioEngine.playMusic(clip, true);
            } else if (typeof clip == "string") {
                cc.loader.loadRes(clip, cc.AudioClip, (err, audioClip) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    cc.audioEngine.playMusic(audioClip, true);
                });
            } else {
                console.error("找不到音频资源");
            }
        }
    }

    /** 播放音效 */
    static playEffect(clip: string | cc.AudioClip) {
        if (this.audio && this.effect) {
            if (clip instanceof cc.AudioClip) {
                cc.audioEngine.playEffect(clip, false);
            } else if (typeof clip == "string") {
                cc.loader.loadRes(clip, cc.AudioClip, (err, audioClip) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    cc.audioEngine.playEffect(audioClip, false);
                });
            } else {
                console.error("找不到音频资源");
            }
        }
    }

    /** 停止播放音乐 */
    static stopMusic() {
        cc.audioEngine.stopMusic();
    }

    /** 停止播放音效 */
    static stopEffect() {
        cc.audioEngine.stopAllEffects();
    }

    /** 设置音频总开关 */
    static setAudio(value: boolean) {
        if (value) {
            cc.audioEngine.resumeMusic();
        } else {
            cc.audioEngine.pauseMusic();
            this.stopEffect();
        }
        this.audio = value;
        cc.sys.localStorage.setItem(this.localKey.audio, this.audio);
    }

    /** 设置音乐开关 */
    static setMusic(value: boolean) {
        if (value) {
            cc.audioEngine.resumeMusic();
        } else {
            cc.audioEngine.pauseMusic();
        }
        this.music = value;
        cc.sys.localStorage.setItem(this.localKey.music, this.music);
    }

    /** 设置音效开关 */
    static setEffect(value: boolean) {
        if (!value) {
            this.stopEffect();
        }
        this.effect = value;
        cc.sys.localStorage.setItem(this.localKey.effect, this.effect);
    }
}
