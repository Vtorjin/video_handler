import { app } from "electron";
import fs from "fs";
import { join, sep } from "path";
import pkg from "~/config/default.json"
import SystemManager, { isProduction } from "./systemManager";
import os from "os";
import { execSync } from "child_process";
import { MainLogger } from "../utils/logs";

export const isExist = (_path: string): boolean => {
    return fs.existsSync(_path)
};

export const joinFilePath = (...args: string[]) => {
    return join(...args);
}

export const readFile = (url: string, suc: Function, err: Function) => {
    fs.readFile(url, (_err, data) => {
        if (_err) {
            err(_err);
        } else {
            suc(data);
        }
    })
};

export const readFileSync = (url: string) => {
    return fs.readFileSync(url)
}

export const writeFile = (file: string, content: string, contentType?: BufferEncoding) => {
    fs.writeFileSync(file, content, contentType || "utf-8")
}

export const removeFileSync = (file: string) => {
    isExist(file) && fs.rmSync(file);
}



class FileManager {

    static instance: null | FileManager = null;
    static getInstance() {
        if (this.instance == null) {
            this.instance = new FileManager()
        }
        return this.instance;
    }

    private systemConf: MyAppSetting
    private aria2cConf: Aria2cSetting

    constructor() {
        this.systemConf = {
            ap: true,
            lp: false,
            cs: "0",
            sp: joinFilePath(app.getPath('appData'), 'download'),
            op: joinFilePath(app.getPath('appData'), 'output'),
            compress: joinFilePath(app.getPath('appData'), 'compress'),
            workerTotal: 4,
            apiKey: "your apiKey",
            apiUrl: "your apiUrl",
            yt: "D:/youtube"
        }

        this.aria2cConf = {
            confPath: "",
            savePath: "",
            sessionPath: "",
            trackers: []

        }
    }

    getWorkCount() {
        return this.systemConf.workerTotal || 6
    }

    getProjectPath(): string {
        return app.isPackaged ? join(app.getAppPath(), '../') : app.getAppPath();
    }

    getTrayLogoPath(): string {
        return app.isPackaged ? join(app.getAppPath(), "../", "logo.png") : join(app.getAppPath(), "public/logo.ico");
    }

    getDistHtml(): string {
        return join(app.getAppPath(), "out", "renderer", "index.html");
    }

    getDevHtml(): string {
        return `http://127.0.0.1:${pkg.port}/`
    }

    getClientHtml(): string {
        return join(app.getAppPath(), "client.html");
    }

    getChatgptPagePath() {
        return isProduction ? this.getDistHtml() : `http://127.0.0.1:${pkg.port}/#/chatroom/index`;
    }

    getPlayWindowPath() {
        // return isProduction ? join(app.getAppPath(), "..", 'app.asar.unpacked','resources', "player.html") : `http://127.0.0.1:${pkg.port}/#/window/`;
        return isProduction ? this.getDistHtml() : `http://127.0.0.1:${pkg.port}/#/window/`;

        // return isProduction ? join(app.getAppPath(), "..", 'app.asar.unpacked', 'resources', "player.html") : joinFilePath(__dirname, '..', '..', 'resources', 'player.html')
    }

    getMainLogPath() {
        return join(app.getAppPath(), 'logs/error.log')
    }

    getUserDataFolder() {
        return app.getPath('userData');
    }

    getSysConfPath() {
        return join(this.getUserDataFolder(), 'sys.conf');
    }

    getCompressOut(filename: string) {
        return joinFilePath(this.systemConf.compress, filename);
    }

    getAppIcon() {
        return isProduction ? 'logo.png' : joinFilePath(__dirname, '../', '..', 'resources', 'logo.png')
    }

    initSysConf() {
        const file = this.getSysConfPath();
        if (isExist(file) == false) {
            writeFile(file, JSON.stringify(this.systemConf), 'utf8')
            return;
        };
        Object.assign(this.systemConf, JSON.parse(readFileSync(file).toString()))
        SystemManager.getInstance().sendMessageToRender('systemSetting', this.systemConf);
    }

    updateSysSetting(data: object) {
        const file = this.getSysConfPath();
        Object.assign(this.systemConf, data);
        isExist(file) && writeFile(file, JSON.stringify(this.systemConf), 'utf8')
        SystemManager.getInstance().sendMessageToRender('systemSetting', data);
    }

    /**
     * @description 获取文件操作相关的路径
     * @param {compress} 压缩文件输出文件夹
     * @param {sp}  ts文件下载保存路径
     * @param {op}  ts文件下载并合并为视频文件后的保存路径 
     */
    getRelevantPath(key: PathSettingUnion) {
        return this.systemConf[key];
    } 


    getRelevantValue<T extends SettingValueUnion>(key: string): MyAppSetting[T] {
        return this.systemConf[key];
    }

    getYoutubeDownloadPath() {
        return `${this.systemConf.yt.replace(/\\/g, '')}/%(title).150B.%(ext)s`
        // return `${this.systemConf.yt.replace(/\\/g, '')}/video.150B [%(id)s].%(ext)s`
    }

    getRelevantPathByAria2c() {

    }

    checkAvailableUsedMemory(type: PathSettingUnion, waringValue: number = 3 * 1024 * 1024 * 1024) {
        const driverLetter = FileManager.getInstance().getRelevantPath(type).split(sep).shift();
        // windows环境
        // const cmd = `wmic logicaldisk where "DeviceID='${driverLetter}'" get FreeSpace,Size`
        const cmd = `wmic logicaldisk where "DeviceID='${driverLetter}'" get FreeSpace`;
        const size = isExist(driverLetter) ? execSync(cmd).toString().replace(/\D/gi, '') : 0;
        // console.log(Number(size) > waringValue, this.formatBytes(+size), '!!!!哈哈哈哈', '?????')
        return isExist(driverLetter) ? Number(size) > waringValue : false;
    }

    formatBytes(bytes: number) {
        console.log(bytes, '比特')
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    removeFullPath(url: string) {
        if (isExist(url)) {
            const isDirectory = fs.statSync(url).isDirectory();
            const cmd = isDirectory ? `rd /s /q   "${url}"` : `del /q "${url}"`
            try {
                execSync(cmd);
            } catch (e) {
                console.log(e)
                MainLogger.error(JSON.stringify({
                    type: "concatError",
                    params: url,
                    message: String(e.message || e),
                    time: new Date().toLocaleString(),
                }))
            }
        }
    }

    getDownloadTsFolder(name: string) {
        return joinFilePath(this.getRelevantPath('sp'), name.split('.').shift() || '');
    }
}


export default FileManager;

// rd / s / q   preferences.ini