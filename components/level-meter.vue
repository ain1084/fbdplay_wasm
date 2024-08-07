<template>
  <div class="level-meter">
      <div
      v-for="n in totalBars" :key="n"
      class="bar"
      :class="{ active: n <= level, 'peak-hold': n === peakHold }"
      :style="barStyle" />
    <div class="db-value">-{{ formattedDecibels }}db
    </div>
  </div>
</template>

<script lang="ts" setup>

interface Props {
  totalBars?: number
  gapPercentage?: number
  peakHoldTime?: number
  expectedMaxAmplitude?: number
}

const props = withDefaults(defineProps<Props>(), {
  totalBars: 30,
  gapPercentage: 10,
  peakHoldTime: 1000,
  expectedMaxAmplitude: 1.0,
})

const barStyle = computed(() => ({
  'width': `${100 / props.totalBars}%`,
  '--bar-content-width': `${100 - props.gapPercentage}%`,
}))

const totalBars = computed(() => props.totalBars)
const peakHoldTime = computed(() => props.peakHoldTime)
const expectedMaxAmplitude = computed(() => props.expectedMaxAmplitude)
const formattedDecibels = computed(() => {
  if (decibels.value === undefined) {
    return '--'
  }
  const num = -decibels.value
  return num < 10.0 ? num.toFixed(1) : Math.floor(num).toString()
})
const { level, peakHold, decibels } = useAudioLevelMeter({ totalBars, peakHoldTime, expectedMaxAmplitude })
</script>

<style scoped lang="scss">
.level-meter {
  display: flex;
  align-items: flex-end;
  width: 100%;
  background-color: rgb(var(--v-theme-surface));
  transform: translate(0, 50%);
}

.bar {
  height: 100%;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: var(--bar-content-width);
    background-color: rgb(var(--v-theme-surface-light));
    transition: background-color 0.1s ease;
  }

  &.active::before {
    background-color: rgb(var(--v-theme-surface-bright));
  }

  &.peak-hold::before {
    background-color: rgb(var(--v-theme-surface-variant));
  }
}

.db-value {
  align-self: center;
  font-family: "DSEG7-Modern", "Fira Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  white-space: nowrap;
  font-size: 0.75rem;
  padding: 0rem 0.5rem;
}
</style>
