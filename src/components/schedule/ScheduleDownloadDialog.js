import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import StateMessage from "../ui/StateMessage";
import { formatWeekRange } from "../../lib/format";
import { downloadSchedule } from "../../lib/scheduleExport";
import "./ScheduleDownloadDialog.css";

export default function ScheduleDownloadDialog({ weekStart, shifts, employees, onClose }) {
  const dialogRef = useRef(null);
  const [format, setFormat] = useState("pdf");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const download = async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await downloadSchedule(format, weekStart, shifts, employees);
      onClose();
    } catch (failure) {
      setError(failure.message || "Please try downloading again.");
      setBusy(false);
    }
  };

  return <dialog ref={dialogRef} className="schedule-download-dialog" aria-labelledby="download-dialog-title" aria-describedby="download-dialog-description" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <form onSubmit={download} aria-busy={busy}>
      <div className="download-dialog-heading">
        <h2 id="download-dialog-title">Download schedule</h2>
        <button type="button" className="download-dialog-close" aria-label="Close download dialog" disabled={busy} onClick={onClose}>×</button>
      </div>
      <p id="download-dialog-description">{formatWeekRange(weekStart)}<br />Employee roster with daily shifts and days off.</p>
      <label htmlFor="schedule-download-format">File format</label>
      <select autoFocus id="schedule-download-format" value={format} onChange={event => { setFormat(event.target.value); setError(""); }} disabled={busy}>
        <option value="pdf">PDF (.pdf) — ready to print</option>
        <option value="excel">Excel (.xlsx) — editable spreadsheet</option>
      </select>
      {shifts.some(shift => !shift.isPublished) ? <p className="download-draft-note">This download includes unpublished draft shifts.</p> : null}
      {error ? <StateMessage tone="error" title="Could not download the schedule" detail={error} /> : null}
      <div className="download-dialog-actions">
        <Button tone="gray" disabled={busy} onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={busy}>{busy ? "Preparing download…" : `Download ${format === "pdf" ? "PDF" : "Excel"}`}</Button>
      </div>
    </form>
  </dialog>;
}
