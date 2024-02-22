<template>
    <div id="thepapp">
        <div class="box">
            <div class="pack_yk_pack" v-for="item in list" type="horizontal" @click.capture="createPlayWindow(item)"
                @contextmenu="selectId(item.fr)">
                <div class="pack_pack_cover  pack_pack_preview">
                    <a class="aplus_exp aplus_clk" data-scm="" data-spm="d_zj1_2" data-name="a_pos" :title="item.fr">
                        <img :src="isLoading ? loingPng : item.img" />
                        <span class="pack_p_rb"></span>
                    </a>
                </div>
                <div class="pack_info_list">
                    <div class="pack_title " style="max-height:44px"></div>
                    <div class="pack_subtitle">{{ item.nm || item.fr }}</div>
                </div>
            </div>
        </div>

        <el-row class="flex">
            <!-- <input type="text" v-model="page.q"> -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page.n"
                :page-sizes="[27, 36, 45, 54]" :page-size="page.s" layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-row>
    </div>
</template>

<script setup lang='ts'>
import { onBeforeMount, reactive, ref } from 'vue';
import loingPng from "@renderer/assets/images/loading.gif"
// 36 36
const isLoading = ref(false);
const list = reactive<{ img: string, fr: string, hash_id: string, nm: string }[]>([])
const total = ref(0)
const page = reactive({ n: 1, s: 36 })
const selected = localStorage.getItem('selectedids') ? JSON.parse(localStorage.getItem('selectedids')) : [];
const getList = () => {
    isLoading.value = true
    fetch(`http://localhost:3880/youtube/thep?n=${page.n}&s=${page.s}`)
        .then(r => r.json())
        .then(res => {
            console.log(res)
            list.splice(0);
            Object.assign(list, res.data)
            total.value = 18119
            isLoading.value = false
        })
}
const selectId = (fr) => {
    selected.push(fr);
    localStorage.setItem('selectedids', JSON.stringify(Array.from(new Set(selected))))
}

const handleSizeChange = (s) => {
    page.n = 1;
    page.s = s;
    getList();
}

const handleCurrentChange = (val) => {
    page.n = val;
    // 发送请求获取当前页的数据列表
    getList()
}

const createPlayWindow = (option) => {
    const conf = {
        nm: option.fr,
        id: Date.now(),
        fr: option.fr,
        fn: option.fr,
        cv: option.img,
        url: `https://qhshenghuo.xyz/videos/${option.hash_id}/g.m3u8?h=d11925605f2a1ef`,
        type: "onlineVideo"
    }
    window.videoApp.pubEvent('createChildWindow', { name: "player", conf })
}

onBeforeMount(() => {
    getList();
})

</script>

<style scoped lang='scss'>
.box {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: auto;
}

.flex {
    display: flex;
    justify-content: center;
}

.hide {
    display: none;
}


.fixed {
    position: fixed;
    left: 0px;
    height: 100vh;
    display: flex;
    justify-content: center;
    /* align-items: center; */
    flex-direction: column;
}

#video {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: -1;
}

#video.show {
    z-index: 8888;
}

#app {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: var(--image-url);
    flex-direction: column;
}

#app::before {
    content: "";
    background-image: inherit;
    filter: blur(4px);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: 100% 100%;
    background-repeat: no-repeat;
}

main {
    width: 80%;
    min-height: 54%;
    max-height: 90%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
    align-content: flex-start;
    box-sizing: border-box;
    overflow: hidden;
    margin-bottom: 20px;
    z-index: 20;
}

.el-pagination {
    z-index: 20;
}


video {
    position: absolute;
    width: 100%;
    height: 100%;

    visibility: hidden;
}

.pack_yk_pack {
    cursor: pointer;
}

.pack_yk_pack,
.pack_yk_pack_focus,
.pack_yk_pack_v {
    position: relative;
    text-align: left;
    width: 160px !important;
    height: 90px !important;
    margin-bottom: 50px;
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
</style>