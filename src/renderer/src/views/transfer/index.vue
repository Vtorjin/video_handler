<template>
    <div class="padding">
        <div id="conversion-form" class="padding">
            <div>
                <label for="video-file">视频文件</label>
                <input type="text" readonly id="file-input" placeholder="选择视频文件" ref="inputRef">
            </div>
            <div>
                <label for="output-format">输出格式</label>
                <select id="output-format" name="output-format" v-model="confForm._vf">
                    <option value="default">保留原参数</option>
                    <option value="mp4">MP4</option>
                    <option value="avi">AVI</option>
                    <option value="flv">FLV</option>
                    <option value="mpg">MPG</option>
                    <option value="webm">WebM</option>
                </select>
            </div>

            <div>
                <label for="video-resolution">视频分辨率</label>
                <select id="video-resolution" name="video-resolution" v-model="confForm._vr">
                    <option value="default">保留原参数</option>
                    <option value="1920x1080">1920x1080</option>
                    <option value="1280x720">1280x720</option>
                    <option value="854x480">854x480</option>
                    <option value="720*1280">720*1280</option>
                    <option value="480x270">480x270</option>
                    <option value="270x480">270x480</option>
                </select>
            </div>

            <div>
                <label for="bitrate">比特率</label>
                <select id="bitrate" name="bitrate" v-model="confForm._vb">
                    <option value="default">保留原参数</option>
                    <option value="128">128 kbps</option>
                    <option value="256">256 kbps</option>
                    <option value="300">300 kbps</option>
                    <option value="400">400 kbps</option>
                    <option value="500">500 kbps</option>
                    <option value="600">600 kbps</option>
                    <option value="700">700 kbps</option>
                    <option value="800">800 kbps</option>
                    <option value="900">900 kbps</option>
                    <option value="1024">1024 kbps</option>
                </select>
            </div>

            <div>
                <label for="framerate">帧速率</label>
                <select id="framerate" name="framerate" v-model="confForm._vm">
                    <option value="default">保留原参数</option>
                    <option value="24">24 fps</option>
                    <option value="25">25 fps</option>
                    <option value="28">28 fps</option>
                    <option value="29">29 fps</option>
                    <option value="30">30 fps</option>
                    <option value="60">60 fps</option>
                </select>

            </div>
            <div>
                <label for="aspect-ratio">宽高比</label>
                <select id="aspect-ratio" name="aspect-ratio" v-model="confForm._vw">
                    <option value="default">保留原参数</option>
                    <option value="16:9">16:9</option>
                    <option value="9:16">9:16</option>
                    <option value="4:3">4:3</option>
                    <option value="3:4">3:4</option>
                </select>
            </div>

            <div>
                <label for="audio-bitrate">音频比特率</label>
                <select id="audio-bitrate" name="audio-bitrate" v-model="confForm._va">
                    <option value="default">保留原参数</option>
                    <option value="128">128 kbps</option>
                    <option value="256">256 kbps</option>
                    <option value="512">512 kbps</option>
                    <option value="1024">1024 kbps</option>
                </select>
            </div>

            <div>
                <label for="mute-audio">是否静音</label>
                <input type="checkbox" id="mute-audio" name="mute-audio"
                    style="min-width: 0; padding-left: 1em;margin-right: 1em;">是
            </div>

            <div class="flex-center" style="display: flex; align-items: center;">
                <el-button type="success" id="file-button" @click="openFile()" :icon="Plus" size="small">文件</el-button>
                <el-button type="primary" id="convert-button" @click="startConvert()" :icon="Refresh"
                    size="small">开始</el-button>
                <!-- <el-button type="danger" id="convert-button" @click="openOutFolder()" :icon="Folder"
                    size="small">输出目录</el-button> -->
                <el-button type="danger" id="convert-button" @click="setBatchQueue()" :icon="Folder"
                    size="small">批量转换</el-button>
            </div>


        </div>
        <table>
            <thead>
                <tr class="grid">
                    <th>序号</th>
                    <th>输出文件</th>
                    <th>源文件</th>
                    <th style="width:120px">进度</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody id="trans-list" ref="tbodyRef">
                <!-- 转换结果列表将在这里动态添加 -->
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { Folder, Plus, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { onMounted, ref, reactive, toRaw } from 'vue';

const $$ = (el) => Array.from(document.querySelectorAll(el))
const inputRef = ref<HTMLInputElement>()
const tbodyRef = ref<HTMLElement>();
const isProgressing = ref(false);
const confForm = reactive({
    _vf: "default",
    _vr: "default",
    _vb: "default",
    _vw: "default",
    _vm: "default",
    _va: "default",
})
const startConvert = () => {
    if (inputRef.value.value) {
        window.videoApp.pubEvent('convertHandle', {
            name: 'startConvert',
            val: {
                name: inputRef.value.value || "",
                conf: toRaw(confForm)
            }
        });

        Object.assign(confForm, {
            _vf: "default",
            _vr: "default",
            _vb: "default",
            _vw: "default",
            _vm: "default",
            _va: "default",
        });

        inputRef.value.value = "";
    } else if (tbodyRef.value.children.length) {
        if (isProgressing.value) return;
        isProgressing.value = true;
        // alert('批量开始哟!')
        window.videoApp.pubEvent('convertHandle', { name: 'startMultiTask' })
    } else {
        ElMessage.warning('请上传文件或者选择文件夹')
    }
}

const openFile = () => {
    window.videoApp.pubEvent('convertHandle', { name: "openFile" });
}

const openOutFolder = () => {
    window.videoApp.pubEvent('convertHandle', { name: "openOutFolder" });
}

const createTableContent = (data) => {
    const tbody = document.querySelector('tbody#trans-list') as HTMLTableElement;

    // tbody && 
    if (tbody) {
        tbody.innerHTML = "";
        data.forEach((item, index) => {
            const row = tbody.insertRow();

            row.classList.add('grid');
            row.style.cssText = `display: grid; grid-template-columns:60px 1fr 1fr 120px 200px; text-align: center;`;

            const cellIndex = row.insertCell();
            cellIndex.textContent = index + 1;

            const cellOutput = row.insertCell();
            cellOutput.textContent = item.output;
            cellOutput.setAttribute('title', item.output);
            cellOutput.style.cssText = `width:100%;height: 28px; text-align:center;overflow: hidden;text-overflow: ellipsis;`


            const cellOrigin = row.insertCell();
            cellOrigin.textContent = item.origin;
            cellOrigin.setAttribute('title', item.origin);
            cellOrigin.style.cssText = `width:100%;height: 28px;text-align:center; overflow: hidden;text-overflow: ellipsis;`



            const cellProcess = row.insertCell();
            cellProcess.textContent = "0";
            cellProcess.setAttribute('ptime', item.id)

            const cellActions = row.insertCell();

            const deleteButton = document.createElement('button');
            const startButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            startButton.textContent = "Start";
            cellActions.classList.add('handle-area')


            deleteButton.addEventListener('click', () => {
                deleteRow(row.getAttribute('time')); // 自定义的删除行函数，根据需要实现
            });

            startButton.addEventListener('click', () => {
                window.videoApp.pubEvent('startTransferByName', JSON.stringify(item))
            })

            row.setAttribute('time', item.id);
            cellActions.appendChild(deleteButton);
            cellActions.appendChild(startButton);
        });
    }

}

const setBatchQueue = () => {
    window.videoApp.pubEvent('convertHandle', { name: "openMultiFiles" })
}

function deleteRow(id) {
    console.log(id);
}




onMounted(() => {
    var resolutions = $$("#video-resolution option")
    var bites = $$("#bitrate option")
    var frameRates = $$("#framerate option")
    var audioBitRates = $$("#audio-bitrate option")
    var aspectRatios = $$("#aspect-ratio option")
    var outFormats = $$('#output-format option');

    // 监听上传事件
    window.videoApp.addEventListener('initVideoParams', (d) => {
        let data = JSON.parse(d);
        console.log(data)
        let { name, _va, _vb, _vf, _vw, _vr, _vm } = data;

        if (name && inputRef.value) {
            inputRef.value.value = name;
            _va = Math.ceil(eval(_va));
            _vb = Math.ceil(eval(_vb) / 1024);
            _vm = Math.ceil(eval(_vm));
            _vw = _vw

            // 帧速率
            if (frameRates.find(r => r.value == _vm)) {
                confForm._vm = _vm;
            } else {
                frameRates[0].innerText = `原始参数:${_vm}`
            }

            // 分辨率
            if (resolutions.find(r => r.value == _vr)) {
                confForm._vr = _vr;
            } else {
                resolutions[0].innerText = `原始参数:${_vr}`
            }

            // 比特率
            if (bites.find(r => r.value == _vb)) {
                confForm._vb = _vb;
            } else {
                bites[0].innerText = `原始参数:${_vb}`
            }

            // 音频比特率
            if (audioBitRates.find(r => r.value == _va)) {
                confForm._va = _va;
            } else {
                audioBitRates[0].innerText = `原始参数:${_va}`
            }

            // 宽高比
            if (aspectRatios.find(r => r.value == _vw)) {
                confForm._vw = _vw;
            } else {
                aspectRatios[0].innerText = `原始参数:${_vw}`
            }

            if (outFormats.find(r => r.value == name.split('.').pop())) {
                confForm._vf = _vf;
            }

        }
    })

    // 监听更新进度事件
    window.videoApp.addEventListener('updateTransferProcess', (d) => {
        let data = JSON.parse(d);
        let { id, percentage } = data;
        let el = document.querySelector(`td[ptime="${id}"]`) as HTMLElement;
        if (el) {
            el.innerText = percentage + " %"
        }
    })

    // 监听更新列表事件
    window.videoApp.addEventListener('updateTransferList', (d) => {
        let data = JSON.parse(d);
        sessionStorage.setItem('transfer', d);
        createTableContent(data);
        if (tbodyRef.value.childNodes.length === 0) {
            isProgressing.value = false;
        }
    })


    sessionStorage.getItem('transfer') && createTableContent(JSON.parse(sessionStorage.getItem('transfer')))
})

</script>

<style scoped lang="scss">
.container {
    max-width: 100%;
    margin: 0 auto;
    padding: 20px;
}

.form-group {
    margin-bottom: 10px;
}

#conversion-form {
    display: grid;
    gap: 12px 6px;
    grid-template-columns: repeat(3, 1fr);
}

#conversion-form>div {
    display: flex;
    align-items: center;
    /* justify-content: space-between; */
    margin: 1rem 0;
}

#conversion-form>div>label {
    display: flex;
    width: 120px;
}

label {
    display: block;
    /* 将每个 label 放在一个新行 */
    font-weight: bold;
    /* 设置字体加粗 */
}

select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    text-indent: 0.01px;
    text-overflow: '';
}



select,
input {

    padding: 10px;
    border: 1px solid #ccc;
    /* 添加边框 */
    border-radius: 5px;
    /* 圆角边框 */
    box-sizing: border-box;
}

/* 添加自定义样式 */
input,
select {
    /* width: 360px; */
    min-width: 180px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    color: #333;
    font-size: 14px;
}

#file-input {
    min-width: 240px;
    width: calc(100% - 130px);
}

table {
    width: 100%;
    margin-top: 20px;
    border-collapse: collapse;
}

table,
th,
td {
    border: 1px solid #ccc;
}

th,
td {
    padding: 10px;
    text-align: center;
}

th {
    background-color: #f0f0f0;
}

td {
    color: #fff;
}

td button {
    padding: 5px 10px;
    margin: 0 10px;
}


.grid {
    display: grid;
    grid-template-columns: 60px calc((100% - 380px) / 2) calc((100% - 380px) / 2) 120px 200px;
    text-align: center;
}

.overflow {
    max-width: calc((100% - 380px) / 2);
    height: 28px;
}




#file-button {
    // background-color: #8ff162c4;
    color: #fff;
    padding: 10px;
    margin-top: 20px;
    border: none;
    cursor: pointer;
}

#convert-button {
    // background-color: #3498db;
    color: #fff;
    padding: 10px;
    margin-top: 20px;
    border: none;
    cursor: pointer;
}

#file-input,
#output-format,
#video-resolution,
#bitrate,
#framerate,
#aspect-ratio,
#audio-bitrate {
    height: 28px;
    line-height: 28px;
    padding: 0 10px;
}
</style>