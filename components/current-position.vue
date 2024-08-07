<template>
  <div class="fixed-pitch">
    {{ position.substring(0, 8) }}
    <span class="millisec">{{ position?.substring(8) }}</span>
  </div>
</template>
<script setup lang="ts">
let animationFrameId = 0

const invalidPosition = '00:00:00.000'
const position = ref(invalidPosition)

const update = () => {
  const date = useFbdPlayer().getPosition()
  if (date === undefined) {
    position.value = invalidPosition
  }
  else {
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    const seconds = String(date.getUTCSeconds()).padStart(2, '0')
    const milliSeconds = date.getUTCMilliseconds()
    position.value = `${hours}:${minutes}:${seconds}${milliSeconds >= 500 ? '' : '.'}${String(milliSeconds).padStart(3, '0')}`
  }
  animationFrameId = requestAnimationFrame(update)
}

useFbdPlayer().addEventListener((ev) => {
  switch (ev.type) {
    case 'start':
      animationFrameId = requestAnimationFrame(update)
      break
    case 'stop':
      cancelAnimationFrame(animationFrameId)
      position.value = invalidPosition
      break
  }
})
</script>

<style type="scss" scoped>
.fixed-pitch {
  font-family: "DSEG7-Modern", "Fira Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.75rem;
}
.millisec {
  font-size: 0.6rem;
}
</style>
