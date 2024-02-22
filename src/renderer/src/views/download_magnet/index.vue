<template>
    <div class="magnet flx-align-between " id="magnet">
        <div class="search-bar flx-justify-center">
            <!-- 添加搜索栏的HTML代码 -->
            <!-- <input type="text" v-model="searchKeyword" placeholder="输入关键词搜索" />
            <el-button @click="search"  type="success">搜索</el-button> -->
            <!-- <el-input v-model="searchKeyword" placeholder="输入关键词搜索"></el-input>
            <el-button type="primary" class="playBtn" @click="search">搜索</el-button> -->
            <el-input v-model="pageQuery.q" placeholder="Please input video name" class="input-with-select">
                <template #prepend>
                    <el-select v-model="tagSelect" placeholder="Select" style="width: 115px">
                        <el-option label="未下载" value="1" />
                        <el-option label="下载中" value="2" />
                        <el-option label="已下载" value="3" />
                    </el-select>
                </template>
                <template #append>
                    <el-button :icon="Search" @click="search" />
                </template>
            </el-input>
        </div>
        <div class="magnet-container">
            <div v-for="(task, index) in tasks" :key="index" class="magnet-task">
                <!-- <div class="img-container"> </div> -->
                <el-popover placement="right" width="auto" trigger="click">
                    <template #reference>
                        <div class="img-container">
                            <img :src="getMagnetCover(task.base64)" :alt="task.nm" class="mini-poster" />
                            <!-- <img :src="task.base64" :alt="task.fr" class="magnet-task-image" /> -->
                        </div>
                    </template>
                    <img :src="getMagnetCover(task.base64)" class=" magnet-task-image" />

                    <ul v-if="task.hashs && task.hashs.length">
                        <h4>下载列表</h4>
                        <li v-for="item in task.hashs">
                            <div class="hash-info flx">
                                <div>
                                    名称: <strong>{{ item.desc }}</strong>
                                </div>
                                <div style="margin-left: 4px;">
                                    大小: <strong> {{ item.size }}</strong>
                                    <Download width="12" style="margin-left: 10px; cursor: pointer;"
                                        @click="bindHash(task, item)" />
                                </div>
                            </div>
                            <p class="time-info" style="font-size: 12px;">{{ item.udpt }}</p>
                        </li>
                    </ul>
                    <p v-else>暂无下载列表</p>

                </el-popover>

                <div class="magnet-task-details flx-justify-between">
                    <div class="basic flx-align-between">
                        <!-- <p class="sle" style="width: 26vw;margin-right: 2em;" :title="task.nm">{{ task.nm }}</p> -->
                        <p class="sle" style="width: 26vw;margin-right: 2em;" :title="task.nm">{{ task.fr }}</p>

                        <div class="flx-justify-between" style="max-width: 180px;">
                            <p class="flx-center">
                                <Clock color="#323" width="14"></Clock>
                                <span style="font-size: 12px;color:#334;margin-left: 4px;">{{ task.dt }}</span>
                            </p>

                            <p class="flx-center">
                                <svg class="icon"
                                    style="width: 14px;height: 14px;vertical-align: middle;fill: currentColor;overflow: hidden;"
                                    viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8333">
                                    <path
                                        d="M925.27 269.25V758c0 112.46-185.35 203.64-414 203.64s-414-91.18-414-203.64V269.25c0-112.46 185.34-203.63 414-203.63s414 91.17 414 203.63zM842.47 758V269.25c0-43.07-125.73-122.18-331.18-122.18s-331.18 79.11-331.18 122.18V758c0 43.07 125.73 122.18 331.18 122.18S842.47 801.05 842.47 758z"
                                        fill="#323" p-id="8334"></path>
                                    <path
                                        d="M925.27 269.25c0 112.47-185.35 203.64-414 203.64s-414-91.17-414-203.64 185.34-203.63 414-203.63 414 91.17 414 203.63z m-82.8 0c0-43.07-125.73-122.18-331.18-122.18s-331.18 79.11-331.18 122.18 125.73 122.18 331.18 122.18 331.18-79.1 331.18-122.18z"
                                        fill="#323" p-id="8335"></path>
                                    <path
                                        d="M511.29 554.34c-205.45 0-331.18-79.1-331.18-122.18H97.32c0 112.47 185.34 203.64 414 203.64s414-91.17 414-203.64h-82.8c-0.05 43.08-125.78 122.18-331.23 122.18z"
                                        fill="#323" p-id="8336"></path>
                                    <path
                                        d="M511.29 717.25c-205.45 0-331.18-79.11-331.18-122.18H97.32c0 112.47 185.34 203.64 414 203.64s414-91.17 414-203.64h-82.8c-0.05 43.07-125.78 122.18-331.23 122.18z"
                                        fill="#323" p-id="8337"></path>
                                </svg>
                                <span style="font-size: 12px;color:#334;margin-left: 4px;">{{ task.fileSize }}</span>
                            </p>
                        </div>
                    </div>
                    <div class="progress flx-align-between">
                        <p><span style="font-size: 14px;">下载状态:</span> <span style="margin-left: 12px; font-size: 16px;">{{
                            task.info }}</span></p>
                        <el-progress :percentage="task.progress" indeterminate />
                    </div>
                    <div class="handle flx-center">
                        <el-button v-if="task.state === 0" @click="startDownload(task)" link :icon="Download" type="primary"
                            size="small">
                            开始
                        </el-button>
                        <el-button v-else-if="task.state === 1" @click="pauseDownload(task)" link :icon="VideoPause"
                            type="warning" size="small">
                            暂停
                        </el-button>
                        <el-button @click="deleteTask(task)" :icon="Delete" type="danger" link size="small">
                            删除
                        </el-button>
                        <el-button @click="openLocalFile(task)" link :icon="Folder"
                            :type="task.progress !== 100 ? 'info' : 'warning'" size="small">
                            本地文件
                        </el-button>
                    </div>
                </div>
            </div>
        </div>
        <div class="pagination">
            <el-pagination :total="pageQuery.total" v-model:page-num="pageQuery.n" v-model:page-size="pageQuery.s"
                layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 30]"
                @current-change="handleCurrentChange" size="small" @size-change="handleSizeChange" />
        </div>

    </div>
</template>
4
<script setup lang='ts'>
import { reactive, ref, computed, onBeforeMount } from 'vue';
import { Clock, Delete, Download, VideoPause, Search, VideoPlay, Folder } from '@element-plus/icons-vue';
import { setObjToUrlParams } from '@renderer/utils/urlTool';
import { ElMessage } from 'element-plus';

interface TaskMap {
    [key: string]: string
}


const taskMap = reactive<TaskMap>(sessionStorage.getItem('magnet') ? JSON.parse(sessionStorage.getItem('magnet')) : {})
const waitMap = reactive<TaskMap>(sessionStorage.getItem('magnet_wait') ? JSON.parse(sessionStorage.getItem('magnet_wait')) : {})

const tagSelect = ref('1');

const pageQuery = reactive({
    s: 10,
    n: 1000,
    q: "",
    total: 12
})


const getData = () => {
    fetch(setObjToUrlParams('http://localhost:3880/magnet/page', {
        ...pageQuery,
        tag: tagSelect.value
    })).then(r => r.json())
        .then(res => {
            if (res.data) {
                const keys = Object.keys(taskMap)
                const waits = Object.keys(waitMap);
                tasks.splice(0);
                Object.assign(tasks, res.data.shift().map(task => {
                    // task.info = keys.includes(task.fr) ? "下载中" : waits.includes(task.fr) ? "等待中" : "未下载";
                    if (keys.includes(task.fr)) {
                        task.info = "downloading...";
                        task.selHash = taskMap[task.fr]
                        task.state = 1
                    } else if (waits.includes(task.fr)) {
                        task.info = "waiting..."
                        task.selHash = waitMap[task.fr]
                        task.state = 1
                    } else {
                        task.info = "未下载..."
                        task.selHash = "";
                        task.state = 0;
                    }
                    return task;
                }));
                pageQuery.total = res.data.shift();
            }
        })
}


const getMagnetCover = (suffix: string) => {
    return `http://localhost:3880/magnet/img/${suffix}`
}

const handleCurrentChange = (e) => {
    pageQuery.n = e;
    getData();
}

const handleSizeChange = (e) => {
    pageQuery.s = e;
    getData()
}

const search = () => {
    // 实现搜索逻辑，可以根据实际需求调整
};




const tasks = reactive<MagnetDownloadTask[]>([
    {
        id: "",
        fr: "",
        href: "",
        progress: 50,
        nm: '检查网线、调制解调器和路由器',
        ai: "",
        dt: "164分钟",
        cv: 'https://ts4.cn.mm.bing.net/th?id=ORMS.a873eb8090d8eb6933fb0107d53fb0ab&pid=Wdp&w=300&h=225&qlt=90&c=1&rs=1',
        ok: 0,
        local: "",
        base64: "",
        hashs: [],
        fileSize: "2.06GB",
        selHash: "",
        info: "未下载...",
        state: 0, // 0: 未开始, 1: 下载中, 100: 下载完成
    }
])

const startDownload = (t: MagnetDownloadTask) => {
    t.state = 1;

    if (Object.values(taskMap).length === 0) {
        taskMap[t.fr] = t.selHash
        sessionStorage.setItem('magnet', JSON.stringify(taskMap))
        t.info = "start downloading . . ."
        // send directive
    } else {
        t.info = "waiting . . ."
        waitMap[t.fr] = t.selHash;
        sessionStorage.setItem('magnet_wait', JSON.stringify(waitMap))
    }
}

const pauseDownload = (t: MagnetDownloadTask) => {
    t.state = 0;
    t.info = "暂停下载"
    Object.keys(taskMap).forEach(key => {
        delete taskMap[key];
    })
    sessionStorage.setItem('magnet', JSON.stringify({}))
}

const deleteTask = (t: MagnetDownloadTask) => {

}

const openLocalFile = (t: MagnetDownloadTask) => {

}

const bindHash = (task: MagnetDownloadTask, hash: MagnetLinkItem) => {
    task.selHash = hash.hash;
    task.fileSize = hash.size.toString();
    navigator.clipboard.writeText(hash.hash).then(() => {
        ElMessage.success('写入ok!')
    })
}

onBeforeMount(() => {
    getData();
})

</script>

<style scoped lang='scss'>
.magnet {
    &#magnet {
        height: 100%;
        padding: 10px 14px;
    }

    &-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-sizing: border-box;
        overflow-y: scroll;
        background-color: #fff;
    }

    .search-bar {
        display: flex;
        gap: 10px;
        margin: 0 auto 20px;
        width: 75%;

        input {
            padding: 5px;
            flex: 1;
            border: 1px solid #ccc;

            border-radius: 4px;
        }
    }

    &-task {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        width: 100%;
        justify-content: space-between;

        .basic {
            height: 60px;
        }

        .progress {
            height: 50px;
            flex: 1;
        }

        .handle {
            width: 16vw;
            margin-left: 10px;
        }

        .img-container {
            width: 120px;
            height: 80px;
            margin-right: 20px;
            overflow: hidden;
            cursor: pointer;
        }

        .magnet-task-image {
            width: 50vw;
            // height: 100%;
            object-fit: cover;
            /* 按比例缩放并裁剪图片以填充整个div */
            // border-radius: 8px;
            // width: 100px;
            // height: 100px;
        }

        .mini-poster {
            width: 100%;
        }

        .magnet-task-details {
            flex: 1;
            display: flex;
            align-items: center;
            padding-right: 2em;
            box-sizing: border-box;

            .magnet-task-info {
                flex: 1;

                .task-name {
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                p {
                    margin-bottom: 5px;
                }
            }

            .magnet-task-actions {
                display: flex;
                gap: 10px;
            }
        }
    }

    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>