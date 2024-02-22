import FingerprintJS from '@fingerprintjs/fingerprintjs'
import TrackManager from "@renderer/lib/monitor/utils/trackManager";
import { injectJsError, injectJsRejectionError } from "./inject/globalError"
 
import { injectPageViewCollect } from './inject/userCollect';
import { injectXHR } from './inject/xhrCollect';

function setupWindowMonitor() {
 
    FingerprintJS.load().then(fp => {
        fp.get().then(result => {
            const visitorId = result.visitorId;
            console.log('获取设备唯一标识：', visitorId);
            TrackManager.getInstance().init('/api/tracker', visitorId);
            injectJsError();
            injectJsRejectionError();
            injectPageViewCollect();
            injectXHR();
        });
    });
}

setupWindowMonitor();