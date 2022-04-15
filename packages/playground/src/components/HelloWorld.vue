<template>
  <h1>{{ msg }}</h1>

  <p>
    Recommended IDE setup:
    <a href="https://code.visualstudio.com/" target="_blank">VS Code</a>
    +
    <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
  </p>

  <div>
    <div class="icon-wrap" v-for="icon in icons" :key="icon">
      <svg-icon class="icon" :name="icon" />
    </div>
  </div>

  <button type="button" @click="count++">count is: {{ count }}</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SvgIcon from './SvgIcon.vue'
import icons from 'virtual:svg-icons-names'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}

.icon-wrap {
  width: 100px;
  height: 100px;
}

.icon {
  width: 80px;
  height: 80px;
  fill: currentColor;
  color: #304455;
}

.icon:hover {
  color: brown;
}
</style>
