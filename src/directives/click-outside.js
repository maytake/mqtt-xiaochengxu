// v-click-outside 自定义指令，支持 Vue 3
export default {
  mounted(el, binding) {
    el.__clickOutsideHandler__ = function(event) {
      // 判断点击目标是否在 el 内部
      if (!el.contains(event.target)) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.__clickOutsideHandler__, true);
  },
  unmounted(el) {
    document.removeEventListener('click', el.__clickOutsideHandler__, true);
    delete el.__clickOutsideHandler__;
  }
}; 