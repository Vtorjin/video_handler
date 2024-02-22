import { ipcRenderer, contextBridge } from "electron";
import { readFileSync } from "fs";
import { join } from "path";

window.addEventListener('error', (...args) => { console.log(...args); })
window.addEventListener('rejectionhandled', (...args) => { console.log('异步', ...args); })
process.on('uncaughtException', function () { console.log(...arguments); })

// setInterval(() => {document.querySelectorAll('a').forEach(a => { a.target = "_self" })}, 50)
const hls = join(__dirname, "../../resources", 'Hls.js');
const flv = join(__dirname, "../../resources", 'Flv.js')
const dplayer = join(__dirname, "../../resources", 'Dplayer.js')
const dpcss = join(__dirname, "../../resources", 'Dplayer.css');
const globalConf = {
    id: "",
    lo: location.origin,
    ls: location.search,
    lp: location.pathname,
    dt: 0,
    nm: "",
    fr: "",
    fn: "",
    ou: "",
    cd: "",
    local: "",
    vw: 0,
    vh: 0,
    insertEl: "",
    cv: "", //cover
    cb: null
};

(window as any).globalConf = globalConf;

const cache = {
    isExist: false,
    existTxt: "",
    root: null,
    times: {
        s: 0,
        e: 99999,
        r: []
    }
}


contextBridge.exposeInMainWorld('videoApp', {
    createChildWindow() {
        ipcRenderer.invoke("createChildWindow", ...arguments);
    },
    pubEvent(tag: string, data?: string | object | undefined) {
        ipcRenderer.invoke(tag, JSON.stringify(data) || '{}');
    },
    addEventListener(tag: string, cb: Function = () => { }) {
        ipcRenderer.on(tag, (e: Event, msg: string) => {
            e = e;
            cb(msg);
        })
    },
})
if ((function () { }).constructor === Function) {
    Function.prototype.constructor = function () { }
}


contextBridge.exposeInMainWorld('_tool', {
    root: null,
    initConf(data: InitConf, insertEl: string = "", els: string[] = []) {
        const name = data.nm.replace(/:|#|\/|~|\?|\n/g, '');
        Object.assign(globalConf, data);
        insertPreloadConf();
        cache.isExist = false;
        globalConf.nm = name;
        globalConf.cb = data.cb || null;
        globalConf.id = Date.now().toString();
        globalConf.fn = globalConf.fr + globalConf.nm;
        globalConf.cd = name.match(/[\w]+[_-]+[\w]+[_-]+[\w]+/gi)?.shift() || name.match(/[\w]+[_-]+[\w]+/gi)?.shift() || (name.match(/[\w]{4,}/g)?.shift()?.length >= 5 ? name.match(/[\w]{4,}/g)?.shift() : name)
        globalConf.insertEl = insertEl;
        console.log('初始化的内容', data);
        Promise.all([checkIsExist(), removeElRoundTime(els)]);
        insertBasicConf();
    },

    createHandle(url: string): void {
        globalConf.ou = globalConf.cb ? globalConf.cb(url) : url;
        if (cache.root === null && !document.querySelector('#handleArea')) {
            cache.root = 122;
            console.log('create root!');
            const btn = document.createElement("div");
            btn.id = "handleArea"; document.body.appendChild(btn);
            btn.style.cssText = `background-color:#444444;  color:white;  width:100%;  min-height:50px;  position:fixed;  bottom:0; left:0;  z-index:9999; display:flex;`
            const _btn = document.createElement("div");
            _btn.id = "handle"; _btn.style.cssText = ` flex:1;  display:flex; flex-wrap:wrap;`
            btn.appendChild(_btn);
            const image = document.createElement('img'); image.style.cssText = `display:block; width: 160px;  height:90px;`;
            btn.appendChild(image);
            createButton({ clickHandler: function () { addTime(this) }, textContent: "开头", id: "my_start" })
            createButton({ clickHandler: function () { addTime(this, 'e') }, textContent: "结尾", id: "my_end" })
            createButton({
                clickHandler: function () {
                    cache.times = { s: 0, e: 99999, r: [] };
                    ipcRenderer.invoke('downloadHandle', JSON.stringify({ eventName: "update-time", conf: cache.times }))
                }, textContent: "重置时长", bgColor: "black", id: "my_reset_time"
            })
            createButton({ clickHandler: function () { addTime(this, 'r', 'a') }, textContent: "add", id: "my_rg_add" })
            createButton({ clickHandler: function () { addTime(this, 'r', 'p') }, textContent: "pre", id: "my_rg_pre" })
            createButton({ clickHandler: function () { addTime(this, 'r', 'l') }, textContent: "last", id: "my_rg_last" })
            createButton({ clickHandler: function () { createPlayer(globalConf.ou) }, textContent: "创建播放器" })
            createButton({ clickHandler: function () { createCover(this); }, textContent: "视频截图", id: "my_screenShot" })
            cache.root = true;
        }
    },

    setPlayUrl(url: string) {
        globalConf.ou = url;
        console.log('更新地址了', globalConf)
    },

    getConf() {
        try {
            const video = document.querySelector('video');
            globalConf.vw = video?.videoWidth || 0;
            globalConf.vh = video?.videoHeight || 0;
            Object.assign(globalConf, { cb: "" })
            return {
                ...globalConf,
                vw: globalConf.vw,
                vh: globalConf.vh,
                tm: JSON.stringify(!!cache.times?.r?.length ? cache.times.r : { s: cache.times?.s || 0, e: cache.times?.e || 99999 })

            };
        } catch (e) {
            // console.log('globalCofn', globalConf)
            alert(e)
            return {
                id: "",
                lo: location.origin,
                ls: location.search,
                lp: location.pathname,
                dt: 0,
                nm: "",
                fr: "",
                fn: "",
                ou: globalConf.ou,
                cd: "",
                local: "",
                vw: 0,
                vh: 0,
                insertEl: "",
                cv: "", //cover
                cb: null,
                tm: JSON.stringify(!!cache.times?.r?.length ? cache.times.r : { s: cache.times?.s || 0, e: cache.times?.e || 99999 })
            }
        }
    },

    createFullScreenVideo() {
        if (globalConf.ou == '') return;
        console.log('播放全屏了哟!')
        createPlayer(globalConf.ou, true)
    }
})


/**
 * @description
 * */
ipcRenderer.on('check-is-exist', (e, data) => {
    cache.existTxt = data;
    console.log('看到了存储的内容了', data);
    data ? Promise.all([
        createButton({
            clickHandler: function () {
                this.style.color = getRandomColor();
                ipcRenderer.invoke('downloadHandle', JSON.stringify({ conf: globalConf.id, eventName: 'confirm-delete' }));
            },
            textContent: "删除",
            id: "del_v",
            customAttrs: { title: JSON.stringify(globalConf) }
        }),
        createButton({
            clickHandler: function () { updateData(this) },
            textContent: "更新数据",
            id: "my_udp"
        }),
        createButton({ clickHandler: function () { createCover(this); }, textContent: "强制保存", id: "force_save" })
    ]) : createButton({ clickHandler: function () { ipcRenderer.invoke('checkBeforeSave') }, textContent: "发送保存", id: "my_save" })
    const _scr = document.createElement('script');
    _scr.innerHTML = `
    (()=>{
      var root = document.querySelector('.dplayer-icons.dplayer-icons-right');
      if (root == null) return;
      if (window.insertButtonInfoMenu) {
        ${!!data} ?
        Promise.all([
          window.insertButtonInfoMenu({width:80, textContent: "强制保存", clickHandler: function () { this.style.color =  getRandomColor(); document.querySelector("#force_save")?.click() } }),
          window.insertButtonInfoMenu({width:80x, textContent: "更新地址", clickHandler: function () { this.style.color =  getRandomColor(); document.querySelector("#my_udp")?.click() } }), 
          window.insertButtonInfoMenu({ textContent: "删除", clickHandler: function () { this.style.color =  getRandomColor(); document.querySelector("#del_v")?.click() } }) 
        ]): 
         window.insertButtonInfoMenu({ textContent: "保存", clickHandler: function () { this.style.color =  getRandomColor(); document.querySelector("#my_save")?.click()} })
      }
    })();`;

    (document.head || document.getElementsByTagName('head')[0]).appendChild(_scr);
})


ipcRenderer.on('check-exists-many', (e, data) => {
    // alert(data)
    console.log('存在多个', data)
    const handle = document.querySelector('#handle');
    const root = document.querySelector('.dplayer-icons.dplayer-icons-right');
    root && createButton({ textContent: "查看", customAttrs: { title: data }, parentElem: root })
    handle && createButton({ textContent: "查看", parentElem: handle, customAttrs: { title: data } })
})

ipcRenderer.on('deleteSuccess', () => { document.querySelector('#del_v') && document.querySelector('#del_v').remove(); document.querySelector('#my_udp') && document.querySelector('#my_udp').remove() })


/**
 *@decscription 
 * **/
function insertPreloadConf() {
    const _scr = document.createElement('script');
    _scr.innerHTML = `
      function insertButtonInfoMenu(options) {
        const { width = 40, height = 24, bgColor = 'transparent', textContent, parentElem = document.querySelector('.dplayer-icons.dplayer-icons-right'), clickHandler, customAttrs, ctx, id, disabled } = options;
        const btn = document.createElement('button');   // 创建按钮元素
        btn.style.cssText = \`display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff\`;
        btn.style.width = width + 'px'; // 设置元素的样式和内容
        btn.style.height = height + 'px';
        btn.style.backgroundColor = bgColor;
        btn.textContent = textContent;
        id && btn.setAttribute('id', id)
        disabled && btn.setAttribute('disabled', "true");
        if (customAttrs) { for (let attr in customAttrs) { btn.dataset[attr] = customAttrs[attr]; } }
  
        // 绑定点击事件
        clickHandler && btn.addEventListener('click', clickHandler);
        ctx && btn.addEventListener('contextmenu', function () { window.open("http://localhost:3880/"); return false })
        var firstChild = parentElem.firstChild;
        if (firstChild) {
          parentElem.insertBefore(btn, firstChild);
        } else {
          parentElem.appendChild(btn);
        }
      }
  
      function getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return "rgb(" + r + ", " + g + ", " + b + ")";
      }`;

    (document.head || document.getElementsByTagName('head')[0]).appendChild(_scr);
}

function insertBasicConf() {
    if (location.origin.includes('127.0') || location.origin.includes('file')) return;
    // console.log('添加dom', location.origin)

    if (!document.querySelector("#fix-height")) {
        const style = document.createElement('style');
        const head = document.head || document.getElementsByTagName('head')[0];
        const script = document.createElement('script');
        const script2 = document.createElement('script');
        const script3 = document.createElement('script');

        style.id = "fix-height";
        style.innerHTML = `
        body::-webkit-scrollbar {  width:8px; }   
        body::-webkit-scrollbar-thumb { background: #9AA1EC;}
        body::-webkit-scrollbar-track-piece {background: transparent;}
        body{ scrollbar-width: thin; scrollbar-color: transparent;}
        ${readFileSync(dpcss, 'utf-8')}`;

        try {
            script.innerHTML = readFileSync(flv, 'utf-8');
            script2.innerHTML = readFileSync(hls, 'utf-8');
            script3.innerHTML = readFileSync(dplayer, 'utf-8');
            head.appendChild(style);
            head.appendChild(script);
            head.appendChild(script2);
            head.appendChild(script3);

        } catch (e) {
            console.log(e)
        }
        setInterval(() => { document.querySelectorAll('a').forEach(element => { element.target = "self"; element.setAttribute('target', "_self"); }); }, 100)
        // @ts-ignore
        window.open = (url: string | URL, target: any) => { location.replace(url); }
    }
}

function removeElRoundTime(els: string[]) {
    els.length && setInterval(() => {
        els.forEach(el => {
            let dom: HTMLElement | null = document.querySelector(el);
            if (dom) { dom.style.display = "none"; }
        })
    });
}

function checkIsExist() {
    let timer = null;
    timer = setInterval(() => {
        if (globalConf.ou && cache.isExist === false) {
            setTimeout(() => {
                ipcRenderer.invoke('downloadHandle', JSON.stringify({ eventName: "check-is-exist", conf: { fr: globalConf.fr, nm: name, cd: globalConf.cd } }))
            }, 200);
            cache.isExist = true;
            clearInterval(timer);
            timer = null;
        }
    }, 50);
}

function createButton(options) {
    const { width = 100, height = 50, bgColor = 'transparent', textContent, parentElem = document.querySelector('#handle'), clickHandler, customAttrs, ctx, id, disabled } = options;
    const btn = document.createElement('button');   // 创建按钮元素
    btn.style.width = width + 'px'; // 设置元素的样式和内容
    btn.style.height = height + 'px';
    btn.style.backgroundColor = bgColor;
    btn.textContent = textContent;
    btn.style.color = "#fff"
    id && btn.setAttribute('id', id)
    disabled && btn.setAttribute('disabled', "true");
    if (customAttrs) { for (let attr in customAttrs) { btn.dataset[attr] = customAttrs[attr]; attr == 'title' && btn.setAttribute(attr, customAttrs[attr].toString()) } }

    // 绑定点击事件
    clickHandler && btn.addEventListener('click', clickHandler);
    ctx && btn.addEventListener('contextmenu', function () { window.open(`http://localhost:3880/`); return false })
    // 将元素插入到指定位置
    parentElem && parentElem.appendChild(btn);
}

function addTime(btn, d = "s", tag = "") {
    let video = document.querySelector('video');
    if (video) {
        btn.style.backgroundColor = getRandomColor();
        cache.times = cache.times || { s: 0, e: 99999, r: [] };
        if (d === 's' && !tag) {
            cache.times.s = Math.floor(video.currentTime); cache.times.e = cache.times.e || Math.ceil(video.duration); delete cache.times.r
            btn.innerText = '开' + cache.times.s
        } else if (d === 'e' && !tag) {
            cache.times.e = (video.currentTime > cache.times.s) ? Math.ceil(video.currentTime) : Math.ceil(video.duration); cache.times.s = cache.times.s || 0; delete cache.times.r
            btn.innerText = '结' + cache.times.e
        } else {
            cache.times.r = cache.times.r || [];
            tag == 'a' && cache.times.r.push(Math.floor(video.currentTime));
            tag === 'p' && cache.times.r.unshift(Math.floor(0));
            tag === "l" && cache.times.r.push(Math.ceil(video.duration))
            delete cache.times.s; delete cache.times.e
            btn.innerText = tag + cache.times.r.length + '个'
        }
        console.log(cache.times)
        ipcRenderer.invoke('downloadHandle', JSON.stringify({ eventName: "update-time", conf: cache.times }))
    } else {
        document.title = 'video 不存在';
    }
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return "rgb(" + r + ", " + g + ", " + b + ")";
}

function createCover(btn) {
    let video = document.querySelector('video'); let canvas; let ctx;
    if (document.querySelector('canvas')) { canvas = document.querySelector('canvas') } else { canvas = document.createElement('canvas'); document.body.append('canvas'); }
    canvas.style.opacity = "0"; ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 当视频加载完成时
    video && (() => {
        btn.style.backgroundColor = getRandomColor();
        const width = video.videoWidth;
        const height = video.videoHeight;
        const targetWidth = width > height ? 160 : 90; // 目标宽度
        const targetHeight = width > height ? 90 : 160; // 目标高度
        // 计算缩放比例
        const scaleX = targetWidth / width;
        const scaleY = targetHeight / height;
        const scale = Math.min(scaleX, scaleY);
        // 计算裁剪后的视频帧大小和位置
        const cropWidth = targetWidth / scale;
        const cropHeight = targetHeight / scale;
        const cropX = (width - cropWidth) / 2;
        const cropY = (height - cropHeight) / 2;
        // 设置Canvas的尺寸为目标大小
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        globalConf.vw = width;
        globalConf.vh = height
        // 绘制缩放后的视频帧到Canvas上
        ctx.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);
        // 将Canvas生成的图片数据URL设置为视频的封面
        const dataURL = canvas.toDataURL('image/png', 1.0); video.setAttribute('poster', dataURL);
        (document.querySelector('#handleArea img') as HTMLImageElement).src = dataURL;
        globalConf.cv = dataURL;
    })();
}

function createPlayer(url: string, isFullScreen = false) {
    if (document.querySelector('#insertedScript')) return;
    const script = document.createElement('script');
    const head = document.head || document.getElementsByTagName('head')[0];
    script.id = "insertedScript";
    script.innerHTML = `    
    var el = document.querySelector("${globalConf.insertEl}");
    var _player = null; 
    el ? (()=>{
      _player = new globalThis.top.DPlayer({
        container: el,
        //contextmenu: [{ text: "", link: "" }],
        theme: '#4C8FE8',
        volume: 0.8,
        logo: "",
        autoplay: true,
        controls: true,
        screenshot:false,
       // playbackSpeed:[0.5, 0.75, 1, 1.25, 1.5, 2],
        video: {
          url: "${url}",
          pic: "",
          type: 'auto',
          defaultQuality: 0,
          controls: true
        },
        setting:false,
        lang:'en',
        language:"en",
        mutex:true
      }) 
    })() : document.body.style.background = "red";
  
    function fullscreen(element) {
      // @ts-ignore
      if (document.mozFullScreenEnabled) { 
        return 
      }
    
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullScreen();
      }
      // Promise.reject(new Error("不支持全屏"));
    }
  
    function setFullVideo(){ 
      document.querySelector('.dplayer-full-in-icon')?.click();
    }
    ${isFullScreen ? "setFullVideo()" : ""}
  
  
    function createCustomMenu() {
      const root = document.querySelector('.dplayer-icons.dplayer-icons-right');
      if (root == null) return;
      insertButtonInfoMenu({ textContent: "开始", clickHandler: function () { this.style.color =  getRandomColor(); document.querySelector("#my_start")?.click()}})
      insertButtonInfoMenu({ textContent: "结束", clickHandler: function () { this.style.color =  getRandomColor();  document.querySelector("#my_end")?.click()}})
      insertButtonInfoMenu({ textContent: "add", clickHandler: function () { this.style.color =  getRandomColor(); document.querySelector("#my_rg_add")?.click()}})
      insertButtonInfoMenu({ textContent: "重置", clickHandler: function () {  this.style.color =  getRandomColor(); document.querySelector("#my_reset_time")?.click()}})
      insertButtonInfoMenu({ textContent: "截图", clickHandler: function () { this.style.color =  getRandomColor();  document.querySelector("#my_screenShot")?.click()}})
      //insertButtonInfoMenu({ textContent: "保存", clickHandler: function () { this.style.color =  getRandomColor(); document.querySelector("#my_save")?.click()}})
      root.style.cssText = "display: flex; flex-direction: row-reverse;align-items:center"
    }
  
  
    setTimeout(()=>{createCustomMenu();},1000)
    `;
    head.appendChild(script);
    globalConf.ou = url;
    console.log('sssss', url, globalConf)
}

function updateData(btn) {
    btn.style.backgroundColor = getRandomColor();
}

function injectNavigateChange() {
    window.addEventListener('load', () => {
        console.log('ghhhhh');

        setInterval(() => { document.querySelectorAll('a').forEach(a => { a.target = "_self" }) }, 50)

        window.addEventListener('hashchange', function (event) {
            console.log('Hash changed to: ' + window.location.hash);
            // 在这里执行你的操作
            event.preventDefault();
        });

        // 监听history变化
        window.addEventListener('popstate', function (event) {
            event.preventDefault();
            console.log('History state changed to: ' + JSON.stringify(event.state));
            // 在这里执行你的操作
        });

        // // 修改history状态
        // var stateObj = { key: 'value' };
        // history.replaceState(stateObj, 'Title', '/new-url');
    })
}

injectNavigateChange();