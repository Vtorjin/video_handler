<template>
    <div class="flex flex-col justify-center page-container">
        <div class="text-center">
            <img :src="notFoundImg" alt="" />
        </div>
        <div class="text-center">
            <h1 class="text-base text-gray-500">抱歉，你访问的页面不存在</h1>
            <button @click="goHome">回到首页</button>
        </div>
    </div>
</template>
  
<script lang="ts" setup>
import { useRouter } from 'vue-router';
import notFoundImg from "@renderer/assets/svg/404.svg"

const router = useRouter();
function goHome() {
    router.push('/');
}
</script>
  
<style lang="scss" scoped>
.page-container {
    width: 100%;
    border-radius: 4px;
    padding: 50px 0;
    height: 100vh;

    .text-center {
        h1 {
            color: #666;
            padding: 20px 0;
        }
    }

    img {
        width: 350px;
        margin: 0 auto;
    }
}
</style>
  