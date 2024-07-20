<template>
  <v-footer app dense>
    <v-btn :icon="mdiStop" class="ml-2" :disabled="isStopDisabled" @click="onStop" />
    <level-meter :total-bars="30" :expected-max-level="0.5" :gap-percentage="15" :peak-hold-time="1000" :style="{ height: '5px' }" />
    <v-btn :icon="mdiCog" class="ml-2" @click="emit(`show-settings`)" />
  </v-footer>
</template>

<script setup lang="ts">
import { mdiCog, mdiStop } from '@mdi/js'

const isStopDisabled = computed(() => !useFbdPlayer().isPlaying.value)
const emit = defineEmits(['show-settings'])
const onStop = () => useFbdPlayer().stop()

</script>
