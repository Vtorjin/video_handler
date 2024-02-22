import { BeforeSendResponse, OnBeforeSendHeadersListenerDetails, session } from "electron";
import SystemManager from "./systemManager";

export default class SessionManager {
    static instance: SessionManager | null;
    static getInstance() {
        this.instance = this.instance ? this.instance : new SessionManager();
        return this.instance;
    }

    overrideRequestHeader() {
        session.defaultSession.webRequest.onBeforeSendHeaders({
            urls: ['<all_urls>']
        }, (details: OnBeforeSendHeadersListenerDetails, callback: (beforeSendResponse: Electron.BeforeSendResponse) => void) => {
            if (details.url.includes('/newplayer/track')) {
                callback({ cancel: true })
            } else {
                callback({
                    requestHeaders: {
                        ...details.requestHeaders,
                        'sec-ch-ua': "Quark",
                        'sec-ch-ua-platform': "Mac",
                        'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
                    },
                })
            }
        })
    }

    overrideWebResponse() {
        session.defaultSession.webRequest.onHeadersReceived({
            urls: ['<all_urls>']
        }, (details, callback) => {
            // details.url.includes('.m3u8') && console.log(details.url, '响应的地址')
            details.url.includes('.m3u8') && !details.url.includes('.key') && SystemManager.getInstance().sendMessageToRender('captureM3u8Url', details.url)
 
            callback({ responseHeaders: { ...details.responseHeaders } })
        })
    }
}