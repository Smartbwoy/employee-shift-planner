import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { currentUser, signOut } from "../api/auth";
import { clearSession, post } from "../api/client";
import Button from "../components/ui/Button";
import PasswordInput from "../components/ui/PasswordInput";
import "./LoginPage.css";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ currentPassword: "", password: "", confirmation: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const update = (field) => (event) => setForm(value => ({ ...value, [field]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmation) { setError("Passwords do not match."); return; }
    setPending(true);
    setError("");
    try {
      await post("/auth/change-password", { currentPassword: form.currentPassword, password: form.password });
      clearSession();
      queryClient.clear();
      navigate("/", { replace: true });
    } catch (cause) { setError(cause.message); }
    finally { setPending(false); }
  };
  return <div className="login">
    <section><b>SHIFTLY</b><div><h1>Choose a new password.</h1><p>Your password change ends all existing sessions. Sign in again afterward.</p></div></section>
    <form onSubmit={submit}>
      <h2>Change password</h2>
      {currentUser()?.mustChangePassword ? <p>You must replace your temporary password before continuing.</p> : null}
      <label htmlFor="current-password">Current password<PasswordInput id="current-password" autoComplete="current-password" required value={form.currentPassword} onChange={update("currentPassword")} /></label>
      <label htmlFor="new-password">New password<PasswordInput id="new-password" autoComplete="new-password" required minLength={8} value={form.password} onChange={update("password")} /></label>
      <label htmlFor="confirm-password">Confirm new password<PasswordInput id="confirm-password" autoComplete="new-password" required minLength={8} value={form.confirmation} onChange={update("confirmation")} /></label>
      {error ? <p role="alert">{error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Updating…" : "Update password"}</Button>
      <Button type="button" tone="gray" onClick={() => { signOut(queryClient); navigate("/", { replace: true }); }}>Log out</Button>
    </form>
  </div>;
}
