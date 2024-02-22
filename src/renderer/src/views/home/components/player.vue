<template>
    <div id="VideoPlayer"></div>
    <div class="handle">
        <button @click="patchingUrl">补充地址</button>
        <button @click="sniffing">嗅探网页</button>
        <button>直接播放</button>
        <button @click="playFlv">flv格式</button>

    </div>
    <!-- .handle -->
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue';

let dom = ref<any>(null);

const patchingUrl = () => {
    if (dom && dom.value.value) {
        dom.value.value = dom.value.value.includes('.m3u8') ? dom.value.value : dom.value.value + '/index.m3u8'

        new window.DPlayer({
            container: document.querySelector('#VideoPlayer'),
            theme: '#4C8FE8',
            volume: 1.0,
            preload: 'auto',
            // logo: logo,
            autoplay: true,
            video: {
                url: dom.value.value,
                // pic: pics,
                type: 'auto'
            }
        })
    }
}

const sniffing = (e) => {
    dom.value && fetch(`http://localhost:3880/angular/sniffing?origin=${dom.value.value}`)
        .then(res => res.json()).then(res => {
            if (typeof res.data === 'string' && res.data.includes('.m3u8')) {
                e.target.style.backgroundColor = "#fff";
                new window.DPlayer({
                    container: document.querySelector('#VideoPlayer'),
                    theme: '#4C8FE8',
                    volume: 1.0,
                    preload: 'auto',
                    // logo: logo,
                    autoplay: true,
                    video: {
                        url: res.data,
                        // pic: pics,
                        type: 'auto'
                    }
                })
            }
        }).catch(() => {
            e.target.style.backgroundColor = "red";
            console.log(e)
        })
}

const playFlv = () => {
    dom.value && new window.DPlayer({
        container: document.querySelector('#VideoPlayer'),
        theme: '#4C8FE8',
        volume: 1.0,
        preload: 'auto',
        // logo: logo,
        autoplay: true,
        video: {
            url: `./output.flv`,
            type: 'flv'
        },
        lang: 'zh-cn' // 设置语言为简体中文
    })
}

onMounted(() => {
    dom.value = document.querySelector('input.search-input');
})

</script>

<style scoped lang='scss'>
#VideoPlayer {
    width: 100%;
    height: calc(100% - 40px);
}

.handle {
    display: flex;
    height: 40px;
    background-color: aquamarine;
    justify-content: flex-start;
    align-items: center;

    button {
        margin: 0 0.5em;

        &:nth-child(odd) {
            background-color: #ffff;
            padding: 4px;
            border-radius: 4px;
        }

        &:nth-child(even) {
            border: 1px solid #ffff;
            padding: 4px;
            border-radius: 4px;
        }
    }
}
</style>