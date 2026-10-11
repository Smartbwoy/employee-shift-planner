import { fireEvent, render, screen } from "@testing-library/react";
import PositionDeletionDialog from "./PositionDeletionDialog";
import { useDeletePosition, usePositionDeletionPreview } from "../../api/employees";
jest.mock("../../api/employees");
const mutate = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  useDeletePosition.mockReturnValue({ mutate });
  usePositionDeletionPreview.mockReturnValue({ isSuccess: true, data: { assignedEmployees: 2 } });
});
test("warns before unassigning employees and submits the reviewed count", () => {
  const onDeleted = jest.fn();
  render(<PositionDeletionDialog position={{ positionId: 1, title: "Server" }} onDeleted={onDeleted} onClose={() => {}} />);
  expect(screen.getByText(/assigned to 2 employees/)).toHaveTextContent("Unassigned");
  expect(mutate).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Confirm deletion" }));
  expect(mutate).toHaveBeenCalledWith({ positionId: 1, assignedEmployees: 2 }, expect.any(Object));
  mutate.mock.calls[0][1].onSuccess();
  expect(onDeleted).toHaveBeenCalled();
});
test("keeps the position when the user cancels", () => {
  const onClose = jest.fn();
  render(<PositionDeletionDialog position={{ positionId: 1, title: "Server" }} onDeleted={() => {}} onClose={onClose} />);
  fireEvent.click(screen.getByRole("button", { name: "Keep position" }));
  expect(onClose).toHaveBeenCalled();
  expect(mutate).not.toHaveBeenCalled();
});
test("blocks confirmation until the assignment check succeeds", () => {
  usePositionDeletionPreview.mockReturnValue({ isPending: true });
  render(<PositionDeletionDialog position={{ positionId: 1, title: "Server" }} onDeleted={() => {}} onClose={() => {}} />);
  expect(screen.getByRole("button", { name: "Confirm deletion" })).toBeDisabled();
});
