import FileManager, { isExist, joinFilePath } from "./fileManager";
import { ChildProcess, spawn } from "child_process";

class MagnetManager {
    static instance: MagnetManager | null = null;
    static getInstance() {
        if (this.instance == null) {
            this.instance = new MagnetManager();
        }
        return this.instance;
    }
    // taskQueue
    private _tq: string[] = []
    // waitingQueue
    private _wq: string[] = []
    private child: ChildProcess;

    constructor() {
        this._tq = [];
        this._wq = [];
    }

    createDownloadTask() {}

}

export default MagnetManager;