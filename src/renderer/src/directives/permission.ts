import { ObjectDirective } from 'vue';
import { useUserStore } from '@renderer/stores/modules/user';

export const permission: ObjectDirective = {
    mounted(el: HTMLButtonElement, binding) {
        if (binding.value === undefined) {
            return;
        }
        const { effect } = binding.value;

        const hasPermission = useUserStore().hasButtonPermission;

        if (!hasPermission) {
            if (effect === 'disabled') {
                el.disabled = true;
                el.style['disabled'] = 'disabled';
                el.classList.add('n-button--disabled');
            } else {
                el.remove();
            }
        }
    },
};
