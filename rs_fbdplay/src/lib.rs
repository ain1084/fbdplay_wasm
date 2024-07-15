use std::cell::UnsafeCell;

use fbd_sequencer::{DataAccessor, PlayContext, PsgTrait, Sequencer};
use js_sys::Uint8Array;
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
        Self {
            psg,
            data_accessor,
            sequencer: Some(sequencer),
            player: Some(player),
        }
    }

    pub fn fill_buffer(
        &mut self,
        buffer: &mut [f32],
        start_index: Option<usize>,
        count: Option<usize>,
    ) -> usize {
        if self.player.is_none() {
            return 0;
        }
        let start = start_index.unwrap_or_default();
        let end = std::cmp::min(start + count.unwrap_or(buffer.len()), buffer.len());
        self.player
            .as_mut()
            .unwrap()
            .next_samples_f32(&mut buffer[start..end])
    }

    pub fn is_playing(&self) -> bool {
        if let Some(player) = &self.player {
            player.is_playing()
        } else {
            false
        }
    }
}

impl Drop for FbdPlayer {
    fn drop(&mut self) {
        self.player = None;
        self.sequencer = None;
    }
}
