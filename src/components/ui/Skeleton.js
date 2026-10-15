import "./Skeleton.css";
export default function Skeleton({ label = "Loading…" }) {
  return <section className="card skeleton" aria-busy="true" role="status" aria-label={label}><span className="skeleton-label">{label}</span><div aria-hidden="true"><i /><i /><i /></div></section>;
}
