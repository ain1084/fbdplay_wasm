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

const { contents, start: startFetchContent } = useFbdContent()
onMounted(async () => {
  await startFetchContent()
})

useFbdPlayer().addEventListener((ev) => {
  switch (ev.type) {
    case 'stop':
      console.log(`stopped (frames: ${ev.frames})`)
      break
    case 'underrun':
      console.log(`underrun (frames: ${ev.frames})`)
      break
  }
})

let reentrant = false
const clickItem = async (args: { id: unknown }) => {
  if (reentrant) {
    return
  }
  reentrant = true
  const selectedItem = args.id as FbdContent
  if (selectedItem) {
    await useFbdPlayer().play(selectedItem.data)
  }
  reentrant = false
}
</script>
