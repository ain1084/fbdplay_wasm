<template>
  <v-list density="compact" color="primary" lines="two" @click:select="clickItem">
    <v-list-item
      v-for="(item, i) in contents"
      :key="i"
      :value="item"
      :prepend-icon="mdiMusic"
      :title="item.title"
      :subtitle="item.name" />
  </v-list>
</template>
<script setup lang="ts">
import type { FbdContent } from '~/types/FbdContent'
import { mdiMusic } from '@mdi/js'
import type { StopEvent, UnderrunEvent } from '@ain1084/audio-worklet-stream'
import type { PlayerContext } from '@/composables/useFbdPlayer'

const { contents, start } = useFbdContent()
onMounted(async () => start())

let playerContext: PlayerContext | null = null
let reentrant = false

const { createContext } = useFbdPlayer({
  stop: (ev: StopEvent) => {
    console.log(`stopped (framePos: ${ev.frames})`)
  },
  underrun: (ev: UnderrunEvent) => {
    console.log(`underrun (frames: ${ev.frames})`)
  },
})

onUnmounted(() => playerContext?.stop())

const clickItem = async (args: { id: unknown }) => {
  if (reentrant) {
    return
  }
  reentrant = true
  await playerContext?.stop()
  playerContext = null
  const selectedItem = args.id as FbdContent
  if (selectedItem) {
    playerContext = await createContext(await useSettings().createAudioStreamFactory(), selectedItem.data)
  }
  reentrant = false
}
</script>
