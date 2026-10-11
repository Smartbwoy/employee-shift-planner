import Modal from "../ui/Modal";
import Button from "../ui/Button";
import StateMessage from "../ui/StateMessage";
import { formatWeekRange } from "../../lib/format";

export default function PublishWeekDialog({ weekStart, draftCount, readiness, publication, onClose }) {
  return <Modal onClose={onClose} busy={publication.isPending} aria-labelledby="publish-dialog-title">
    <h2 id="publish-dialog-title">Review before publishing</h2>
    <p>{formatWeekRange(weekStart)}</p>
    <p><strong>{draftCount} draft {draftCount === 1 ? "shift" : "shifts"}</strong> will become visible to employees. Schedule notifications will follow their notification preferences.</p>
    {readiness.isPending ? <StateMessage title="Checking schedule readiness…" /> : readiness.isError ? <StateMessage tone="error" title="Could not check readiness" detail={readiness.error?.message} /> : readiness.data?.isReady ? <StateMessage title="Ready to publish" detail="No blocking assignment conflicts were found." /> : <StateMessage tone="error" title="Resolve conflicts before publishing" detail={(readiness.data?.issues ?? []).map(issue => `Shift ${issue.shiftId}: ${issue.errors.join(" ")}`).join(" ")} />}
    {publication.isError ? <StateMessage tone="error" title="Could not publish this week" detail={publication.error?.message} /> : null}
    <div className="modal-actions"><Button tone="gray" disabled={publication.isPending} onClick={onClose}>Back to schedule</Button><Button disabled={!draftCount || !readiness.data?.isReady || readiness.isPending || readiness.isError || publication.isPending} onClick={() => publication.mutate(undefined, { onSuccess: onClose })}>{publication.isPending ? "Publishing…" : "Publish week"}</Button></div>
  </Modal>;
}
