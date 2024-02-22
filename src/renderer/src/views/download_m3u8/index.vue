<template>
    <div id="download-page">
        <header class="tab">
            <div class="right">
                <div class="tab-item" :class="{ active: activeTab === 'initial' }" @click="selectTab(0)">
                    未完成
                </div>
                <div class="tab-item" :class="{ active: activeTab === 'downloading' }" @click="selectTab(2)">
                    下载中
                </div>
                <div class="tab-item" :class="{ active: activeTab === 'completed' }" @click="selectTab(1)">
                    已完成 <span class="badge" v-if="activeTab === 'completed'">{{ completed }}</span>
                </div>
            </div>
        </header>

        <main>
            <el-table :data="tableData" :row-style="{ height: '80px' }">
                <el-table-column label="图片" align="center" width="150">
                    <template #default="scope">
                        <el-popover placement="right" width="600" trigger="contextmenu">
                            <template #reference>
                                <div class="video-cover" @click="playLocalVideo(scope.row)">
                                    <img :src="formatImage(scope.row.id)" :alt="scope.row.nm" class="mini-poster"
                                        @error="e => setDefaultCover(e.target as HTMLImageElement)" />
                                    <div class="playIcon"
                                        v-show="(scope.row.state == DownloadState.completed) || scope.row.ok">
                                    </div>
                                    <span class="localTime">{{ formatTimeInfo(scope.row.dt, true) }}</span>
                                </div>
                            </template>
                            <img :src="formatImage(scope.row.id)" :alt="scope.row.nm" width="600"
                                @error="e => setDefaultCover(e.target as HTMLImageElement)" />
                        </el-popover>

                    </template>

                </el-table-column>
                <el-table-column label="视频来源" prop="fr" align="center" width="100" :show-overflow-tooltip="true">
                    <template #default="scope">
                        <span>{{ scope.row.fr.split('_').shift() }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="视频名称" prop="nm" align="center" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column label="进度" align="center" width="120">
                    <template #default="scope">
                        <strong>{{ scope.row.qs_ok || 0 }} / {{ scope.row.qs || 0 }} </strong>
                    </template>
                </el-table-column>
                <el-table-column label="状态信息" align="center" width="180" prop="netInfo">
                    <!-- <template #default="scope">
                        <span :class="`status${scope.row.state}`">{{ current.includes(scope.row.id) ? activeItem.netInfo :
                            scope.row.netInfo }}</span>
                        <span :class="`status${scope.row.state}`">{{ formatNetInfo(scope.row) }}</span>
                    </template> -->
                </el-table-column>
                <el-table-column label="操作" align="center" width="180">
                    <template #default="scope">
                        <div class="download-handle" v-if="scope.row.ok">
                            <el-button size="small" class="handle" @click="playLocalVideo(scope.row)" :icon="VideoPlay"
                                type="primary">播放</el-button>
                            <el-button size="small" class="handle" @click="openLocalFolder(scope.row)" :icon="Folder"
                                type="success">打开</el-button>
                        </div>
                        <div class="download-handle" v-else>
                            <el-button size="small" link type="warning" @click="preview(scope.row)"
                                :icon="View">预览</el-button>
                            <el-button size="small" link type="primary" @click="download(scope.row)"
                                v-if="scope.row.state !== 'downloading'" :icon="Download">下载</el-button>
                            <el-button size="small" link type="primary" @click="pause(scope.row)"
                                v-else-if="['downloading', 'wait'].includes(scope.row.state)"
                                :icon="VideoPause">暂停</el-button>
                            <el-button size="small" link type="danger" @click="deleteItem(scope.row)"
                                :icon="Delete">删除</el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </main>
        <footer>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page.n"
                size="small" :page-sizes="[6, 7, 8]" :page-size="page.s" layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </footer>

    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onBeforeMount, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Download, VideoPause, View, VideoPlay, Folder } from "@element-plus/icons-vue";
import { formatFileSize, concatData, download, activeItem, current, wait, tableData } from "@renderer/hooks/api";
import { DownloadState, StatusUnion } from "~/enmu.d";
 


const activeTab = ref<'downloading' | "completed" | 'initial'>(localStorage.getItem('tab') as StatusUnion || 'initial');
const router = useRouter();
const page = reactive({ n: 1, s: 6, q: "" })
const total = ref(0)
const completed = ref<any>(0)


const handleSizeChange = (s) => {
    page.s = s;
    localStorage.setItem('ps0', s)
    getList(getTabs(localStorage.getItem('tab')));
}

const getTabs = (name: string) => {
    return DownloadState[name] || 0
}

const handleCurrentChange = (val) => {
    page.n = val;
    localStorage.setItem('pn0', val)
    getList(getTabs(localStorage.getItem('tab')), false);
}

const selectTab = (tab) => {
    activeTab.value = tab == DownloadState.completed ? "completed" : tab == DownloadState.downloading ? "downloading" : "initial"
    localStorage.setItem('tab', activeTab.value);
    getList(tab);
}


const pause = (item) => {
    item.state = 'initial';
    window.videoApp.pubEvent('downloadHandle', { eventName: "download-pause" })
    current.splice(0);
    sessionStorage.removeItem('current');
}

const deleteItem = (t: VideoInfoDatabaseTypeEdit) => {
    ElMessageBox.confirm(`是否要删除【${t.nm}】?`, '操作提示', {
        type: "warning",
        confirmButtonText: "确认",
        center: true,
        buttonSize: 'small'
    }).then(() => {
        fetch(`http://localhost:3880/video/del/${t.id}`)
            .then(r => r.json()).then(({ status }) => {
                const isSuc = status === 200;
                isSuc ? Promise.all([ElMessage.success('删除成功！'), handleCurrentChange(1)]) : ElMessage.error('handle error!')
            })
        window.videoApp.pubEvent('downloadHandle', { eventName: "confirm-delete", conf: { nm: t.fn } })
    })
}

const formatTimeInfo = (time, needPad = false) => {
    if (!time) return `0 时 0分 0秒`;
    if (typeof time == 'string') return time;
    let h = Math.floor(time / 3600);
    let m = Math.floor((time - h * 3600) / 60);
    let s = time % 60;
    return needPad ?
        `${String(h).padStart(2, "0")}: ${String(m).padStart(2, "0")}: ${String(Math.ceil(s)).padStart(2, "0")
        } `
        : `${h} 小时 ${m} 分钟 ${Math.ceil(s)} 秒`
}

const formatNetInfo = (row: DownloadInfo) => {
    return activeTab.value === 'completed' ? formatFileSize(row.sz) : current.includes(row.id) ? activeItem.netInfo : wait.includes(row.id) ? '等待中...' : row.netInfo
}

const formatImage = (id: number) => {
    return `http://localhost:3880/video/img/${id}.png`
}

const setDefaultCover = (target: HTMLImageElement) => {
    target.src = 'loading.gif';
    target.classList.add('error')
}


const preview = (a: DownloadInfo) => {
    concatData(a);
    router.push({ path: '/player/index', query: { id: a.id, local: a.local, type: 'true' } })
}

const playLocalVideo = (a: DownloadInfo) => {
    if (((a.state != DownloadState.completed) && (a.ok == false))) {
        ElMessage.warning('该视频未下载完成!')
        return;
    }
    const conf: PlayLocalVideoConf = { nm: a.nm, id: a.id, fn: a.fn, cv: a.cv, type: "localVideo" }
    window.videoApp.pubEvent('createChildWindow', { name: "player", conf })
}


const openLocalFolder = (a: DownloadInfo) => {
    window.videoApp.pubEvent('openDesignatedShell', { eventName: "openJsFolder", url: a.fn });
}

const getList = (isOk: 0 | 1 | 2 = 1, needResetPage = true) => {
    page.n = needResetPage ? 1 : Number(page.n);
    page.q = activeTab.value === 'downloading' ? [...current, ...wait].join(',') : "";
    fetch(`http://localhost:3880/angular/download_list/${isOk}?s=${page.s}&n=${page.n}&q=${page.q}`)
        .then(r => r.json())
        .then(({ data: [data, all] }) => {
            total.value = all;
            tableData.splice(0)
            Object.assign(tableData, data.map(item => {
                return {
                    ...item,
                    cv: 'http://localhost:3880/video/img/' + item.id + '.png' || "./logo_max.png",
                    state: isOk == 1 ? 'finish' : wait.includes(item.id) ? "wait" : "init",
                    netInfo: isOk == 1 ? formatFileSize(item.sz) : wait.includes(item.id) ? "等待中..." : "未开始"
                }
            }));
            if (isOk === 1) {
                completed.value = total.value.toString();
            }
        })
}



onBeforeMount(() => {
    page.s = +localStorage.getItem('ps0') || 6
    page.n = +localStorage.getItem('pn0') || 1
    if (activeTab.value === 'downloading') {
        page.q = [...current, ...wait].join(',');
    } else {
        page.q = ""
    }
    getList(getTabs(localStorage.getItem('tab')), false);
})

 


</script>

<style scoped lang="scss">
#download-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 10px 0px;

}

.el-pagination {
    // position: absolute;
    // bottom: 0;
    // width: 100%;
    height: 28px;
    display: flex;
    justify-content: center;
}

header.tab {
    display: flex;
    align-items: center;
    height: 40px;
    width: 100%;

    .right {
        display: flex;
        justify-self: flex-end;

        .tab-item {
            margin: 0 10px;
            cursor: pointer;
            padding: 4px 10px;

            &.active {
                background-color: #96a4ff;

            }
        }
    }
}


.download-body::-webkit-scrollbar-track-piece {
    background: transparent;
}

.download-body::-webkit-scrollbar {
    width: 4px;
}

.download-body::-webkit-scrollbar-thumb {
    background: #dddddd;
}


.mini-poster {
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: 100% 100%;
    background-position: center center;
    background-repeat: no-repeat;
    z-index: 0;
    left: 0;
}


main {
    flex: 1;
    overflow-y: scroll;
}


.video-cover {
    position: relative;
    height: 70px;
    overflow: hidden;
    border-radius: 6px;

    .playIcon {
        position: absolute;
        width: 100%;
        height: 100%;
        background-image: url("@/assets/svg/play.svg");
        background-position: center center;
        background-repeat: no-repeat;
        background-size: 50% 50%;
        cursor: pointer;
        z-index: 10;
    }

    .localTime {
        position: absolute;
        bottom: 0;
        right: 0;
        font-size: 12px;
        text-align: right;
        color: #ffffff;
        width: 100%;
        padding: 0 4px;
        box-sizing: border-box;
    }

    .mini-poster.error {
        background-image: linear-gradient(to right, #a2c3f4, #99baf9, #95affd, #96a4ff, #9b97ff);
    }
}



.download-handle {
    display: flex;
    justify-content: center;
}

.download-handle span {
    margin: 0 4px;
}
</style>