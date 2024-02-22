<template>
    <div id="debugger-page">
        <!-- js 管理 -->
        <header class="setting">
            <el-form-item label="网页地址:" class="fixed">
                <el-select v-model="page" clearable filterable size="small"> <el-option v-for="item in store.address"
                        :label="item.name" :value="item.href"></el-option></el-select>
            </el-form-item>
            <el-button type="info" link :icon="Refresh" @click="refreshPage">刷新网页</el-button>
            <el-button type="warning" link @click="openDevTool">打开控制台</el-button>
            <el-button type="primary" link :icon="DArrowRight" @click="forward">前 进</el-button>
            <el-button type="warning" link :icon="DArrowLeft" @click="pageBack">后 退</el-button>
            <el-button type="primary" link :icon="Search" @click="startCrawler">开始调试</el-button>
            <el-badge :is-dot="newMsg">
                <el-button id="editRef" type="success" link :icon="Edit" @click="edit">编辑</el-button>
            </el-badge>

        </header>
        <main id="web" ref="webviewContainer">
            <div id="loader">
                <div id="shadow"></div>
                <div id="box"></div>
            </div>

        </main>
        <Drawer />
    </div>
</template>

<script setup lang='ts'>
import { Edit, Refresh, Search, DArrowLeft, DArrowRight } from '@element-plus/icons-vue';
import { onMounted, reactive, ref } from 'vue';
import conf from "~/config/default.json";
import Drawer from "@renderer/components/VideoSettingDrawer/index.vue"
import MyDrawer from "@/components/MyDrawer/index.vue"
import { openEditDrawer, updateUrl, basicInfo, concatData } from "@renderer/hooks/api";
import { useGlobalStore } from '@renderer/stores/modules/global';

const store = useGlobalStore();
const newMsg = ref(false);
const page = ref(localStorage.getItem('debuggerpage') || '');
const webview = ref<null | CustomWebView>(null)
const webviewContainer = ref<HTMLDivElement | null>(null);
const drawerRef = ref<ExposedEvent>(null)

const directions = ['left', 'right', 'left', 'bottom']
const dir = ref<'left' | 'right' | 'left' | 'bottom'>('left');
const isFull = ref(false);

const edit = () => {

    newMsg.value = false;
    webview.value && webview.value.executeJavaScript('_tool.getConf()').then((res: VideoFullInfo) => {
        window.videoApp.pubEvent('downloadHandle', { eventName: "request-range", conf: { ou: res.ou, tm: basicInfo.tm } })
        concatData(res);
        openEditDrawer();
        // drawerRef.value.toggleActiveByEvent();
    }).catch(e => {
        console.log(e)
    })
}


const createEl = () => {
    webviewContainer.value && webviewContainer.value.classList.remove('hide');
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
    webview.value.setAttribute('src', page.value || 'https://www.baidu.com');
    // webview.value.setAttribute('src',' http://192.168.0.105:5173/');

    webview.value.addEventListener('dom-ready', () => { webviewContainer.value.classList.add('hide'); })
    webview.value.addEventListener('did-finish-load', () => {
        const file = store.address.find(a => a.href === page.value);
        webviewContainer.value && webviewContainer.value.classList.remove('hide');
        file !== undefined && webview.value.executeJavaScript(`${file.js}`)
    })

    webview.value.addEventListener('error', (e) => {
        console.log('页面出现故障了', { page: webview.value.src, info: e })
    })

    webviewContainer.value && webviewContainer.value.appendChild(webview.value)
}


const refreshPage = () => webview.value && webview.value.reload()
const openDevTool = () => webview.value && webview.value.openDevTools();
const startCrawler = () => {
    localStorage.setItem('debuggerpage', page.value);
    webview.value?.remove && webview.value.remove();
    webview.value = null;
    createEl();
}
const forward = () => webview.value && webview.value.executeJavaScript(`history.go(1)`);
const pageBack = () => webview.value && webview.value.executeJavaScript(`history.back()`);


onMounted(() => {
    createEl();
    window.videoApp.addEventListener('captureM3u8Url', (data: string) => {
        updateUrl(data);
        newMsg.value = true;
        webview.value?.executeJavaScript(`_tool && _tool.createHandle("${data}")`)
    })
    window.videoApp.addEventListener('checkBeforeSave', () => edit())
})

</script>

<style scoped lang='scss'>
#debugger-page {
    width: 100%;
    height: 100%;

}

header {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    height: var(--header-height);

    button {
        margin: 0px 12px;
    }

    .fixed {
        margin-left: 20px;
        margin-bottom: 0;
    }
}

main {
    position: relative;
    height: calc(100% - var(--header-height));
    background-image: linear-gradient(to right top, #9aa1ec, #75b5fa, #4ec7fd, #3bd6f5, #53e3e6, #62e6da, #75e8ce, #88eac2, #87e6ba, #85e1b2, #85dda9, #84d8a1);

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

    &.hide {
        .box {
            display: none;
        }
    }

    .myWebContent {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
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
}
</style>