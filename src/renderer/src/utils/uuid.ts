import * as UID from "uuid";
import FingerprintJS from '@fingerprintjs/fingerprintjs'
// import TrackManager from "@renderer/lib/monitor/utils/trackManager";

export const macID = "";

export const initUniqueCode = () => {
    try {
        FingerprintJS.load().then(fp => {
            fp.get().then(result => {
                const visitorId = result.visitorId;
                console.log('获取设备唯一标识：', visitorId);
                // TrackManager.init('/api/tarcker', visitorId);
            });
        });
    } catch (e) {

    }
}

export const createUUID = () => {
    return UID.v1()
}