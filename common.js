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
  const light = forExport || !matchMedia("(prefers-color-scheme: dark)").matches;
  const col = light ? { bg: "#ffffff", ink: "#0e3f3c", muted: "#5b726f", line: "#dcdccb", r1: "#c9c9b6", r2: "#3a93a6" }
                    : { bg: "#0e3f3c", ink: "#f4f4e9", muted: "#a7bdb9", line: "#1e534e", r1: "#5d7d79", r2: "#6db8c9" };
  g.fillStyle = col.bg; g.fillRect(0, 0, W, H);
  const A = aggregate(sessions);
  const panels = [
    { title: "False alert rate", sub: "main result · lower is better", key: "falsePct", unit: "%", max: 100 },
    { title: "Real off-task detected", sub: "should stay high", key: "detectPct", unit: "%", max: 100 },
    { title: "Attention recovery time", sub: "seconds from alert to return", key: "recov", unit: "s", max: null },
  ];
  const pw = W / 3, top = 120, bottom = H - 90;
  panels.forEach((p, i) => {
    const x0 = i * pw + 70, w = pw - 100;
    g.textAlign = "left"; g.fillStyle = col.ink; g.font = "600 28px 'IBM Plex Sans', sans-serif"; g.fillText(p.title, x0, 52);
    g.fillStyle = col.muted; g.font = "400 20px 'IBM Plex Sans', sans-serif"; g.fillText(p.sub, x0, 82);
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
        if (v == null) { g.fillStyle = col.muted; g.font = "400 14px 'IBM Plex Sans', sans-serif"; g.textAlign = "center"; g.fillText("–", bx + bw / 2, bottom - 8); return; }
        g.fillStyle = color; g.fillRect(bx, y(v), bw, Math.max(1, bottom - y(v)));
        g.fillStyle = col.ink; g.font = "600 17px 'IBM Plex Mono', monospace"; g.textAlign = "center";
        g.fillText((p.unit === "s" ? v.toFixed(1) : Math.round(v)) + p.unit, bx + bw / 2, y(v) - 8);
      });
      g.fillStyle = col.ink; g.font = "500 18px 'IBM Plex Sans', sans-serif"; g.textAlign = "center";
      g.fillText(TASK_LABEL[t], gx + bw + 4, bottom + 30);
    });
  });
  g.textAlign = "left"; g.font = "500 18px 'IBM Plex Sans', sans-serif";
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
