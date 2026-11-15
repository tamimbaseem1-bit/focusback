# FocusBack

Context-aware, adaptive attention support. Proof of concept for SAIF 2026.

Live: https://tamimbaseem1-bit.github.io/focusback/

## Two pages

- **Student page** (`student.html`): runs on the device in front of the student. Camera, calibration per task (Reading, Writing, Listening), scripted Round 1 and Round 2, a soft flash and sound when the head stays outside the task zone. A correct alert needs no tap: the camera sees the student return. A wrong alert gets one tap, “I was focused”.
- **Teacher / Parent dashboard** (`dashboard.html`): creates a session code (e.g. FB-2741), shows live status and counts, raises “Teacher support needed” only after two unanswered alerts, and compares Round 1 with Round 2 in three charts. Results can be shown for **This session** (what a teacher or parent sees), the **Final study**, or the **Pilot**.

The pages are linked by the session code. Only numbers and events travel, through a public MQTT broker (HiveMQ) or BroadcastChannel when both pages are open in one browser. Video is analysed on the student device (MediaPipe Face Landmarker) and is never saved or sent.

## Participant links (participants on their own)

On the dashboard, **Participant links → New link** makes one link per participant (next free code P01, P02…, its own session code, Final or Pilot). The participant opens it on their own device: an Arabic welcome screen (what to prepare, where to put the device, privacy, a practice tap on «كنت مركّزاً»), then an Arabic guide through calibration and both rounds of all three tasks. No settings, no Demo. If the face is often lost or the posture differs from the calibration, the round stops by itself (not counted) and asks for a new calibration. The dashboard shows each link's progress (rounds done of 6) and can watch it live.

## Results sheet

Every finished round (not Demo, not everyday use) is also saved to a Google Sheet you own, so results from every device are in one place and the dashboard shows them all. Only numbers and codes travel; video never leaves the device. If the internet is down, rounds wait on the device and are sent later. Setup: `sheet/SETUP.md`.

## Two modes (Settings on the student page)

- **Study · rounds**: the scripted experiment below. Every round starts fresh from the default zone, so Round 1 and Round 2 can be compared fairly.
- **Everyday use**: what a student would use after the competition. The student code and the calibration are remembered on the device (calibrate once per task), there are no rounds, learning is always on, and what was learned is kept for the next session. These sessions never enter the study results. Demo Mode keeps its own memory, separate from real students.

## Method

Choose task → Calibrate → Round 1 (no learning) → Round 2 (with learning) → Compare.

- Each task has its own default zone around its own calibration centre, set from pilot data (P02–P05, 8 finished rounds per task): the 75th percentile over rounds of the on-task 95th-percentile head angle, +3°, at least 12°, both sides the same. Reading: up 22°, down 12°, sides 16° · Writing: up 16°, down 12°, sides 15° · Listening: up 22°, down 13°, sides 14°.
- A return to the zone only counts once it holds for 0.8 s, so a face glimpsed for a moment while turned away does not reset the off-task count.
- Both rounds start from the same calibration and the same task zone.
- The wait before an alert is fixed at 5 s in both rounds, so only one thing can change in Round 2: the zone.
- In Round 2, each “I was focused” saves where the head was during that alert. From then on, a circle of 15° around each saved position also counts as in the zone (at most 8 positions). The task box itself never changes. This learns diagonal movements, like looking up and to the right to think, without allowing “just to the right”. (s5, from pilot data: natural movements were often diagonal, which widening a box side by side could not cover.)
- If the face disappears right after the head left the zone, the student turned away (a camera cannot see a face turned far to the side): that counts as outside the zone. If the face disappears while in the zone, it is tracking lost and never counts as off-task.
- The notebook goes in front of the student (below the book or screen), so note-taking is an up/down movement and sideways stays for distraction.
- Each round is a scripted test: timed instructions (on task, truly off-task, natural on-task movement), so the correct answer is known in advance.
- Each round is 3 cycles of: on task 10 s → natural movement 12 s (Reading: look up to think · Writing: raise the head to think · Listening: write a note) → off-task (turn the face clearly away) 12 s → on task 8 s → natural movement 12 s (about 2.7 min). 3 off-task steps and 6 natural-movement steps per round. Script version **s6**; Final results use s6 rounds only. (s4 also fixed the head angles: in s3 and older data, up/down and left/right are swapped.)
- If an alert is closed because the step changed, «كنت مركّزاً» (I was focused) still works for 6 s, so a slow answer is not lost.
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
