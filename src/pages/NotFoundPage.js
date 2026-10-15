import { Link } from "react-router-dom";
import { homeForCurrentRole, isSignedIn } from "../api/auth";
export default function NotFoundPage() {
  return <main className="recovery-page"><section className="card"><h1>Page not found</h1><p>The address may have changed or the page may no longer exist.</p><Link to={isSignedIn() ? homeForCurrentRole() : "/"}>{isSignedIn() ? "Back to app" : "Back to sign in"}</Link></section></main>;
}
