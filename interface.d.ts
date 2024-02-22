interface TaskBeforeInitConf {
    name: string
    origin: string,
    output: string
}

// TransferVideoOption
type VideoFormat = "mp4" | 'avi' | 'flv' | "mpg" | 'webm'
type VideoResolution = 'default' | "1920x1080" | "270x480" | "854x480"
type VideoBites = 'default' | "128" | "258" | "512" | "1024"
type VideoFrames = 'default' | "24" | "30" | "60"
type VideoAudioBites = 'default' | "128" | "256" | "512" | "1024"
type VideoARs = 'default' | "16:9" | "4:3" | "9:16" | "3:4";

// TransferVideoOption
interface TransferVideoOption {
    // videoFormat
    _vf: VideoFormat
    // videoResolution
    _vr: 'default' | "1920x1080" | "270x480" | "854x480"
    // videoBite
    _vb: 'default' | "128" | "258" | "512" | "1024"
    // videoFrame 帧
    _vm: 'default' | "24" | "30" | "60",
    // videoScale
    _vw: 'default' | "16:9" | "4:3" | "9:16" | "3:4"
    // videoAudioBite
    _va: 'default' | "128" | "256" | "512" | "1024"
    vt: number //时长
    size: number //视频大小
    id: number
}

type TTSuccess = "2"

type TTS = "0" | "1" | TTSuccess

// 历史记录数据
interface RCDD extends TransferVideoOption {
    id: number
    status: TTS
    width: number
    height: number
    isPc: boolean
    name: string
    origin: string,
    output: string
}

interface RCDDConf extends TaskBeforeInitConf {
    id: number
    status: TTS

}


// windows api
interface CustomWebView extends HTMLElement {
    // 预加载的js文本 和主进程的预加载一样
    preload: string
    // 第三放网页打开控制台
    openDevTools: () => {}
    // 第三方执行代码
    executeJavaScript: (str: string) => Promise<any>,
    // 第三方网页输入元素focus状态可以写入的文本
    insertText: (str: string) => Promise<any>,
    setAttribute: (key: string, val: string) => void
    // 第三方网页地址
    src: string
    loadURL: (url: string) => any
    // 重新加载第三方网页
    reload: () => {}
    session: any
    partition: string
    webpreferences: string
    allowtransparency: string
    // 是否集成nodejs
    nodeintegration: string
    webContents: { executeJavaScript: (str: string) => {} }
    allowpopups: string
}


interface CommunicateFormat {
    createChildWindow: Function
    preloadFile: string
    addEventListener: (tag: string, cb: (data?: string) => void) => void
    pubEvent: (tag: string, data?: string | undefined | object) => void
    errorHandler: (cb: Function) => void
}


interface VideoBasicConf {
    lo: string  // location origin
    lp: string // location path
    ls: string // location search
    dt: number    // duration
    nm: string  // video name
    fr: string  // from App and code
    fn: string // from App and path code and name
    ou: string // original m3u8 address
    cd: string  // name code
    vw: number // video height & width
    vh: number
    sz: number  // video size after compressed
    cv: string    // video cover
    local: string   // local path
}

// preload.js  params of initConf moment
interface InitConf {
    nm: string
    fr: string
    cb?: (u: string) => string
}

interface Window {
    DPlayer: any
}

interface VideoFullInfo extends VideoBasicConf {
    id: number,
    // actor id
    ai: string
    // area id
    ar: string
    // 是否需要定时更新
    ud: boolean
    // 是否需要下载
    dl: boolean
    // 是否已下载
    ok: boolean
    // 视频类型
    tg: string[]
    qs: number
    qs_ok: number
    tm: string
}

interface VideoInfoDatabaseTypeEdit extends Omit<VideoFullInfo, 'times' | 'cv'> {
    ai: string // actor id
    ar: string  // area id
    ud: boolean  // 是否需要定时更新
    dl: boolean   // 是否需要下载
    ok: boolean // 是否已下载
    tg: string[] // 视频类型
    tm: string
}


interface DownloadInfo extends VideoInfoDatabaseTypeEdit {
    netInfo: string
    qs: number,
    qs_ok: number
    state: any
    cv: string
    times: {
        s?: number,
        e?: number,
        r?: number[][]
    }
}

interface PlayLocalVideoConf {
    nm: string,
    id: string | number,
    fn: string,
    cv: string
    type: 'm3u8Id' | 'm3u8Full' | 'localVideo'
}


// 配置内容
interface ConfigItem {
    actor: string
    confId: string
    type: string
    host: string
    area: string
    age: string
}

interface OptionsItem {
    value: string
    viewValue: string
}


// 系统设置
interface AppSetting {
    workerTotal: number  //下载线程数量
    processTotal: number //下载进程数量
    sp: string //下载保存路径
    op: string // 输出视频文件夹
    compress: string
    uf: string, // 本地资源文件
    q: string // 下载清晰度
    ap: boolean // 自动播放
    cp: boolean // 开启粘贴板自动复制
    iq: 1 | 0.8 | 0.5, //封面图片质量
    vq: VideoResolution //视频质量
    lp: boolean, //是否循环播放
    cs: "0" | "30" | "60" | "180"   //下载完成自定义关机 custom shutdown： auto, 
    sep: string
    coverFolder: string
    apiKey: string
    apiUrl: string //openAi 请求地址
    yt: string
}

interface Aria2cSetting {
    savePath: string
    confPath: string
    sessionPath: string
    trackers: string[]
}

type MyAppSetting = Pick<AppSetting, PathSettingUnion | SettingValueUnion>

type PathSettingUnion = 'sp' | 'op' | 'yt' | 'compress'

type SettingValueUnion = 'lp' | 'cs' | 'ap' | 'workerTotal' | 'apiKey' | 'apiUrl'

interface SystemStore {
    appSetting: AppSetting
}


// 转换设置
interface StreamResponse {
    streams: [
        {
            index: number
            width: number //宽
            height: number //高
            display_aspect_ratio: string //真实宽高比
            sample_aspect_ratio: string // 采样的
            "r_frame_rate": string //帧速率
            "duration": string
            "bit_rate": string  //比特率
        },
        {
            "sample_rate": string  //音频比特
            "duration": string
            "bit_rate": string
        }
    ]
    format: {
        "duration": string
        size: string
        bit_rate: string
    }
}

interface PlayerWindowConf {
    url: string
    nm: string,
    id: string | number,
    fn: string
    cv: string
    requestUrl: string
    type: "localVideo" | 'onlineVideo'
}

interface ExposedEvent extends HTMLElement {
    toggleActiveByEvent: Function
}


interface ChatInfo {
    time: number
    type: "send" | 'response'
    txt: string
}

interface VideoDownloadState {
    state: 0 | 1 | 2
    fileSize: string
    info: stringaaaaaaa
}

interface YoutubeDownloadTask {
    id: string
    url: string
    thumbnail: string
    title: string
    progress: number
    fileSize: string
    remainingTime: string
    duration: string
    isLoading: boolean
    local: string
    info: string
    ok: boolean
    choiceId: string
    ext: string,
    options: string
}


interface MagnetLinkItem {
    desc: string // 种子描述
    size: string | number  // 文件大小
    udpt: string    // create time
    hash: string
}


interface MagnetDownloadTask extends VideoDownloadState {
    id: string
    fr: string
    href: string
    progress: number
    nm: string
    ai: string
    dt: string
    cv: string
    base64: string
    ok: number
    local: string
    selHash: string //选中的hash
    hashs: MagnetLinkItem[] //hash列表
}