// Wadif collector
// Receives anonymous choice events from the Wadif page and appends one row
// per event to the "responses" sheet of the spreadsheet this script belongs to.
//
// Setup: open the Google Sheet > Extensions > Apps Script, replace the editor
// contents with this file, then Deploy > New deployment > Web app
// (Execute as: Me, Who has access: Anyone). Put the /exec URL in config.js.

const SHEET_NAME = "responses";
const FIELDS = [
  "event", "play_date", "story_id",
  "choice", "choice_label", "condition", "first_shown",
  "next_choice", "next_label", "next_first_shown",
  "uid", "src", "device", "via", "v"
];
const EVENTS = ["choice", "next"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return text_("busy");
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (EVENTS.indexOf(data.event) < 0 || !data.story_id) return text_("ignored");
    const row = [new Date()].concat(FIELDS.map(function (key) { return clean_(data[key]); }));
    sheet_().appendRow(row);
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
    sheet.appendRow(["received_at"].concat(FIELDS));
    sheet.setFrozenRows(1);
  }
  return sheet;
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
