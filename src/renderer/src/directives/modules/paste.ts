/**
 * v-paste
 * 复制某个值至剪贴板
 * 接收参数：string类型/Ref<string>类型/Reactive<string>类型
 */
import type { Directive, DirectiveBinding } from "vue";
import { ElMessage } from "element-plus";
interface ElType extends HTMLElement {
    pasteData: string | number;
    __handleClick__: any;
}
const paste: Directive = {
    mounted(el: ElType, binding: DirectiveBinding) {
        el.addEventListener("contextmenu", function (e) {
            e.preventDefault();
            handleClick(this, binding);
        });
        el.pasteData = binding.value;
    },
    updated(el: ElType, binding: DirectiveBinding) { el.pasteData = binding.value; },
    beforeUnmount(el: ElType) { el.removeEventListener("click", el.__handleClick__); }
};

async function handleClick(ctx: any, binding: DirectiveBinding) {
    try {
        const text = await navigator.clipboard.readText();
        console.log(text, ctx)
        ctx.pasteData = text;
        const el = ctx.querySelector('input') || ctx.querySelector('textarea') || null;
        if (!el) return;
        el.value = text;
        binding.value.cb(text);
    } catch (err) {
        console.error("复制操作不被支持或失败: ", err);
    }
    // ElMessage({ type: "success", message: "粘贴成功" });
}

export default paste;
