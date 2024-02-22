import { App, ComponentPublicInstance, } from "vue";
import { AppErrorTracker } from "../interface/tracker.interface";
import getExtraInfo from '../utils/getPageInfo';
import TrackManager from "../utils/trackManager";

// vue内使用
export function setupAppMonitor(app: App<Element>) {
    app.config.errorHandler = function (err: any, instance: ComponentPublicInstance | null, info: string) {
        const { id, classList, nodeName } = instance?.$el || {};
        let fileName = "", colno = 0, line = 0;
        let matchResult = err.stack.match(/at\s+(.+):(\d+):(\d+)/);
        let selector = "";
        if (matchResult) {
            fileName = matchResult[1];
            colno = matchResult[2];
            line = matchResult[3];
        }
        if (instance && instance.$el) {
            selector = `${nodeName}${id ? ('#' + id) : ''}${classList ? ('.' + Array.from(classList).join('.')) : ''}`
        }

        let tracker: AppErrorTracker = {
            message: err?.message,
            selector,
            ...getExtraInfo(),
            kind: 'stability',
            type: "app-error",
            fileName,
            position: `${line}行${colno}列`,
            info,
            triggerMethod: "click",
            time: Date.now()
        }

        console.log(tracker);

        TrackManager.getInstance().send(tracker)
    }
}