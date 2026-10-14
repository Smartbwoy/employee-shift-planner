import { startTransition, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { currentUser, homeForCurrentRole, signOut } from "../api/auth";
import { clearSession, post } from "../api/client";
import Button from "../components/ui/Button";
import StateMessage from "../components/ui/StateMessage";
import PolicyLinks from "../components/legal/PolicyLinks";
import PasswordInput from "../components/ui/PasswordInput";
import "./LoginPage.css";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ currentPassword: "", password: "", confirmation: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const mustChangePassword = Boolean(currentUser()?.mustChangePassword);
  const email = currentUser()?.email;
  const update = (field) => (event) => {
    setError("");
    setForm(value => ({ ...value, [field]: event.target.value }));
  };
  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmation) { setError("Passwords do not match."); return; }
    setPending(true);
    setError("");
    try {
      await post("/auth/change-password", { currentPassword: form.currentPassword, password: form.password });
      // Keep session clearing and Router navigation in the same transition.
      startTransition(() => {
        clearSession();
        queryClient.clear();
        navigate("/", { replace: true, state: { passwordChanged: true, email } });
      });
    } catch (cause) { setError(cause.message); }
    finally { setPending(false); }
  };
  return <div className="login">
    <section><b>SHIFTLY</b><div><h1>Choose a new password.</h1><p>Your password change ends all existing sessions. Sign in again afterward.</p></div></section>
    <form onSubmit={submit}>
      <h2>Change password</h2>
      <p>{mustChangePassword ? "You must replace your temporary password before continuing." : "Choose a strong password you do not use elsewhere."}</p>
      <label htmlFor="current-password">Current password<PasswordInput id="current-password" autoComplete="current-password" required value={form.currentPassword} onChange={update("currentPassword")} /></label>
      <label htmlFor="new-password">New password<PasswordInput id="new-password" autoComplete="new-password" required minLength={8} value={form.password} onChange={update("password")} /></label>
      <label htmlFor="confirm-password">Confirm new password<PasswordInput id="confirm-password" autoComplete="new-password" required minLength={8} value={form.confirmation} onChange={update("confirmation")} /></label>
      {error ? <StateMessage tone="error" title="Could not change password" detail={error} /> : null}
      <Button type="submit" disabled={pending}>{pending ? "Updating…" : "Update password"}</Button>
      {!mustChangePassword ? <Link className="login-link" to={homeForCurrentRole()}>Back to app</Link> : null}
      <button type="button" className="login-text-button" disabled={pending} onClick={() => { signOut(queryClient); navigate("/", { replace: true }); }}>Log out</button>
      <PolicyLinks />
    </form>
  </div>;
}
