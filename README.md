# fbdplay wasm

This project aims to create a Web Application using my original works: [PSG Lite](https://github.com/ain1084/rust_psg_lite)[^1], [Audio Worker Stream Library](https://github.com/ain1084/audio-worklet-stream), and [FBD Sequencer](https://github.com/ain1084/rust_fbd_sequencer). In simple terms, it emulates the PSG (AY-3-8910) sound chip and plays old game music using the Web Audio API. It does not have the capability to play arbitrary music[^2].

[^1]: By default, the [psg crate (by Emil Loer)](https://crates.io/crates/psg), which offers higher sound quality than PSG Lite, is selected. This can be changed in the Settings.
[^2]: Copyright of the music: © Nihon Falcom Corporation.

## Overview

- Using Nuxt3 as the web framework.
- Using Vuetify3 as the UI design framework.
- Converting fbdplay implemented in Rust to WebAssembly.
- Retrieving a list of files from the fbd_files in the [FBD Sequencer](https://github.com/ain1084/rust_fbd_sequencer) repository using the GitHub API.
- Getting all .fbd files and reflecting the titles obtained from their contents in the list.
- Starting playback by selecting a file.
- Implementing a settings dialog to change the clock rate, sample rate, and usage crate.
- Deploying to Vercel.

## Deployed Site

[https://fbdplay-wasm.vercel.app/](https://fbdplay-wasm.vercel.app/)

(Rarely, but it may happen)**if the GitHub API rate limit is reached, it may not function properly. In such cases, please wait for a while and try again.**

## Starting the Nuxt Development Server Locally

### Required Software

- rustc and node should be operational
- wasm-pack installed

**Includes configuration files for Dev container. Use them if necessary.**

1. Clone the repository.
   ```
   git clone https://github.com/ain1084/fbdplay_wasm.git
   ```
1. Obtain a personal access token from GitHub and grant it Read access to code and metadata.

1. Paste the token into the `.env` file in the format `GITHUB_TOKEN=token`.

   `rust_fbdplay_wasm/.env`

   ```
   GITHUB_TOKEN=github_pat_123456789aaaa.......
   ```

1. Modify the runtimeConfig section of `nuxt.config.ts` as needed.
   The following configuration retrieves .fbd files from https://github.com/ain1084/rust_fbd_sequencer/tree/main/fbd_files.

   ```
   export default defineNuxtConfig({
     ...
     runtimeConfig: {
       ...
       public: {
         github: {
           owner: "ain1084",
           repo: "rust_fbd_sequencer",
           path: "fbd_files",
         },
       },
     },
     ...
   });
   ```

1. Run the following commands to start the development server.
   ```
   npm install
   npm run dev
   ```
1. Access the URL displayed at startup (e.g., http://localhost:3000/) in your browser.

## Deploy to Vercel

How to deploy and operate on Vercel.

1. Fork the repository.
1. Refer to the "Starting the Nuxt Development Server Locally" section above and make the necessary changes.
   - Change the target repository if necessary.
   - Adding the token to `.env` is not required for deployment.
1. Obtain a personal access token. You can reuse the token generated for the development server or create a new one.

From here, operate on Vercel.

1. Import the GitHub repository worked on above.
1. Change Project Settings.
   - Environment Variables: Add environment variables
     - Name: GITHUB_TOKEN, Value: personal access token.
1. Build.

## Acknowledgements

This project uses Font "DSEG" by keshikan. If you're using this font in your project, the author appreciates a link to thir GitHub repository: [keshikan/DSEG](https://github.com/keshikan/DSEG)

## License

Licensed under either of

- Apache License, Version 2.0
  ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)
  at your option.

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
