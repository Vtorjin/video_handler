import log from 'electron-log';

import FileManager from '../../core/fileManager';

log.transports.file.fileName = "日志错误报告.log";
log.transports.file.format = `[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}`;
log.transports.file.maxSize = 1002430;
log.transports.file.resolvePath = () => FileManager.getInstance().getMainLogPath();

// console.log(FileManager.getInstance().getMainLogPath())

export class MainLogger {
    static info(...argus) {
        log.info(...argus)
    }

    static error(...argus) {
        log.error(...argus)
    }

    static warn(...argus) {
        log.warn(...argus);
    }
}