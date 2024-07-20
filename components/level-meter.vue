<template>
  <div class="level-meter">
    <div
      v-for="n in totalBars" :key="n"
      class="bar"
      :class="{ active: n <= level, 'peak-hold': n === peakHold }"
      :style="barStyle" />
  </div>
</template>

<script lang="ts" setup>

interface Props {
  totalBars?: number
  gapPercentage?: number
  peakHoldTime?: number
  expectedMaxLevel?: number
}

const props = withDefaults(defineProps<Props>(), {
  totalBars: 30,
  gapPercentage: 10,
  peakHoldTime: 1000,
  expectedMaxLevel: 1.0,
})

const barStyle = computed(() => ({
  'width': `${100 / props.totalBars}%`,
  '--bar-content-width': `${100 - props.gapPercentage}%`,
}))

const totalBars = computed(() => props.totalBars)

const { level, peakHold } = useAudioLevelMeter(totalBars, props.peakHoldTime, props.expectedMaxLevel)

useFbdPlayer().addEventListener((ev) => {
  switch (ev.type) {
    case 'stop':
      stop()
      break
  }
})
</script>

<style scoped lang="scss">

.level-meter {
  display: flex;
  align-items: flex-end;
  width: 100%;
  background-color: rgb(var(--v-theme-surface));
}
.bar {
  height: 100%;
  position: relative;
}
.bar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--bar-content-width);
  background-color: rgb(var(--v-theme-surface-light));
  transition: background-color 0.1s ease;
}
.bar.active::before {
  background-color: rgb(var(--v-theme-surface-bright))
}
.bar.peak-hold::before {
  background-color: rgb(var(--v-theme-surface-variant));
}
</style>