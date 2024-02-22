// 用户行为收集
export function injectPageViewCollect() {
    // // 监听popstate事件
    window.addEventListener("popstate", function (event) {
        console.log("popstate event:", event.state);
    });

    // 监听hashchange事件
    window.addEventListener("hashchange", function (event) {
        console.log("hashchange event:", window.location.hash, event);
    });

    // 改变浏览器历史记录状态
    // history.pushState({ pageId: 1 }, "Page 1", "/page-1");
    // location.hash = "#page-2";
}