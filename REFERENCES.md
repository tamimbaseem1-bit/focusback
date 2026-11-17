# FocusBack — References and Project Files

**FocusBack: A browser-based AI that learns how each student focuses, to reduce false distraction alerts.**
Team: Sama Alnaim & Laila Alomair — SAIF 2026 (age group 12–17)

## Project files

- Live prototype (runs in any browser): https://tamimbaseem1-bit.github.io/focusback/
- Source code: https://github.com/tamimbaseem1-bit/focusback
- How the head angle, task zones and learning work: `student.html` and `common.js` in this repository
- Study protocol: version `s6` (see `SCRIPTS` and `PROTOCOL` in `common.js`)

## References

1. Lugaresi, C., Tang, J., Nash, H., et al. (2019). *MediaPipe: A Framework for Building Perception Pipelines.* arXiv:1906.08172.
2. Kartynnik, Y., Ablavatski, A., Grishchenko, I., & Grundmann, M. (2019). *Real-time Facial Surface Geometry from Monocular Video on Mobile GPUs.* arXiv:1907.06724.
3. Google AI Edge. *MediaPipe Face Landmarker* (documentation). https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker
4. Whitehill, J., Serpell, Z., Lin, Y.-C., Foster, A., & Movellan, J. R. (2014). The Faces of Engagement: Automatic Recognition of Student Engagement from Facial Expressions. *IEEE Transactions on Affective Computing, 5*(1), 86–98.
5. Risko, E. F., Anderson, N., Sarwal, A., Engelhardt, M., & Kingstone, A. (2012). Everyday attention: Variation in mind wandering and memory in a lecture. *Applied Cognitive Psychology, 26*(2), 234–242.
6. Hutt, S., Krasich, K., Mills, C., Bosch, N., White, S., Brockmole, J. R., & D'Mello, S. K. (2019). Automated gaze-based mind wandering detection during computerized learning in classrooms. *User Modeling and User-Adapted Interaction, 29*, 821–867.

## Study summary (final study, protocol s6)

| | Round 1 (before learning) | Round 2 (after learning) |
|---|---|---|
| Wrong alerts (alerts while the student was focused) | 92 of 137 alerts (67%) | 20 of 64 alerts (31%) |
| Real distraction caught | 45 of 45 | 44 of 45 (98%) |

Per student, wrong-alert share (Round 1 → Round 2): P06 66.7% → 30.8%, P07 67.9% → 25.0%, P08 67.9% → 42.9%, P09 66.7% → 30.8%, P10 66.7% → 25.0%.
Paired t-test p < 0.001; Wilcoxon signed-rank, one-sided, p = 0.03 (n = 5; all 5 students improved).
