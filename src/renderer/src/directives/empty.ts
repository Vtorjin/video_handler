import { ObjectDirective } from 'vue';
import blank from "@renderer/assets/svg/emptylist.svg"
// <div v-empty="{ data:[], image:"empty.img" }">  </div>
export const emptyImage: ObjectDirective = {
    mounted(el: HTMLButtonElement, binding) {
        if (binding.value === undefined) {
            return;
        }
        const { data, image } = binding.value;
        if (Array.isArray(data) && data.length === 0) {
            el.style.backgroundImage = image ? image : blank;
        }
    },
};