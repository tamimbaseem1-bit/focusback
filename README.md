# FocusBack

Context-aware, adaptive attention support for students during classroom tasks. Research prototype for SAIF 2026.

- A desk camera estimates head direction on the student's own device (MediaPipe Face Landmarker). No video is stored or sent.
- The teacher picks the task (reading or listening); each student is calibrated per task.
- Prolonged time outside the student's zone triggers a private nudge.
- The student can mark a nudge as wrong; the zone adapts gradually (max 8° per correction, capped at 35°).
- An observer marks real off-task periods (key O) so accuracy can be scored. Sessions and events export as CSV.

Two session types:
- **Scripted test** (default): one volunteer follows timed spoken/on-screen instructions (on task, truly off-task, natural on-task movement). Ground truth is known in advance, so detection and false-nudge rates are scored automatically.
- **Free session**: a normal lesson; an observer presses O to mark real off-task periods.

Safeguards: 20 s calibration, 8 s quiet period after each return or correction, a second nudge after 8 s without return, and a teacher alert after two unanswered nudges.

The Charts tab builds the three poster charts (false nudge rate, real off-task detected, recovery time) for baseline vs adaptive rounds, per task, and downloads them as PNG.

Live: https://tamimbaseem1-bit.github.io/focusback/
