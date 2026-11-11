# Local copies (so the demo does not depend on a CDN)

- `mqtt.min.js`: MQTT.js 5.10.1 (MIT), from npm `mqtt`.
- `mediapipe/vision_bundle.mjs` and `mediapipe/wasm/`: MediaPipe Tasks Vision 0.10.14 (Apache-2.0), from npm `@mediapipe/tasks-vision`.
- `mediapipe/face_landmarker.task`: **add this file by hand** (about 3.6 MB). Download it from
  https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
  and upload it to this folder on GitHub (Add file → Upload files). Until it is here, the page loads it from that URL.

Each file falls back to its public CDN if the local copy is missing.
