import { AppErrorTracker, PVTracker, GlobalErrorTracker, UVTracker, XhrTracker, SystemInfo } from "../interface/tracker.interface";
import { getSystemInfo } from "./getSystemInfo";

export default class TrackManager {
    static instance: null | TrackManager = null;
    static getInstance() {
        if (!this.instance) {
            this.instance = new TrackManager();
        }
        return this.instance;
    }

    public host: string = "";
    public systemInfo: SystemInfo = {
        uniq_code: "",
        browserName: '',    // 浏览器名称
        browserVersion: '', // 浏览器版本
        osName: '',         // 操作系统名称
        osVersion: '',      // 操作系统版本
        deviceName: '',     // 设备名称
    }

    asyncQueue: (GlobalErrorTracker | XhrTracker | AppErrorTracker | UVTracker | PVTracker)[];

    init(host: string, id: string) {
        this.host = host;

        this.systemInfo = {
            uniq_code: id,
            ...getSystemInfo()
        }
        console.log(this.systemInfo)
    }

    constructor() {
        this.asyncQueue = [];
    }

    send(tracker: GlobalErrorTracker | XhrTracker | AppErrorTracker | UVTracker | PVTracker) {
        if (this.host === '') {
            this.asyncQueue.push(tracker);
            console.log(this.asyncQueue);
            return;
        }
        fetch(`${this.host}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({
                ...tracker,
                ...this.systemInfo
            })
        }).then(r => r.json())
            .then(() => { })
            .catch((e) => {
                console.log(e);
            })
    }
}