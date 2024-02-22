import { defineStore } from "pinia";
import { GlobalState } from "@/stores/interface";
import { DEFAULT_PRIMARY } from "@/config";
import piniaPersistConfig from "@/stores/helper/persist";
import { getAppConf } from "@renderer/api/modules/config";
import { getJsList } from "@renderer/api/modules/jsfile";

export const useGlobalStore = defineStore({
  id: "geeker-global",
  // 修改默认值之后，需清除 localStorage 数据
  state: (): GlobalState => ({
    // 布局模式 (纵向：vertical | 经典：classic | 横向：transverse | 分栏：columns)
    layout: "vertical",
    // element 组件大小
    assemblySize: "default",
    // 当前系统语言
    language: null,
    // 当前页面是否全屏
    maximize: false,
    // 主题颜色
    primary: DEFAULT_PRIMARY,
    // 深色模式
    isDark: false,
    // 灰色模式
    isGrey: false,
    // 色弱模式
    isWeak: false,
    // 侧边栏反转
    asideInverted: false,
    // 头部反转
    headerInverted: false,
    // 折叠菜单
    isCollapse: false,
    // 菜单手风琴
    accordion: true,
    // 面包屑导航
    breadcrumb: true,
    // 面包屑导航图标
    breadcrumbIcon: true,
    // 标签页
    tabs: true,
    // 标签页图标
    tabsIcon: true,
    // 页脚
    footer: true,
    conf: {
      videoTypes: [
        { value: "2012", viewValue: "动作" },
        { value: "2013", viewValue: "喜剧" },
        { value: "2014", viewValue: "动漫" },
        { value: "2015", viewValue: "记录" },
        { value: "2016", viewValue: "体育" },
      ],
      domains: [],
      areas: [
        { value: "2012", viewValue: "德国" },
        { value: "1693069317924", viewValue: "日本" },
        { value: "2014", viewValue: "新西兰" },
        { value: "2015", viewValue: "加拿大" },
        
      ],
      actors: [],
      ages: []
    },
    address: [
      { name: "樱花", href: 'https://www.yinhuadm.cc/', icon: "", startId: 1000, pathname:"/p/$$-2-1.html",origin:"https://www.yinhuadm.cc",
      path: "https://www.yinhuadm.cc/p/$$-2-1.html", js: `window._tool&& window._tool.initConf({fr:'[樱花动漫]_ ' + location.pathname.split('/').find(t => t.includes('-'))?.split('.')?.shift() + ' ',nm: document.title.slice(0, document.title.indexOf('在线播放'))},'.player-box-main');`, id: 1 },
      { name: "腾讯", href: 'https://v.qq.com/', icon: "", startId: 1000, id: 2, path: "" },
      { name: "爱奇艺", href: "https://www.iqiyi.com/", icon: "", startId: 1000, id: 3, path: "" }
    ]
  }),
  getters: {},
  actions: {
    // Set GlobalState
    setGlobalState(...args: ObjToKeyValArray<GlobalState>) {
      this.$patch({ [args[0]]: args[1] });
    },

    // initVideoConf
    initVideoConf() {
      var me = this;

      if (localStorage.getItem('conf')) {
        me.conf = JSON.parse(localStorage.getItem('conf'))
        console.log(me.conf, '????')
      } else {
        me.refreshVideoConf();
      }
    },

    refreshVideoConf() {
      var me = this;
      getAppConf().then(res => {
        me.conf = {
          videoTypes: [],
          domains: [],
          areas: [],
          actors: [],
          ages: []
        };
        res.forEach(conf => {
          const { confId, actor, type, host, area, age } = conf;
          !!actor && me.conf.actors.push({ value: confId, viewValue: actor });
          !!type && me.conf.videoTypes.push({ value: confId, viewValue: type });
          !!host && me.conf.domains.push({ value: confId, viewValue: host });
          !!age && me.conf.ages.push({ value: confId, viewValue: age });
          !!area && me.conf.areas.push({ value: confId, viewValue: area });
        })

        localStorage.setItem('conf', JSON.stringify(me.conf))
        console.log(me.conf)
      })
    },

    initJSFiles() {
      getJsList().then(res => {
        // console.log(res);
        this.address.splice(0);
        Object.assign(this.address, res.filter(i => !i.href.includes('localhost')));
      }).catch(e => { })
    }

  },
  persist: piniaPersistConfig("geeker-global")
});
