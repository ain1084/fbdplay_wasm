use std::cell::UnsafeCell;

use fbd_sequencer::{DataAccessor, PlayContext, PsgTrait, Sequencer};
use js_sys::Uint8Array;
use tinyaudio::{run_output_device, BaseAudioOutputDevice, OutputDeviceParameters};
use wasm_bindgen::prelude::*;

mod wrapper_psg;
mod wrapper_psg_lite;

struct Uint8FbdAccessor(Uint8Array);

impl Uint8FbdAccessor {
    pub fn new(array: Uint8Array) -> Self {
        Self(array)
    }
}

impl DataAccessor for Uint8FbdAccessor {
    fn read_byte(&self, index: u16) -> u8 {
        self.0.get_index(index as u32)
    }
    fn read_short(&self, index: u16) -> u16 {
        (self.0.get_index(index as u32) as u16) | ((self.0.get_index(index as u32 + 1) as u16) << 8)
    }
}

#[wasm_bindgen]
pub struct FbdPlayer {
    #[allow(dead_code)]
    data_accessor: UnsafeCell<Uint8FbdAccessor>,
    sequencer: Option<Sequencer<'static>>,

    #[allow(dead_code)]
    psg: UnsafeCell<Box<dyn PsgTrait>>,
    player: Option<PlayContext<'static>>,
    producer: direct_ring_buffer::Producer<f32>,
    device: Option<Box<dyn BaseAudioOutputDevice>>,
}

#[wasm_bindgen]
pub enum PsgCrate {
    Psg,
    PsgLite,
}

#[wasm_bindgen]
impl FbdPlayer {
    #[wasm_bindgen(constructor)]
    pub fn new(
        data: Uint8Array,
        clock_rate_mhz: f32,
        sample_rate_hz: f32,
        psg_crate: PsgCrate,
        buffer_size_ratio: u32,
    ) -> Self {
        let data_accessor = UnsafeCell::new(Uint8FbdAccessor::new(data));
        let sequencer = Sequencer::new(unsafe { &*data_accessor.get() });
        let clock_rate = (clock_rate_mhz * 1_000_000.0) as u32;
        let sample_rate = sample_rate_hz as u32;

        let psg: UnsafeCell<Box<dyn PsgTrait>> = UnsafeCell::new(match psg_crate {
            PsgCrate::Psg => Box::new(wrapper_psg::PsgWrapper::new(clock_rate, sample_rate)),
            PsgCrate::PsgLite => {
                Box::new(wrapper_psg_lite::PsgWrapper::new(clock_rate, sample_rate))
            }
        });
        let player = sequencer.play(unsafe { (*psg.get()).as_mut() });

        let sample_buffer_count = sample_rate * buffer_size_ratio / 100;
        let (producer, mut consumer) =
            direct_ring_buffer::create_ring_buffer::<f32>(sample_buffer_count as usize);

        let device = run_output_device(
            OutputDeviceParameters {
                channels_count: 1,
                sample_rate: sample_rate as usize,
                channel_sample_count: sample_buffer_count as usize,
            },
            move |buf| {
                let buf_len = buf.len();
                let written = consumer.read_slices(
                    |input, offset| {
                        buf[offset..offset + input.len()].copy_from_slice(input);
                        input.len()
                    },
                    Some(buf_len),
                );
                // web_sys::console::log_1(&JsValue::from("readed"));
                buf[written..].fill(f32::default());
            },
        )
        .unwrap();

        let mut instance = Self {
            psg,
            data_accessor,
            sequencer: Some(sequencer),
            player: Some(player),
            producer,
            device: Some(device),
        };
        instance.fill_buffer();
        instance
    }

    pub fn fill_buffer(&mut self) -> bool {
        if let Some(player) = &mut self.player {
            if player.is_playing() {
                self.producer
                    .write_slices(|buf, _offset| player.next_samples_f32(buf), None);
            }
            // web_sys::console::log_1(&JsValue::from("wirtten"));
            return true;
        }
        false
    }
}

impl Drop for FbdPlayer {
    fn drop(&mut self) {
        self.device = None;
        self.player = None;
        self.sequencer = None;
    }
}
