import { createApp } from "vue";
import App from "./App.vue";
// element plus
// import ElementPlus from "element-plus";
// reset style sheet
import "@/styles/reset.scss";
// CSS common style sheet
import "@/styles/common.scss";
// iconfont css
import "@/assets/iconfont/iconfont.scss";
// font css
import "@/assets/fonts/font.scss";
// element css
// import "element-plus/dist/index.css";
// element dark css
// import "element-plus/theme-chalk/dark/css-vars.css";
// custom element dark css
// import "@/styles/element-dark.scss";
// custom element css
// import "@/styles/element.scss";
// svg icons
import "virtual:svg-icons-register";

import "./assets/css/styles.css";

// element icons
import * as Icons from "@element-plus/icons-vue";
// custom directives
import directives from "@/directives/index";
// vue Router
import router from "@/routers";
// vue i18n
import I18n from "@/languages/index";
// pinia store
import pinia from "@/stores";
// errorHandler
import errorHandler from "@/utils/errorHandler";


import "./assets/css/Dplayer.css"
import "./assets/js/Flv.js";
import "./assets/js/Hls.js";
import "./assets/js/WebTorrent.js"
import "./assets/js/Dplayer.js";


import Youtube from "@/components/Youtube/index.vue"


const app = createApp(App);
app.config.errorHandler = errorHandler;

// windo


// register the element Icons component
Object.keys(Icons).forEach(key => { app.component(key, Icons[key as keyof typeof Icons]) });

app.component('Youtube',Youtube);


app.use(directives).use(router).use(I18n).use(pinia).mount("#app");
