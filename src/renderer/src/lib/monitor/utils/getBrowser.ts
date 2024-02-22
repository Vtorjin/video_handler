export function getBrowserInfo() {
    var userAgent = navigator.userAgent;
    console.log('??')
    if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
        return userAgent.match(/Opera\/[0-9.]+/i)?.pop() || "opera";
    } else if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1) {
        return userAgent.match(/ie\/[0-9.]+/i)?.pop() || "ie";
    } else if (userAgent.match(/edg/gi)) {
        return userAgent.match(/edge?\/[0-9.]+/i)?.pop() || "edge";
    } else if (userAgent.indexOf("Firefox") > -1) {
        return userAgent.match(/firefox\/[0-9.]+/i)?.pop() || "firefox";
    } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1) {
        return userAgent.match(/safari\/[0-9.]+/i)?.pop() || "safari";
    } else if (userAgent.indexOf("Chrome") > -1) {
        console.log('chrome')
        return userAgent.match(/chrome\/[0-9.]+/i)?.pop() || "chrome";
    } else if (!!(window as any).ActiveXObject || "ActiveXObject" in window) {
        return 'IE>=11';
    } else {
        return 'Unkonwn';
    }
}

