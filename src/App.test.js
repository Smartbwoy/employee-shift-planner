import { clearSession, storeSession } from "./api/client";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, useLocation } from "react-router-dom";
import App from "./App";

const renderAt = (path) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

beforeEach(() => { window.localStorage.clear(); clearSession(); });
afterEach(() => jest.restoreAllMocks());

test("the root renders the API-backed sign-in screen", () => {
  renderAt("/");
  expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
});

test("planner routes require an authenticated API session", () => {
  renderAt("/schedule");
  expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
});

test("unknown routes return to sign in", () => {
  renderAt("/does-not-exist");
  expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
});

test("requests a password reset without exposing whether the account exists", async () => {
  const request = jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    text: () => Promise.resolve(""),
  });
  renderAt("/forgot-password");

  fireEvent.change(screen.getByLabelText("Email address"), {
    target: { value: "employee@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

  expect(await screen.findByText("Check your email")).toBeInTheDocument();
  expect(request).toHaveBeenCalledWith(
    expect.stringMatching(/\/auth\/forgot-password$/),
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ email: "employee@example.com" }),
    })
  );
});

test("submits a valid password reset link", async () => {
  const request = jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    text: () => Promise.resolve(""),
  });
  renderAt("/reset-password?email=employee%40example.com&token=secure-token");

  fireEvent.change(screen.getByLabelText("New password"), { target: { value: "new-password" } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "new-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Update password" }));

  await waitFor(() => expect(request).toHaveBeenCalled());
  expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({
    email: "employee@example.com",
    token: "secure-token",
    password: "new-password",
  });
  expect(await screen.findByText("Password updated")).toBeInTheDocument();
});

test("rejects mismatched replacement passwords before calling the API", () => {
  const request = jest.spyOn(global, "fetch");
  renderAt("/reset-password?email=employee%40example.com&token=secure-token");

  fireEvent.change(screen.getByLabelText("New password"), { target: { value: "new-password" } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "different-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Update password" }));

  expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  expect(request).not.toHaveBeenCalled();
});

test("an invalid reset URL offers a new password reset link", () => {
  renderAt("/reset-password");

  expect(screen.getByText("Invalid reset link")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Request a new reset link" })).toHaveAttribute(
    "href",
    "/forgot-password"
  );
});


describe("public website policies", () => {
  beforeEach(() => jest.spyOn(window, "scrollTo").mockImplementation(() => {}));

  test.each([
    ["privacy", "Privacy notice"],
    ["terms", "Terms of use"],
    ["storage", "Cookies and browser storage"],
    ["retention", "Retention and deletion"],
  ])("opens %s without authentication or API calls", (slug, title) => {
    const request = jest.spyOn(global, "fetch");
    renderAt(`/policies/${slug}`);
    expect(screen.getByRole("heading", { level: 1, name: title })).toHaveFocus();
    expect(screen.getByText("Elevizion Studio")).toBeInTheDocument();
    expect(screen.getByLabelText("Publication status")).toHaveTextContent("Draft for review");
    expect(request).not.toHaveBeenCalled();
  });

  test("policies remain accessible with a signed-in session", () => {
    storeSession("test-token", { role: "Employee" });
    renderAt("/policies/privacy");
    expect(screen.getByRole("heading", { name: "Privacy notice" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to app/ })).toHaveAttribute("href", "/mobile");
  });

  test("sign-in exposes working policy links", () => {
    renderAt("/");
    fireEvent.click(screen.getByRole("link", { name: "Privacy" }));
    expect(screen.getByRole("heading", { name: "Privacy notice" })).toBeInTheDocument();
  });
});

test("temporary credentials require a password change before accessing protected pages", () => {
  storeSession("test-token", { role: "Administrator", mustChangePassword: true });
  renderAt("/schedule");
  expect(screen.getByRole("heading", { name: "Change password" })).toBeInTheDocument();
  expect(screen.getByText("You must replace your temporary password before continuing.")).toBeInTheDocument();
});

test("changing a password requires confirmation and clears the session", async () => {
  storeSession("test-token", { role: "Employee", mustChangePassword: true });
  jest.spyOn(global, "fetch").mockResolvedValue({ ok: true, status: 200, text: async () => "" });
  renderAt("/change-password");
  fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "Temporary-123" } });
  fireEvent.change(screen.getByLabelText("New password"), { target: { value: "New-password-123" } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "Different-123" } });
  fireEvent.click(screen.getByRole("button", { name: "Update password" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Passwords do not match.");
  expect(global.fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "New-password-123" } });
  fireEvent.click(screen.getByRole("button", { name: "Update password" }));
  await screen.findByRole("heading", { name: "Welcome back" });
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ currentPassword: "Temporary-123", password: "New-password-123" });
  expect(screen.getByText("Sign in with your new password to continue.")).toBeInTheDocument();
  global.fetch.mockImplementation((url) => Promise.resolve({
    ok: true, status: 200, text: async () => JSON.stringify(String(url).endsWith('/auth/login')
      ? { token: "new-token", user: { role: "Employee", mustChangePassword: false } }
      : {}),
  }));
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "employee@example.com" } });
  fireEvent.change(document.querySelector('#password'), { target: { value: "New-password-123" } });
  fireEvent.click(screen.getByRole("button", { name: "Sign in", exact: true }));
  await screen.findByRole("heading", { name: /Hi, / });
  expect(screen.queryByRole("heading", { name: "Change password" })).not.toBeInTheDocument();
});

test.each([false, true])("login ignores stale password-change destinations unless the account requires it (%s)", async (mustChangePassword) => {
  jest.spyOn(global, "fetch").mockImplementation((url) => Promise.resolve({
    ok: true, status: 200, text: async () => JSON.stringify(String(url).endsWith('/auth/login')
      ? { token: "test-token", user: { role: "Employee", mustChangePassword } }
      : {}),
  }));
  renderAt({ pathname: "/", state: { from: "/change-password?previous=true" } });
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "employee@example.com" } });
  fireEvent.change(document.querySelector('#password'), { target: { value: "New-password-123" } });
  fireEvent.click(screen.getByRole("button", { name: "Sign in", exact: true }));
  if (mustChangePassword) {
    await screen.findByRole("heading", { name: "Change password" });
  } else {
    await screen.findByRole("heading", { name: /Hi, / });
    expect(screen.queryByRole("heading", { name: "Change password" })).not.toBeInTheDocument();
  }
});


test("reset credentials are stripped while unrelated parameters and the reset form remain", async () => {
  function LocationProbe() { const location = useLocation(); return <output data-testid="reset-location">{location.pathname}{location.search}</output>; }
  render(<QueryClientProvider client={new QueryClient()}><MemoryRouter initialEntries={["/reset-password?email=employee%40example.com&token=secret&source=email"]}><App /><LocationProbe /></MemoryRouter></QueryClientProvider>);
  await waitFor(() => expect(screen.getByTestId("reset-location")).toHaveTextContent("/reset-password?source=email"));
  expect(screen.getByTestId("reset-location")).not.toHaveTextContent("secret");
  expect(screen.getByLabelText("New password")).toBeInTheDocument();
});
