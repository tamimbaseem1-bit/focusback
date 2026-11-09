// FocusBack shared code: tasks, scripted tests, scoring, the session-code link and the result charts.

export const TASKS = ["reading", "writing", "listening"];
export const TASK_LABEL = { reading: "Reading", writing: "Writing", listening: "Listening" };
export const ROUND_LABEL = { 1: "Round 1 · no learning", 2: "Round 2 · with learning" };

// Scripted test: the volunteer follows timed instructions, so the correct answer is known in advance.
// on = doing the task · off = truly off-task · test = natural on-task movement that tempts a false nudge.
export const SCRIPTS = {
  reading: [
    { k: "on",   d: 20000, s: "اقرأ في الكتاب كعادتك" },
    { k: "off",  d: 12000, s: "انظر جانباً بعيداً عن الكتاب، وعُد للقراءة عند التنبيه" },
    { k: "on",   d: 15000, s: "عُد إلى القراءة" },
    { k: "test", d: 12000, s: "دوّن ملاحظة في الدفتر الذي بجانبك" },
  ],
  writing: [
    { k: "on",   d: 20000, s: "اكتب في الدفتر كعادتك" },
    { k: "off",  d: 12000, s: "توقف عن الكتابة وانظر جانباً، وعُد عند التنبيه" },
    { k: "on",   d: 15000, s: "عُد إلى الكتابة" },
    { k: "test", d: 12000, s: "ارفع رأسك وفكّر في الجملة التالية، ثم أكمل" },
  ],
  listening: [
    { k: "on",   d: 20000, s: "انظر إلى المتحدث أو الشاشة واستمع" },
    { k: "off",  d: 12000, s: "انشغل بشيء جانبي، وعُد للاستماع عند التنبيه" },
    { k: "on",   d: 15000, s: "عُد إلى الاستماع" },
    { k: "test", d: 12000, s: "اكتب ملاحظة سريعة عن الشرح" },
  ],
};
export const CYCLES = 3;
export const GRACE_MS = 2000;

// ---------- scoring ----------
// episodes: [[start,end,lostMs]] truly off-task periods · alerts: [{at}]
// An episode where tracking was lost for more than half its length is left out (tracking lost is not off-task).
export function score(episodes, alerts) {
  const usable = episodes.filter(([s, e, lost]) => (lost || 0) <= (e - s) / 2);
  const hit = (a, s, e) => a.at >= s - 1000 && a.at <= e + GRACE_MS;
  const detected = usable.filter(([s, e]) => alerts.some(a => hit(a, s, e))).length;
  const falseAlerts = alerts.filter(a => !episodes.some(([s, e]) => hit(a, s, e))).length;
  return { episodes: usable.length, excluded: episodes.length - usable.length, detected, falseAlerts };
}

export function aggregate(sessions) {
  const out = {};
  for (const t of TASKS) for (const r of [1, 2]) {
    const rows = sessions.filter(s => s.task === t && s.round === r && !s.demo && s.episodes > 0);
    const alerts = rows.reduce((x, s) => x + s.alerts, 0), fa = rows.reduce((x, s) => x + s.falseAlerts, 0);
    const ep = rows.reduce((x, s) => x + s.episodes, 0), det = rows.reduce((x, s) => x + s.detected, 0);
    const rs = rows.reduce((x, s) => x + (s.recovSumS || 0), 0), rn = rows.reduce((x, s) => x + (s.recovN || 0), 0);
    out[t + "_" + r] = { n: rows.length, falsePct: alerts ? 100 * fa / alerts : (rows.length ? 0 : null),
      detectPct: ep ? 100 * det / ep : null, recov: rn ? rs / rn : null };
  }
  return out;
}

// ---------- charts ----------
export function drawCharts(c, sessions, forExport) {
  const g = c.getContext("2d"), W = c.width, H = c.height;
  // On screen: night-study colours. Exported PNG: white background, so it prints cleanly on the poster.
  // On screen: white on the glowing green. Exported PNG: white background for the printed poster.
  const col = forExport ? { bg: "#ffffff", ink: "#0d2a1b", muted: "#5a6d62", line: "#dde6de", r1: "#c3cec5", r2: "#0e7a43" }
                        : { bg: null, ink: "#ffffff", muted: "rgba(255,255,255,.7)", line: "rgba(255,255,255,.16)", r1: "rgba(255,255,255,.35)", r2: "#7dffb9" };
  g.clearRect(0, 0, W, H); if (col.bg){ g.fillStyle = col.bg; g.fillRect(0, 0, W, H); }
  const A = aggregate(sessions);
  const panels = [
    { title: "False alert rate", sub: "main result · lower is better", key: "falsePct", unit: "%", max: 100 },
    { title: "Real off-task detected", sub: "should stay high", key: "detectPct", unit: "%", max: 100 },
    { title: "Attention recovery time", sub: "seconds from alert to return", key: "recov", unit: "s", max: null },
  ];
  const pw = W / 3, top = 120, bottom = H - 90;
  panels.forEach((p, i) => {
    const x0 = i * pw + 70, w = pw - 100;
    g.textAlign = "left"; g.fillStyle = col.ink; g.font = "600 28px 'Readex Pro', sans-serif"; g.fillText(p.title, x0, 52);
    g.fillStyle = col.muted; g.font = "400 20px 'Readex Pro', sans-serif"; g.fillText(p.sub, x0, 82);
    const vals = TASKS.flatMap(t => [A[t + "_1"][p.key], A[t + "_2"][p.key]]).filter(v => v != null);
    const max = p.max ?? Math.max(5, Math.ceil((Math.max(0, ...vals) * 1.25) / 5) * 5);
    const y = v => bottom - (v / max) * (bottom - top);
    g.strokeStyle = col.line; g.lineWidth = 1;
    [0, .5, 1].forEach(f => {
      const yy = y(max * f), tv = max * f;
      g.beginPath(); g.moveTo(x0, yy); g.lineTo(x0 + w, yy); g.stroke();
      g.fillStyle = col.muted; g.font = "400 16px 'IBM Plex Mono', monospace"; g.textAlign = "right";
      g.fillText((Number.isInteger(tv) ? tv : tv.toFixed(1)) + p.unit, x0 - 8, yy + 5);
    });
    const gw = w / 3;
    TASKS.forEach((t, j) => {
      const bw = (gw - 34) / 2, gx = x0 + j * gw + 12;
      [[1, col.r1], [2, col.r2]].forEach(([r, color], k) => {
        const v = A[t + "_" + r][p.key], bx = gx + k * (bw + 8);
        if (v == null) { g.fillStyle = col.muted; g.font = "400 14px 'Readex Pro', sans-serif"; g.textAlign = "center"; g.fillText("–", bx + bw / 2, bottom - 8); return; }
        g.fillStyle = color; g.fillRect(bx, y(v), bw, Math.max(1, bottom - y(v)));
        g.fillStyle = col.ink; g.font = "600 17px 'IBM Plex Mono', monospace"; g.textAlign = "center";
        g.fillText((p.unit === "s" ? v.toFixed(1) : Math.round(v)) + p.unit, bx + bw / 2, y(v) - 8);
      });
      g.fillStyle = col.ink; g.font = "500 18px 'Readex Pro', sans-serif"; g.textAlign = "center";
      g.fillText(TASK_LABEL[t], gx + bw + 4, bottom + 30);
    });
  });
  g.textAlign = "left"; g.font = "500 18px 'Readex Pro', sans-serif";
  g.fillStyle = col.r1; g.fillRect(40, H - 34, 18, 18); g.fillStyle = col.ink; g.fillText("Round 1 · no learning", 66, H - 19);
  g.fillStyle = col.r2; g.fillRect(300, H - 34, 18, 18); g.fillStyle = col.ink; g.fillText("Round 2 · with learning", 326, H - 19);
  const n = Object.values(A).reduce((x, a) => x + a.n, 0);
  g.fillStyle = col.muted; g.textAlign = "right"; g.fillText(`${n} round${n === 1 ? "" : "s"} · demo rounds excluded`, W - 40, H - 19);
}

// ---------- files ----------
export function csv(rows) {
  if (!rows.length) return "";
  const keys = [...new Set(rows.flatMap(r => Object.keys(r)))];
  const esc = v => { const s = v == null ? "" : (typeof v === "object" ? JSON.stringify(v) : String(v)); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [keys.join(","), ...rows.map(r => keys.map(k => esc(r[k])).join(","))].join("\n");
}
export function download(name, blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
}
export const store = {
  get(k, d) { try { const v = localStorage.getItem("fb2_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("fb2_" + k, JSON.stringify(v)); } catch {} },
};

// ---------- session-code link ----------
// Only numbers and events travel: no video, no names. Messages go through a public MQTT broker
// (and BroadcastChannel when both pages are open in the same browser, for testing on one laptop).
const BROKER = "wss://broker.hivemq.com:8884/mqtt";
export function normCode(v) {
  const d = String(v || "").replace(/\D/g, "").slice(0, 4);
  return d.length === 4 ? "FB-" + d : "";
}
export function newCode() { return "FB-" + String(Math.floor(1000 + Math.random() * 9000)); }

export class Link {
  constructor(code, role, onMessage, onStatus) {
    this.code = code; this.role = role; this.onMessage = onMessage; this.onStatus = onStatus || (() => {});
    this.seen = new Set(); this.status = "connecting";
    this.base = "focusback/v2/" + code.replace("-", "") + "/";
    try {
      this.bc = new BroadcastChannel("focusback-" + code);
      this.bc.onmessage = e => this._in(e.data.topic, e.data.msg);
    } catch {}
    try {
      if (!window.mqtt) throw new Error("mqtt library not loaded");
      this.client = window.mqtt.connect(BROKER, { clientId: "fb_" + role + "_" + Math.random().toString(16).slice(2, 10), clean: true, connectTimeout: 8000, reconnectPeriod: 3000 });
      this.client.on("connect", () => { this.client.subscribe(this.base + "#"); this._status("online"); });
      this.client.on("reconnect", () => this._status("connecting"));
      this.client.on("offline", () => this._status("offline"));
      this.client.on("error", () => this._status("offline"));
      this.client.on("message", (topic, payload) => { try { this._in(topic.slice(this.base.length), JSON.parse(payload.toString())); } catch {} });
    } catch { this._status(this.bc ? "local" : "offline"); }
  }
  _status(s) { this.status = s; this.onStatus(s); }
  _in(topic, msg) {
    if (!msg || msg.from === this.role) return;
    if (msg.id) { if (this.seen.has(msg.id)) return; this.seen.add(msg.id); if (this.seen.size > 500) this.seen = new Set([...this.seen].slice(-200)); }
    this.onMessage(topic, msg);
  }
  send(topic, data, retain = false) {
    const msg = { ...data, from: this.role, id: Math.random().toString(36).slice(2) + Date.now().toString(36), ts: Date.now() };
    try { this.bc && this.bc.postMessage({ topic, msg }); } catch {}
    try { this.client && this.client.connected && this.client.publish(this.base + topic, JSON.stringify(msg), { retain, qos: 0 }); } catch {}
  }
  close() { try { this.bc && this.bc.close(); } catch {} try { this.client && this.client.end(true); } catch {} }
}

// ---------- icons (one outline family, 2px stroke) ----------
export const SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
<symbol id="i-camera" viewBox="0 0 24 24"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>
<symbol id="i-link" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></symbol>
<symbol id="i-play" viewBox="0 0 24 24"><path d="M6 3l14 9-14 9z"/></symbol>
<symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/></symbol>
<symbol id="i-download" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></symbol>
<symbol id="i-watch" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/><path d="M12 10v2l1 1"/><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05"/><path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"/></symbol>
<symbol id="i-book" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></symbol>
<symbol id="i-pen" viewBox="0 0 24 24"><path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/></symbol>
<symbol id="i-ear" viewBox="0 0 24 24"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></symbol>
<symbol id="i-shield" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></symbol>
<symbol id="i-monitor" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/></symbol>
<symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-stop" viewBox="0 0 24 24"><rect width="14" height="14" x="5" y="5" rx="2"/></symbol>
<symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></symbol>
<symbol id="i-copy" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M5 12h14M12 5v14"/></symbol>
<symbol id="i-chart" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16v-5M12 16V8M17 16v-8"/></symbol>
</svg>`;
export function mountIcons(){ if (!document.getElementById("i-check")) document.body.insertAdjacentHTML("afterbegin", SPRITE); }
export const icon = (name, cls = "") => `<svg class="i ${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
mountIcons();
