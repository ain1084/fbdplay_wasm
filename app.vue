<template>
  <v-app>
    <v-main>
      <content-list />
    </v-main>
    <v-footer app dense>
      <v-btn :icon="mdiCog" class="ml-2" @click="showSettings = true" />
    </v-footer>
  </v-app>
  <settings-dialog v-model="showSettings" />
</template>

<script setup lang="ts">
import { mdiCog } from "@mdi/js";
import init from "./rs_fbdplay/pkg/rs_fbdplay";

onMounted(async () => {
  await init();
});

const showSettings = ref(false);
</script>
