<script setup lang="ts">
import { reactive } from 'vue'

const versions = reactive({
  electron: "",
  chrome: "",
  node: "",
  v8: ""
})
</script>

<template>
  <ul class="versions">
    <li class="electron-version">Electron v{{ versions.electron }}</li>
    <li class="chrome-version">Chromium v{{ versions.chrome }}</li>
    <li class="node-version">Node v{{ versions.node }}</li>
    <li class="v8-version">V8 v{{ versions.v8 }}</li>
  </ul>
  <p><span>主进程渲染进程通信:</span> <el-button type="primary"> 获取版本信息</el-button></p>
</template>
