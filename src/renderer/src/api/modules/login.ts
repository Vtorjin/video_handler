import { Login } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import authMenuList from "@/assets/json/authMenuList";
import authButtonList from "@/assets/json/authButtonList";
import http from "@/api";

/**
 * @name 登录模块
 */
// 用户登录
export const loginApi = (params: Login.ReqLoginForm) => {
  return http.post<Login.ResLogin>(PORT1 + `/login`, params, { loading: false }); // 正常 post json 请求  ==>  application/json
  // return http.post<Login.ResLogin>(PORT1 + `/login`, params, { loading: false }); // 控制当前请求不显示 loading
  // return http.post<Login.ResLogin>(PORT1 + `/login`, {}, { params }); // post 请求携带 query 参数  ==>  ?username=admin&password=123456
  // return http.post<Login.ResLogin>(PORT1 + `/login`, qs.stringify(params)); // post 请求携带表单参数  ==>  application/x-www-form-urlencoded
  // return http.get<Login.ResLogin>(PORT1 + `/login?${qs.stringify(params, { arrayFormat: "repeat" })}`); // get 请求可以携带数组等复杂参数
};

// 获取菜单列表
export const getAuthMenuListApi = () => {
  // return http.get<Menu.MenuOptions[]>(PORT1 + `/menu/list`, {}, { loading: false });
  // 如果想让菜单变为本地数据，注释上一行代码，并引入本地 authMenuList.json 数据
  // window.process !== undefined && 
  // window.process === undefined && insert();
  insert();
  function insert() {
    authMenuList.data.splice(authMenuList.data.length - 1, 0,
       {
      "path": "/JSmodule/index",
      "name": "JSmodule",
      "component": "/JSmodule/index",
      "meta": {
        "icon": "Document",
        "title": "JS文件管理",
        "isLink": "",
        "isHide": false,
        "isFull": false,
        "isAffix": false,
        "isKeepAlive": true
      }
    });

    authMenuList.data.splice(4, 0, {
      "path": "/crawler/index",
      "name": "crawler",
      "component": "/crawler/index",
      "meta": {
        "icon": "SoldOut",
        "title": "网页调试",
        "isLink": "",
        "isHide": false,
        "isFull": false,
        "isAffix": false,
        "isKeepAlive": true
      }
    })

    authMenuList.data.splice(3, 0, 
      {
      "path": "/online/index",
      "name": "online",
      "component": "/online/index",
      "meta": {
        "icon": "Menu",
        "title": "在线列表",
        "isLink": "",
        "isHide": false,
        "isFull": false,
        "isAffix": false,
        "isKeepAlive": true
      }
    });


    authMenuList.data.splice(1, 0, {
      "path": "/download_m3u8/index",
      "name": "download_m3u8",
      "component": "/download_m3u8/index",
      "meta": {
        "icon": "Download",
        "title": "M3u8 下载",
        "isLink": "",
        "isHide": false,
        "isFull": false,
        "isAffix": false,
        "isKeepAlive": true
      }
    })
  }
  return authMenuList;
};

// 获取按钮权限
export const getAuthButtonListApi = () => {
  // return http.get<Login.ResAuthButtons>(PORT1 + `/auth/buttons`, {}, { loading: false });
  // 如果想让按钮权限变为本地数据，注释上一行代码，并引入本地 authButtonList.json 数据
  return authButtonList;
};

// 用户退出登录
export const logoutApi = () => {
  return http.post(PORT1 + `/logout`);
};
