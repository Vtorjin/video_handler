import { XhrTracker, XHREventType } from "../interface/tracker.interface";

interface XhrProto extends XMLHttpRequest {
    logMessage?: XhrTracker
}

export function injectXHR() {
    let XMLHttpRequest = window.XMLHttpRequest;

    let oldOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function open(method: string, url: string | URL, async?: boolean): void {
        var context: XhrProto = this as XhrProto;
        var _url = String(url);
        context.logMessage = {
            method,
            path: url,
            async,
            duration: 0,
            kind: "stability",
            type: "TcpError",
        };
        context.logMessage.params = _url.indexOf('?') !== -1 ? _url.slice(_url.indexOf('?')) : '';
        return oldOpen.apply(this, [...arguments] as any);
    }

    let oldSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
        var context: XhrProto = this as XhrProto;
        let startTime = Date.now();
        let handler = function (e: Event) {
            let status = context.status
            if (status >= 500 && context.logMessage !== undefined) {
                let duration = Date.now() - startTime;
                context.logMessage = {
                    ...context.logMessage,
                    body: body,
                    duration,
                    status,
                    eventType: e.type as XHREventType,
                    response: context.response ? JSON.stringify(context.response) : ""
                }

                console.log(duration, '市场', e.type, context.logMessage)
            }
            delete context.logMessage;
        }
        // context.addEventListener('load', handler, false);
        // context.addEventListener('error', handler, false);
        // context.addEventListener('abort', handler, false);
        context.onerror = handler;
        context.onload = handler
        return oldSend.apply(this, [...arguments] as any);
    }
}