<template>
  <v-dialog v-if="modelValue" activator="parent" @click:outside="close">
    <v-card title="Settings">
      <v-card-text>
        <v-container>
          <v-select
            v-for="(select, i) in selects"
            :key="i"
            v-model="select.value.value"
            :label="select.label"
            :items="select.items"
          />
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn text="Close" @click="close" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { PsgCrate } from "@/rs_fbdplay/pkg/rs_fbdplay";

const { modelValue } = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const close = () => emit("update:modelValue", false);

const { clockRate, sampleRate, psgCrate } = useSettings();

const selects = [
  {
    label: "Clock Rate",
    items: [
      { title: "2.0MHz", value: 2.0 },
      { title: "1.7897725MHz", value: 1.7897725 },
    ],
    value: clockRate,
  },
  {
    label: "Sample Rate",
    items: [
      { title: "44.1KHz", value: 44100 },
      { title: "48KHz", value: 48000 },
      { title: "88.2KHz", value: 88200 },
      { title: "96KHz", value: 96000 },
      { title: "192KHz", value: 192000 },
      { title: "250KHz", value: 250000 },
    ],
    value: sampleRate,
  },
  {
    label: "PSG Crate",
    items: [
      { title: "PSG", value: PsgCrate.Psg },
      { title: "PSG Lite", value: PsgCrate.PsgLite },
    ],
    value: psgCrate,
  },
];
</script>
