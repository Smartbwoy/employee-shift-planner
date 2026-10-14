// Review business disclosures before setting the publication flag.
export const policyDetails = {
  businessName: process.env.REACT_APP_LEGAL_BUSINESS_NAME || "Elevizion Studio",
  privacyEmail: process.env.REACT_APP_PRIVACY_EMAIL || "",
  address: process.env.REACT_APP_LEGAL_ADDRESS || "",
  retention: process.env.REACT_APP_DATA_RETENTION_SUMMARY || "",
  providers: process.env.REACT_APP_DATA_PROCESSORS_SUMMARY || "",
  legalBasis: process.env.REACT_APP_PROCESSING_BASIS_SUMMARY || "",
  published: process.env.REACT_APP_POLICIES_PUBLISHED === "true",
};
export const policiesReady = policyDetails.published && Object.entries(policyDetails)
  .filter(([key]) => key !== "published").every(([, value]) => value.trim());
export const POLICY_VERSION = "2026-10-11";
export const policies = [
  { slug: "privacy", title: "Privacy notice", sections: [
    ["Who is responsible", "Your employer or the organization providing your account determines why employee records are used. Ask its administrator to identify the responsible organization and any separate service operator. Their respective responsibilities depend on the service arrangements and applicable law."],
    ["Information used", "Shiftly handles account and employee identifiers, names, contact details, roles, positions, availability, schedules, pay rates and overtime settings, leave and swap requests, attendance, notification preferences, delivery records, and audit history. Browser push subscriptions are collected when you enable push notifications. The information held depends on the features your organization uses."],
    ["Why information is used", "Information supports account access, workforce planning, staffing, leave and swap decisions, attendance, cost forecasting, reports, notifications, and accountability. Submit only information needed for those purposes. Avoid including medical details or other sensitive information in free-text requests unless your organization has authorized a secure process."],
    ["Access and sharing", "Authorized administrators and supervisors can access records needed for their work. Employee accounts provide access to their own schedule and requests. Hosting, email, and notification services may process information to deliver the service. Reports downloaded by authorized users leave the app and must be handled securely. Information may also be disclosed where required by applicable law."],
    ["Hosting and international transfers", "Cloud hosting and delivery services may process information outside your country. The responsible organization must identify the actual providers, locations, and applicable transfer safeguards in the service details below."],
    ["Your choices and rights", "Contact the responsible organization to request access or correction, ask about retention, or exercise other rights available under applicable law, including deletion or restriction where applicable. Identity verification may be needed. Some records must be retained for legal obligations or disputes. You may also complain to the relevant data protection authority; in Jamaica this is the Office of the Information Commissioner."],
    ["Notifications and security", "Browser push is optional and requires browser permission. You can disable it in Notifications or browser settings. Service messages may be needed for account recovery and scheduling. Keep your credentials private, sign out on shared devices, and report suspected unauthorized access promptly. No online system can promise absolute security."],
    ["Changes", "The version date identifies this notice. The responsible organization should notify affected users of material changes and provide any additional notice or choices required by law. Reading this notice or signing in does not constitute consent to unrelated processing."],
  ]},
  { slug: "terms", title: "Terms of use", sections: [
    ["Scope", "These terms describe use of Shiftly by authorized organizations and their users. Any separate signed service agreement governs the commercial relationship where applicable. This website notice does not replace employment agreements, workplace policies, or rights provided by law."],
    ["Accounts", "Use only an account assigned to you and accurate information you are authorized to provide. Keep passwords private. Organization administrators are responsible for granting appropriate access and promptly removing access when it is no longer needed."],
    ["Scheduling and employment decisions", "Shiftly assists workforce planning. Managers remain responsible for checking schedules, hours, pay calculations, breaks, overtime, leave, and compliance with applicable employment law and agreements. Forecasts and warnings are planning aids and should be verified before payroll or employment decisions."],
    ["Acceptable use", "Do not access another person's account without authorization, bypass access controls, falsify attendance or requests, harass others, upload unlawful content, disclose employee records without authority, or disrupt the service. Use exports only for authorized business purposes and secure downloaded files."],
    ["Availability and access changes", "Maintenance, network issues, and service interruptions can affect access. Keep an appropriate continuity process for important schedules. Authorized administrators may suspend or revoke access for security concerns, misuse, or employment changes, subject to applicable law and organizational procedures."],
    ["Responsibility and statutory rights", "Each party remains responsible for obligations imposed on it by applicable law. Nothing in these terms excludes liability that cannot legally be excluded or limits mandatory privacy, consumer, or employment rights. Any commercial warranties, liability limits, payment terms, and dispute arrangements should be set out in the applicable service agreement."],
    ["Questions and updates", "Contact your organization administrator for account and workplace issues, and the operator identified below for service questions. Material changes should be communicated before they apply where required by law. No paid subscription or refund arrangement is established by this page."],
  ]},
  { slug: "storage", title: "Cookies and browser storage", sections: [
    ["Sign-in storage", "The application keeps the sign-in token, account profile, and session expiry in memory. Reloading requires a new sign-in. The app clears this session when you sign out or it detects expiry. Organization preferences may remain in browser storage."],
    ["Display settings", "Organization timezone and currency settings are stored in your browser to format schedules and amounts. These settings may remain after sign-out and can be removed by clearing site data."],
    ["Push notifications", "If you enable browser push, the browser creates a subscription and the application registers it with the API. A service worker receives notifications. Disable push in Notifications or revoke browser permission. Clearing site data alone may not remove a subscription held by the server."],
    ["Analytics and other technologies", "The current application code does not integrate advertising or analytics tracking. Hosting and delivery providers may use their own necessary technologies, which the operator must review and disclose. If optional tracking is introduced, this notice and the applicable consent controls must be updated before it runs."],
    ["Managing storage", "Use your browser's site settings to inspect and clear stored data or change notification permission. Removing sign-in storage signs you out; disabling storage may prevent persistent sign-in and saved display settings. See the privacy notice for information about records held by the organization."],
  ]},
  { slug: "retention", title: "Retention and deletion", sections: [
    ["Employment records", "Schedules, attendance, leave, pay-related settings, and audit history may need to be retained for employment administration, legal obligations, and disputes. The responsible organization determines and must communicate the actual retention periods for each category; these are not automatically set by this page."],
    ["Removing an employee", "Removing an employee from the directory is a soft deletion: it prevents new assignments while preserving existing shifts and historical records. It is not permanent erasure. Account access must also be reviewed separately by an administrator."],
    ["Deletion requests", "Contact the responsible organization to request deletion or correction. It must assess the request under applicable law, explain any necessary retention, and arrange authorized deletion where appropriate. Removing browser storage does not delete server records."],
    ["Backups and exports", "Backup expiry, provider copies, audit records, and exported reports require their own retention and disposal arrangements. The organization must include these in its retention schedule and protect records retained for legal holds. This notice does not implement automated deletion."],
  ]},
];
