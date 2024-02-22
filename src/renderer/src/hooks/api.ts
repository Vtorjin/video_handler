import { reactive, ref, toRaw, toRef } from "vue";
import { DownloadState } from "~/enmu.d";

export const drawerSwitch = ref<boolean>(false);
export const text = ref('');
export const confirmClick = () => { drawerSwitch.value = false; }
export const cancelClick = () => { drawerSwitch.value = false; }
export const openEditDrawer = () => { drawerSwitch.value = true; }
export const toggleDrawer = () => { drawerSwitch.value = !drawerSwitch.value }
export const basicInfo = reactive<VideoFullInfo>({
    id: 0,
    lo: '',
    lp: '',  // location path
    ls: '',  // location search
    dt: 0, // duration
    nm: '',   // video name
    fr: '',   // from App and code
    fn: '',  // from App and path code and name
    ou: '',// original m3u8 address
    cd: '',     // name code 
    local: '',  // local path
    vw: 0,
    vh: 0,
    sz: 0, // video size after compressed
    ud: false,  // 是否需要定时更新
    dl: false,   // 是否需要下载
    ok: false, // 是否已下载
    ai: "",   // actor
    ar: "", // area 
    cv: "", // video cover
    qs: 0,
    qs_ok: 0,
    tg: ['demo', 'comic', 'action'], // multiple types
    tm: '{"s":0,"e":99999}'
})

export const extraInfo = reactive({
    cv: "",
    text: ""
})

export const updateUrl = (url: string) => {
    basicInfo.ou = url;
}

export const concatData = (d: VideoFullInfo) => {
    d.tm = typeof d.tm === 'undefined' ? '{"s":0,"e":99999}' : typeof d.tm === 'object' ? JSON.stringify(d.tm) : d.tm;
    Object.assign(basicInfo, d);
}

export const resetData = () => {
    Object.assign(basicInfo, {
        id: 0,
        lo: '',
        lp: '',  // location path
        ls: '',  // location search
        dt: 0, // duration
        nm: '',   // video name
        fr: '',   // from App and code
        fn: '',  // from App and path code and name
        ou: '',// original m3u8 address
        cd: '',     // name code 
        local: '',  // local path
        vw: 0,
        vh: 0,
        sz: 0, // video size after compressed
        ud: false,  // 是否需要定时更新
        dl: true,   // 是否需要下载
        ok: false, // 是否已下载
        ai: "",   // actor
        ar: "1693069317924", // area 
        cv: "", // video cover
        qs: 0,
        qs_ok: 0,
        tg: ['demo', 'comic', 'action'], // multiple types
        tm: '{"s":0,"e":99999}'
    })

    text.value = "";
}

// download List

export const current: number[] = reactive(JSON.parse(sessionStorage.getItem('current')) || []);
export const wait: number[] = reactive(JSON.parse(sessionStorage.getItem('wait')) || []);
export const udpInfo = ref('');
export const tableData = reactive<DownloadInfo[]>([{
    state: "",
    nm: '完美世界 第1集',
    lo: "",
    lp: "",
    ls: "",
    dt: 0,
    cv: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.gGwvPgS0ldsYOYM9eC4VqAHaE7',
    fr: "樱花动漫_20123 ",
    fn: "樱花动漫_20123 完美世界 第一集",
    local: "C:\\Users\\Administrator\\AppData\\Roaming",
    cd: "",
    vw: 0,
    vh: 0,
    id: 0,
    ou: "https://s6.bfzycdn.com/video/mofashidexinniangdierji/%E7%AC%AC01%E9%9B%86/index.m3u8",// original m3u8 address
    sz: 1024 * 1024 * 50,
    ud: false,  // 是否需要定时更新
    dl: false,   // 是否需要下载
    ok: true, // 是否已下载
    ai: "",   // actor
    ar: "", // area 
    tg: [], // multiple types
    tm: '',
    qs: 0,
    qs_ok: 0,
    netInfo: "2.15Mb/s",
    times: {}
}, {
    state: "",
    nm: '剑域风云 第45集',
    lo: "",
    lp: "",
    ls: "",
    dt: 0,
    cv: 'https://pic3.zhimg.com/v2-d1f733345b0d11ea4d1bde0e2511dbc8_720w.jpg',
    fr: "樱花动漫_20123 ",
    fn: "樱花动漫_20123 剑域风云 第45集",
    local: "C:\\Users\\Administrator\\AppData\\Roaming",
    cd: "",
    vw: 0,
    vh: 0,
    id: 12,
    ou: "https://s5.bfzycdn.com/video/jianyufengyun/%E7%AC%AC45%E9%9B%86/index.m3u8",// original m3u8 address
    sz: 1024 * 1024 * 50,
    ud: false,  // 是否需要定时更新
    dl: false,   // 是否需要下载
    ok: false, // 是否已下载
    ai: "",   // actor
    ar: "", // area 
    tg: [], // multiple types
    tm: '',
    qs: 0,
    qs_ok: 0,
    netInfo: "368KB/s",
    times: {}
}])

export const download = (item: DownloadInfo) => {
    // 下载视频
    console.log(`下载 ${item.id}`);
    if (current.length === 0) {
        item.state = 'downloading';
        fetch(`http://localhost:3880/video/m3u8/${item.id}.m3u8`)
            .then(res => res.text()).then(r => {
                current.push(item.id);
                activeItem.netInfo = '正在下载中...'
                sessionStorage.setItem('current', JSON.stringify(current))
                sessionStorage.setItem('wait', JSON.stringify(wait))
                window.videoApp.pubEvent('downloadHandle', { eventName: "download-start", conf: { id: item.id, mu: r, fn: item.fn } });
            })
    } else if (!current.includes(item.id) && !wait.includes(item.id)) {
        wait.push(item.id);
        sessionStorage.setItem('wait', JSON.stringify(wait))
        sessionStorage.setItem('current', JSON.stringify(current))
        item.state = DownloadState.initial;
        item.netInfo = "等待中..."
        const idx = tableData.findIndex(t => t.id === item.id);
        if (idx !== -1) { tableData[idx].netInfo = "等待中" }
    }
}

export const activeItem = { id: 0, net: 0, success: 0, state: "initial", qs: 0, isConcat: false, netInfo: "未开始" }

export const formatFileSize = (fileSize: number) => {
    if (fileSize == undefined) return "0 MB";
    const GB = Math.pow(1024, 3);
    const MB = Math.pow(1024, 2);
    const KB = 1024;
    // console.log(KB, MB, GB, fileSize);
    if (fileSize < KB) {
        return "0KB";
    } else if (KB < fileSize && fileSize < MB) {
        return Math.ceil(fileSize / KB) + " KB";
    } else if (MB < fileSize && fileSize < GB) {
        return (fileSize / MB).toFixed(2) + " MB";
    } else {
        return (fileSize / GB).toFixed(2) + " GB";
    }
}


// download handle
export function registerCrawlerAndDownloadEvent() {
    // m3u8下载事件
    window.videoApp.addEventListener('updateNet', (e: string) => {
        const data = JSON.parse(e);
        const item = tableData.find(t => t.id === data.id);
        item && Object.assign(item, { netInfo: !!data.isConcat ? "视频合并中..." : formatFileSize(+data.net), qs_ok: data.success });
    })

    window.videoApp.addEventListener('download-finish', (data: string) => {
        try {
            console.log('时间哈杀杀杀', data)
            const result = JSON.parse(data)
            const { id } = result;
            const item = tableData.find(t => t.id === id);
            item && Object.assign(item, result, { netInfo: "下载完成", ok: true })
            delete result.state
            fetch('http://localhost:3880/video/update/' + id, {
                method: "PATCH",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...result, ok: true })
            }).then(async () => {
                current.splice(0);
                Object.assign(activeItem, { id: 0, net: 0, success: 0, state: "initial", qs: 0, isConcat: false, netInfo: "初始化中..." })
                let next = wait.shift();
                if (next && !current.includes(next)) {
                    let one = await fetch(`http://localhost:3880/video/basicInfo?id=${next}`).then(r => r.json())
                    delete one.src;
                    delete one.m3u8
                    one && download(one.data);
                    current.push(next);
                }
                sessionStorage.setItem('current', JSON.stringify(current));
                sessionStorage.setItem('wait', JSON.stringify(wait));
            })
        } catch (e) {
            console.log(e);
        }
    })

    window.videoApp.addEventListener('download-error', async (e: string) => {
        const data = JSON.parse(e);
        const { id, state } = data;
        const item = tableData.find(t => t.id == id);
        let error = current.pop();
        if (item) {
            wait.push(error);
            item && Object.assign(item, { netInfo: "下载失败", state })
            Object.assign(activeItem, { id: 0, net: 0, success: 0, state: "initial", qs: 0, isConcat: false, netInfo: "初始化中..." });
        } else {
            console.log('名称错误了哟!')
            let errName = tableData.find(item => item.id == error);
            errName && Object.assign(errName, { id: 0, net: 0, state: "initial", success: 0, isConcat: false, netInfo: "文件名称错误" });
        }

        let firstWait = wait.shift();
        if (firstWait && !current.includes(firstWait)) {
            current.splice(0);
            let one = await fetch(`http://localhost:3880/video/basicInfo?id=${firstWait}`).then(r => r.json())
            //    = tableData.find(item => item.id === next);
            delete one.src;
            delete one.m3u8
            one && download(one.data);
            current.push(firstWait);
        }
        sessionStorage && sessionStorage.setItem('current', JSON.stringify(current));
        sessionStorage && sessionStorage.setItem('wait', JSON.stringify(wait));
    })

    window.videoApp.addEventListener('pauseDownload', (e: string) => {
        const data = JSON.parse(e);
        const { id, state } = data;
        const item = tableData.find(t => t.id == id);
        item && current.splice(0);
        Object.assign(item, { netInfo: "下载已暂停", state });
        Object.assign(activeItem, { id: 0, net: 0, success: 0, state: "initial", qs: 0, isConcat: false, netInfo: "初始化中..." });
        sessionStorage && sessionStorage.removeItem('current');
    })

    // crawler handle
    window.videoApp.addEventListener('update-mutxt', (data: string) => {
        if (!!data) {
            const res = JSON.parse(data)
            text.value = res.mu;
            basicInfo.qs = res.qs
        }
    })

    window.videoApp.addEventListener('update-time', (data: string) => { basicInfo.tm = data; })

    window.videoApp.addEventListener('start-error', (data) => {
        // console.log('失败;了', data)
        // current.splice(0);
    })

    // magnet下载事件

}