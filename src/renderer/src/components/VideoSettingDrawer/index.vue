<template>
    <el-drawer v-model="drawerSwitch" direction="ltr" id="setting-form-body">
        <template #header>
            <h4>视频设置</h4>
        </template>
        <template #default>
            <el-form :model="basicInfo" ref="loginFormRef" :rules="loginRules" label-width="120px" label-position="right"
                inline>
                <el-form-item label="视频地址">
                    <el-input v-model="basicInfo.ou" size="small" readonly v-copy="basicInfo.ou" />
                </el-form-item>
                <el-form-item prop="fn" label="视频名称">
                    <el-input v-model="basicInfo.fn" size="small"
                        :formatter="(value: string) => `${value}`.replace(/[::]+/g, '')" placeholder="请在视频设置里添加信息"
                        readonly />
                </el-form-item>
                <el-form-item label="演员">
                    <el-select v-model="basicInfo.ai" filterable size="small">
                        <el-option v-for="item in store.conf.actors" :value="item.value"
                            :label="item.viewValue"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="定时更新">
                    <el-radio-group v-model="basicInfo.ud">
                        <el-radio :label="false" size="small">否</el-radio>
                        <el-radio :label="true" size="small">是</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="保存方式">
                    <el-radio-group v-model="basicInfo.dl">
                        <el-radio :label="false" size="small">在线列表播放</el-radio>
                        <el-radio :label="true" size="small">本地下载</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="视频类型">
                    <el-checkbox-group v-model="basicInfo.tg">
                        <el-checkbox v-for="item in allTypes" :label="item.viewValue" name="tg"></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="视频地区">
                    <el-radio-group v-model="basicInfo.ar" filterable size="small">
                        <el-radio :label="item.value" v-for="item in store.conf.areas" size="large"> {{ item.viewValue
                        }}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="其他" prop="cv">
                    来源:&nbsp;{{ (basicInfo.lo + basicInfo.lp + basicInfo.ls).slice(0, 24) }}<br>
                    时间段:&nbsp;{{ JSON.stringify(basicInfo.tm).slice(0, 22) }}<br>
                    截图:&nbsp;{{ basicInfo.cv.slice(0, 24) || '暂无截图' }}<br>
                    Mu:&nbsp;{{ text && text.slice(0, 24) }}<br>
                    文件数量: &nbsp;{{ basicInfo.qs }}个
                </el-form-item>
            </el-form>
        </template>
        <template #footer>
            <div style="flex: auto">

                <el-button @click="cancelClick" type="default" size="small">关闭</el-button>
                <el-button type="primary" @click="checkForm(loginFormRef)" size="small">保存</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage, FormInstance, FormRules, } from 'element-plus'
import { createConfirmMessage } from "@renderer/utils";
import { drawerSwitch, cancelClick, confirmClick, basicInfo, text, resetData } from "@renderer/hooks/api";
import { useGlobalStore } from '@renderer/stores/modules/global';


const store = useGlobalStore();
const loginFormRef = ref<FormInstance>()
const allTypes = computed(() => {
    return [...store.conf.ages, ...store.conf.videoTypes]
})
const forbiddenXss = (rule: any, value: any, callback: Function): void => {
    rule = rule;
    if (/<script\b\S*>|document.createElement|setsttribute('type', 'text\/javascript')|<a \S*/gis.test(value)) { throw Error(); }
    callback();
}

const forbiddenSpecialCode = (rule: any, value: any, callback: Function): void => {
    rule = rule
    if (/[：:&%#$@;；￥%&]/gis.test(value)) { throw Error('输入特殊字符会导致生成文件失败!'); }
    callback();
}


let loginRules = reactive<FormRules>({
    fn: [
        { required: true, message: "请自定义视频名称", trigger: "blur" },
        { validator: forbiddenXss, message: "禁止输入非法内容!", trigger: "blur" },
        // { validator: forbiddenSpecialCode, trigger: "blur" }
    ],
    cv: [
        { required: true, message: "请先截个图!", trigger: "blur" },
    ]
})


const addSelectOption = (type: "add" | "edit" = "add") => {
    let clone = Object.assign({ tm: "", insertEl: "", cb: "", ci: '', md: "", text: text.value }, basicInfo);
    clone.md = clone.id + '.m3u8';
    clone.ci = clone.id + '.png';
    clone.tm = basicInfo.tm;
    delete clone.insertEl
    delete clone.cb
    console.log(clone, '保存的数据是', Object.keys(clone).length)
    fetch(`http://localhost:3880/video/add`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...clone, tg: clone.tg.join(',') })
    }).then(res => res.json()).then(e => {
        e.status === 200 && Promise.all([ElMessage.success('添加成功!'), resetData(), confirmClick()])
    })
}

const checkForm = (formEl: FormInstance | undefined) => {
    if (!formEl || !navigator.onLine) return;
    formEl.validate(async (valid) => {
        !!valid ? addSelectOption() : createConfirmMessage('操作提示:', "请填写正确的信息", {
            type: "warning",
            center: true,
            showCancelButton: false,
            confirmButtonText: "确认",
        })
    });
}

</script>

<style lang='scss' scoped>
p {
    margin: 0;
    padding: 0;
}

.custom-form-item {
    display: flex;
    align-items: center;
}

.custom-form-item .el-form-item__content {
    flex-wrap: nowrap;
    user-select: none;
}

.custom-select {
    width: 100%;
}

.timeInfo {
    color: var(--app-highlight-color)
}
</style>

<style lang="scss">
#setting-form-body {
    min-height: 270px;


    :deep(.el-drawer__body) {
        padding: 20px 0px !important;
    }
}
</style>