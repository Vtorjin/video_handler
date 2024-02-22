<template>
    <div class="youtube-page" v-loading="loading" element-loading-text="解析数据中...">
        <header>
            <el-input v-model="url" placeholder="输入youtube地址"></el-input>
            <el-button type="primary" :icon="Search" size="default" @click="analysisUrl">解 析</el-button>
            <el-button type="success" :icon="Search" size="default" @click="startConvert">开始转换</el-button>
        </header>
        <main class="youtube-main">
            <div v-for="(item, index) in downloadList" :key="index" class="yt-download-item">
                <div class="yt-thumbnail">
                    <img :src="item.thumbnail" alt="Video Thumbnail" />
                </div>
                <div class="yt-details">
                    <div class="yt-title">{{ item.title }}</div>
                    <div class="yt-progress" v-if="item.ok == false">
                        <el-progress :percentage="activeItem.url === item.url ? activeItem.progress : item.progress"
                            :stroke-width="5" />
                        <p v-if="activeItem.url === item.url">{{ activeItem.info }}</p>
                    </div>
                    <div class="handle-row">
                        <div class="yt-duration">{{ item.duration }}</div>
                        <div class="yt-actions">
                            <FolderOpened width="16" color="green" v-if="item.ok" class="pointer"
                                @click="createPlayWindow(item)" />
                            <Download width="16" color="green" v-if="!item.ok" class="pointer" @click="startDownload(item)">
                            </Download>
                            <Edit width="16" color="green" v-if="!item.ok" class="pointer" @click="editVideoForm(item)">
                            </Edit>
                            <Delete width="16" color="green" class="pointer" @click="deleteTask(item)" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <el-dialog title="设置格式" width="50%" v-model="visible">
            <el-form :model="form" label-width="100">
                <el-form-item label="保存格式 :">
                    <el-tabs v-model="activeName" type="card" class="demo-tabs" @tab-click="handleClick" size="small">
                        <el-tab-pane v-for="item in tabs" :label="item.viewValue" :name="item.value"></el-tab-pane>
                    </el-tabs>
                </el-form-item>
                <el-form-item label="视频名称 :">
                    <el-input v-model="form.title" readonly></el-input>
                </el-form-item>
                <el-form-item label="输出质量 :">
                    <el-select v-model="choiceId" @change="changFormatId">
                        <el-option v-for="option in selectOptions" :value="option.id"
                            :label="`${option.more || option.ext || 'N'} / ${(option.size || 'A')}`"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="时长 :"><span>{{ form.time }}</span></el-form-item>
                <el-form-item label="视频封面 :"><img :src="form.thumbnail" :alt="form.title" width="300"></el-form-item>
                <el-form-item>
                    <el-button size="small" @click="visible = false">关 闭</el-button>
                    <el-button size="small" type="primary" @click="confirmAdd">确 定</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script setup lang='ts'>
import { computed, onBeforeMount, reactive, ref } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { imgToBase64 } from "@/utils/function";
import { setObjToUrlParams } from '@renderer/utils/urlTool';


const url = ref('');
const visible = ref(false)
const form = reactive({
    title: "Taylor Swift - You're Losing Me (From The Vault)",
    type: "",
    quality: "",
    size: "100.35MiB",
    time: "00:00",
    thumbnail: ""
})
const activeName = ref('mp3');
const tabs = reactive([]);
const options = reactive([])
const choiceId = ref('251');
const loading = ref(false);
const page = reactive({
    s: 10,
    n: 1,
    q: ""
})
const downloadList = reactive<YoutubeDownloadTask[]>([

])

const activeItem = reactive<YoutubeDownloadTask>({
    id: "",
    url: "",
    thumbnail: '',
    title: '',
    progress: 0,
    fileSize: '',
    remainingTime: '',
    duration: '',
    isLoading: false,
    local: "",
    info: "",
    ok: false,
    choiceId: "",
    ext: "",
    options: "[]"
})

const getList = () => {
    fetch(setObjToUrlParams(`http://localhost:3880/youtube/list`, page))
        .then(r => r.json())
        .then(res => {
            const { status, data, message } = res;
            if (status !== 200) {
                ElMessage.error(message);
                return;
            }
            downloadList.splice(0);
            Array.isArray(data) && Object.assign(downloadList, data.map(item => {
                return {
                    ...item,
                    remainingTime: "99:99",
                    isLoading: item.ok ? false : true,
                    info: item.ok ? '下载已完成' : "等待下载中...."
                }
            }))
            Object.assign(activeItem, downloadList[0] || {});
            console.log(res)
        })
}

const initList = () => {
    Object.assign(page, { s: 10, n: 1, q: "" });
    getList();
}

const selectOptions = computed(() => {
    return options.filter(item => item.tag === activeName.value)
})

const handleClick = () => {
    choiceId.value = ""
}

const changFormatId = (id) => {
    console.log(id, '选的', selectOptions);
    choiceId.value = id;
    form.size = selectOptions.value.find(item => item.id === id).size

}

const analysisUrl = () => {

    if (url.value == '') {
        ElMessage.info('please input search info!')
        return;
    }

    if (downloadList.some(item => item.url === url.value)) {
        ElMessage.info('任务已添加!')
        return;
    }
    loading.value = true
    window.videoApp.pubEvent('youtubeHandle', { conf: url.value, eventName: "analysisUrl" })
}

const confirmAdd = () => {
    const id = url.value.slice(url.value.indexOf('=') + 1) || url.value.split('/').pop();
    fetch(`http://localhost:3880/youtube/add`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...form,
            url: url.value,
            progress: 0,
            local: "",
            id,
            choiceId: insertAudioId(choiceId.value),
            fileSize: form.size,
            ok: false,
            options: JSON.stringify(options),
            ext: activeName.value,
            duration: form.time
        })
    }).then(r => r.json()).then(r => {
        let insertItem: YoutubeDownloadTask = {
            id,
            url: url.value,
            thumbnail: form.thumbnail,
            title: form.title,
            duration: form.time,
            progress: 0,
            isLoading: false,
            remainingTime: "0",
            local: "",
            info: "",
            ok: false,
            fileSize: form.size,
            choiceId: "",
            ext: activeName.value,
            options: JSON.stringify(options),
        };
        // downloadList.push(insertItem);
        Object.assign(activeItem, insertItem);
        initList();
        visible.value = false;
        ElMessage.success('add success!')
    }).catch(e => {
        ElMessage.error('add failed!')
    })

}


const insertAudioId = (choiceId: string) => {

    if (!choiceId) {
        return options[0].id;
    }
    if (activeName.value === 'mp3') {
        return choiceId;
    }
    const audioIds = options.filter(t => t.tag == 'mp3');
    return `${audioIds.at(-1).id}+${choiceId}`;
}

const editVideoForm = (item: YoutubeDownloadTask) => {
    console.log(item);
    Object.assign(activeItem, item);
    form.thumbnail = item.thumbnail;
    visible.value = true;
}

const startConvert = () => {
    if (options.length === 0) {
        ElMessage.warning('该网页没有下载选项!')
        return;
    }
    // console.log(insertAudioId(choiceId.value));
    // return;
    window.videoApp.pubEvent('youtubeHandle', { conf: { url: url.value, id: choiceId.value.includes('+') ? choiceId.value : insertAudioId(choiceId.value), title: form.title, ext: activeName.value }, eventName: "startDownload" })
}

const startDownload = (item: YoutubeDownloadTask) => {
    // if (options.length === 0) {
    //     ElMessage.warning('该网页没有下载选项!')
    //     return;
    // }
    // console.log(insertAudioId(choiceId.value));
    // return;
    Object.assign(activeItem, item);
    window.videoApp.pubEvent('youtubeHandle', { conf: { url: item.url, id: item.choiceId, title: item.title, ext: item.ext }, eventName: "startDownload" })
}

const createPlayWindow = (video) => {
    // const conf = {
    //     nm: video.title,
    //     id: video.url,
    //     fn: video.title,
    //     cv: video.thumbnail,
    //     url: `http://localhost:3880/youtube/local_video?p=${video.local}`,
    //     type: "localVideo"
    // }
    const conf = {
        id: "",
        nm: "测试用",
        url: "https://qhshenghuo.xyz/videos/7ce32c0363e1d4f393b55c53754d40b4fe43af3e/g.m3u8?h=d11925605f2a1ef",
        fn: "测试用",
        fr: "thePeP_226873",
        cv: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.gGwvPgS0ldsYOYM9eC4VqAHaE7',
        requestUrl: "haxi"
    }
    window.videoApp.pubEvent('createChildWindow', { name: "player", conf })
    console.log('Open video:', video);
}
const addToFavorites = (video) => {
    // Implement add to favorites logic
    console.log('Add to favorites:', video);
}
const deleteTask = (video: YoutubeDownloadTask) => {
    // Implement delete video logic
    console.log('Delete video:', video);
    ElMessageBox.confirm(`确定是否要删除${video.title} ?`, '操作提示', {
        type: "warning",
        confirmButtonText: "确 定",
        cancelButtonText: "取 消",
    }).then(() => {
        fetch(`http://localhost:3880/youtube/del?id=${video.id}`)
            .then(r => r.json())
            .then(res => { res.status === 200 ? Promise.all([ElMessage.success(res.message), initList()]) : ElMessage.error(res.message) })
            .catch((e) => { console.log(e), ElMessage.error('delete failed!') })
    }).catch()
}

const getProgressStatus = (code: boolean) => {
    switch (code) {
        case false:
            return "exception" as any;
        case true:
            return "success" as any;
        default:
            return "exception" as any;
    }
}

onBeforeMount(() => {

    getList();

    window.videoApp.addEventListener('youtubeHandle', (data: string) => {
        const { conf, eventName } = JSON.parse(data);

        switch (eventName) {
            case "analysisUrl": {
                let cache = [];
                tabs.splice(0);
                options.splice(0);
                conf.array.forEach(item => {
                    let tag = item.tag == 'audio only' ? 'mp3' : item.ext;
                    let tab = { value: tag, viewValue: tag }
                    !cache.includes(tab.value) && Promise.all([tabs.push(tab), cache.push(tab.value)])
                    options.push({ ...item, tag })
                })

                form.title = conf.title;
                form.time = conf.time

                imgToBase64(conf.thumbnail).then((res: string) => {
                    form.thumbnail = res
                })

                Object.assign(form, conf, { size: "0MB" })

                choiceId.value = "";

                if (cache.length) {
                    const first = cache.shift();
                    activeName.value = first;
                }
                loading.value = false;
                visible.value = true;
                return;
            }

            case "updatePercentage": {
                const { percent, info, url } = conf;
                activeItem.info = info;
                activeItem.progress = percent
                return;
            }
            case "downloadError": {
                activeItem.info = "下载失败!";
                return;
            }
            case "analysisError": {
                loading.value = false;
                ElMessage.error('系统读取网页失败,请检测地址和本地网络是否正确!');
                return;
            }
            case "downloadSuccess": {
                activeItem.progress = 100;
                activeItem.info = "下载成功!"
                activeItem.isLoading = false;
                const item = downloadList.find(item => item.id == activeItem.id);

                if (item) {
                    item.ok = true;
                    item.isLoading = false;
                    item.local = conf.local;
                }

                console.log(form, activeItem, item)
                fetch(`http://localhost:3880/youtube/${activeItem.id}`, {
                    method: "PATCH",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ok: true, local: conf.local })
                }).then(r => r.json()).then(r => {
                    console.log(r)
                })
                return;
            }
        }
    })
})

</script>

<style scoped lang='scss'>
.youtube-page {
    width: 100%;
    height: 100%;
    display: grid;
    // background: #f0cdcd;
    grid-template-rows: 10% 90%;

    header {
        display: flex;
        width: 80%;
        align-items: center;
        margin: 0 auto;

        .el-button {
            margin-left: 20px;
        }
    }

    .youtube-main {
        // background-color: #cff;
        overflow-y: scroll;
    }


}

.yt-download-item {
    display: flex;
    margin-bottom: 20px;

    .yt-thumbnail {
        img {
            max-width: 150px;
        }
    }

    .yt-details {
        flex-grow: 1;
        margin-left: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        padding: 10px;
        box-sizing: border-box;

        .yt-title {
            font-weight: bold;
        }

        .yt-progress {
            color: #3498db;
        }

        .yt-duration {
            margin-top: 5px;
        }

        .yt-actions {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            justify-content: space-around;
            margin-top: 5px;
            gap: 22px;

            .yt-action-icon {
                margin-right: 10px;
                cursor: pointer;
            }
        }

        .handle-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
    }
}
</style>