
import { GlobalErrorTracker, ErrorType } from "../interface/tracker.interface";
import getLastEvent from "../utils/getLastEvent";
import getLines from "../utils/getLines";
import getSelector from "../utils/getSelector";
import getExtraInfo from "../utils/getPageInfo";
import TrackManager from "../utils/trackManager";

// 全局异常错错误注册
export function injectJsError() {
    //监听全局捕获的错误
    window.addEventListener('error', function (event: ErrorEvent) {
        //情误事件对象 console.log(event);
        let { lastEvent, triggerMethod } = getLastEvent();//最后一个交互事件
        let { filename, lineno, colno, message } = event;

        let logMessage: GlobalErrorTracker = {
            kind: 'stability',//监控指标的大类 
            type: 'JsError',//小类型 这是一个情误
            errorType: 'execute-Error',//OS执行错误 
            triggerMethod: triggerMethod, //触发方式
            message: message || "",//报错信息
            fileName: filename,//哪个文件报错了 
            position: `${lineno || 0}行${colno || 0}列`,
            stack: getLines(event?.error?.stack || ''),
            selector: '',//代表最后一个操作的元素 
            src: undefined,
            time: new Date()
        };
        let src = (event?.target as any)?.src || (event?.target as any)?.href || '';
        // computed selector
        if (src !== '') {
            let tag = (event.target as HTMLElement)?.nodeName || '';
            logMessage.src = src
            logMessage.type = "sourceError";
            logMessage.errorType = `${tag.toLocaleLowerCase()}-Error` as ErrorType;
            logMessage.selector = getSelector(event.target as HTMLElement);
            delete logMessage.fileName;
            delete logMessage.stack;
        } else {
            logMessage.selector = lastEvent ? getSelector(lastEvent.path || lastEvent?.composedPath()) : ""
        }

        TrackManager.getInstance().send({ ...logMessage, ...getExtraInfo() })
    }, false);

}

// 异步异常注册
export function injectJsRejectionError() {

    window.addEventListener('unhandledrejection', function (e: PromiseRejectionEvent) {
        let { reason } = e;
        let message: string = "";
        let filename: string = "";
        let line = 0;
        let column = 8;
        let stack = '';
        let { lastEvent, triggerMethod } = getLastEvent();//最后一个交互事件I 
        let selector = lastEvent ? getSelector(lastEvent.path || lastEvent?.composedPath()) : ''
        if (typeof reason === 'string') {
            message = reason;
        } else if (typeof reason === 'object') {
            if (reason?.stack) {
                message = reason.message
                let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
                filename = matchResult[1];
                line = matchResult[2];
                column = matchResult[3];
                stack = getLines(reason?.stack);
            }
        }

        // http请求失败是异步操作,在这个位置进行上报错误的处理
        // if (HttpManager.tracker !== null) {
        //     let tracker = HttpManager.tracker
        //     tracker = {
        //         ...tracker,
        //         ...getExtraInfo(),
        //         selector,
        //         triggerMethod,
        //         fileName: filename
        //     }
        //     HttpManager.tracker = null;
        //     // 请求异步操作上报
        //     TrackManager.getInstance().send(tracker);
        //     console.log('异步请求上报', tracker)
        //     return;
        // }

        let log: GlobalErrorTracker = {
            kind: 'stability',//监控指标的大类 
            type: 'JsError',//小类型 这是一个情误
            errorType: 'promise-Error',//OS执行错误 
            message,//报错信息
            fileName: filename,//哪个文件报错了 
            position: `${line}行${column}列`,
            stack,
            triggerMethod,
            selector,//代表最后一个操作的元素 
            time: new Date(),
        }

        console.log({
            ...log,
            ...getExtraInfo()
        });

        TrackManager.getInstance().send({ ...log, ...getExtraInfo() })
    }, true)
}