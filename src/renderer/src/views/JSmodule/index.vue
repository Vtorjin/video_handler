<template>
    <div id="js-manage-page">
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick" type="card">
            <el-tab-pane label="JS列表" name="first" class="demo-image">
                <div class="js-block pointer" v-for="item in list" :title="item.name" @click="gotoEditForm(item)">
                    <span class="demonstration  "> {{ item.name }}</span>
                    <el-image
                        style="display: flex;  justify-content: center;  width: 80px;  height: 45px; align-items: center; max-height: 100px;"
                        :src="item.icon" fit="fill"><template #error> <img src="@renderer/assets/images/folder.png" alt="">
                        </template>
                    </el-image>
                </div>
                <div class="js-block pointer" style="padding: 0; justify-content: center;" @click="activeName = 'second'">
                    <el-image
                        style="display: flex;  justify-content: center; max-width: 100px;  min-height: 50px; align-items: center; max-height: 100px;"
                        src="/src/assets/images/symbol-plus.jpg" fit="fill"><template #error> <img
                                src="@renderer/assets/images/folder.png" alt="">
                        </template>
                    </el-image>
                </div>
            </el-tab-pane>
            <el-tab-pane label="文件操作" name="second">
                <el-form ref="jsFormRef" :model="form" label-position="right" label-width="100px"
                    style="width:100% ;margin: 10px;display: grid; grid-template-columns: repeat(2,1fr);" inline>
                    <el-form-item label="文件名稱:">
                        <el-input v-model="form.name"></el-input>
                    </el-form-item>
                    <el-form-item label="所屬域名:">
                        <el-select v-model="form.belong" filterable clearable>
                            <el-option v-for="item in globalStore.conf.domains" :value="item.value"
                                :label="item.viewValue"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="文件後綴:">
                        <el-input v-model="form.suffix"></el-input>
                    </el-form-item>
                    <el-form-item label="網站圖標:">
                        <el-input v-model="form.icon" @contextmenu="pasteUrl('icon')"></el-input>
                    </el-form-item>
                    <el-form-item label="網址地址:">
                        <el-input v-model="form.href" @contextmenu="pasteUrl('href')"></el-input>
                    </el-form-item>
                    <el-form-item label="替换Origin:">
                        <el-input v-model="form.origin" @contextmenu="pasteUrl('origin')"></el-input>
                    </el-form-item>
                    <el-form-item label="替换Path:">
                        <el-input v-model="form.pathname" @contextmenu="pasteUrl('pathname')"></el-input>
                    </el-form-item>
                    <el-form-item label="是否动态地址">
                        <el-radio-group v-model="form.isDynamic">
                            <el-radio :label="true">是</el-radio>
                            <el-radio :label="false">否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="开始id">
                        <el-input v-model="form.startId"></el-input>
                    </el-form-item>

                    <el-form-item label="文件内容:">
                        <el-input v-model="form.js" type="textarea" class="fix-input"
                            style="  height: 30vh; min-height: 200px;" @contextmenu="pasteUrl('js')"></el-input>
                    </el-form-item>
                </el-form>
                <div class="flx-center">
                    <el-button type="info" @click="reset()">重 置</el-button>
                    <el-button type="danger" @click="deleteFile">刪 除</el-button>
                    <el-button type="warning" @click="editForm">修 改</el-button>
                    <el-button type="primary" @click="saveForm">保 存</el-button>
                </div>
            </el-tab-pane>
            <el-tab-pane label="網絡圖片轉Base64" name="third" class="flx-center" style="height: 100%;">
                <div class="img-content">
                    <header class="flx-center">
                        <el-input v-model="input" placeholder="請輸入文本" style="min-width: 400px;margin:2rem 1rem;"
                            @click="pasteAddr" @contextmenu="pasteAddr"></el-input>
                        <el-button type="primary" @click="startConvert">開始轉換</el-button>
                    </header>
                    <main>
                        <p>輸出結果是:</p>
                        <hr style="margin:10px auto">
                        <textarea class="output" @click="copyImage" :value="textContent"
                            style="user-select: none;">  </textarea>
                    </main>
                </div>
            </el-tab-pane>
            <!-- <el-tab-pane label="动态网址" name="fourth">
                <header><el-button type="warning">一键更新</el-button></header>
                <main>
                    <li v-for="item in filter">
                        name: {{ item.name }}
                    </li>
                </main>
            </el-tab-pane> -->
            <el-tab-pane label="标签管理" name="tags ">
                <el-form :model="tagForm" label-position="right" label-width="100">
                    <el-form-item label="视频Host:">
                        <el-input v-model="tagForm.host"></el-input>
                    </el-form-item>
                    <el-form-item label="种类:">
                        <el-input v-model="tagForm.type"></el-input>
                    </el-form-item>
                    <el-form-item label="演员:">
                        <el-input v-model="tagForm.actor"></el-input>
                    </el-form-item>
                    <el-form-item label="国家:">
                        <el-input v-model="tagForm.area"></el-input>
                    </el-form-item>
                    <el-form-item label="人物类型:">
                        <el-input v-model="tagForm.age"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button :icon="Refresh" @click="resetTagForm">重置</el-button>
                        <el-button :icon="Plus" type="primary" @click="saveTagForm">添加</el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup lang='ts'>
import { ref, onMounted, reactive, toRaw } from 'vue';
import { ElMessage, TabsPaneContext, FormInstance } from 'element-plus'
import { useHandleData } from "@/hooks/useHandleData";
import { getJsList, udpJsFile, addFile, deleteFileApi, addTag } from '@renderer/api/modules/jsfile';
import { useGlobalStore } from "@/stores/modules/global";
import { Plus, Refresh } from '@element-plus/icons-vue';

const globalStore = useGlobalStore();
const jsFormRef = ref<FormInstance>();
const form = reactive<JSFile.JSEdit>({
    id: "",
    belong: "",
    suffix: "",
    href: "",
    icon: "",
    js: "",
    name: "",
    startId: 0,
    origin: "",
    pathname: "",
    isDynamic: false
})
const tagForm = reactive<JSFile.TagsForm>({
    id: "",
    host: '',
    actor: '',
    type: '',
    area: '',
    age: ''
})


const activeName = ref('first')
const input = ref('')
const list = reactive<JSFile.JSEdit[]>([]);
const filter = reactive<JSFile.JSEdit[]>([]);
const init = () => {
    getJsList().then(res => { list.splice(0); filter.splice(0); Object.assign(list, res); Object.assign(filter, list.filter(t => (!t.belong.includes('localhost') && t.isDynamic))); console.log(list) })
}

const handleClick = (tab: TabsPaneContext, event: Event) => {
    console.log(tab.active, event)
    if (tab.active) return;
    reset();
}

const gotoEditForm = (item: JSFile.JSEdit) => {
    Object.assign(form, item);
    activeName.value = "second";
}

const textContent = ref('');

const copyImage = () => {
    if (textContent.value == '') return;
    navigator.clipboard.writeText(textContent.value).then(() => ElMessage.success('复制成功!'))
}

const reset = () => {
    console.log('存储过程')
    Object.assign(form, {
        id: "",
        belong: "",
        suffix: "",
        href: "",
        icon: "",
        js: `
        var timer = setInterval(() => {
        var t = document.querySelector('')?.textContent
        var el = '#bofang_box'
        if (t && document.querySelector(el)) {
            window._tool && window._tool.initConf({
                fr: '云宝宝视频_' + + location.pathname.split('/')[5] + ' ',
                nm: t
            }, el);
            clearInterval(timer);
            timer = null;
         }
        }, 50)`,
        name: "",
        origin: "",
        pathname: "",
        isDynamic: false,
        startId: 0
    })
    textContent.value = "";
    input.value = ""
}



const editForm = () => {
    udpJsFile(form.id, form).then(res => {
        res.status == 200 ? Promise.all([ElMessage.success(res.message), reset(), init()]) : ElMessage.error(res.message)
    })
}

const saveForm = () => {
    addFile(toRaw(form)).then(res => {
        res.status == 200 ? Promise.all([ElMessage.success(res.message), reset(), init()]) : ElMessage.error(res.message)
    })
}

const resetTagForm = () => {
    Object.assign(tagForm, { id: "", host: '', actor: '', type: '', area: '', age: '' })
}

const saveTagForm = () => {
    addTag(toRaw(tagForm)).then(res => {
        res.status == 200 ? Promise.all([ElMessage.success(res.message), globalStore.refreshVideoConf(), resetTagForm()]) : ElMessage.error(res.message)
    })
}

const pasteAddr = () => {
    navigator.clipboard.readText().then(text => { input.value = text; })
}

const pasteUrl = (k: keyof JSFile.PasteKeys) => {
    navigator.clipboard.readText().then(text => { form[k] = text; })
}

const startConvert = async () => {
    if (input.value == '') return;
    try {
        const response = await fetch(input.value);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = function (e) {
            textContent.value = e.target.result.toString();
        };

        reader.readAsDataURL(blob);
    } catch (e) {

    }
}

const deleteFile = async () => {
    if (form.name === '') return;
    await useHandleData(deleteFileApi, form.id, `删除【${form.name}】文件`);
    reset();
    init();
}



onMounted(() => {
    init();
})

</script>

<style scoped lang='scss'>
#js-manage-page {
    height: 100%;

    :deep(.el-tabs__nav-scroll) {
        padding-left: 1em;
    }

    .output {
        width: 80vw;
        min-height: 400px;
    }

    :deep(.fix-input textarea) {
        height: 100%;
    }

    .demo-tabs {
        height: 100%;

        :deep(.el-tabs__content) {
            height: calc(100% - 55px);
            overflow-y: scroll;
        }
    }

    :deep(.el-form-item__content) {
        align-items: flex-start;
    }
}

.demo-image {
    width: 100%;
    overflow-y: scroll;

    display: grid;
    justify-content: space-around;
    gap: 20px 10px;
    grid-template-columns: repeat(6, 1fr);

    .js-block {
        padding: 20px 0;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-sizing: border-box;
        border: solid 1px var(--el-border-color);

        .demonstration {
            margin: 10px 0;
        }
    }

}
</style>