import _conf from "~/config/default.json";
import { errorMsg } from "~/types/interface";

function setupGlobalVariable() {
    window[_conf.ipcRenderName].errorHandler(function (errMsg: errorMsg) {
        console.log(errMsg, '监听主进程的错误!Ls');
    })
}

setupGlobalVariable();