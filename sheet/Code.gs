// FocusBack results sheet. Paste this whole file into Extensions → Apps Script of your Google Sheet.
// Every finished round becomes one row in the "Rounds" tab. Only numbers and codes (P01…); never video.
const KEY = "fb-7937fa5daa18";   // must match SHEET_KEY in config.js

const COLS = ["id", "receivedAt", "phase", "code", "pid", "task", "round", "completed", "demo", "startedAt", "minutes",
  "alerts", "falseAlerts", "falsePct", "episodes", "excludedEpisodes", "detected", "detectPct",
  "meanReturnS", "recovSumS", "recovN", "repeats", "teacherSupport", "iWasFocused",
  "trackingLostCount", "trackingLostS", "alertS", "version", "startZone", "finalZone", "learn", "spread"];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("Rounds");
  if (!sh) {
    sh = ss.insertSheet("Rounds");
    sh.getRange(1, 1, 1, COLS.length).setValues([COLS]).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.getRange("A:A").setNumberFormat("@"); sh.getRange("J:J").setNumberFormat("@");   // keep ids and times as text
  }
  return sh;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// The site sends { key, rows: [ … ] }. Rows already in the sheet (same id) are skipped, so sending twice is safe.
function doPost(e) {
  let body; try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: "bad json" }); }
  if (body.key !== KEY) return out_({ ok: false, error: "bad key" });
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const sh = sheet_(), last = sh.getLastRow();
    const have = new Set(last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(r => String(r[0])) : []);
    const now = new Date().toISOString(), add = [], ids = [];
    for (const r of body.rows || []) {
      if (!r || !r.id || have.has(String(r.id))) { if (r && r.id) ids.push(r.id); continue; }
      add.push(COLS.map(c => c === "receivedAt" ? now : r[c] == null ? "" : typeof r[c] === "object" ? JSON.stringify(r[c]) : r[c]));
      have.add(String(r.id)); ids.push(r.id);
    }
    if (add.length) sh.getRange(sh.getLastRow() + 1, 1, add.length, COLS.length).setValues(add);
    return out_({ ok: true, added: add.length, ids });
  } finally { lock.releaseLock(); }
}

// The dashboard reads every row back: GET ?key=…
function doGet(e) {
  if ((e.parameter || {}).key !== KEY) return out_({ ok: false, error: "bad key" });
  const v = sheet_().getDataRange().getValues(), head = v.shift() || [];
  const parse = x => { if (typeof x === "string" && /^[\[{]/.test(x)) { try { return JSON.parse(x); } catch (err) {} } return x === "" ? null : x; };
  const rows = v.map(r => Object.fromEntries(head.map((h, i) => [h, parse(r[i])])));
  return out_({ ok: true, rows });
}
