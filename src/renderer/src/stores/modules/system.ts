import { defineStore } from "pinia";
import piniaPersistConfig from "@/stores/helper/persist";
import { isKeyObject } from "util/types";

let timer: NodeJS.Timeout | null = null;
export const useSystemStore = defineStore({
    id: "geeker-system",
    state(): SystemStore {
        return {
            appSetting: {
                workerTotal: 6,
                processTotal: 1,
                sp: "",
                op: "",
                compress: "",
                uf: "",
                q: "",//压缩质量
                ap: false,
                iq: 1,
                cp: false,
                cs: "0", //自定义下载
                lp: true,
                vq: "default",
                sep: "\\",
                coverFolder: "",
                apiKey: "sk-NYsoG3VBKDiTuvdtC969F95aFc4f45379aD3854a93602327",
                apiUrl: "https://key.wenwen-ai.com/v1",
                yt: ""
            },
        }
    },
    actions: {
        initConf() {
            window.videoApp.pubEvent('initSysConf');
            window.videoApp.addEventListener('systemSetting', (data: string) => {
                Object.assign(this.appSetting, JSON.parse(data))
            })
        },
        copyInput(key: "apiKey" | 'apiUrl', value: string) {
            this[key] = value;
            // console.log(value, key)
            // if (timer) {
            //     clearTimeout(timer);
            // }
            // timer = setTimeout(() => {
            window.videoApp.pubEvent('systemSetting', { key, value });
            // })
        }


    },
    // persist: piniaPersistConfig("geeker-system")
})