<template>
  <client-only>
    <v-app>
      <v-main>
        <content-list />
      </v-main>
      <v-footer app dense>
        <app-footer @show-settings="showSettings = true"/>
      </v-footer>
    </v-app>
    <settings-dialog v-model="showSettings" />
  </client-only>
</template>

<script setup lang="ts">
import init from './rs_fbdplay/pkg/rs_fbdplay'

onMounted(async () => {
  await init()
})

const showSettings = ref(false)

</script>
