<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName" :fill="color"/>
  </svg>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  name: { type: String, required: true },
  className: { type: String, default: '' },
  color: { type: String, default: '' }
})
const iconName = computed(() => `#icon-${props.name}`)
const svgClass = computed(() => 'svg-icon ' + props.className)
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  vertical-align: middle;
}
</style>