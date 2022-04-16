<template>
  <svg :class="$attrs.class" aria-hidden="true">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  prefix?: string
  name: string
  color?: string
}>()

const symbolId = computed(
  () => `#${props.prefix ? `${props.prefix}-${props.name}` : props.name}`,
)
</script>
