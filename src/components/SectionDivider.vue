<template>
  <div :class="['relative my-6', wrapperClass]" role="separator" :aria-label="label">
    <div class="absolute inset-0 flex items-center" aria-hidden="true">
      <div class="w-full border-t border-neutral-200 dark:border-neutral-800"></div>
    </div>
    <div class="relative flex justify-center">
      <span class="bg-white dark:bg-neutral-950 px-3 text-xs font-medium uppercase tracking-wide
                   text-neutral-500 dark:text-neutral-400">
        {{ label }}
      </span>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ label?: string; sticky?: boolean }>(), {
  label: 'Results',
  sticky: false,
})
const wrapperClass = computed(() => [
  'relative my-6',
  props.sticky ? 'sticky top-0 z-10' : '',
])
</script>
