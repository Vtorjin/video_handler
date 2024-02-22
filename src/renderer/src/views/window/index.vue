<template>
    <div id="player" ref="myPlayer">
        <div class="loader">
            <div class="shadow"></div>
            <div class="box"></div>
        </div>
    </div>
    <Drawer v-if="query.type === 'onlineVideo'"></Drawer>
</template>

<script setup lang='ts'>
/*** 36 51
 * @description this is  a child_window page for play local video
 * */
import { ref, onBeforeMount, watchEffect, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import Drawer from "@renderer/components/VideoSettingDrawer/index.vue"
import { basicInfo, concatData, toggleDrawer, resetData, extraInfo, text } from '@renderer/hooks/api';

import { ElMessage, ElMessageBox } from 'element-plus';

const myPlayer = ref<HTMLDivElement>();
const query = useRoute().query || { fn: "" };
query?.fn && (document.title = document.title.replace('$$', (query?.fn.toString() || '')));
const createHandle = () => {
    var root: HTMLDivElement = document.querySelector('.dplayer-icons.dplayer-icons-right');
    if (root == null) return;
    if (root.getAttribute('inited')) return;
    insertButtonInfoMenu({ textContent: "开始", clickHandler: function () { this.style.color = getRandomColor(); addTime(this) } })
    insertButtonInfoMenu({ textContent: "结束", clickHandler: function () { this.style.color = getRandomColor(); addTime(this, 'e') } })
    insertButtonInfoMenu({ textContent: "add", clickHandler: function () { this.style.color = getRandomColor(); addTime(this, 'r', 'a') } })
    insertButtonInfoMenu({ textContent: "重置", clickHandler: function () { this.style.color = getRandomColor(); times = { s: 0, e: 99999, r: [] }; Object.assign(basicInfo, { tm: JSON.stringify({ s: 0, e: 99999 }) }) } })
    insertButtonInfoMenu({ textContent: "截图", clickHandler: function () { this.style.color = getRandomColor(); createCover(); } })
    insertButtonInfoMenu({ textContent: "toggle", clickHandler: () => toggleDrawer() })
    root.style.cssText = "display: flex; flex-direction: row-reverse;align-items:center"
    root.setAttribute('inited', 'true')
    checkVideoExist();
}


const checkVideoExist = () => {
    basicInfo.cd && fetch(`http://localhost:3880/video/query?name=${basicInfo.cd}`)
        .then(r => r.json())
        .then(({ data, status }) => {
            console.log('?SSSSS', data, status)
            if (status !== 200) { console.log('直接取消'); return; }
            if (data.length === 1) {
                insertButtonInfoMenu({ textContent: "删除", customAttrs: { title: JSON.stringify(data.pop()) }, clickHandler: function () { this.style.color = getRandomColor(); deleteVideo(data.pop().id) } })
                createSaveBtn();
                return;
            }

            if (data.length > 1) {
                insertButtonInfoMenu({ textContent: "查看", customAttrs: { title: data.reduce((total, item) => { return total += JSON.stringify({ id: item.id, nm: item.nm, fr: item.fr, lp: item.lp }) + '\n' }, '') } })
                insertButtonInfoMenu({ textContent: "删除", clickHandler: function () { this.style.color = getRandomColor(); deleteVideo(data.pop().id) } });
                createSaveBtn();
                return;
            }

            createSaveBtn();
            console.log('insertddd')
        })
}

const createSaveBtn = () => {
    insertButtonInfoMenu({
        textContent: "保存",
        clickHandler() {
            this.style.color = getRandomColor();
            basicInfo.ou ? fetch("http://localhost:3880/angular/gettext", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: basicInfo.ou,
                    times: typeof basicInfo.tm === 'string' ? JSON.parse(basicInfo.tm) : basicInfo.tm
                })
            }).then(r => r.json())
                .then(({ data, status }) => {
                    if (status === 200) {
                        extraInfo.text = data.mu;
                        text.value = data.mu;
                        Object.assign(basicInfo, { qs: data.qs })
                        ElMessage.success('读取成功!')
                        toggleDrawer();
                    } else {
                        ElMessage.error('muText generate error!')
                    }
                }) : ElMessage.warning('ou未抓取到!')
        }
    })
}


const deleteVideo = (id: number | string, isRetry = false) => {
    isRetry === false ? ElMessageBox.confirm(
        '是否要删除【' + basicInfo.nm + '】?',
        '操作提示', {
        type: "warning",
        center: true
    }).then(() => {
        fetch(`http://localhost:3880/video/del/${id}`).then(r => r.json()).then(res => {
            res.status === 200 ? ElMessage.success('delete success!') : deleteVideo(id, true)
        }).catch(() => deleteVideo(id, true))
    }) : fetch(`http://localhost:3880/video/del/${id}`).then(r => r.json()).then(res => {
        res.status === 200 && ElMessage.success('delete success!')
    })

}


function insertButtonInfoMenu(options) {
    const { width = 40, height = 24, bgColor = 'transparent', textContent, parentElem = document.querySelector('.dplayer-icons.dplayer-icons-right'), clickHandler, customAttrs, ctx, id, disabled } = options;
    const btn = document.createElement('button');   // 创建按钮元素
    btn.style.cssText = `display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff`;
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
}


function createCover() {
    let video = document.querySelector('video'); let canvas; let ctx;
    if (document.querySelector('canvas')) {
        canvas = document.querySelector('canvas')
    } else {
        canvas = document.createElement('canvas'); document.body.append('canvas');
    }
    canvas.style.opacity = "0"; ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 当视频加载完成时
    video && (() => {

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
        // globalConf.vw = width;
        // globalConf.vh = height
        // 绘制缩放后的视频帧到Canvas上
        ctx.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);
        // 将Canvas生成的图片数据URL设置为视频的封面
        const dataURL = canvas.toDataURL('image/png', 1.0); video.setAttribute('poster', dataURL);
        // (document.querySelector('#handleArea img') as HTMLImageElement).src = dataURL;
        // globalConf.cv = dataURL;
        concatData({ ...basicInfo, vw: width, vh: height, cv: dataURL })
    })();
}


let times = { s: 0, e: 99999, r: [] }

function addTime(btn: HTMLButtonElement, d = "s", tag = "") {
    let video = document.querySelector('video');
    if (video) {
        btn.style.color = getRandomColor();
        times = times || { s: 0, e: 99999, r: [] };
        if (d === 's' && !tag) {
            times.s = Math.floor(video.currentTime); times.e = times.e || Math.ceil(video.duration); delete times.r
            Object.assign(basicInfo, { tm: JSON.stringify(times) })
        } else if (d === 'e' && !tag) {
            times.e = (video.currentTime > times.s) ? Math.ceil(video.currentTime) : Math.ceil(video.duration); times.s = times.s || 0; delete times.r
            Object.assign(basicInfo, { tm: JSON.stringify(times) })
        } else {
            times.r = times.r || [];
            tag == 'a' && times.r.push(Math.floor(video.currentTime));
            tag === 'p' && times.r.unshift(Math.floor(0));
            tag === "l" && times.r.push(Math.ceil(video.duration))
            delete times.s; delete times.e
            btn.innerText = tag + times.r.length + '个'
            Object.assign(basicInfo, { tm: JSON.stringify(times) })
        }

    } else {
        document.title = 'video 不存在';
    }
}


onMounted(() => {
    new window.DPlayer({
        container: document.querySelector('#player'),
        contextmenu: [{ text: "", link: "" }],
        theme: '#4C8FE8',
        volume: 0.8,
        autoplay: true,
        controls: true,
        preload: false,
        video: {
            url: query.url ? query.url : (+query.id ? `http://localhost:3880/angular/local_video?id=${query.id} ` : 'https://s6.bfzycdn.com/video/mofashidexinniangdierji/%E7%AC%AC01%E9%9B%86/index.m3u8'),
            // url: 'https://s6.bfzycdn.com/video/mofashidexinniangdierji/%E7%AC%AC01%E9%9B%86/index.m3u8',
            pic: query.cv ? query.cv : (+query.id ? `http://localhost:3880/video/img/${query.id}.png` : 'https://tse2-mm.cn.bing.net/th/id/OIP-C.gGwvPgS0ldsYOYM9eC4VqAHaE7'),
            type: 'auto', defaultQuality: 0, preload: true, controls: true
        },
        mutex: false,
        lang: 'en',
        language: "en",
    })
    if (query.type === 'onlineVideo') {

        var [app, id] = query.fr.toString().split('_');
        id = id.trim();
        var map = {
            thePorn: {
                host: "https://thep1490.cc",
                path: "/video/$$",
                fn(title: string) {
                    if (!title) return;
                    title = title.replace(/:|#|\/|~|\?|\n/g, '');
                    document.title = '正在播放：' + title;
                    resetData();
                    let clone = Object.assign({}, basicInfo);
                    concatData({ ...clone, nm: title, fn: app.trim() + ' ' + title, fr: query.fr.toString(), id: Date.now(), lo: 'https://thep1490.cc', lp: "/video/" + id, ls: "", ou: query.url.toString(), cv: "", cd: title.match(/[\w]+[_-]+[\w]+[_-]+[\w]+/gi)?.shift() || title.match(/[\w]+[_-]+[\w]+/gi)?.shift() || (title.match(/[\w]{4,}/g)?.shift()?.length >= 5 ? title.match(/[\w]{4,}/g)?.shift() : title) })
                    basicInfo.nm = title;

                    createHandle();
                }
            }
        }

        Object.keys(map).forEach(key => {
            if (app.includes(key)) {
                let conf = map[key]
                function request() {
                    fetch(`http://localhost:3880/angular/proxy_request?u=${conf.host}${conf.path.replace('$$', id)}`).then(r => r.json()).then(title => {
                        !!title.data ? conf.fn(title.data) : request();
                    })
                }
                request();
            }
        })
    }
})

</script>

<style scoped lang='scss'>
#player {
    width: 100%;
    height: 100%;
    background-image: linear-gradient(to left bottom, #7e9ecf, #00bbec, #00d5d7, #00e78e, #a8eb12);

}

.loader {
    /* Uncomment this to make it run! */
    /* animation: loader 5s linear infinite;  */
    position: absolute;
    top: calc(50% - 20px);
    left: calc(50% - 20px);
}

@keyframes loader {
    0% {
        left: -100px
    }

    100% {
        left: 110%;
    }
}

.box {
    width: 50px;
    height: 50px;
    background: #fff;
    animation: animate .5s linear infinite;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 3px;
    z-index: 20;
}

@keyframes animate {
    17% {
        border-bottom-right-radius: 3px;
    }

    25% {
        transform: translateY(9px) rotate(22.5deg);
    }

    50% {
        transform: translateY(18px) scale(1, .9) rotate(45deg);
        border-bottom-right-radius: 40px;
    }

    75% {
        transform: translateY(9px) rotate(67.5deg);
    }

    100% {
        transform: translateY(0) rotate(90deg);
    }
}

.shadow {
    width: 50px;
    height: 5px;
    background: #000;
    opacity: 0.1;
    position: absolute;
    top: 59px;
    left: 0;
    border-radius: 50%;
    animation: shadow .5s linear infinite;
}

@keyframes shadow {
    50% {
        transform: scale(1.2, 1);
    }
}
</style>