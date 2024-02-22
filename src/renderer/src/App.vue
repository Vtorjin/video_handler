<template>
  <el-config-provider :locale="locale" :size="assemblySize" :button="buttonConfig">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider, ElMessage } from "element-plus";
import { onMounted, reactive, computed, onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
import { getBrowserLang } from "@/utils";
import { useTheme } from "@/hooks/useTheme";
import { LanguageType } from "./stores/interface";
import { useGlobalStore } from "@/stores/modules/global";
import { useSystemStore } from "./stores/modules/system";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { registerCrawlerAndDownloadEvent } from "./hooks/api";


const globalStore = useGlobalStore();
const system = useSystemStore()

// init theme
const { initTheme } = useTheme();
initTheme();

// init language
const i18n = useI18n();


onMounted(() => {
  const language = globalStore.language ?? getBrowserLang();
  i18n.locale.value = language;
  globalStore.setGlobalState("language", language as LanguageType);
  system.initConf();
  registerCrawlerAndDownloadEvent();
  window.videoApp.addEventListener('showHandleResult', (data: string) => {
  
    const { type, message }: { type: "success" | 'error', message: string } = JSON.parse(data);
    console.log(message,'xxxx')
    ElMessage[type](message);
  })
});
Promise.all([globalStore.initVideoConf(), globalStore.initJSFiles()]);
// element language
const locale = computed(() => {
  if (globalStore.language == "zh") return zhCn;
  if (globalStore.language == "en") return en;
  return getBrowserLang() == "zh" ? zhCn : en;
});
// element assemblySize
const assemblySize = computed(() => globalStore.assemblySize);
// element button config
const buttonConfig = reactive({ autoInsertSpace: false });

</script>

<style lang="scss" scoped></style>