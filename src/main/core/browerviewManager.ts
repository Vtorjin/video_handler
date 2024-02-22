import { BrowserView, BrowserWindow } from "electron";
import FileManager, { joinFilePath } from "./fileManager";
import SystemManager, { isProduction } from "./systemManager";

class BrowserViewManager {
    static instance: BrowserViewManager | null = null;
    static getInstance() {
        if (this.instance == null) {
            this.instance = new BrowserViewManager();
        }
        return this.instance;
    }

    private rootWin: BrowserWindow
    private browser: BrowserView

    init() {
        console.log('添加');
        const win = SystemManager.getInstance().getMainWindow();
        if (!this.browser) {
            this.bindRootWindow(win);
            this.loadProxyPage();
        } else {
            const { width, height } = win.getBounds();
           
            this.browser.setBounds({x: 210, y: 55, width, height })
        }
    }

    bindRootWindow(win: BrowserWindow) {
        this.rootWin = win;
    }

    loadProxyPage() {
        const context = this
        const view = new BrowserView({
            webPreferences: {
                spellcheck: !1,
                contextIsolation: !0,
                nodeIntegration: !0,
                backgroundThrottling: !1,
                nodeIntegrationInWorker: !0,
                nodeIntegrationInSubFrames: !0,
                allowRunningInsecureContent: !0,
                preload: joinFilePath(__dirname, "../preload/index.js"),
            }
        })
        const page = FileManager.getInstance().getChatgptPagePath();
        view.setBounds({ x: 210, y: 55, width: 600, height: 300 })
        view.setAutoResize({ horizontal: true, vertical: true });
        isProduction ? view.webContents.loadFile(page, { hash: "chatRoom" }) : view.webContents.loadURL(page)
        view.webContents.openDevTools();
        context.rootWin.addBrowserView(view);
        context.browser = view;

    }

    hideProxyPage() {
        this.browser && this.browser.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    }

}

export default BrowserViewManager;