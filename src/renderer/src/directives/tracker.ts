import { ObjectDirective } from 'vue';
// import TrackManager from '@renderer/lib/monitor/utils/trackManager';
import getSelector from '@renderer/lib/monitor/utils/getSelector';

export const tracker: ObjectDirective = {
    mounted(el: any, binding: any) {
        if (binding.value) {
            //这里参数是根据自己业务可以自己定义
            const params = {
                url: binding.value.url,
                type: "PV&UV",
                title: binding.value.title,
                // preUrl:binding.value.preUrl,
                triggerMethod: binding.value.triggerType,
                // businesscode:binding.value.businessCode, 
                behavior: binding.value.behavior,
                selector: getSelector(el as HTMLElement),
                // service: "xxx" //chenjianwe101 ［24 hours ago］·feat：添加定义指令
            }
            if (binding.value.triggerType === "browse") {
                console.log('browse', params);//1清用后台接口保存数据
            } else if (binding.value.triggerType === 'click') {
                el.addEventListener('click', () => {
                    console.log(params)
                    // TrackManager.getInstance().send(params);
                }, true); //调用后台搜口保存数据
            }


            //api.eventTrach.saveEventTrack(params); });
        }
    },
    updated() {

    }
}