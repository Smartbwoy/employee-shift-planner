import { fireEvent, render, screen } from "@testing-library/react";
import EmployeeDetailPage from "./EmployeeDetailPage";
import { useDeleteEmployee, useEmployeeSummary, useEmployeeDeletionPreview } from "../api/employees";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useParams: () => ({ employeeId: "E1" }),
  useNavigate: () => mockNavigate,
  Link: ({ children }) => <span>{children}</span>,
}));
jest.mock("../api/employees");
jest.mock("../components/layout/Shell", () => ({ children, actions }) => <div>{actions}{children}</div>);
jest.mock("../components/employees/EmployeeProfileCard", () => () => null);
jest.mock("../components/employees/UpcomingShifts", () => () => null);

const mockMutate = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(window, "confirm").mockReturnValue(true);
  useEmployeeSummary.mockReturnValue({ data: {
    employee: { fullName: "Jane Doe", active: true },
    scheduledHours: 0, maxWeeklyHours: 40, upcomingShifts: [],
  } });
  useDeleteEmployee.mockReturnValue({ mutate: mockMutate });
  useEmployeeDeletionPreview.mockReturnValue({ isSuccess: true, data: { futureShifts: 2, activeShifts: 0, pendingTimeOff: 1, pendingSwaps: 1, queuedNotifications: 2, linkedAccounts: 1 } });
  HTMLDialogElement.prototype.showModal = jest.fn(function () { this.setAttribute("open", ""); });
  HTMLDialogElement.prototype.close = jest.fn(function () { this.removeAttribute("open"); });
});
afterEach(() => jest.restoreAllMocks());

test("reviews impact and requires future-shift cancellation before deletion", () => {
  render(<EmployeeDetailPage />);
  fireEvent.click(screen.getByRole("button", { name: "Delete employee" }));
  expect(screen.getByText("Pending time-off requests")).toBeInTheDocument();
  const confirm = screen.getByRole("button", { name: "Confirm deletion" });
  expect(confirm).toBeDisabled();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(confirm);
  expect(mockMutate).toHaveBeenCalledWith({ employeeId: "E1", cancelFutureShifts: true }, expect.any(Object));
  expect(mockNavigate).not.toHaveBeenCalled();
  mockMutate.mock.calls[0][1].onSuccess();
  expect(mockNavigate).toHaveBeenCalledWith("/employees", { replace: true });
});

test("keeping the employee closes the review without deleting", () => {
  render(<EmployeeDetailPage />);
  fireEvent.click(screen.getByRole("button", { name: "Delete employee" }));
  fireEvent.click(screen.getByRole("button", { name: "Keep employee" }));
  expect(screen.queryByRole("button", { name: "Confirm deletion" })).not.toBeInTheDocument();
  expect(mockMutate).not.toHaveBeenCalled();
});

test("blocks deletion for an in-progress shift", () => {
  useEmployeeDeletionPreview.mockReturnValue({ isSuccess: true, data: { futureShifts: 0, activeShifts: 1 } });
  render(<EmployeeDetailPage />);
  fireEvent.click(screen.getByRole("button", { name: "Delete employee" }));
  expect(screen.getByRole("button", { name: "Confirm deletion" })).toBeDisabled();
  expect(screen.getByText(/Resolve in-progress shifts/)).toBeInTheDocument();
});

test("failed deletion displays the server error", () => {
  useDeleteEmployee.mockReturnValue({ mutate: mockMutate, isError: true, error: new Error("Please retry") });
  render(<EmployeeDetailPage />);
  expect(screen.getByRole("alert")).toHaveTextContent("Please retry");
});

test("pending deletion disables profile actions", () => {
  useDeleteEmployee.mockReturnValue({ mutate: mockMutate, isPending: true });
  render(<EmployeeDetailPage />);
  expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Edit profile" })).toBeDisabled();
});
