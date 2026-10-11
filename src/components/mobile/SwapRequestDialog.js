import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import StateMessage from "../ui/StateMessage";
import { useCreateSwapRequest } from "../../api/operations";
import { formatShiftDay, formatShiftRangeLong } from "../../lib/format";

export default function SwapRequestDialog({ shift, onClose, onSubmitted }) {
  const [reason, setReason] = useState("");
  const request = useCreateSwapRequest();
  const submit = event => {
    event.preventDefault();
    if (request.isPending || !reason.trim()) return;
    request.mutate({ shiftId: shift.id, reason: reason.trim() }, { onSuccess: onSubmitted });
  };
  return <Modal onClose={onClose} busy={request.isPending} aria-labelledby="swap-dialog-title">
    <h2 id="swap-dialog-title">Request a shift swap</h2>
    <p>{shift.role || "Shift"} · {formatShiftDay(shift.startTime)}<br />{formatShiftRangeLong(shift.startTime, shift.endTime)}</p>
    <form onSubmit={submit}>
      <label className="modal-field">Reason<textarea autoFocus required maxLength={500} rows={4} value={reason} onChange={event => setReason(event.target.value)} /></label>
      <p>Your manager will review this request. You remain assigned until a swap is approved.</p>
      {request.isError ? <StateMessage tone="error" title="Could not submit request" detail={request.error?.message} /> : null}
      <div className="modal-actions"><Button tone="gray" disabled={request.isPending} onClick={onClose}>Cancel</Button><Button type="submit" disabled={!reason.trim() || request.isPending}>{request.isPending ? "Submitting…" : "Submit request"}</Button></div>
    </form>
  </Modal>;
}
