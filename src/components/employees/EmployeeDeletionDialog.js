import { useState } from "react";
import { Link } from "react-router-dom";
import { useEmployeeDeletionPreview } from "../../api/employees";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import StateMessage from "../ui/StateMessage";
import "./EmployeeDeletionDialog.css";

export default function EmployeeDeletionDialog({ employeeId, name, mutation, onDelete, onClose }) {
  const preview = useEmployeeDeletionPreview(employeeId);
  const [cancelShifts, setCancelShifts] = useState(false);
  const data = preview.data;
  const blocked = data && (data.activeShifts > 0 || data.hasOpenAttendance || data.isOwnProfile);


  return <Modal onClose={onClose} busy={mutation.isPending} className="employee-deletion-dialog" aria-labelledby="employee-deletion-title">
    <h2 id="employee-deletion-title">Delete {name}?</h2>
    <p>Remove this employee from the directory and disable their linked accounts. Historical shifts, attendance and reviewed requests will be preserved.</p>
    {preview.isPending ? <StateMessage title="Checking deletion impact…" /> : preview.isError ? <><StateMessage tone="error" title="Could not check deletion impact" detail={preview.error?.message} /><Button tone="gray" onClick={() => preview.refetch()}>Retry</Button></> : data ? <>
      <dl className="employee-deletion-impact">
        <div><dt>Future shifts</dt><dd>{data.futureShifts}</dd></div>
        <div><dt>Pending time-off requests</dt><dd>{data.pendingTimeOff}</dd></div>
        <div><dt>Pending swap requests</dt><dd>{data.pendingSwaps}</dd></div>
        <div><dt>Queued notifications</dt><dd>{data.queuedNotifications}</dd></div>
        <div><dt>Active linked accounts</dt><dd>{data.linkedAccounts}</dd></div>
      </dl>
      {blocked ? <StateMessage tone="error" title="Deletion needs review" detail={data.isOwnProfile ? "Ask another manager to delete your own profile." : "Resolve in-progress shifts and open clock-ins before deleting this employee."} /> : null}
      {data.futureShifts > 0 ? <>
        <p><Link to="/schedule">Reassign future shifts in the schedule</Link>, or confirm their cancellation below.</p>
        <label className="employee-deletion-check"><input type="checkbox" checked={cancelShifts} disabled={mutation.isPending} onChange={event => setCancelShifts(event.target.checked)} />Cancel all {data.futureShifts} future shifts. These shifts will no longer count toward staffing coverage.</label>
      </> : null}
      <p>Pending requests and queued notifications will be cancelled. Availability and notification preferences will be removed.</p>
    </> : null}
    {mutation.isError ? <StateMessage tone="error" title="Employee could not be deleted" detail={mutation.error?.message} /> : null}
    <div className="employee-deletion-actions">
      <Button tone="gray" disabled={mutation.isPending} onClick={onClose}>Keep employee</Button>
      <Button className="employee-delete-confirm" disabled={!preview.isSuccess || preview.isFetching || blocked || (data?.futureShifts > 0 && !cancelShifts) || mutation.isPending} onClick={() => onDelete(cancelShifts)}>{mutation.isPending ? "Deleting…" : "Confirm deletion"}</Button>
    </div>
  </Modal>;
}
