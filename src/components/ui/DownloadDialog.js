import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import StateMessage from "./StateMessage";
import "../schedule/ScheduleDownloadDialog.css";

export default function DownloadDialog({ title, description, note, onDownload, onClose }) {
  const [format, setFormat] = useState("pdf");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try { await onDownload(format); onClose(); }
    catch (failure) { setError(failure.message || "Please try again."); setBusy(false); }
  };
  return <Modal className="schedule-download-dialog" onClose={onClose} busy={busy} aria-labelledby="download-dialog-title" aria-describedby="download-dialog-description">
    <form onSubmit={submit} aria-busy={busy}>
      <div className="download-dialog-heading"><h2 id="download-dialog-title">{title}</h2><button className="download-dialog-close" type="button" aria-label="Close download dialog" disabled={busy} onClick={onClose}>×</button></div>
      <p id="download-dialog-description">{description}</p>
      <label htmlFor="download-format">File format</label>
      <select autoFocus id="download-format" value={format} disabled={busy} onChange={event => setFormat(event.target.value)}><option value="pdf">PDF (.pdf) — ready to print</option><option value="excel">Excel (.xlsx) — editable spreadsheet</option></select>
      {note ? <p className="download-draft-note">{note}</p> : null}
      {error ? <StateMessage tone="error" title="Could not download" detail={error} /> : null}
      <div className="modal-actions"><Button tone="gray" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? "Preparing download…" : `Download ${format === "pdf" ? "PDF" : "Excel"}`}</Button></div>
    </form>
  </Modal>;
}
