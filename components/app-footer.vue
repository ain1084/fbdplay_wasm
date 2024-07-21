<template>
  <v-footer app dense>
    <v-btn
      :icon="mdiStop"
      class="ml-2"
      :disabled="!useFbdPlayer().isPlaying"
      @click="useFbdPlayer().stop()" />
    <level-meter
      :total-bars="bars"
      :expected-max-amplitude="0.5"
      :gap-percentage="15"
      :peak-hold-time="peakHoldTime"
      :style="{ height: '5px' }" />
    <v-btn :icon="mdiCog" class="ml-2" @click="emit(`show-settings`)" />
  </v-footer>
</template>

<script setup lang="ts">
import { mdiCog, mdiStop } from '@mdi/js'

const emit = defineEmits(['show-settings'])

const { levelMeter: levelMeterSettings } = useSettings()
const bars = computed(() => levelMeterSettings.bars.value)
const peakHoldTime = computed(() => levelMeterSettings.peakHoldTime.value)

</script>
