export class HttpRequest {
    private constructor() { }
    private static _inst: HttpRequest = null;
    public static get inst() {
        if (!this._inst) {
            this._inst = new HttpRequest();
        }
        return this._inst;
    }

    public async post(action: string, data?, url?: string, showWait = true) {
        if (!url) {
            url = "http://www.tianqiapi.com/api";
        }
        let p = new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.timeout = 5000;
            xhr.ontimeout = () => {
                reject("timeout");
            };
            xhr.onabort = () => {
                reject("user abort");
            };
            xhr.onerror = () => {
                reject("network error");
            };
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                    var response = xhr.responseText;
                    resolve(response);
                }
            }
            xhr.open("POST", url + action, true);
            xhr.send(data);
        });
        return p;
    }

    public async get(action: string, url?: string, showWait = true) {
        if (!url) {
            url = "http://www.tianqiapi.com/api?version=v9&appid=23035354&appsecret=8YvlPNrz";
        }
        let p = new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.timeout = 5000;
            xhr.ontimeout = () => {
                reject("timeout");
            };
            xhr.onabort = () => {
                reject("user abort");
            };
            xhr.onerror = () => {
                reject("network error");
            };
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                    var response = xhr.responseText;
                    resolve(response);
                }
            }
            xhr.open("GET", url + action, true);
            xhr.send();
        });
        return p;
    }


}