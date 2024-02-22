export function generateFirstLoadReport() {
    window.addEventListener('load', () => {
        var performanceData = window.performance.timing;
        var ttfb = performanceData.responseStart - performanceData.requestStart; // Time To First Byte
        var domLoadTime = performanceData.domContentLoadedEventEnd - performanceData.navigationStart; // DOM 加载时间
        var pageLoadTime = performanceData.loadEventEnd - performanceData.navigationStart; // 页面加载时间

        console.log({
            ttfb, domLoadTime, pageLoadTime
        })
    })
}