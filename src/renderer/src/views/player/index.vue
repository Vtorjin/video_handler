<template>
    <div id="player-page">
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane label="快速播放" name="first" class="demo-image">
                <div id="m3u8">
                    <header class="m3u8">
                        <el-input v-model="m3u8Url" v-paste="{ url: m3u8Url, cb: (e: string) => { format(e) } }"></el-input>
                        <el-button type="primary" class="playBtn" @click="createPlayer">播放</el-button>
                    </header>
                    <main id="dp" ref="dpRef">
                        <div class="loader">
                            <div class="shadow"></div>
                            <div class="box"></div>
                        </div>
                    </main>
                </div>
            </el-tab-pane>
            <el-tab-pane label="完整播放" name="third" style="height:100%">

                <MyDrawer dir="bottom" height="30%" ref="drawerRef" :is-full="true" :asb="true">
                    <template #default>
                        <main id="dp2" ref="udpRef">
                            <div class="loader">
                                <div class="shadow"></div>
                                <div class="box"></div>
                            </div>
                        </main>
                    </template>
                </MyDrawer>
            </el-tab-pane>

            <el-tab-pane label="数字ID播放" name="second">
                <div id="onlyId" :style="{ '--header-height-2': headerHeight }">
                    <header class="onlyId">
                        <el-form :model="form" inline>
                            <el-form-item label="host:">
                                <el-select v-model="form.id" clearable filterable size="small"
                                    @change="changeDebuggerParams">
                                    <el-option v-for="item in store.address" :label="item.name"
                                        :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="id:">
                                <el-input v-model="form.startId" type="number" size="small" style="width: 100px;"
                                    v-paste="{ url: m3u8Url, cb: (e: string) => { form.startId = (+e) } }"></el-input>
                            </el-form-item>
                            <el-form-item label="path:">
                                <el-input v-model="form.path"
                                    v-paste="{ url: m3u8Url, cb: (e: string) => { form.path = e } }" size="small"
                                    style="min-width: 28vw;"></el-input>
                            </el-form-item>
                            <el-form-item label="全屏播放:">
                                <el-switch v-model="form.isFull" active-text="开启" inactive-text="关闭"></el-switch>
                            </el-form-item>
                            <el-form-item>
                                <!-- <el-button size="small" type="info" @click="playPre(0)" :icon="Edit">编辑</el-button> -->
                                <el-button size="small" type="success" @click="playPre()" :icon="CaretTop">上一个</el-button>
                                <el-button size="small" type="info" @click="playNext()" :icon="CaretBottom">下一个</el-button>
                                <el-button size="small" type="danger" @click="playPre(10)" :icon="CaretTop">前10个</el-button>
                                <el-button size="small" type="info" @click="playNext(10)"
                                    :icon="CaretBottom">后10个</el-button>
                                <el-button size="small" type="danger" @click="playPre(100)"
                                    :icon="CaretTop">前100个</el-button>
                                <el-button size="small" type="success" @click="playNext(100)"
                                    :icon="CaretBottom">后100个</el-button>
                                <el-button size="small" type="primary" @click="startCreate"
                                    :icon="VideoCamera">加载</el-button>

                                <el-button size="small" type="info" @click=" webview?.reload()"
                                    :icon="Refresh">刷新网页</el-button>
                                <el-button size="small" type="danger" @click="webview?.openDevTools()"
                                    :icon="ChromeFilled">控制台</el-button>

                                <el-button id="editRef" type="success" size="small" :icon="Edit" @click="edit">
                                    <el-badge :is-dot="newMsg">
                                        编辑
                                    </el-badge>
                                </el-button>
                                <el-button @click="hpYOn">下一个</el-button>

                            </el-form-item>
                        </el-form>
                    </header>
                    <main id="page" ref="webviewContainer">
                        <div class="loader">
                            <div class="shadow"></div>
                            <div class="box"></div>
                        </div>
                    </main>

                    <Drawer />
                </div>
            </el-tab-pane>

            <el-tab-pane label="thep" name="false" v-if="showThep">
                <Thep />
            </el-tab-pane>

        </el-tabs>
        <el-button type="danger" @click="backHistory" class=" absolute" v-if="needBack"> 返回上一级</el-button>
    </div>
</template>
    
<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import conf from "~/config/default.json";
import { TabsPaneContext } from 'element-plus'
import { CaretTop, CaretBottom, Edit, VideoCamera, ChromeFilled, Refresh } from '@element-plus/icons-vue';
import Drawer from "@renderer/components/VideoSettingDrawer/index.vue"
import Thep from "@renderer/components/thep/index.vue"
import { openEditDrawer, updateUrl, basicInfo, concatData } from "@renderer/hooks/api";
import MyDrawer from "@/components/MyDrawer/index.vue"
import { udpJsFile } from '@renderer/api/modules/jsfile';
import { useRoute } from 'vue-router';
import { useGlobalStore } from '@renderer/stores/modules/global';

const store = useGlobalStore();
const query = useRoute();
const showThep = !!window.process;

const activeName = ref('first')
const handleClick = (tab: TabsPaneContext, event: Event) => {
    console.log(tab.active, event, tab.paneName)
    if (tab.active) return;
    localStorage.setItem('debuggerplayerName', tab.paneName.toString());
}


const m3u8Url = ref('');
const dpRef = ref<HTMLElement>();
const udpRef = ref<HTMLElement>();
const player = ref<Window['DPlayer'] | null>(null)
const ad = ["thePorn_27593 ", "thePorn_227041 ", "thePorn_226884 ", "thePorn_226873 ", "thePorn_225962 ", "thePorn_225536 ", "thePorn_225306 ", "thePorn_225238 ", "thePorn_224719 ", "thePorn_223959 ", "thePorn_223688 ", "thePorn_223525 ", "thePorn_223461 ", "thePorn_223475 ", "thePorn_223457 ", "thePorn_223299 ", "thePorn_223273 ", "thePorn_223076 ", "thePorn_223112 ", "thePorn_222928 ", "thePorn_222735 ", "thePorn_222721 ", "thePorn_222664 ", "thePorn_222667 ", "thePorn_222665 ", "thePorn_222309 ", "thePorn_222306 ", "thePorn_222305 ", "thePorn_221977 ", "thePorn_221165 ", "thePorn_220918 ", "thePorn_220865 ", "thePorn_220857 ", "thePorn_220760 ", "thePorn_220601 ", "thePorn_220187 ", "thePorn_220102 ", "thePorn_219907 ", "thePorn_219884 ", "thePorn_219911 ", "thePorn_219904 ", "thePorn_219941 ", "thePorn_219808 ", "thePorn_219746 ", "thePorn_219446 ", "thePorn_219515 ", "thePorn_219440 ", "thePorn_219307 ", "thePorn_218931 ", "thePorn_218604 ", "thePorn_218573 ", "thePorn_218520 ", "thePorn_218535 ", "thePorn_218528 ", "thePorn_218518 ", "thePorn_218514 ", "thePorn_218510 ", "thePorn_218509 ", "thePorn_218501 ", "thePorn_218457 ", "thePorn_218445 ", "thePorn_218441 ", "thePorn_218428 ", "thePorn_218425 ", "thePorn_218415 ", "thePorn_218391 ", "thePorn_218399 ", "thePorn_218406 ", "thePorn_218367 ", "thePorn_218370 ", "thePorn_218360 ", "thePorn_217908 ", "thePorn_217922 ", "thePorn_218054 ", "thePorn_218160 ", "thePorn_218172 ", "thePorn_217840 ", "thePorn_217747 ", "thePorn_217760 ", "thePorn_217665 ", "thePorn_217479 ", "thePorn_217471 ", "thePorn_217074 ", "thePorn_216824 ", "thePorn_216587 ", "thePorn_216223 ", "thePorn_216259 ", "thePorn_216234 ", "thePorn_216245 ", "thePorn_216137 ", "thePorn_216118 ", "thePorn_216114 ", "thePorn_216113 ", "thePorn_216109 ", "thePorn_216100 ", "thePorn_216088 ", "thePorn_216076 ", "thePorn_216064 ", "thePorn_216038 ", "thePorn_215917 ", "thePorn_216027 ", "thePorn_216023 ", "thePorn_215998 ", "thePorn_215964 ", "thePorn_215966 ", "thePorn_215983 ", "thePorn_215923 ", "thePorn_215886 ", "thePorn_215825 ", "thePorn_215791 ", "thePorn_215785 ", "thePorn_215740 ", "thePorn_215699 ", "thePorn_215662 ", "thePorn_215634 ", "thePorn_215627 ", "thePorn_215636 ", "thePorn_215600 ", "thePorn_215593 ", "thePorn_215566 ", "thePorn_215579 ", "thePorn_215614 "]
const hpYOn = () => {
    let index = ad.findIndex(t => t.includes(form.startId.toString()))
    index++;
    if (ad[index]) {
        form.startId = +ad[index].split('_').pop();
        startCreate();
    }

}




const createPlayer = () => {
    m3u8Url.value && (player.value = new window.DPlayer({
        container: dpRef.value,
        contextmenu: [{ text: "", link: "" }],
        theme: '#4C8FE8',
        volume: 0.8,
        logo: "",
        autoplay: true,
        controls: true,
        video: {
            url: m3u8Url.value,
            pic: "",
            type: m3u8Url.value.includes('magnet') ? "webtorrent" : 'auto',
            defaultQuality: 0,
            controls: true
        },
        mutex: true,
        lang: 'en',
        language: "en",
    }))
}


const format = (e: string) => {
    if (e.indexOf('.m3u8') === -1) {
        e = e.replace(e.slice(e.lastIndexOf('/')), '/index.m3u8');
        navigator.clipboard.writeText(e);
    }
    m3u8Url.value = e
}




const headerHeight = ref('0px');
const form = reactive({
    host: "",
    id: '',
    startId: 21802,
    origin: "",
    pathname: "",
    path: "https://www.yinhuadm.cc/p/$$-3-1.html",
    isFull: false
})
const webview = ref<null | CustomWebView>(null)
const webviewContainer = ref<HTMLDivElement>();
const newMsg = ref(false);
const saveDebuggerParams = () => {
    let split = form.path.split('/');
    let clone = JSON.parse(JSON.stringify(form));
    let item = store.address.find(t => t.id == form.id);
    clone.origin = split.slice(0, 3).join('/');
    clone.pathname = '/' + split.slice(3).join('/');
    console.log(clone)
    delete clone.host
    delete clone.isFull
    delete clone.path
    if (item) {
        item.startId = form.startId;
        item.pathname = clone.pathname;
        item.origin = clone.origin;
    }
    udpJsFile(form.id, clone)

}

const edit = () => {
    openEditDrawer();
    newMsg.value = false;
    document.querySelector('webview') && (document.querySelector('webview') as CustomWebView).executeJavaScript('window._tool && _tool.getConf()').then((res: VideoFullInfo) => {
        concatData(res);
        window.videoApp.pubEvent('downloadHandle', { eventName: "request-range", conf: { ou: res.ou, tm: res.tm } })
    }).catch(e => {
        console.log(e)
    })
}


const createEl = () => {
    webviewContainer.value.classList.remove('hide');
    webview.value = document.createElement('webview') as CustomWebView;
    webview.value.setAttribute('webpreferences', "nativeWindowOpen=yes, spellcheck=no, contextIsolation=no");
    webview.value.setAttribute('useragent', "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15");
    webview.value.setAttribute('nodeintegration', 'true');
    webview.value.setAttribute('allowtransparency', 'true');
    webview.value.setAttribute('allowRendererProcessReuse', 'true')
    webview.value.setAttribute('disablewebsecurity', 'true');
    webview.value.setAttribute('plugin', 'true');
    webview.value.setAttribute('preload', window[conf.ipcRenderName].preloadFile);
    webview.value.style.cssText = `position: absolute;  left: 0; top: 0; width: 100%; height: 100%;z-index: 100;`
    webview.value.className = "myWebContent"
    webview.value.setAttribute('src', (form.path.replace('$$', form.startId.toString())) || 'https://www.baidu.com');
    webview.value.addEventListener('dom-ready', () => { webviewContainer.value.classList.add('hide'); })
    webview.value.addEventListener('did-finish-load', () => {
        webviewContainer.value && webviewContainer.value.classList.remove('hide');
        const file = store.address.find(a => a.id === form.id);
        console.log('执行的内容是', file?.js)
        webview.value && file !== undefined && webview.value.executeJavaScript(`${file.js}`)
    })
    webviewContainer.value && webviewContainer.value.appendChild(webview.value)
}
const startCreate = () => {
    webview.value?.remove && webview.value.remove();
    createEl();
    localStorage.setItem('debuggerplayer', JSON.stringify(form));
    saveDebuggerParams();
}
const playPre = (n: number = 1) => {
    form.startId = +form.startId - n;
    form.startId = form.startId < 1 ? 1 : form.startId
    startCreate();
}
const playNext = (n: number = 1) => {
    form.startId = +form.startId + n;
    startCreate();
}
const playFullVideo = () => webview.value?.executeJavaScript(`_tool && _tool.createFullScreenVideo()`);


const createFullInfoPlayer = (id: number) => {
    id && new window.DPlayer({
        container: udpRef.value,
        contextmenu: [{ text: "", link: "" }],
        theme: '#4C8FE8',
        volume: 0.8,
        logo: "",
        autoplay: true,
        controls: true,
        video: {
            url: id ? `http://localhost:3880/video/m3u8/${id}.m3u8` : basicInfo.ou,
            pic: "",
            type: 'auto',
            defaultQuality: 0,
            controls: true
        },
        mutex: true,
        lang: 'en',
        language: "en",
    })
}

const needBack = ref(false);
const initPlayer = () => {
    let { id, local, type } = query.query;
    if (id) {
        activeName.value = "first";
        m3u8Url.value = local ? (local as string) : `http://localhost:3880/video/m3u8/${id}.m3u8`
        localStorage.setItem('debuggerplayerName', "first")
        needBack.value = true;
    }
    if (type) {
        localStorage.setItem('debuggerplayerName', "third")
        activeName.value = "third";
        needBack.value = true;
        createFullInfoPlayer(+id);
    }
}

const initDebuggerParams = () => {
    Object.assign(form, JSON.parse(localStorage.getItem('debuggerplayer')) || {})
}


const changeDebuggerParams = (id) => {
    const item = store.address.find(t => t.id == id);
    form.path = item.origin + item.pathname;
    form.startId = item.startId;
}



const backHistory = () => { history.go(-1); }

onMounted(() => {
    let url = "";
    activeName.value = localStorage.getItem('debuggerplayerName') || 'first';
    initPlayer();
    initDebuggerParams();
    setTimeout(() => {
        const header: HTMLElement = document.querySelector("#onlyId header.onlyId");
        header && (() => {
            new ResizeObserver(([entries]) => {
                const { height } = entries.contentRect;
                headerHeight.value = height + 'px'
            }).observe(header, { box: "border-box" });
        })();
    })

    window.videoApp.addEventListener('captureM3u8Url', async (data: string) => {
        if (url !== data) {
            updateUrl(data);
            newMsg.value = true;
            webview.value && webview.value
                .executeJavaScript(`_tool && _tool.createHandle("${data}")`)
                .then(() => { form.isFull && playFullVideo(); })
            url = data;
        }
    })

    window.videoApp.addEventListener('checkBeforeSave', () => edit())
})



</script>
    
<style scoped lang="scss">
#player-page {
    width: 100%;
    height: 100%;
    position: relative;
    // --tab-height: 0px;

    .absolute {
        position: absolute;
        top: 4px;
        right: 10px;
        z-index: 788;
    }

    :deep(.el-tabs__nav-scroll) {
        padding-left: 1em;
    }

    :deep(.el-tabs) {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    :deep(.el-tabs .el-tabs__content) {
        flex: 1;
    }
}

:deep(.el-form--inline .el-form-item) {
    margin-right: 20px;
}

header {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;


    &.m3u8 {
        padding-left: 2rem;
        height: var(--header-height);
    }

    .playBtn {
        margin: 0 2em;
    }

    &.onlyId {
        padding-left: 2rem;
    }
}

main {

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


    &#dp {
        margin-top: 10px;
        height: calc(100vh - 95px - 15px - 40px - 30px - 10px - var(--tab-height));
        background-image: linear-gradient(to left bottom, #7e9ecf, #00bbec, #00d5d7, #00e78e, #a8eb12);
    }




    &#dp2 {
        flex: 1;
        margin-top: 10px;
        background-image: linear-gradient(to left bottom, #5f99f0, #25c3eb, #0beaee, #7beec2, #c1fc43);
    }

    &#page {
        position: relative;
        // margin-top: 10px;
        height: calc(100vh - 55px - var(--tab-height) - 40px - 15px - var(--header-height-2) - 30px);
        background-image: linear-gradient(to right top, #9aa1ec, #75b5fa, #4ec7fd, #3bd6f5, #53e3e6, #62e6da, #75e8ce, #88eac2, #87e6ba, #85e1b2, #85dda9, #84d8a1);


        &.hide {
            .box {
                display: none;
            }
        }


    }
}


.my-component {
    // extra
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;

    header {
        position: absolute;
        width: 100%;
        height: 150px;
        background-color: #ffffff;
        display: flex;
        flex-direction: column;
        box-sizing: content-box;
        transition: top, .2856s;
        z-index: 9999;
        box-sizing: border-box;


        &.top {
            top: calc(-150px - 10px);

            &.active {
                top: 0;


                .triangle {
                    border-top: 10px solid transparent;
                    border-bottom: 10px solid #00d5d7;
                    bottom: 0;
                }
            }

            .triangle {
                bottom: -30px;
                right: 20%;
                border-top: 10px solid #00d5d7;
                border-right: 10px solid transparent;
                border-left: 10px solid transparent;
            }
        }

        .triangle {
            position: absolute;
            width: 0;
            height: 0;
            cursor: pointer;

        }
    }
}
</style>