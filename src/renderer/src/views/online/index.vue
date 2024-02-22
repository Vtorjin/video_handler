<template>
    <div id="online-page">
        <div class="header-box" style="display: flex; justify-content: space-between; align-items: center;">
            <div class="search-box nonenav">
                <div class="searchbar-main">
                    <form name="search" @submit="search">
                        <div class="searchbar">
                            <input class="search-input" type="text" name="wd" autocomplete="off"
                                placeholder="输入番剧关键词，请少字也别错字了....">
                            <button class="search-btn search-go" id="searchbutton">
                                <!-- <i class="icon-search"></i> -->
                                <img src="@/assets/svg/search.svg" style="width:16px" draggable="false" alt="">
                            </button>
                            <button class="cancel-btn" type="button">取消</button>
                        </div>
                        <div class="search-recommend-box">
                            <div class="search-recommend">
                                <div class="search-recommend-title">
                                    <strong>大家都在搜</strong>
                                </div>
                                <div class="search-tag">

                                    <a href="/vch%E6%B5%B7%E8%B4%BC%E7%8E%8B.html" class="hot "><i
                                            class="icon-hot"></i>海贼王</a>

                                    <a href="/vch%E7%81%AB%E5%BD%B1%E5%BF%8D%E8%80%85.html" class="hot "><i
                                            class="icon-hot"></i>火影忍者</a>

                                    <a href="/vch%E6%96%97%E7%BD%97%E5%A4%A7%E9%99%86.html" class="hot "><i
                                            class="icon-hot"></i>斗罗大陆</a>

                                    <a href="/vch%E9%97%B4%E8%B0%8D%E8%BF%87%E5%AE%B6%E5%AE%B6.html" class="hot "><i
                                            class="icon-hot"></i>间谍过家家</a>

                                    <a href="/vch%E5%A5%B3%E5%8F%8B%E6%88%90%E5%8F%8C.html" class=""><i
                                            class="icon-hot"></i>女友成双</a>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div class="header-op">
                <div class="header-op-list">
                    <div class="drop">
                        <div class="header-op-list-btn header-op-history"><i
                                class="icon icon-history-o"></i><span>观看记录</span>
                        </div>
                        <div class="drop-content drop-history">
                            <div class="drop-content-box">
                                <ul class="drop-content-items historical">
                                    <li class="drop-item drop-item-title">
                                        <i class="icon icon-history"></i><strong>我的观影记录</strong>
                                    </li>
                                    <li class="drop-item drop-item-content nolist">
                                        <div class="drop-prompt">暂无观看影片的记录</div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="shortcuts-mobile-overlay"></div>
                    </div>
                    <div class="header-op-list-btn header-op-search">
                        <i class="icon icon-search"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="home-nav-body" v-if="mode === 'tagMode'">
            <div class="module" v-for=" item in navList">
                <div class="module-heading flex">
                    <h2 class="module-title">
                        <a href="javascript:;">
                            <span>{{ item.key }}</span>
                        </a>
                    </h2>
                    <div class="module-tab-items">
                        <div class="module-tab-title">
                            选择类型<span class="close-drop"><i class="icon-close"></i></span>
                        </div>
                        <!-- <a class="module-heading-more" href="/s/9.html">更多<i class="icon-arrow-right"></i></a> -->
                        <div class="module-heading-more" @click="setMode('allMode', item.key)">更多<i
                                class="icon-arrow-right"></i>
                        </div>
                    </div>
                    <!-- <div class="shortcuts-mobile-overlay"></div> -->
                </div>
                <div class="module-main tab-list active">
                    <div class="module-items module-poster-items-base ">
                        <div v-for="video in item.val" @click="goToPlayer(video)" routerLinkActive="router-link-active"
                            :title="video.nm" class="module-poster-item module-item pointer" style="display:block">
                            <div class="module-item-cover">
                                <div class="module-item-note">
                                    {{ video.dt }} </div>
                                <div class="module-item-pic">
                                    <!-- <img class="lazy lazyload"
                                        data-original="https://oss-cdn.meowa.cn/mxtheme/images/loading.gif" alt="中国奇谭"
                                        src="https://oss-cdn.meowa.cn/mxtheme/images/loading.gif" /> -->
                                    <img class="lazy lazyload"
                                        data-original="https://oss-cdn.meowa.cn/mxtheme/images/loading.gif" :alt="video.nm"
                                        :src="getImageUrl(video.id)"
                                        @error="e => setDefaultCover(e.target as HTMLImageElement)" />
                                </div>
                            </div>
                            <div class="module-poster-item-info">
                                <div :class="['module-poster-item-title', getVideoState(video)]">{{ video.nm }}</div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>

        <div class="home-nav-body" v-else="mode === 'allMode'">
            <p class="back_nav" @click="setMode('tagMode')">
                <a href="javascript:;">返回</a>
                <span>{{ key }}</span>
            </p>

            <div class="modules flex fixed">
                <div class="pack_yk_pack" v-for="item in allVideos" type="horizontal" @click="goToPlayer(item)">
                    <div class="pack_pack_cover  pack_pack_preview">
                        <a class="aplus_exp aplus_clk" data-scm="" data-spm="d_zj1_2" data-name="a_pos" :title="item.nm">
                            <img :src="getImageUrl(item.id)">
                            <span class="pack_p_rb">
                                <span> {{ item.dt }} </span>
                            </span>
                        </a>
                    </div>
                    <div class="pack_info_list" :title="item.nm">
                        <div class="pack_title " style="max-height:44px"></div>
                        <div class="pack_subtitle">{{ item.nm }}</div>
                    </div>
                </div>
            </div>

            <el-pagination :page-size="pageSize" :page-sizes="[16, 24, 32, 40]" :total="total"
                @size-change="handleSizeChange" @current-change="goToPage" layout="total, sizes, prev, pager, next, jumper"
                class="fixed-page"></el-pagination>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onBeforeMount, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { basicInfo, concatData } from "@renderer/hooks/api";


type Mode = 'allMode' | 'tagMode';

interface NavList {
    key: string,
    val: NavCoverItem[]
}

interface NavCoverItem {
    ar: string
    dt: number
    fr: string
    id: number
    local: string
    nm: string
    fn?: string
    ok: boolean
    qs: number
    img: string
    ud: boolean
    ou?: string
}

interface VideoInfo extends NavCoverItem {
    lp: string
    ls: string
    lo: string
    tg: string
    vh: number
    vw: number
}

const mode = ref<Mode>((localStorage.getItem('mode') as Mode) || "tagMode")
const key = ref(localStorage.getItem('videoKey') || '')
const router = useRouter();
const navList = reactive<NavList[]>([
    {
        key: "周更动漫", val: [{ nm: '完美世界 第1集', fn: "樱花动漫_20123 完美世界 第1集", dt: 0, fr: "樱花动漫_20123 ", local: "C:\\Users\\Administrator\\AppData\\Roaming", id: 0, ou: "https://s6.bfzycdn.com/video/mofashidexinniangdierji/%E7%AC%AC01%E9%9B%86/index.m3u8", ud: false, ok: false, ar: "", qs: 0, img: "" },
        { ar: "aaaa", dt: 3000, fr: "动漫", id: 1000, local: "", nm: "飞机", ok: true, qs: 22, img: "sssss", ud: true },
        { ar: "aaaa", dt: 3000, fr: "动漫", id: 1000, local: "", nm: "飞机", ok: true, qs: 22, img: "sssss", ud: true },
        { ar: "aaaa", dt: 3000, fr: "动漫", id: 1000, local: "", nm: "飞机", ok: true, qs: 22, img: "sssss", ud: true },
        { ar: "aaaa", dt: 3000, fr: "动漫", id: 1000, local: "", nm: "飞机", ok: true, qs: 22, img: "sssss", ud: true },
        { ar: "aaaa", dt: 3000, fr: "动漫", id: 1000, local: "", nm: "飞机", ok: true, qs: 22, img: "sssss", ud: true },
        { ar: "aaaa", dt: 3000, fr: "动漫", id: 1000, local: "", nm: "飞机", ok: true, qs: 22, img: "sssss", ud: true },

        ]
    },
    { key: "追番列表", val: [] },
    { key: "日本动漫", val: [] },
    { key: "欧美", val: [] },
])
const allVideos = reactive<NavCoverItem[]>([])
const currentPage = ref(Number(localStorage.getItem('page')) || 1);
const total = ref(0);
const pageSize = ref(24);

const getAllVideo = (page: number = 1) => {
    fetch(`http://localhost:3880/angular/types`, {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            key: key.value,
            page,
            size: pageSize.value
        })
    }).then(res => res.json())
        .then(res => {
            const { data } = res
            const [list, count]: [NavCoverItem[], number] = data;
            console.log(list, count);
            allVideos.splice(0);
            Object.assign(allVideos, list);
            total.value = count;
        })
        .catch(() => { })
}

const setMode = (m: Mode, k?: string) => {
    mode.value = m;
    localStorage.setItem('mode', m)
    key.value = k || key.value || '';
    if (k) {
        localStorage.setItem('videoKey', k)
        getAllVideo();
    } else {
        getTypeList()
    }
}



const getImageUrl = (id: number) => {
    return `http://localhost:3880/video/img/${id}.png`
}

const getTypeList = (page = 1) => {
    var size = 20;
    fetch("http://localhost:3880/angular/home", {
        method: "get"
    }).then(res => res.json()).then(res => {
        const { data } = res
        navList.splice(0)
        Object.assign(navList, data)
    })
}

const goToPage = (pageNumber: number) => {
    localStorage.setItem('page', pageNumber + '')
    getAllVideo(pageNumber)
}

const handleSizeChange = (s: number) => {
    pageSize.value = s;
    getAllVideo(1);
}



const getVideoState = (video: NavCoverItem) => {
    if (video.ok) return 'ok'
    if (video.ud) return 'err'
    return 'normal'
}

const goToPlayer = (video: NavCoverItem) => {
    console.log(video)
    concatData(video as any);
    console.log(basicInfo)
    // this.route.navigate(['player'], { queryParams: { id: video.id, from: "home" } })
    router.push({ path: '/player/index', query: { id: video.id, type: 'true' } })
}

const search = (e) => {
    console.log('hahahah')
    e.preventDefault();
}

const setDefaultCover = (target: HTMLImageElement) => {
    target.src = 'loading.gif';
    target.classList.add('error')
}

onBeforeMount(() => {
    const app = document.querySelector('#online-page') as HTMLElement;
    console.log(app, '存在都不能')
    mode.value === "tagMode" ? getTypeList(currentPage.value) : getAllVideo(1);
})


</script>

<style scoped lang="scss">
#online-page {
    position: relative;
    height: 100%;
}

.header-box {
    position: absolute;
    padding-left: 1rem;
    height: 64px;
    top: 0;
    width: calc(100vw - var(--aside-width));
    background-color: #ffff;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}

.home-nav-body {
    position: absolute;
    top: 64px;
    height: calc(100vh - 64px - 95px - 30px);
    overflow-y: scroll;
    width: calc(100vw - var(--aside-width));

    &::-webkit-scrollbar-track-piece {
        background: transparent;
    }

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #dddddd;
        // border-radius: 20px;
    }

    scrollbar-width: thin;
    scrollbar-color: transparent;

    .back_nav {
        cursor: pointer;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        padding-right: 4em;
        height: 40px;
        box-sizing: border-box;
        overflow: hidden;
        font-size: 18px;
        font-weight: 600;
        font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;
    }
}

.module-heading {
    border-bottom: 1px solid var(--el-header-border-color);
    padding: 1rem;
    align-items: center;
}

.module-main {
    padding: 0 1rem;
    box-sizing: border-box;
    overflow-x: hidden;
}

.module-items.module-poster-items-base {
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    margin-right: 0;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: auto;
    grid-gap: 20px;
    justify-items: start;
    /* 将所有元素左对齐 */
    align-content: start;
    /* 将所有行向上对齐 */
    box-sizing: border-box;


    .module-poster-item {
        width: 100% !important;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
    }

    .module-item {
        margin: 0;
    }

    .module-poster-item-title {
        min-height: 20px;
    }
}

.pagination {
    span {
        margin: 0 2em;
    }

    button {
        cursor: pointer;
    }
}


.pack_yk_pack {
    cursor: pointer;
}

.pack_yk_pack,
.pack_yk_pack_focus,
.pack_yk_pack_v {
    position: relative;
    text-align: left;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
}

.pack_pack_cover.pack_pack_preview {
    background-size: 100% 100% !important;
    background-repeat: no-repeat !important;
    object-fit: cover
}


.pack_yk_pack .pack_pack_cover,
.pack_yk_pack_focus .pack_pack_cover,
.pack_yk_pack_v .pack_pack_cover {
    position: relative;
    padding-top: 55.74%;
    border-radius: 10px;
    background: #25252b;
    overflow: hidden;
    /* width: 160px !important;
height: 90px !important; */
    box-sizing: border-box;
}


.pack_yk_pack .pack_pack_cover a,
.pack_yk_pack_focus .pack_pack_cover a,
.pack_yk_pack_v .pack_pack_cover a {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    text-decoration: none;
    color: #fff;
    z-index: 2;
}

.pack_yk_pack .pack_info_list,
.pack_yk_pack_focus .pack_info_list,
.pack_yk_pack_v .pack_info_list {
    position: relative;
    padding-top: 9px;
    color: hsla(0, 0%, 100%, .87);
    z-index: 10;
    overflow: hidden;
    max-height: 44px;
}


.pack_yk_pack .pack_info_list .pack_subtitle,
.pack_yk_pack_focus .pack_info_list .pack_subtitle,
.pack_yk_pack_v .pack_info_list .pack_subtitle {
    color: #444;
    margin-top: 3px;
    height: 14px;
    line-height: 14px;
    font-size: 14px;
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pack_yk_pack .pack_pack_cover a,
.pack_yk_pack_focus .pack_pack_cover a,
.pack_yk_pack_v .pack_pack_cover a {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    text-decoration: none;
    color: #fff;
    z-index: 2;
}

.pack_yk_pack .pack_pack_cover a img,
.pack_yk_pack_focus .pack_pack_cover a img,
.pack_yk_pack_v .pack_pack_cover a img {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    object-fit: contain;
    border-radius: 7px;
    -webkit-transition: all .25s ease-in-out;
    transition: all .25s ease-in-out;
}

.pack_yk_pack .pack_p_rb {
    line-height: 28px;
    color: #fff;
    font-size: 12px;
    right: 8px;
    bottom: 0;
    position: absolute;
    z-index: 15;
}

.modules {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-auto-rows: auto;
    grid-gap: 10px;
    padding: 10px 20px;

    &.fixed {
        height: calc(100% - 70px);
    }
}


@media (min-width:600px) {
    .module-poster-items-base .module-poster-item:nth-child(n+12) {
        display: block !important;
    }

    .module-poster-items-base .module-poster-item:nth-child(n+16) {
        display: none !important;
    }
}

@media (max-width: 1789px) {
    .module-poster-items-base .module-poster-item:nth-child(n+12) {
        display: block !important;
    }

    .module-poster-items-base .module-poster-item:nth-child(n+16) {
        display: none !important;
    }
}

.fixed-page {
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    height: 30px;
    align-items: center;
    box-sizing: border-box;
}
</style>