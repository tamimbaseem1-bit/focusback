# Results sheet: one-time setup (about 5 minutes)

1. Open https://sheets.new and name the sheet **FocusBack results**.
2. **Extensions → Apps Script**. Delete what is there, paste all of `sheet/Code.gs`, press **Save**.
3. **Deploy → New deployment** → gear icon → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy**, then **Authorize access** (choose your account → Advanced → Go to project → Allow).
4. Copy the **Web app URL** (ends with `/exec`) and put it in `config.js` as `SHEET_URL`.

That is all. Every finished round (not Demo) is added to the **Rounds** tab automatically.
If the internet is down, rounds wait on the device and are sent later.
To send rounds saved before the sheet existed: Settings on the student page → **Send saved rounds to the sheet**
(and the same button on the dashboard, under Details).

If you change Code.gs later: Deploy → Manage deployments → edit → Version: New version → Deploy (the URL stays the same).
