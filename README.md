# FocusBack

Context-aware, adaptive attention support. Proof of concept for SAIF 2026.

Live: https://tamimbaseem1-bit.github.io/focusback/

## Two pages

- **Student page** (`student.html`): runs on the device in front of the student. Camera, calibration per task (Reading, Writing, Listening), scripted Round 1 and Round 2, a soft flash and sound when attention drifts, and the two answers “I’m back” and “I was focused”.
- **Teacher / Parent dashboard** (`dashboard.html`): creates a session code (e.g. FB-2741), shows live status and counts, raises “Teacher support needed” only after two unanswered alerts, and compares Round 1 with Round 2 in three charts.

The pages are linked by the session code. Only numbers and events travel, through a public MQTT broker (HiveMQ) or BroadcastChannel when both pages are open in one browser. Video is analysed on the student device (MediaPipe Face Landmarker) and is never saved or sent.

## Method

Choose task → Calibrate → Round 1 (no learning) → Round 2 (with learning) → Compare.

- Both rounds start from the same calibration and default zone.
- In Round 2, each “I was focused” widens the zone by at most 8° (cap 35°) and the wait by 0.5 s (cap 8 s).
- Each round is a scripted test: timed instructions (on task, truly off-task, natural on-task movement), so the correct answer is known in advance.
- Main result: false alert rate (should fall). Real off-task detection should stay high. Recovery time is supporting.
- Tracking lost is logged on its own and never counted as off-task. Off-task periods with mostly lost tracking are left out of detection.
- Demo Mode (no camera, drag to move) is labelled, and its rounds are excluded from results.

## Future work

Move the alert to a smart wristband or smartwatch; support several students per dashboard.
