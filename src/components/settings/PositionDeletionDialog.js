import { useDeletePosition, usePositionDeletionPreview } from "../../api/employees";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import StateMessage from "../ui/StateMessage";
import "../employees/EmployeeDeletionDialog.css";

export default function PositionDeletionDialog({ position, onClose, onDeleted }) {
  const preview = usePositionDeletionPreview(position.positionId);
  const remove = useDeletePosition();

  const confirm = () => remove.mutate({ positionId: position.positionId, assignedEmployees: preview.data.assignedEmployees }, {
    onSuccess: onDeleted,
    onError: () => preview.refetch(),
  });
  return <Modal onClose={onClose} busy={remove.isPending} className="employee-deletion-dialog" aria-labelledby="position-deletion-title">
    <h2 id="position-deletion-title">Delete {position.title}?</h2>
    {preview.isPending ? <StateMessage title="Checking assigned employees…" /> : preview.isError ? <><StateMessage tone="error" title="Could not check assignments" detail={preview.error?.message} /><Button tone="gray" onClick={() => preview.refetch()}>Retry</Button></> : preview.data ? <>
      <p>{preview.data.assignedEmployees ? `This position is assigned to ${preview.data.assignedEmployees} ${preview.data.assignedEmployees === 1 ? "employee" : "employees"}. Deleting it will change their position to Unassigned.` : "No employees are assigned to this position."}</p>
      <p>The position will be removed from position lists.</p>
    </> : null}
    {remove.isError ? <StateMessage tone="error" title="Could not delete position" detail={remove.error?.message} /> : null}
    <div className="employee-deletion-actions">
      <Button tone="gray" disabled={remove.isPending} onClick={onClose}>Keep position</Button>
      <Button className="employee-delete-confirm" disabled={!preview.isSuccess || preview.isFetching || remove.isPending} onClick={confirm}>{remove.isPending ? "Deleting…" : "Confirm deletion"}</Button>
    </div>
  </Modal>;
}
