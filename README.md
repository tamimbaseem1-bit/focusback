# FocusBack

Context-aware, adaptive attention support for students during classroom tasks. Research prototype for SAIF 2026.

- A desk camera estimates head direction on the student's own device (MediaPipe Face Landmarker). No video is stored or sent.
- The teacher picks the task (reading or listening); each student is calibrated per task.
- Prolonged time outside the student's zone triggers a private nudge.
- The student can mark a nudge as wrong; the zone adapts gradually (max 8° per correction, capped at 35°).
- An observer marks real off-task periods (key O) so accuracy can be scored. Sessions and events export as CSV.

Open `index.html` in Chrome, allow the camera, calibrate, then start a session.
