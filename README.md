# FocusBack

Context-aware, adaptive attention support. Proof of concept for SAIF 2026.

Live: https://tamimbaseem1-bit.github.io/focusback/

## Two pages

- **Student page** (`student.html`): runs on the device in front of the student. Camera, calibration per task (Reading, Writing, Listening), scripted Round 1 and Round 2, a soft flash and sound when the head stays outside the task zone. A correct alert needs no tap: the camera sees the student return. A wrong alert gets one tap, “I was focused”.
- **Teacher / Parent dashboard** (`dashboard.html`): creates a session code (e.g. FB-2741), shows live status and counts, raises “Teacher support needed” only after two unanswered alerts, and compares Round 1 with Round 2 in three charts. Results can be shown for **This session** (what a teacher or parent sees), the **Final study**, or the **Pilot**.

The pages are linked by the session code. Only numbers and events travel, through a public MQTT broker (HiveMQ) or BroadcastChannel when both pages are open in one browser. Video is analysed on the student device (MediaPipe Face Landmarker) and is never saved or sent.

## Method

Choose task → Calibrate → Round 1 (no learning) → Round 2 (with learning) → Compare.

- Each task has its own default zone around its own calibration centre (Reading: more room down and sideways; Writing: most room down and sideways; Listening: narrow). Starting values, to be updated from pilot data (the dashboard shows the measured head-angle spread per task).
- Both rounds start from the same calibration and the same task zone.
- The wait before an alert is fixed at 5 s in both rounds, so only one thing can change in Round 2: the zone.
- In Round 2, each “I was focused” widens only the side the head moved to, by at most 5° (cap 30°).
- Each round is a scripted test: timed instructions (on task, truly off-task, natural on-task movement), so the correct answer is known in advance.
- Main result: **Wrong alerts (%)**, the share of alerts that were unnecessary (should fall). Real off-task detection should stay high. Recovery time is supporting.
- Tracking lost is logged on its own and never counted as off-task. Off-task periods with mostly lost tracking are left out of detection.
- Demo Mode (no camera, drag to move) is labelled, and its rounds are excluded from results. Rounds stopped early are excluded too.
- Every round is tagged **Pilot** or **Final study** (Settings on the student page). Final results use Final rounds only. The CSV keeps everything, with a phase column.
- Volunteers are coded P01, P02… No names. Video never leaves the device.

## Future work

- Send the alert to a smartwatch or wristband (a working ntfy prototype is in the git history, commit f3114ca).
- Several students per dashboard.
- A private link instead of a public MQTT broker; fully offline mode.

## Running offline-ready

MediaPipe and MQTT.js are served from `vendor/`, each with a CDN fallback. Add `vendor/mediapipe/face_landmarker.task` once (see `vendor/README.md`) so the face model also loads from this site.
