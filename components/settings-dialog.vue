<template>
  <v-dialog v-if="modelValue" activator="parent" @click:outside="close">
    <v-card title="Settings">
      <v-card-text>
        <v-card v-for="(category, i) in settings" :key="i" :title="category.title">
          <div v-for="(setting, j) in category.items" :key="j">
            <v-select
              v-if="setting.type === 'select'"
              v-model="setting.value.value"
              :label="setting.label"
              :items="setting.selects" />
            <v-slider
              v-else-if="setting.type === 'slider'"
              v-model="setting.value.value"
              thumb-label
              :label="setting.label"
              :step="setting.step"
              :min="setting.min"
              :max="setting.max" />
          </div>
        </v-card>
      </v-card-text>
      <v-card-actions>
        <v-btn text="Close" @click="close" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { PsgCrate } from '@/rs_fbdplay/pkg/rs_fbdplay'

const { modelValue } = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const close = () => emit('update:modelValue', false)

const { audioOutput, levelMeter } = useSettings()

type SettingItems = Readonly<
  {
    type: 'select'
    label: string
    selects: {
      title: string
      value: number | string | PsgCrate
    }[]
    value: Ref
  } | {
    type: 'slider'
    label: string
    min: number
    max: number
    step: number
    value: Ref
  }
>

type SettingCategory = Readonly<{
  title: string
  items: SettingItems[]
}>

const settings: SettingCategory[] = [
  {
    title: 'Audio Output',
    items: [
      {
        type: 'select',
        label: 'ClockRate Rate',
        selects: [
          { title: '2.0MHz', value: 2.0 },
          { title: '1.7897725MHz', value: 1.7897725 },
        ],
        value: audioOutput.clockRate,
      },
      {
        type: 'select',
        label: 'Sample Rate',
        selects: [
          { title: '44.1KHz', value: 44100 },
          { title: '48KHz', value: 48000 },
          { title: '88.2KHz', value: 88200 },
          { title: '96KHz', value: 96000 },
          { title: '192KHz', value: 192000 },
          { title: '250KHz', value: 250000 },
        ],
        value: audioOutput.sampleRate,
      },
      {
        type: 'select',
        label: 'PSG Crate',
        selects: [
          { title: 'PSG', value: PsgCrate.Psg },
          { title: 'PSG Lite', value: PsgCrate.PsgLite },
        ],
        value: audioOutput.psgCrate,
      },
      {
        type: 'select',
        label: 'Stream Type',
        selects: [
          { title: 'Timer', value: 'timer' },
          { title: 'Worker', value: 'worker' },
        ],
        value: audioOutput.streamType,
      },
    ],
  },
  {
    title: 'Level Meter',
    items: [
      {
        type: 'slider',
        label: 'Bars',
        min: 5,
        max: 240,
        step: 1,
        value: levelMeter.bars,
      },
      {
        type: 'slider',
        label: 'Peak Hold Time (ms)',
        min: 50,
        max: 4000,
        step: 50,
        value: levelMeter.peakHoldTime,
      },
    ],
  },
]
</script>
