import { Link } from "react-router-dom";
import "./PolicyLinks.css";

export default function PolicyLinks() {
  return <nav className="policy-links" aria-label="Website policies">
    <Link to="/policies/privacy">Privacy</Link>
    <Link to="/policies/terms">Terms</Link>
    <Link to="/policies/storage">Browser storage</Link>
    <Link to="/policies/retention">Retention</Link>
  </nav>;
}
