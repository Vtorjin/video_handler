type Stability = "stability"
type UserCollection = "user_collection"
export type TrackerType = Stability | UserCollection;

type AppError = "app-error";

export type TrackerInfoType = "JsError" | "sourceError" | "TcpError" | "PV&UV"
export type ErrorType = "promise-Error" | "execute-Error" | "script-Error" | "link-Error" | "img-Error" | "iframe-Error" | "a-Error"
export type XHREventType = "load" | "error"
export type TriggerMethod = "click" | "scroll" | "touchstart" | "mousedown" | "keydown" | "mouseover" | "contextmenu" | "focus" | "blur" | "other"
export type TrackerAllTypes = BasicTrackerInfo | GlobalErrorTracker | AppErrorTracker | UVTracker | PVTracker

export interface SystemInfo {
    uniq_code: string,
    browserName: string
    browserVersion: string
    osName: string
    osVersion: string
    deviceName: string
}

export interface BasicTrackerInfo {
    title: string,
    url: string
    platform: string
}

export interface GlobalErrorTracker {
    kind: TrackerType,
    type: TrackerInfoType,
    errorType?: ErrorType
    message: string
    fileName?: string
    position: string
    stack?: string //堆栈信息
    selector: string  //dom元素
    src?: string
    triggerMethod: TriggerMethod,
    time: Date
}

export interface XhrTracker {
    method: string
    path: string | URL,
    async?: boolean,
    kind: TrackerType,
    type: TrackerInfoType,
    eventType?: XHREventType,
    params?: string,
    status?: number;
    body?: XMLHttpRequestBodyInit | Document | null
    duration: number,
    response?: string,
    [key: string]: any
}

export interface AppErrorTracker {
    message?: string,
    selector?: string
    kind: TrackerType,
    type: AppError
    fileName?: string
    position?: string
    stack?: string
    triggerMethod: TriggerMethod,
    time: Date | string | number,
    info: string
}

export interface UVTracker {
    url: string,
    type: TrackerInfoType,
    title: string
    triggerMethod: TriggerMethod,
    behavior?: string,
    selector?: string
}

export interface PVTracker {
    from: string,
    to: string,
    stayTime: number,
    kind: UserCollection,
    type: "pv"
}

export interface PerformanceTracker {
    // first paint
    fp: number | string
    // first meaningful paint
    fmp: number | string
    // first content paint
    fcp: number | string
    // Largest Contentful Paint
    lcp: number | string
    // Time to Interactive
    tti: number | string
    load: number | string
    dcl: number | string

}