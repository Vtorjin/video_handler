export function getSystemInfo() {
    let userAgentStr = navigator.userAgent
    const browserReg = {
        Chrome: /Chrome\/[0-9.]+/i,
        IE: /compatible|MSIE/i,
        Firefox: /firefox\/[0-9.]+/i,
        Edge: /()(edge?\/[0-9.]+)/i,
        360: /360\/[0-9.]+/i,
        QQBrowser: /QQBrowser\/[0-9.]+/i,
        Opera: /Opera\/[0-9.]+/i,
        Safari: /(!chrome)(Safari\/[0-9.]+)/i,

    };

    const deviceReg = {
        Windows: /windows/i,
        Mac: /mac/i,
        iPhone: /iphone/i,
        iPad: /iPad/i,
        Android: /Android/i,
    }

    const userAgentObj = {
        browserName: '',    // 浏览器名称
        browserVersion: '', // 浏览器版本
        osName: '',         // 操作系统名称
        osVersion: '',      // 操作系统版本
        deviceName: '',     // 设备名称
    }

    for (let key in browserReg) {
        if (browserReg[key].test(userAgentStr)) {
            userAgentObj.browserName = key
            if (key === "Edge") {
                userAgentObj.browserVersion = userAgentStr.split('Edg/')[1].split(' ')[0]
            } else if (key === 'IE') {
                userAgentObj.browserVersion = userAgentStr.split('MSIE ')[1].split(' ')[1]
            } else if (key === 'Firefox') {
                userAgentObj.browserVersion = userAgentStr.split('Firefox/')[1]
            } else if (key === 'Opera') {
                userAgentObj.browserVersion = userAgentStr.split('Version/')[1]
            } else if (key === 'Safari' && userAgentStr.indexOf('Chrome') == -1) {
                userAgentObj.browserVersion = userAgentStr.split('Version/')[1].split(' ')[0]
            } else if (key === '360') {
                userAgentObj.browserVersion = ''
            } else if (key === 'QQBrowser') {
                userAgentObj.browserVersion = userAgentStr.split('Version/')[1].split(' ')[0]
            } else if (key === 'Chrome') {
                userAgentObj.browserVersion = userAgentStr.split('Chrome/')[1].split(' ')[0]
            } else {
                userAgentObj.browserVersion = "unknown"
            }
        }
    }

    for (let key in deviceReg) {
        if (deviceReg[key].test(userAgentStr)) {
            userAgentObj.osName = key
            if (key === 'Windows') {
                userAgentObj.osVersion = userAgentStr.split('Windows NT ')[1].split(';')[0]
                userAgentObj.deviceName = "PC"   
            } else if (key === 'Mac') {
                userAgentObj.osVersion = userAgentStr.split('Mac OS X ')[1].split(')')[0]
                userAgentObj.deviceName = "PC"   
            } else if (key === 'iPhone') {
                userAgentObj.osVersion = userAgentStr.split('iPhone OS ')[1].split(' ')[0]
                userAgentObj.deviceName = "IPhone"   
            } else if (key === 'iPad') {
                userAgentObj.osVersion = userAgentStr.split('iPad; CPU OS ')[1].split(' ')[0]
                userAgentObj.deviceName = "IPad"   
            } else if (key === 'Android') {
                userAgentObj.osVersion = userAgentStr.split('Android ')[1].split(';')[0]
                userAgentObj.deviceName = userAgentStr.split('(Linux; Android ')[1].split('; ')[1].split(' Build')[0]
            }
        }
    }

    return userAgentObj
}