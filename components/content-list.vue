<template>
  <v-list
    density="compact"
    color="primary"
    lines="two"
    @click:select="clickItem"
  >
    <v-list-item
      v-for="(item, i) in contents"
      :key="i"
      :value="item"
      :prepend-icon="mdiMusic"
      :title="item.title"
      :subtitle="item.name"
    />
  </v-list>
</template>
<script setup lang="ts">
import type { FbdContent } from "~/types/FbdContent";
import { mdiMusic } from "@mdi/js";

const { contents, start } = useFbdContent();
onMounted(async () => start());

const player = useFbdPlayer();
const clickItem = (args: { id: unknown }) => {
  const selectedItem = args.id as FbdContent;
  if (selectedItem) {
    player.play(selectedItem.data);
  }
};
</script>
