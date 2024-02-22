import { Notification } from "electron";
import SystemManager from "./systemManager";
import FileManager, { isExist, joinFilePath } from "./fileManager";
import { ChildProcess, exec, execSync, spawn } from "child_process";
import { calculateDurationPercentage } from "../utils/ffmpeg";
import { mkdirSync, readdirSync, statSync } from "fs";
import TaskPoolManager from "./taskManager";
import { sep } from "path";
/**
 * @description 视频格式转换处理管理类
 * */
class VideoTransferManager {
    static instance: VideoTransferManager | null
    static getInstance() {
        if (this.instance == null) {
            this.instance = new VideoTransferManager()
        }
        return this.instance;
    }

    private suc: TTSuccess = "2";
    // taskQueue
    private _tq: string[] = []
    // waitingQueue
    private _wq: string[] = []
    // transferConfMap
    private _tc: Record<string, RCDD> = {}
    private child: ChildProcess;

    constructor() {


        this._tc = {};
        this._tq = [];
        this._wq = [];
    }

    checkIsExist(name: string) {
        return name in this._tc && this._tc[name]
    }


    // initTaskBeforeCreate
    initTaskBeforeCreate(basic: TaskBeforeInitConf, needNotify = true) {
        return new Promise((r) => {
            var argus = ['-v', 'error', '-of json', '-show_format', '-show_streams', `"${basic.origin}"`];
            var _process = spawn('ffprobe', argus, { shell: true });
            var cacheStream = "";
            _process.stderr.on('data', (data) => {
            })
            _process.stdout.on('data', (data) => {
                cacheStream += data.toString();
            })
            _process.on('error', (e) => {
            })
            _process.on('exit', code => {
                code == 0 ? this.handleAnalysisVideo(JSON.parse(cacheStream) as StreamResponse, basic, needNotify) : new Notification({ title: "文件操作提示", body: "系统读取视频信息失败!" }).show()
                _process = null;
                r(true);
            })
        })
    }


    handleAnalysisVideo(result: StreamResponse, basic: TaskBeforeInitConf, needNotify = true) {
        let { width, height } = result.streams[0]
        let params = {
            name: basic.name,
            _vr: `${width}x${height}` as VideoResolution || 'default',
            _vb: result.format?`${result.format.bit_rate}` as VideoBites : 'default',
            _va: result.streams[1] ? `${result.streams[1].bit_rate}/1000` as VideoAudioBites : 'default',
            _vm: result.streams[0] ? `${eval(result.streams[0].r_frame_rate)}` as VideoFrames : 'default',
            _vw: result.streams[0] ? `${result.streams[0].display_aspect_ratio}` as VideoARs : 'default',
            _vf: basic.name.split('.').pop() as VideoFormat || 'mp4',
            width: result.streams[0].width,
            height: height,
            isPc: width > height
        }
        this._tc[basic.name] = {
            ...params,
            vt: +result.format.duration,
            size: +result.format.size,
            id: Date.now(),
            status: "0",
            origin: basic.origin,
            output: basic.output

        }
        needNotify && SystemManager.getInstance().sendMessageToRender('initVideoParams', params)
    }

    //startTransferTask
    startTransferTask(name: string, conf: TransferVideoOption) {
        if (this._tq.includes(name) || this._wq.includes(name)) return
        Object.assign(this._tc[name], conf);
        if (this._tq.length >= 1) {
            this._wq.push(name);
        } else {
            this._tq.push(name);
            this.createSingleChildProcessTask(name);
        }
        SystemManager.getInstance().sendMessageToRender('updateTransferList', this.getDownloadingTasks())
    }

    startMultiTask() {
        this._tq.length && this.createMultiChildProcessTasks(this._tq);
    }

    createSingleChildProcessTask(name: string) {
        let conf = this._tc[name]
        if (conf == undefined) return;
        var argus = ['-i', `"${conf.origin}"`,
            conf._vr == 'default' ? '' : "-s " + conf._vr,
            conf._vb == 'default' ? '' : "-b:v " + conf._vb + 'k',
            conf._vm == 'default' ? '' : "-r " + conf._vm,
            conf._va == 'default' ? '' : "-b:a " + conf._va + 'k',
            '-y', `"${conf.output}"`
        ]
        var start = Date.now();
        var tsFiles = FileManager.getInstance().getDownloadTsFolder(name);
        var cp = FileManager.getInstance().getRelevantPath('compress');
        isExist(cp) === false && mkdirSync(cp);
        this.child = spawn('ffmpeg', argus, { shell: true });
        this.child.on('exit', (code) => {
            if (code == 0) {
                FileManager.getInstance().removeFullPath(conf.origin);
                FileManager.getInstance().removeFullPath(tsFiles);
                delete this._tc[name];
                SystemManager.getInstance().sendMessageToRender('updateTransferList', this.getDownloadingTasks());
                this._tq.shift();

            } else {
                new Notification({ title: "合并提示", body: "出现异常了" }).show()
            }
            this._wq.length !== 0 && this.createSingleChildProcessTask(this._wq.shift() as string);
            console.log(Date.now() - start);
        })

        // stdout
        this.child.stdout.on('data', (data) => { })

        // stderr
        this.child.stderr.on('data', (data) => {
            let percentage = calculateDurationPercentage(data.toString(), conf.vt);
            percentage && SystemManager.getInstance().sendMessageToRender('updateTransferProcess', { id: conf.id, percentage })

        })

    }

    createMultiChildProcessTasks(names: string[]) {
        let name = names.shift();
        let conf = this._tc[name]
        if (conf == undefined) return;
        const tsFiles = FileManager.getInstance().getDownloadTsFolder(name);
        const cp = FileManager.getInstance().getRelevantPath('compress');
        isExist(cp) === false && mkdirSync(cp);
        // if (isExist(conf.output)) {
        //     console.log('执行的内容是', conf)
        //     FileManager.getInstance().removeFullPath(conf.origin);
        //     FileManager.getInstance().removeFullPath(tsFiles);
        //     delete this._tc[name];
        //     SystemManager.getInstance().sendMessageToRender('updateTransferList', this.getDownloadingTasks());
        //     this._tq.shift();
        //     this._wq.length !== 0 && this.createMultiChildProcessTasks([this._wq.shift() as string]);
        //     return;
        // }
        if (FileManager.getInstance().checkAvailableUsedMemory('compress') === false) {
            new Notification({
                body: "剩下的内存不够了哟!"
            }).show();
            return;
        }


        var bite = conf.isPc ? (Number(conf._vb) > 600 ? 600 : ((Number(conf._vb) - 20) || 600)) : (Number(conf._vb) > 300 ? 300 : ((Number(conf._vb) - 20) || 300));
        conf.width = conf.isPc ? (conf.width > 854 ? 854 : conf.width) : (conf.width > 270 ? 270 : conf.width);
        conf.height = conf.isPc ? (conf.height > 480 ? 480 : conf.height) : (conf.height > 480 ? 480 : conf.height);

        var argus = ['-i', `"${conf.origin}"`,
            conf._vr == 'default' ? '' : "-s " + `${conf.width}x${conf.height}`,
            conf._vb == 'default' ? '' : `-b:v ${bite}k`,
            conf._vm == 'default' ? '' : "-r " + '25',
            conf._va == 'default' ? '' : "-b:a " + (+conf._va > 128 ? 128 : conf._va) + 'k',
            '-y', `"${conf.output}"`
        ]

        // console.log(argus, '当前执行的任务是');
        // this._wq.length !== 0 && this.createMultiChildProcessTasks([this._wq.shift() as string]);
        var start = Date.now();
        this.child = spawn('ffmpeg', argus, { shell: true });

        this.child.on('exit', (code) => {
            if (code == 0) {
                FileManager.getInstance().removeFullPath(conf.origin);
                FileManager.getInstance().removeFullPath(tsFiles);
                delete this._tc[name];
                SystemManager.getInstance().sendMessageToRender('updateTransferList', this.getDownloadingTasks());
                this._tq.shift();

            } else {
                new Notification({ title: "合并提示", body: "出现异常了" }).show()
            }
            // this.child && this.child.kill(1);
            this.child = null;
            this._wq.length !== 0 && this.createMultiChildProcessTasks([this._wq.shift() as string]);
            console.log(Date.now() - start);
        })

        // stdout
        this.child.stdout.on('data', (data) => { })

        // stderr
        this.child.stderr.on('data', (data) => {
            let percentage = calculateDurationPercentage(data.toString(), conf.vt);
            percentage && SystemManager.getInstance().sendMessageToRender('updateTransferProcess', { id: conf.id, percentage })
        })
    }


    // getDownloadingT9asks
    getDownloadingTasks() {
        return Object.values(this._tc).filter(t => t.status !== this.suc)
    }

    getTaskNames() {
        return Object.keys(this._tc)
    }

    isPendingStatus() {
        return this._tq.length === 0
    }

    scanFolder(directoryPath: string, queue: string[] = [], isChild: boolean = false) {
        isChild == false && (this._tc = {})
        const me = this;
        const files = readdirSync(directoryPath);
        if (files.length == 0 && !isChild) {
            SystemManager.getInstance().sendMessageToRender('updateTransferList', this.getDownloadingTasks());
            return;
        }

        files.forEach((file, i) => {
            if (!file.includes('Sys') && !file.includes('$')) {
                const filePath = joinFilePath(directoryPath, file);

                if (statSync(filePath).isDirectory()) {
                    me.scanFolder(filePath, queue, true);
                } else {
                    filePath.includes('.mp4') && !queue.includes(filePath) && queue.push(filePath);
                }

                // SystemManager.getInstance().sendMessageToRender('updateTransferList', this.getDownloadingTasks());

                i === files.length - 1 && !isChild && TaskPoolManager.getInstance().start(queue, async (name: string) => {
                    const origin = name.split(sep).pop();
                    const _conf = {
                        origin: name,
                        name: origin,
                        output: joinFilePath(FileManager.getInstance().getRelevantPath('compress'), origin),
                    }
                    if (this._tq.includes(origin) || this._wq.includes(origin)) {
                        return true
                    }
                    if (this._tq.length >= 1) {
                        this._wq.push(origin);
                    } else {
                        this._tq.push(origin);
                        this.createMultiChildProcessTasks([origin]);
                    }
                    const res = await this.initTaskBeforeCreate(_conf, false);


                    return res;
                }, () => {
                    SystemManager.getInstance().sendMessageToRender('updateTransferList', this.getDownloadingTasks());
                    // const names = Object.keys(this._tc);
                    // this.createMultiChildProcessTasks(names);
                    console.log('地址是啥啊', Object.keys(this._tc))
                })

            }
        })
    }

    killChildProcess() {
        this.child && this.child.kill(1);
        this.child = null;
    }

}

export default VideoTransferManager