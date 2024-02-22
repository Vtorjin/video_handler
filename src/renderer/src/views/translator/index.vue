<template>
    <div class="translator-page">
        <header>
            <div class="language-select">
                <label for="sourceLanguage">输入语言:</label>
                <select id="sourceLanguage">
                    <option value="en">英语</option>
                    <option value="zh">中文</option>
                    <option value="es">西班牙语</option>
                </select>
                <label for="sourceLanguage">输出语言:</label>
                <select id="targetLanguage">
                    <option value="en">英语</option>
                    <option value="zh">中文</option>
                    <option value="es">西班牙语</option>
                </select>
            </div>
            <button class="translate-button" @click="translate()">开始翻译</button>
        </header>
        <main>
            <div class="_left">
                <textarea name="" id="" cols="30" rows="10" placeholder="输入翻译的文本" ref="a" @change="handleClose"></textarea>
                <div class="close" v-show="show" @click="clearInput">X</div>
            </div>
            <div class="_right">
                <textarea class="textarea" name="" id="" cols="30" rows="10" placeholder="翻译内容展示区域" ref="b"></textarea>
              
            </div>
        </main>
        <el-button @click="router.push({path:'/window/index'})">调整</el-button>
    </div>
</template>

<script setup lang='ts'>
import { ref } from "vue";
import MD5 from "md5";
import { setObjToUrlParams } from "@renderer/utils/urlTool";
import { useRouter } from "vue-router";

const router = useRouter();
const show = ref(false)
const a = ref<HTMLTextAreaElement>();
const b = ref<HTMLTextAreaElement>();

const translate = () => {
    const value = a.value.value
    const appid = "20230524001688428";
    const key = "I4AXMKKxH6YML2N8bGws"
    const salt = new Date();
    const from = "zh"
    const to = "en"
    const sign = MD5(appid + value + salt + key)
    value && fetch(setObjToUrlParams('http://api.fanyi.baidu.com/api/trans/vip/translate', {
        from,
        to,
        sign,
        salt,
        appid,
        q: value
    })).then(r => r.json()).then(res => {
        console.log(res);
        const { trans_result: [data] } = res;
        b.value.value = data.dst

    })
}

const handleClose = () => {
    if (!!a.value.value) {
        show.value = true;
    }
}

const clearInput = () => {
    show.value = false;
    a.value.value = ""
    b.value.value = ""
}

</script>

<style scoped lang='scss'>
.translator-page {
    padding: 0 10px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: #f2f4fb;

    header {
        width: 60%;
        height: 40px;
        box-sizing: border-box;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        background-color: #f0f0f0;
        margin: 20px 0;

        .language-select {
            display: flex;
            align-items: center;
        }

        .language-select select {
            padding: 5px;
            margin-right: 10px;
        }

        .translate-button {
            background-color: #4CAF50;
            color: white;
            padding: 8px 16px;
            border: none;
            cursor: pointer;
        }
    }

    main {
        width: 80%;
        height: 80%;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        // display: flex;
    }

    ._left {
        position: relative;
        margin-right: 20px;

        textarea {
            width: 100%;
            height: 70%;
            max-height: 400px;
            background-color: #ffffff;
            padding: 10px;
        }


    }

    ._right {
        position: relative;
        margin-left: 20px;

        textarea {
            width: 100%;
            height: 70%;
            max-height: 400px;
            padding: 10px;
            background-color: rgba(169, 173, 204, .1);
        }
    }

    .close {
        position: absolute;
        right: 20px;
        top: 10px;
        cursor: pointer;
    }
}
</style>