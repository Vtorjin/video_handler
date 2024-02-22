<template>
    <div class='system'>
        <el-form class="em2" :model="store.appSetting" label-width="150px" style="width:70vw;">
            <el-form-item label="自动播放">
                <el-switch v-model="store.appSetting.ap" active-text="开启" inactive-text="关闭"
                    @change="saveSettingHandle('ap', $event)" />
            </el-form-item>
            <el-form-item label="openAi密钥">
                <el-input v-model="store.appSetting.apiKey" size="small" placeholder="右键直接粘贴即可"
                    @change="store.copyInput('apiKey', $event)"></el-input>
            </el-form-item>

            <el-form-item label="openAi请求地址">
                <el-input v-model="store.appSetting.apiUrl" size="small" placeholder="右键直接粘贴即可"
                    @change="store.copyInput('apiUrl', $event)"></el-input>
            </el-form-item>
 
            <el-form-item label="TS文件下载路径" class="custom-form-item">
                <div class="flex-start" style="width: 100%;">
                    <el-input v-model="store.appSetting.sp" size="small" readonly></el-input>
                    <el-button type="default" size="small" id="sp-btn"
                        @click="saveSettingHandle('sp', $event)">点击设置</el-button>
                </div>
            </el-form-item>
            <el-form-item label="视频文件输出路径" class="custom-form-item">
                <div class="flex-start" style="width: 100%;">
                    <el-input v-model="store.appSetting.op" size="small" readonly></el-input>
                    <el-button type="default" size="small" id="sp-btn"
                        @click="saveSettingHandle('op', $event)">点击设置</el-button>
                </div>
            </el-form-item>
            <el-form-item label="Youtube下载路径">
                <div class="flex-start" style="width: 100%;">
                    <el-input v-model="store.appSetting.yt" size="small" readonly></el-input>
                    <el-button type="default" size="small" id="sp-btn"
                        @click="saveSettingHandle('yt', $event)">点击设置</el-button>
                </div>
            </el-form-item>
            <el-form-item label="格式转换输出路径" class="custom-form-item">
                <div class="flex-start" style="width: 100%;">
                    <el-input v-model="store.appSetting.compress" size="small" readonly></el-input>
                    <el-button type="default" size="small" id="sp-btn"
                        @click="saveSettingHandle('compress', $event)">点击设置</el-button>
                </div>
            </el-form-item>
            <el-form-item label="线程最大数量" class="">
                <el-select v-model="store.appSetting.workerTotal" size="small" filterable clearable
                    @change="saveSettingHandle('workerTotal', $event)">
                    <el-option label="4" :value="4"></el-option>
                    <el-option label="8" :value="8"></el-option>
                    <el-option label="12" :value="12"></el-option>
                    <el-option label="16" :value="16"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="最大下载数量" class="">
                <el-select v-model="store.appSetting.processTotal" size="small"
                    @change="saveSettingHandle('workerTotal', $event)">
                    <el-option label="1" :value="1"></el-option>
                    <el-option label="2" :value="2"></el-option>
                    <el-option label="3" :value="3"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="下载结束操作">
                <el-select v-model="store.appSetting.cs" size="small" @change="saveSettingHandle('cs', $event)">
                    <el-option label="无" value=""></el-option>
                    <el-option label="立即关机" value="0"></el-option>
                    <el-option label="30分钟后关机" value="30"></el-option>
                    <el-option label="60分钟后关机" value="60"></el-option>
                    <el-option label="3小时候关机" value="180"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, reactive, onBeforeUnmount, onUnmounted, onMounted } from 'vue';
import { useSystemStore } from "@renderer/stores/modules/system";


const store = useSystemStore();

const registerSpSetting = () => {

}

const offSpSetting = () => {

}

const saveSettingHandle = (key: keyof AppSetting, value: Event | string | boolean | number) => {
    window.videoApp.pubEvent('systemSetting', { key, value });
}




onMounted(() => { })

</script>

<style lang='scss'  scoped>
#sp-btn,
#uf-btn {
    margin: 0 3rem;
}

.system {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
}
</style>