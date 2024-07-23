<template>
  <div class="fixed-pitch">
    {{ position }}
  </div>
</template>
<script setup lang="ts">
const invalidPosition = '00:00:00.000'
let animationFrameId = 0

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
    const milliSeconds = String(date.getUTCMilliseconds()).padStart(3, '0')
    position.value = `${hours}:${minutes}:${seconds}.${milliSeconds}`
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
.fixed-patch {
  font-family: "Fira Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>
