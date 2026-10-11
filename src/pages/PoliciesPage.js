import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { homeForCurrentRole, isSignedIn } from "../api/auth";
import { policies, policyDetails, policiesReady, POLICY_VERSION } from "../data/policies";
import PolicyLinks from "../components/legal/PolicyLinks";
import "./PoliciesPage.css";

export default function PoliciesPage() {
  const { policy = "privacy" } = useParams();
  const document = policies.find(item => item.slug === policy);
  const heading = useRef(null);
  useEffect(() => {
    const previousTitle = window.document.title;
    window.document.title = `${document?.title || "Website policies"} | Shiftly`;
    heading.current?.focus();
    if (typeof window.scrollTo === "function") window.scrollTo(0, 0);
    return () => { window.document.title = previousTitle; };
  }, [policy, document]);
  return <div className="policies-page">
    <header><Link to={isSignedIn() ? homeForCurrentRole() : "/"}>SHIFTLY · {isSignedIn() ? "Back to app" : "Sign in"}</Link><PolicyLinks /></header>
    <main>
      <h1 ref={heading} tabIndex={-1}>{document?.title || "Policy not found"}</h1>
      {!document ? <p>Choose a policy using the links above.</p> : <>
        <p className="policy-version">{policiesReady ? "Version" : "Draft version"}: <time dateTime={POLICY_VERSION}>11 October 2026</time></p>
        {!policiesReady && <aside className="policy-draft" aria-label="Publication status">Draft for review. Operator details, processing grounds, providers, and retention periods must be confirmed before this notice is finalized. Contact your organization administrator with questions.</aside>}
        <nav className="policy-contents" aria-label="On this page">{document.sections.map(([title], index) => <a key={title} href={`#section-${index}`}>{title}</a>)}</nav>
        {document.sections.map(([title, text], index) => <section key={title} id={`section-${index}`}><h2>{title}</h2><p>{text}</p></section>)}
        <section><h2>Organization and service details</h2>
          <dl>
            <dt>Legal operator</dt><dd>{policyDetails.businessName || "Not yet supplied — ask your organization administrator."}</dd>
            <dt>Business address</dt><dd>{policyDetails.address || "Not yet supplied."}</dd>
            <dt>Privacy and service contact</dt><dd>{/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(policyDetails.privacyEmail) ? <a href={`mailto:${policyDetails.privacyEmail}`}>{policyDetails.privacyEmail}</a> : "Contact your organization administrator; a dedicated contact has not yet been supplied."}</dd>
            <dt>Processing grounds</dt><dd>{policyDetails.legalBasis || "The responsible organization must specify applicable legal grounds and any additional grounds for sensitive information."}</dd>
            <dt>Providers, locations, and transfer arrangements</dt><dd>{policyDetails.providers || "The operator must confirm hosting, email, push providers, and transfer safeguards."}</dd>
            <dt>Retention periods</dt><dd>{policyDetails.retention || "The responsible organization must provide category-specific periods, including audit logs, backups, and exports."}</dd>
          </dl>
        </section>
      </>}
    </main>
    <footer><PolicyLinks /><p>For workplace questions, contact your organization administrator.</p></footer>
  </div>;
}
