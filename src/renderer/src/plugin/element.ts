import { App } from "vue";
import element from "element-plus";
import "../assets/css/styles.less"

export function setupElement(app: App<Element>) {
    const css = () => import("element-plus/dist/index.css");
    app.use(element)
    app.use(css);
}