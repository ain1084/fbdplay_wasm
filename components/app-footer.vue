<template>
  <v-footer app dense class="container">
    <v-btn
      class="item fixed"
      :icon="mdiStop"
      :disabled="!useFbdPlayer().isPlaying.value"
      @click="useFbdPlayer().stop()" />
    <current-position class="ml-2"/>
    <level-meter
      class="item flexible"
      :total-bars="bars"
      :expected-max-amplitude="0.5"
      :gap-percentage="15"
      :peak-hold-time="peakHoldTime"
      :style="{ height: '5px' }" />
    <v-btn class="item fixed" :icon="mdiCog" @click="isShowSettings = true" />
    <settings-dialog v-model="isShowSettings" class="item fixed" />
  </v-footer>
</template>

<script setup lang="ts">
import { mdiStop, mdiCog } from '@mdi/js'

const isShowSettings = ref(false)

const { levelMeter: levelMeterSettings } = useSettings()
const bars = computed(() => levelMeterSettings.bars.value)
const peakHoldTime = computed(() => levelMeterSettings.peakHoldTime.value)
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 1rem;
}
.item.fixed {
  flex: 0 0 auto;
}
.item.flexible {
  flex: 1;
}
</style>
