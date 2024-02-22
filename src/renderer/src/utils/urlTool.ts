/*
 * @Author: LHL
 * @Date: 2022-11-28 15:50:44
 * @LastEditors: LHL
 * @LastEditTime: 2022-11-30 17:34:17
 * @FilePath: /scs-parking-web-v3/src/utils/urlUtils.ts
 * @Description:
 */

/**
 * 将对象添加当作参数拼接到URL上面
 * @param baseUrl 需要拼接的url
 * @param obj 参数对象
 * @returns {string} 拼接后的对象
 * 例子:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: Record<string, any>): string {
    let parameters = '';
    let url = '';
    for (const key in obj) {
        parameters += key + '=' + encodeURIComponent(obj[key]) + '&';
    }
    parameters = parameters.replace(/&$/, '');
    if (/\?$/.test(baseUrl)) {
        url = baseUrl + parameters;
    } else {
        url = baseUrl.replace(/\/?$/, '?') + parameters;
    }
    return url;
}

// 获取url中全部参数的对象
export function getUrlAllParams() {
    // 解决乱码问题
    return Object.fromEntries(new URLSearchParams(location.search))
}
