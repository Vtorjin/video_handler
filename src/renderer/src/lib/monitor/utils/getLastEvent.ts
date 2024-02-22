import { TriggerMethod } from "../interface/tracker.interface";
let lastEvent: any;
let triggerMethod: TriggerMethod = "other";

["click", "scroll", "touchstart", "mousedown", "keydown", "mouseover", "contextmenu", "focus", "blur"].forEach((eventType) => {
    document.addEventListener(eventType, (event) => {
        lastEvent = event;
        triggerMethod = (eventType as TriggerMethod);
    }, {
        capture: true,//■获阶段段
        passive: true//默认不阻止默认事件
    });

})

export default function () {
    let tem: TriggerMethod = "other";
    tem = triggerMethod;
    triggerMethod = "other";
    return {
        lastEvent,
        triggerMethod: tem
    };
}