<template>
  <client-only>
    <v-app>
      <v-main>
        <content-list />
      </v-main>
      <v-footer app dense>
       <v-btn :icon="mdiCog" class="ml-2" @click="onShowSettings" />
      </v-footer>
        <settings-dialog v-model="showSettings" />
    </v-app>
  </client-only>
</template>

<script setup lang="ts">
import { mdiCog } from '@mdi/js'
import init from './rs_fbdplay/pkg/rs_fbdplay'

onMounted(async () => {
  await init()
})

const onShowSettings = () => {
  const _ = useSettings().sampleRate
  showSettings.value = true
}

const showSettings = ref(false)
</script>
