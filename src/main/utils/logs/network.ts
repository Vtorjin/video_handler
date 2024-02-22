import { netLog } from "electron";
import type { NetLog } from "electron";
import { joinFilePath } from "../../core/fileManager";

export class NetLogger {
    static instance: null | NetLogger = null;
    static getInstance() {
        return this.instance === null ? new NetLogger() : this.instance;
    }

    public netLog: NetLog;

    constructor() {
        this.netLog = netLog;
    }

    start() {
        this.netLog.startLogging(joinFilePath(__dirname, "../../", 'logs'));
    }

    stop() {
        this.netLog.stopLogging();
    }

}