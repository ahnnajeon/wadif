// Wadif collector
// Receives anonymous choice events from the Wadif page and appends one row
// per event to the "responses" sheet of the spreadsheet this script belongs to.
//
// Columns follow the sheet's header row. A field the page sends that has no
// column yet (for example `age`) gets a new column at the right, so adding a
// field to the page never needs a new deployment of this script.
//
// Setup: open the Google Sheet > Extensions > Apps Script, replace the editor
// contents with this file, save, then Deploy > Manage deployments > edit (pencil)
// > Version: New version > Deploy. The /exec URL stays the same.
// First time only: Deploy > New deployment > Web app (Execute as: Me,
// Who has access: Anyone) and put the /exec URL in config.js.

const SHEET_NAME = "responses";
const FIRST_FIELDS = [
  "event", "play_date", "age", "story_id",
  "choice", "choice_label", "condition", "first_shown",
  "next_choice", "next_label", "next_first_shown",
  "uid", "src", "device", "via", "v"
];
const EVENTS = ["choice", "next"];
const MAX_NEW_COLUMNS = 5; // per request, so a junk request can't flood the header

function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return text_("busy");
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (EVENTS.indexOf(data.event) < 0 || !data.story_id) return text_("ignored");
    const sheet = sheet_();
    const header = header_(sheet, data);
    const row = header.map(function (key, i) { return i === 0 ? new Date() : clean_(data[key]); });
    sheet.appendRow(row);
    return text_("ok");
  } catch (err) {
    return text_("error");
  } finally {
    lock.releaseLock();
  }
}

// Opening the /exec URL in a browser should show this line.
function doGet() {
  return text_("wadif collector is running");
}

function sheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(["received_at"].concat(FIRST_FIELDS));
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// The header row, plus a new column for each simple field name it lacks.
function header_(sheet, data) {
  const width = Math.max(sheet.getLastColumn(), 1);
  const header = sheet.getRange(1, 1, 1, width).getValues()[0].map(String);
  const missing = Object.keys(data)
    .filter(function (key) { return /^[a-z][a-z0-9_]{0,29}$/.test(key) && header.indexOf(key) < 0; })
    .slice(0, MAX_NEW_COLUMNS);
  if (missing.length) {
    sheet.getRange(1, header.length + 1, 1, missing.length).setValues([missing]);
    return header.concat(missing);
  }
  return header;
}

function clean_(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "number" && isFinite(value)) return value;
  const s = String(value).slice(0, 120);
  return /^[=+\-@]/.test(s) ? "'" + s : s; // never let a value become a formula
}

function text_(s) {
  return ContentService.createTextOutput(s);
}
