import { ipcRenderer, contextBridge } from "electron";
import _conf from "~/config/default.json";
import { errorMsg } from "~/types/interface.node";
import { join } from "path";

contextBridge.exposeInMainWorld(_conf.ipcRenderName, {
  createChildWindow() {
    ipcRenderer.invoke("createChildWindow", ...arguments);
  },
  errorHandler(cb: Function) {
    ipcRenderer.on("errorHandler", (e: Event, msg: errorMsg) => {
      console.log(e);
      cb(msg);
    })
  },
  pubEvent(tag: string, data?: string | object | undefined) {
    ipcRenderer.invoke(tag, JSON.stringify(data) || '{}');
  },
  addEventListener(tag: string, cb: Function = () => { }) {

    ipcRenderer.on(tag, (e: Event, msg: string) => {

      try {
        cb(msg)
      } catch (e) {
        console.log({ tag, msg })
      }
    })

  },
  preloadFile: join(__dirname, 'webview.js'),
})




/**==functionArea==**/
