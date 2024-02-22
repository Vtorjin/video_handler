import { Worker } from 'worker_threads';
import { existsSync, mkdirSync, statSync } from "fs";
import { join } from "path"
import FileManager, { isExist, joinFilePath, removeFileSync, writeFile } from './fileManager';
import SystemManager from './systemManager';
import { ChildProcess, spawn } from 'child_process';
import { DownloadState } from "~/enmu.d";
import axios from 'axios';

class DownloadManager {
    static instance: DownloadManager | null
    static getInstance() {
        if (this.instance == null) {
            this.instance = new DownloadManager()
        }
        return this.instance;
    }


    public urls: string[] //url downloading queue
    public clone: string[] //clone downloading queue
    public workers: Worker[]; // worker pool
    public nWorkers: number  //worker counts
    public finishNum: number //ts finished count
    public whiteList: string[] //404 white list
    public videoName: string //origin video name
    public videoPath: string // ts save folder
    public taskId: string
    public net = 0; // write speed
    public timer: NodeJS.Timer | null = null
    public waitQueue = [];
    public errorQueue = [];
    public total: number // all task number
    public count = 0; // finished ts count
    public fullName: string //full out video file name
    public muPath: string // local m3u8 file path
    public state: number // download state
    public repeatTimes = 0; //network crashed and repeat times
    public failedTimes = 0; //ts files concat failed times
    public mu: string   //local m3u8 textContent
    private isPending = true;
    private muNet = ""; //remote m3u8 textContent
    private downloadingMap: { [key: number]: string }
    private fpgProcess: ChildProcess | null = null;

    constructor() {
        this.urls = [];
        this.clone = []
        this.workers = [];
        this.nWorkers = FileManager.getInstance().getWorkCount();
        this.finishNum = 0;
        this.whiteList = [];
        this.mu = '';
        this.videoPath = ""
        this.videoName = ""
        this.taskId = ""
        this.total = 0;
        this.muPath = ""
        this.fullName = ""
        this.state = DownloadState.initial
        this.downloadingMap = {}
    }

    checkIsExist(event: Electron.IpcMainInvokeEvent, _data: { fr: string, nm: string, cd: string, ou: string }, me = this) {
        axios.get(`http://localhost:3880/video/query?name=${_data.cd}`)
            .then(async ({ data: { data, status } }) => {
                // console.log('校验结果', status, data, _data)
                if (status !== 200) {
                    console.log('直接取消')
                    event.sender.send('check-is-exist', '')
                    return;
                }
                if (data.length === 1) {
                    let existOne: VideoInfoDatabaseTypeEdit = data.pop();
                    event.sender.send('check-is-exist', JSON.stringify(existOne));
                    me.getVideoText(existOne.tm, _data.ou, true, existOne)
                }

                if (data.length !== 0) {
                    let existOne: VideoInfoDatabaseTypeEdit = (data as VideoInfoDatabaseTypeEdit[]).find(item => (item.fr === _data.fr || item.nm === _data.nm))
                    if (existOne == undefined) {
                        console.log('发送多个', data)
                        event.sender.send('check-exists-many', data.reduce((total, item) => {
                            return total += JSON.stringify({
                                id: item.id,
                                nm: item.nm,
                                fr: item.fr,
                                lp: item.lp
                            }) + '\n'
                        }, ''))

                    } else {
                        await me.getVideoText(existOne.tm, _data.ou, true)
                        event.sender.send('check-is-exist', JSON.stringify(existOne));
                    }
                    return;
                }
            }).catch((e) => {
                event.sender.send('check-is-exist', '')
                event.sender.send('check-exists-many', '' + e)
            })
    }

    // get local m3u8 text and sent it to front end
    getVideoText(time: string | object, ou: string, auto = false, origin?: VideoInfoDatabaseTypeEdit) {
        this.muNet = "";
        // console.log(...arguments)
        return axios({
            url: "http://localhost:3880/angular/gettext",
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                url: ou,
                times: typeof time === 'string' ? JSON.parse(time) : time
            })
        }).then(({ data: { data, status, message } }) => {
            if (status === 200) {
                this.muNet = data.mu;
                auto === false && SystemManager.getInstance().notifyHandleResult('success', '文本已自动获取!');
                auto && origin && this.updateMuText(origin, ou);
                // console.log('data',data/)
                SystemManager.getInstance().sendMessageToRender('update-mutxt', data);
            } else {
                SystemManager.getInstance().notifyHandleResult('error', '文本自动获取失败' + message + '!')
            }

        }).catch((e) => {
            SystemManager.getInstance().notifyHandleResult("error", '自动获取失败拦截内容:' + e)
        })
    }

    // update local m3u8 textContent
    updateMuText(origin: Pick<VideoInfoDatabaseTypeEdit, 'id' | 'lo' | 'tm'>, ou: string) {
        const me = this
        console.log(origin, me.muNet)
        me.muNet && axios({
            url: `http://localhost:3880/video/update/${origin.id}`,
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                id: origin.id,
                lo: origin.lo,
                tm: origin.tm,
                ou,
                text: me.muNet,
            })
        }).then(({ data: { status, message } }) => {
            console.log(origin, me.muNet, '自动更新了吗， ')
            let isSuccess = status === 200;
            SystemManager.getInstance().notifyHandleResult(isSuccess ? 'success' : "error", isSuccess ? '视频文本更新成功' : ('视频文本更新失败:' + message))
        }).catch((e) => {
            SystemManager.getInstance().notifyHandleResult("error", '视频文本更新失败:' + e)

        })
    }

    deleteById(id: string, e: Electron.IpcMainInvokeEvent) {
        axios({
            url: `http://localhost:3880/video/del/${id}`
        }).then(({ data: { status, data, message } }) => {
            console.log(status, data, message)
            status == 200 && e.sender.send('deleteSuccess')

        }).catch(e => {
            console.log(e, 'delete failed!');
        })
    }

    /**
     * @param id: taskId
     * @param mu: muText
     * @param name videoName
     * */
    init(id: string, mu: string, name: string) {
        if (this.state === DownloadState.downloading) return
        // 解析mu文本，并将符合条件的URL保存至this.urls中
        const lines = mu.split('\n');
        const plaintName = name.replace(/:|#|\/|~|\?|\n/g, '');
        const sp = FileManager.getInstance().getRelevantPath('sp');
        const vp = joinFilePath(sp, plaintName)
        const op = FileManager.getInstance().getRelevantPath('op')
        this.taskId = id;
        this.videoName = name;
        this.videoPath = vp;
        this.total = 0;
        this.finishNum = 0;
        this.mu = "";
        this.muPath = joinFilePath(vp, 'index.m3u8');
        this.fullName = joinFilePath(op, plaintName + '.mp4')
        this.clone = [];
        this.urls = [];
        this.count = 0;
        this.nWorkers = FileManager.getInstance().getWorkCount();
        this.downloadingMap = {};

        // check download Folder is exist
        try {
            !existsSync(sp) && mkdirSync(sp)
            !existsSync(op) && mkdirSync(op)
            !isExist(this.videoPath) && mkdirSync(this.videoPath)

            // Rewrite network file request address to local address
            for (let line of lines) {
                if (line.includes('.ts')) {
                    let file = line.split("/").pop();
                    let plaint = (file as string).slice(0, file?.includes('?') ? file.indexOf('?') : file?.length)
                    let filePath = joinFilePath(vp, plaint);
                    existsSync(filePath) ? this.finishNum++ : this.urls.push(line)
                    this.clone.push(line);
                    this.mu += `${plaint}\n`;
                    ++this.total
                } else if (line.includes('URI=')) {
                    let arr = line.split('"')
                    let key = line.slice(line.indexOf('"') + 1, line.lastIndexOf('"'))
                    let keyParams = key.split("/").pop() || '';
                    let plaint = keyParams.slice(0, keyParams?.includes('?') ? keyParams.indexOf('?') : keyParams?.length)
                    let filePath = joinFilePath(vp, plaint);
                    existsSync(filePath) ? this.finishNum++ : this.urls.push(key)
                    this.clone.push(key);
                    console.log(key, 'encrypt file')
                    this.mu += `${arr[0]}"${plaint}"${arr[2]}\n`;
                    ++this.total
                } else {
                    this.mu += `${line}\n`;
                }
            }

            // create local m3u8 file
            writeFile(this.muPath, this.mu);

            // distribute the task queue evenly to each sub thread
            this.urls = Array.from(new Set(this.urls))
            this.run()
            this.isPending = false

        } catch (e) {
            // for the most part, your video name has some specific character.
            SystemManager.getInstance().sendMessageToRender('download-error', { id: 'error name', state: DownloadState.initial })
        }
    }

    run() {
        var me = this;
        me.state = DownloadState.downloading
        if ((me.finishNum + me.whiteList.length) < me.total) {
            me.start();
        } else {
            me.concatFluentFFmpeg()
                .then(() => {
                    me.notifyFinish()
                    me.isPending = true;
                })
                .catch((e) => me.reloadTask());
        }
        console.log(this.workers.length, '线程长度');
    }

    start() {
        var me = this;
        this.workers.splice(0)
        for (let i = 0; i < this.nWorkers; i++) {
            let startUrl = me.urls.shift() || '';
            const worker = new Worker(joinFilePath(__dirname, 'worker.js'), {
                workerData: {
                    port: i,
                    task: startUrl,
                    folder: me.videoPath,
                },
            });
            me.downloadingMap[i] = startUrl;
            worker.on('message', message => {
                switch (message.name) {
                    case "net-info": {
                        const { net } = message.data
                        me.net += net;
                        return
                    }
                    case "ts-ok": {
                        ++me.finishNum;
                        const nextUrl = me.urls.shift() || "";
                        me.downloadingMap[i] = nextUrl;
                        nextUrl ? worker.postMessage({
                            name: 'next', data: { url: nextUrl, vp: me.videoPath }
                        }) : worker.postMessage('task-over')
                        return;
                    }

                    case "ts-failed": {
                        me.finishNum = me.finishNum < 0 ? 0 : me.finishNum
                        me.urls.push(message.data);
                        const nextUrl = me.urls.shift() || "";
                        me.downloadingMap[i] = nextUrl;
                        nextUrl ? worker.postMessage({
                            name: 'next', data: { url: nextUrl, vp: me.videoPath }
                        }) : worker.postMessage('task-over')
                        return;
                    }

                    case "ts-404": {
                        me.whiteList.push(message.data);
                        const nextUrl = me.urls.shift() || "";
                        me.downloadingMap[i] = nextUrl;
                        nextUrl ? worker.postMessage({
                            name: 'next', data: { url: nextUrl, vp: me.videoPath }
                        }) : worker.postMessage('task-over')
                        return;
                    }

                    case "ts-finish": {
                        me.count++
                        if (me.count >= me.nWorkers && (me.finishNum + me.whiteList.length + 4) > me.total) {
                            console.log('开始发hi有的', me)
                            delete me.downloadingMap[i];
                            me.stopTimer()
                            me.concatFluentFFmpeg()
                                .then(() => me.notifyFinish())
                                .catch((e) => me.reloadTask())
                        }
                        return;
                    }
                }
            });

            this.workers.push(worker);
        }

        // use a timer to Prevent bad (internet) connection
        me.timer = setInterval(() => {
            me.net == 0 && ++me.repeatTimes;
            me.repeatTimes <= 15 ? me.notifyStatus() : me.handlePending();
        }, 1000);
    }

    reloadTask() {
        let task: string | undefined = ""
        let idx = 0;
        let me = this;
        let num = me.nWorkers;
        let tasks = me.urls.splice(0, num);
        this.downloadingMap = {};

        // me.failedTimes++;
        // if (me.failedTimes >= 5) {
        //     console.log('下载失败!')
        //     me.notifyError()
        //     me.failedTimes = 0;
        //     return;
        // }

        if (tasks.length === 0) {
            console.log('重新合并')
            me.concatFluentFFmpeg()
                .then(() => {
                    me.notifyFinish();
                    me.isPending = true;
                })
                .catch((e) => {
                    me.notifyError()
                    me.failedTimes = 0;
                });
            return
        }
        // console.log(num, '任务重启', me.workers.length, '长度', tasks, '请求内容')
        if (me.workers.length) {
            while (task = tasks.pop()) {
                // console.log("重启的任务", me.workers[idx])
                if (me.workers[idx]) {
                    me.downloadingMap[idx] = task;
                    me.workers[idx].postMessage({ name: "next", data: { url: task, vp: me.videoPath } })
                }
                idx++;
                idx = idx % num;
            }
            me.timer = setInterval(() => {
                me.net == 0 && ++me.repeatTimes;
                me.repeatTimes <= 15 ? me.notifyStatus() : me.handlePending();
            }, 1000);
        } else {
            me.start()
        }

    }

    concatFluentFFmpeg() {
        var me = this;
        return new Promise((r, j) => {
            // cmd 
            var args = ['-allowed_extensions', 'ALL', '-i', `"${me.muPath}"`, '-y', '-c', 'copy', `"${me.fullName}"`];
            var isFailed = false;

            me.stopTimer();

            //  show concat process start info in front end!
            SystemManager.getInstance().sendMessageToRender('updateNet', {
                net: 0,
                success: this.finishNum,
                error: this.whiteList,
                id: this.taskId,
                qs: this.total,
                state: 'downloading',
                isConcat: true
            })

            function recursionConcat() {
                if (me.failedTimes >= 5) {
                    me.failedTimes = 0;
                    return j(false)
                };


                var stack: string[] = [];
                var childProcess = spawn("ffmpeg", args, { shell: true });

                me.fpgProcess = childProcess;


                childProcess.stderr.on('data', (data) => {
                    var text = data.toString()
                    text.includes('.ts') && stack.push(text.slice(text.indexOf("'") + 1, text.lastIndexOf("'")));
                })

                childProcess.on('exit', (code: number) => {
                    if (code == 0) {
                        // isFailed ? console.log('合计测试通过,但仍要继续执行当前的下载任务') : console.log('合并成功!', isFailed,)
                        me.fpgProcess && me.fpgProcess.kill();
                        me.fpgProcess = null;
                        me.failedTimes = 0;
                        isFailed ? j(false) : r(true)
                    } else {
                        let errItems: string[] = stack.length > 2 ? [...stack.splice(stack.length - 3)] : stack.splice(0);
                        // console.log('concat error!', stack.length)
                        me.failedTimes++;
                        if (!errItems[0]) {
                            console.log('concat error and cannot found the second to last error ts file!', stack.length)
                            me.failedTimes = 0;
                            return j(false)
                        };
                        isFailed = true;
                        errItems.forEach(errItem => {
                            let tsFile = errItem.split("\\").pop() || 'unknown';
                            let plaint: string = tsFile.slice(0, tsFile.indexOf('?') != -1 ? tsFile.indexOf('?') : tsFile.length)
                            let ts = join(me.videoPath, plaint);
                            let newOne = me.clone.find(t => t.includes(ts));
                            removeFileSync(errItem.replace('crypto:', ''));
                            newOne && me.urls.push(newOne)
                            --me.finishNum;
                            me.finishNum = me.finishNum < 0 ? 0 : me.finishNum
                        })

                        me.urls = Array.from(new Set(me.urls))
                        me.fpgProcess = null;
                        // 清楚中间错误的内容,所有的资源可以合并时再进行ts完整性的整合
                        recursionConcat()
                    }
                })

            }

            recursionConcat()
        })
    }


    stopTimer() {
        this.timer && clearInterval(this.timer)
        this.timer = null
    }

    isPendingStatus() {
        return this.isPending;
    }

    // Due to not downloading data for a long time, it is necessary to rewrite the timer settings and clear all thread tasks
    handlePending() {
        const me = this;
        const folder = me.videoPath;
        me.repeatTimes = 0;
        me.timer && clearInterval(me.timer);
        me.repeatTimes = 0;
        Object.values(me.downloadingMap).map(url => {
            const fullPath = joinFilePath(folder, url.slice(0, url.includes('?') ? url.indexOf('?') : url.length));
            try {
                url && removeFileSync(fullPath);
            } catch (e) {
                console.log('可讷讷的的', e.message, fullPath, me.downloadingMap)
            }
            // if(isExist(fullPath)&&!!url){removeFileSync(fullPath);me.count--;}
        })
        me.downloadingMap = {};
        me.reloadTask();
 
    }

    notifyStatus() {
        this.state === DownloadState.downloading && SystemManager.getInstance().sendMessageToRender('updateNet', {
            net: this.net,
            success: this.finishNum,
            error: this.whiteList,
            id: this.taskId,
            qs: this.total,
            state: 'downloading'
        })
        this.net = 0;
    }

    notifyFinish(me = this) {
        me.workers.forEach(worker => {
            worker.terminate()
            worker = null;
        });
        me.workers.splice(0);

        SystemManager.getInstance().sendMessageToRender('download-finish', {
            id: me.taskId,
            state: DownloadState.completed,
            qs: me.total,
            qs_ok: me.finishNum > me.total ? me.total : me.finishNum,
            local: me.fullName,
            sz: statSync(me.fullName).size
        })

        me.state = DownloadState.completed
    }

    notifyError() {
        this.failedTimes = 0
        SystemManager.getInstance().sendMessageToRender('download-error', { id: this.taskId, state: DownloadState.initial })
        this.state = DownloadState.error

    }

    stopTask() {
        this.workers.forEach(worker => {
            worker.postMessage('cancel');
            setTimeout(() => { worker.terminate() }, 500);
        })
    }

    pauseTask() {
        // console.log('暂停任务', this.workers.length)
        this.fpgProcess && this.fpgProcess.kill(1);
        this.fpgProcess = null;

        this.stopTimer()
        this.workers.forEach((worker, i) => {
            worker.postMessage({ name: "pause" });
            worker.terminate();
            (i == this.workers.length - 1) && this.workers.splice(0)

        })
        SystemManager.getInstance().sendMessageToRender('pauseDownload', { id: this.taskId, state: DownloadState.initial })
        this.state = DownloadState.initial;
    }
}


export default DownloadManager