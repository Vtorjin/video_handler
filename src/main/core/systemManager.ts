import { app, dialog, Menu, Tray, BrowserWindow, clipboard, globalShortcut, MessageBoxOptions, Notification, shell } from "electron";
import childProcess from "child_process";
import FileManager, { joinFilePath, writeFile } from "./fileManager";
import SessionManager from "./sessionManager";
import VideoTransferManager from "./videoTransferManager";
import { setObjToUrlParams } from "../utils/url";


export const isProduction = !!app.isPackaged;

class SystemManager {
    static instance: SystemManager | null = null;
    static getInstance() {
        if (this.instance == null) {
            this.instance = new SystemManager();
        }
        return this.instance;
    }

    public devUrl: string | undefined = process.env.VITE_DEV_SERVER_URL;
    public win: BrowserWindow | null = null;
    public childWin: BrowserWindow | null = null;

    private willQuit = false;
    private shutdownTime: string | number = 0;


    constructor() { }

    getMainWindow() {
        return this.win;
    }

    // 创建主系统
    createMainWindow(title: string): void {
        var me = this;
        var win = new BrowserWindow({
            title,
            width: 1280,
            height: 840,
            icon: FileManager.getInstance().getAppIcon(),
            // frame: true, //显示异常标题栏
            // autoHideMenuBar: true,
            autoHideMenuBar: true,
            webPreferences: {
                // sandbox: false,
                nodeIntegration: true,
                nodeIntegrationInSubFrames: true,
                nodeIntegrationInWorker: true,
                // webSecurity: true,
                webviewTag: true,
                preload: joinFilePath(__dirname, "../preload/index.js"),
            }
        });
        me.win = win;
        SessionManager.getInstance().overrideRequestHeader();
        SessionManager.getInstance().overrideWebResponse();



        win.on('close', (e) => {
            if (me.willQuit) return;
            e.preventDefault();
            const option: MessageBoxOptions = { type: "question", message: "操作提示", detail: `确定是否要退出?`, buttons: ["确定", "取消"] }
            dialog.showMessageBox(option)
                .then((res: { response: number, checkboxChecked: boolean }) => {
                    if (res.response === 0) {
                        me.willQuit = true; me.childWin = null; me.win = win = null;
                        VideoTransferManager.getInstance().killChildProcess();
                        app.quit();

                    } else {
                        me.willQuit = false
                    }
                })
        })
        Promise.all([
            me.createCustomSystemMenu(win),
            // me.createCustomContextMenu(),
            // me.createApplicationTray(),
            me.loadMainWINFile(),
        ]);
    }

    // 创建子系统
    createChildWindow(title: string) {
        var me = this;
        var childWin = new BrowserWindow({
            title,
            width: 1280,
            height: 840
        });
        me.childWin = childWin;
    }

    createPlayWindow(conf: PlayerWindowConf) {
        var me = this;
        var childWin = new BrowserWindow({
            width: 854,
            height: 540,
            title: '',
            icon: FileManager.getInstance().getAppIcon(),
            // frame: true, //显示异常标题栏
            autoHideMenuBar: true,
            webPreferences: {
                sandbox: false,
                nodeIntegration: true,
                nodeIntegrationInSubFrames: true,
                nodeIntegrationInWorker: true,
                webSecurity: false,
                webviewTag: true,
                preload: joinFilePath(__dirname, "../preload/index.js"),
            }
        });

        const page = FileManager.getInstance().getPlayWindowPath();
        const query = { ...conf, "id": conf.id.toString() }
        // isProduction ? childWin.loadFile(page, { query }) : childWin.loadFile(page, { query: query });
        // isProduction ? childWin.loadFile(page, { hash: "window", query }) : childWin.loadURL(setObjToUrlParams(page, query));
        isProduction ? childWin.loadFile(page, { hash: setObjToUrlParams("window", query) }) : childWin.loadURL(setObjToUrlParams(page, query));

        childWin.addListener('closed', () => { me.childWin = null; })
        me.childWin = childWin;
        // childWin.webContents.openDevTools();
    }

    // 创建应用主要菜单
    createCustomSystemMenu(win: BrowserWindow) {
        const mainMenu = Menu.buildFromTemplate([
            {
                label: "控制台",
                click: () => win.webContents.toggleDevTools()
            },
            {
                label: "重新加载",
                click: () => {
                    win.reload()
                },
                "accelerator": "CTRL+R"
            },
            {
                label: "退出",
                click: () => {
                    app.quit();
                },
                "accelerator": "ESC"
            },
            {
                label: "文件目录管理",
                submenu: [
                    {
                        label: "打开下载目录",
                        click: () => {
                            shell.openPath(FileManager.getInstance().getRelevantPath('sp'))
                        },
                        "accelerator": "F10"
                    },
                    {
                        label: "打开输出目录",
                        click: () => {
                            shell.openPath(FileManager.getInstance().getRelevantPath('op'))
                        },
                        "accelerator": "F9"
                    },
                    {
                        label: "打开压 缩 输 出目录",
                        click: () => {
                            shell.openPath(FileManager.getInstance().getRelevantPath('compress'))
                        },
                        "accelerator": "CTRL+F8"
                    }, {
                        label: "打开数据目录",
                        click: () => {
                            shell.openPath(FileManager.getInstance().getUserDataFolder());
                        }
                    }
                ]

            },

        ]);

        Menu.setApplicationMenu(mainMenu);
        this.createShortCut(win);
    }

    // autohidemenuBar为true
    createShortCut(win: BrowserWindow) {
        globalShortcut.register('CTRL+R', () => { win.reload() });
        globalShortcut.register('F5', () => { win.reload() });
        globalShortcut.register('F11', () => { win.webContents.toggleDevTools() })
        globalShortcut.register('F10', () => { shell.openPath(FileManager.getInstance().getRelevantPath('sp')) })
        globalShortcut.register('F9', () => { shell.openPath(FileManager.getInstance().getRelevantPath('op')) })
        globalShortcut.register('F8', () => { shell.openPath(FileManager.getInstance().getRelevantPath('compress')) })
        globalShortcut.register('CTRL+SHIFT+F12', () => { win.webContents.toggleDevTools() });
        // globalShortcut.register('F12', () => { win.webContents.toggleDevTools() });

        // globalShortcut.register('ESC', () => { app.quit() })
    }

    // 创建鼠标右键菜单
    createCustomContextMenu() {
        let _menu: Electron.MenuItemConstructorOptions[] = [
            {
                label: "刷新",
                role: "reload"
            },
            {
                label: "加入",
                click: () => { }
            },
            {
                label: "退出",
                click() { }
            },
            {
                label: "录制视频",
                click: function () { },
            }
        ];
        let ctxMenu = Menu.buildFromTemplate(_menu);
        ctxMenu.popup();
    }

    // 创建托盘
    createApplicationTray() {
        var appIcon = new Tray(FileManager.getInstance().getTrayLogoPath());
        const menu = Menu.buildFromTemplate([
            {
                label: '设置',
                click: function () { } //打开相应页面
            },
            {
                label: '退出',
                click: function () { app.quit() }
            }
        ])
        appIcon.setToolTip('m3u8解析下载器');
        appIcon.setContextMenu(menu);
    }

    // 主窗口加载html资源的同时,需要开启http服务
    loadMainWINFile() {
        var me = this;
        isProduction ? me.win?.loadFile(FileManager.getInstance().getDistHtml()) : me.win?.loadURL(FileManager.getInstance().getDevHtml())
        // me.win.loadURL(`${FileManager.getInstance().getDevHtml()}#/window`)
    }

    quitSystem() {
        this.childWin = null;
        this.win = null;
        if (process.platform !== 'darwin') app.quit()
    }

    // 下载关机
    setShutDownCount(t: string | number) {
        this.shutdownTime = t;
    }

    shutDownSystem() {
        const time = Number.isNaN(this.shutdownTime) ? 60 : Number(this.shutdownTime) * 60;
        childProcess.execSync(`shutdown -t ${time} -s `)
    }

    // 处理异常
    handleError(errInfo: Error) {
        this.win?.webContents.send("errorHandler", errInfo);
    }

    handlePasteEvent() {
        let val = {};
        try {
            val = JSON.parse(clipboard.readText());
            delete val['reqQueue'];
            console.log(val);
        } catch (e) {
            val = clipboard.readText()
            // console.log('错误的内容', '单个版本使用', e)
        }

    }

    handleCopyEvent() {

    }

    sendMessageToRender(tag: string, val?: string | object) {
        this.win && this.win.webContents.send(tag, typeof val === "string" ? val : JSON.stringify(val))
    }

    notifyHandleResult(type: "success" | 'error', message: string) {
        this.win && this.win.webContents.send('showHandleResult', JSON.stringify({ type, message }))
    }
}




export default SystemManager;