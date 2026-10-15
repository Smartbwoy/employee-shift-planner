import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Request } from "cross-fetch";
import App from "./App";
import { clearSession, storeSession } from "./api/client";
import { createQueryClient, retryQuery } from "./lib/queryClient";
import ErrorBoundary from "./components/feedback/ErrorBoundary";

const account = { id: 1, email: "manager@example.com", role: "Administrator" };
const reply = value => Promise.resolve({ ok: true, status: 200, text: async () => JSON.stringify(value) });
function renderRoute(path) {
  const router = createMemoryRouter([{ path: "*", element: <App /> }], { initialEntries: [path] });
  render(<QueryClientProvider client={createQueryClient()}><RouterProvider router={router} /></QueryClientProvider>);
  return router;
}
beforeEach(() => {
  global.Request = Request;
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  storeSession("test-token", account);
  jest.spyOn(global, "fetch").mockImplementation(url => {
    if (String(url).endsWith("/auth/login")) return reply({ token: "new-token", user: account });
    if (String(url).includes("Organization")) return reply({ currency: "JMD", timeZone: "America/Jamaica" });
    return reply([]);
  });
});
afterEach(() => { jest.restoreAllMocks(); clearSession(); });

test("leaving a dirty employee form requires confirmation and cancel retains inputs", async () => {
  const router = renderRoute("/employees/new");
  fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Unsaved" } });
  fireEvent.click(screen.getAllByRole("link", { name: "Schedule", exact: true })[0]);
  const dialog = await screen.findByRole("dialog");
  expect(dialog).toHaveTextContent("You have unsaved changes");
  await act(async () => { fireEvent.click(within(dialog).getByRole("button", { name: "Keep editing" })); });
  expect(screen.getByLabelText("First name")).toHaveValue("Unsaved");
  expect(router.state.location.pathname).toBe("/employees/new");
  fireEvent.click(screen.getAllByRole("link", { name: "Schedule", exact: true })[0]);
  fireEvent.click(await screen.findByRole("button", { name: "Discard changes" }));
  await waitFor(() => expect(router.state.location.pathname).toBe("/schedule"));
});

test("session expiry preserves mounted form values through reauthentication", async () => {
  renderRoute("/employees/new");
  fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Unsaved" } });
  act(() => clearSession());
  const dialog = await screen.findByRole("dialog", { name: "Your session expired" });
  expect(screen.getByLabelText("First name")).toHaveValue("Unsaved");
  fireEvent.change(within(dialog).getByLabelText("Password"), { target: { value: "Password-123" } });
  fireEvent.click(within(dialog).getByRole("button", { name: "Continue editing" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByLabelText("First name")).toHaveValue("Unsaved");
});

test("employee creation advances through basics, employment and review", async () => {
  renderRoute("/employees/new");
  fireEvent.change(screen.getByLabelText("Employee ID"), { target: { value: "E1" } });
  fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Alex" } });
  fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Brown" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue", exact: true }));
  expect(screen.getByText("Employment and scheduling")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Continue", exact: true }));
  expect(screen.getByRole("heading", { name: "Review employee" })).toBeInTheDocument();
  expect(screen.getByText("Alex")).toBeInTheDocument();
});

test.each([403, 404, 401, 429])("does not retry HTTP %s", status => expect(retryQuery(0, { status })).toBe(false));
test("a transient error is retried only once", () => {
  expect(retryQuery(0, { status: 503 })).toBe(true);
  expect(retryQuery(1, { status: 503 })).toBe(false);
});
test("render failures show a recovery action", () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  function Broken() { throw new Error("render failed"); }
  render(<ErrorBoundary><Broken /></ErrorBoundary>);
  expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Reload page" })).toBeInTheDocument();
});


test("submitting a new time-off request still protects unsaved review notes", async () => {
  global.fetch.mockImplementation(url => {
    if (String(url).includes("TimeOffRequests")) return reply([{ id: 7, employeeId: "E2", employeeName: "Sam", status: "Pending", startDate: "2026-01-01", endDate: "2026-01-01", reason: "Appointment" }]);
    if (String(url).endsWith("/Employee")) return reply([{ employeeId: "E1", fullName: "Alex" }]);
    return reply([]);
  });
  const router = renderRoute("/time-off");
  const note = await screen.findByRole("textbox", { name: "Review note for Sam" });
  fireEvent.change(note, { target: { value: "Keep this review draft" } });
  await screen.findByRole("option", { name: "Alex" });
  fireEvent.change(screen.getByLabelText("Employee"), { target: { value: "E1" } });
  fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "Vacation" } });
  fireEvent.click(screen.getByRole("button", { name: "Submit request" }));
  await screen.findByText("Time-off request submitted for review.");
  fireEvent.click(screen.getAllByRole("link", { name: "Schedule", exact: true })[0]);
  const dialog = await screen.findByRole("dialog");
  expect(dialog).toHaveTextContent("You have unsaved changes");
  await act(async () => { fireEvent.click(within(dialog).getByRole("button", { name: "Keep editing" })); });
  expect(note).toHaveValue("Keep this review draft");
  expect(router.state.location.pathname).toBe("/time-off");
});
