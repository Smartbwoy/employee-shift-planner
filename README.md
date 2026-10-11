# Employee Shift Planner

React frontend for Shiftly, a workforce scheduling application for administrators, supervisors, and employees. The companion ASP.NET Core API is in the sibling `Scheduler-API` directory and is the security and data boundary.

## What the application covers

- Weekly draft and published schedules, shift copying, templates, and assignment checks
- Employee profiles, positions, availability, time off, rates, and overtime thresholds
- Soft delete employees from their profile: removes them from the directory and new shift assignments while preserving existing shifts and historical records
- Staffing requirements, holidays, coverage warnings, and labour-cost forecasting
- Shift swaps, attendance, audit history, notifications, and weekly reports
- Administrator, Supervisor, and Employee experiences, including a mobile employee schedule
- Password recovery and browser push-notification subscriptions

## Technology

- React 18 and Create React App (`react-scripts`)
- React Router 6 and TanStack React Query 5
- Plain CSS components and Lucide icons
- JWT bearer authentication supplied by Scheduler API
- Jest/React Testing Library and Playwright

## Repository relationship

```text
Employer Shift Planner/
├── employee-shift-planner/  # this React application
└── Scheduler-API/           # ASP.NET Core API and EF Core migrations
```

Run the API and apply its migrations before using data-backed frontend features. The frontend never connects directly to SQL Server.

## Local development

Requirements: Node.js 18 or later, npm, and a running Scheduler API.

```bash
npm install
```

Create an ignored `.env.local` file:

```dotenv
REACT_APP_API_BASE_URL=https://localhost:7213/api
# Optional: enables browser push subscription registration
REACT_APP_WEB_PUSH_PUBLIC_KEY=your_url_safe_public_vapid_key
```

Then start the application:

```bash
npm start
```

The frontend opens at `http://localhost:3000`. `REACT_APP_API_BASE_URL` must include `/api`. Set it explicitly for local development: the source fallback currently targets the deployed API. Restart the development server after changing environment variables.

All `REACT_APP_*` values are embedded in the browser bundle. The VAPID public key is safe to expose; database credentials, JWT signing keys, VAPID private keys, and provider credentials are not.

For a local HTTPS API certificate warning, trust the .NET development certificate:

```bash
dotnet dev-certs https --trust
```

## Authentication and roles

The login response is stored by the API client and attached to authenticated requests. Route guards improve navigation, but API authorization remains authoritative.

| Role | Main access |
| --- | --- |
| Administrator | Supervisor capabilities plus user creation, roles, activation, and organization settings |
| Supervisor | Scheduling, employees, availability, approvals, reports, operations, and settings |
| Employee | Own published schedule, notifications, time off, and swap requests |

Employee identity uses the explicit `User.EmployeeId` relationship. Matching email addresses alone does not grant access. Role or access changes require a new sign-in token.

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Login |
| `/forgot-password` | Request a password-reset email |
| `/reset-password?email=…&token=…` | Set a password from an emailed link |
| `/schedule` | Weekly planner; accepts `?week=YYYY-MM-DD` |
| `/create-shift` | Create a draft shift |
| `/employees` | Employee directory and profiles |
| `/availability` | Recurring availability matrix |
| `/time-off` | Submit and review leave requests |
| `/operations` | Swaps, attendance, and audit history |
| `/reports` | Coverage, hours, and cost reports |
| `/notifications` | Preferences, delivery history, and browser push |
| `/settings` | Organization, positions, staffing, holidays, and user access |
| `/mobile` | Employee-facing published schedule |

## Source map and data flow

```text
src/api/          fetch client, session storage, and React Query hooks
src/components/   layout, reusable UI, and feature components
src/pages/        route-level screens
src/lib/          shared formatting, including organization-aware currency
src/utils/        week and date helpers
src/data/         navigation and regional option data
e2e/              Playwright browser tests
public/           static files, service worker, and Azure routing config
scripts/          developer utilities and sample-data scripts
```

Pages use hooks from `src/api`; those hooks call the shared authenticated client and cache server state with React Query. Organization settings control regional display such as currency. Keep API contracts in the API layer rather than issuing ad-hoc requests from components.

## Commands

```bash
npm start                    # development server
npm test -- --watchAll=false # unit/component tests once
npm run test:e2e             # Playwright tests
npm run build                # optimized build in build/
```

Install Playwright's browser once before the first end-to-end run if necessary:

```bash
npx playwright install chromium
```

There is no `npm run deploy` script. Deployment is handled by GitHub Actions.

## Sample employees

With the API running and an Administrator or Supervisor account available:

```bash
./scripts/add-sample-employees.sh
```

The script can prompt for manager credentials or use `TOKEN` and `API_BASE_URL` environment variables. Review the script before targeting a shared environment; it creates real employee records.

## Deployment

`.github/workflows/azure-static-web-apps-black-mud-04e096110.yml` deploys `master` to Azure Static Web Apps. It requires the repository secret:

```text
AZURE_STATIC_WEB_APPS_API_TOKEN_BLACK_MUD_04E096110
```

The token must belong to the intended Static Web App. A missing, expired, or mismatched token produces “No matching Static Web App was found or the api key was invalid.” Regenerate the deployment token in Azure and replace the GitHub secret; never place it in the workflow file.

Before deployment:

1. Apply API migrations and verify `/healthz`.
2. Configure the API's exact CORS origin for the deployed frontend.
3. Build with the production API URL and, when enabled, the VAPID public key.
4. Run unit and end-to-end tests.
5. Confirm an active Administrator exists and user accounts are linked to employee profiles.

`public/staticwebapp.config.json` rewrites direct client-side route requests to `index.html`. Do not remove it from the build output.

## Password recovery and push notifications

The client calls anonymous `POST /api/Auth/forgot-password` and `POST /api/Auth/reset-password`. The API owns token lifetime, password policy, single-use validation, and email delivery.

Employees subscribe their current browser from Notifications. The browser creates the push subscription; the frontend sends it to `PUT /api/Employee/me/push-subscription` and removes it with `DELETE /api/Employee/me/push-subscription`. Do not add a manually editable “push token” field to employee administration.

Push requires HTTPS outside localhost, notification permission, the service worker, a public VAPID key in the frontend, and matching private/provider configuration on the API.

## Troubleshooting

- **CORS error:** add the frontend's exact scheme, host, and port to `Cors:AllowedOrigins` in the API.
- **401 after a role/profile change:** sign out and back in to obtain a new JWT.
- **Network calls reach the wrong API:** inspect `REACT_APP_API_BASE_URL`, then restart or rebuild the frontend.
- **Direct route returns 404 after deployment:** verify `staticwebapp.config.json` exists in `build/`.
- **Push unavailable:** use HTTPS, grant browser permission, and check the VAPID public key and service-worker registration.
- **Static Web Apps rejects the token:** regenerate the token for the correct Azure resource and update the GitHub secret.

## Maintenance and security

- Keep generated dependencies, builds, coverage, environment files, and test artifacts out of Git.
- Never commit connection strings, JWT keys, deployment tokens, SMTP credentials, or push-provider secrets.
- Treat changes to routes, roles, API contracts, configuration, or deployment as documentation changes too.
- `UX-REDESIGN.md` records the current interface direction and responsive behavior.
- No license is included. Confirm licensing before redistribution.

## Illustrated user guide

The [user guide](docs/user-guide/SHIFTLY-USER-GUIDE.md) and [PDF](docs/user-guide/SHIFTLY-USER-GUIDE.pdf) cover manager and employee workflows. Screenshots use fictional data with intercepted API requests.

To refresh screenshots, start the local frontend, then run `npm run capture:guide`. Set `GUIDE_BASE_URL` for a different local URL. Run `npm run build:guide` to regenerate the printable HTML and PDF. Both commands use Chrome; set `PLAYWRIGHT_CHROME_PATH` to override its executable path.

### Mobile workflows

Employee home uses the shared navigation and separates loading, errors, empty schedules, and upcoming shifts. Future shifts offer a swap form with confirmation; completed shifts remain visible as history.

On phones, employee lists use cards, attendance and request history expand on demand, and schedule filters collapse behind a Filters button. Shift editing fills the screen and dialogs keep keyboard focus inside, returning it to the opening control when closed.

Create a shift by choosing a role and times, selecting an available employee, reviewing the details, and saving a draft. Publish week opens a readiness review before employee visibility changes. Schedule and Reports share a download dialog for PDF and native Excel (.xlsx) files.

Run `npm run test:e2e -- e2e/mobile-usability.spec.js --workers=1` to check 320, 375, 430, 600, 768, and 1024px layouts, long names, loading/error states, modal focus, reduced-height editing, and downloaded file contents. These browser checks use mocked API data and do not write production records.

## Website policies

Public policy pages are available at `/policies/privacy`, `/policies/terms`,
`/policies/storage`, and `/policies/retention`. Links appear on sign-in and password
recovery forms; all roles can open Policies from desktop navigation or mobile More.
These routes require no account and remain available to signed-in users.

The content reflects browser local storage, optional push notifications, workforce
records, reports, and employee soft deletion. It does not introduce tracking,
automated erasure, a paid subscription agreement, or a consent/acceptance record.
The privacy notice is information, rather than a blanket consent request.

Elevizion Studio is the default legal operator name. Confirm its exact legal name
and relationship to each employer before publication. Configure these public build
values in `.env.local` or the build environment, then rebuild:

```dotenv
REACT_APP_LEGAL_BUSINESS_NAME=Elevizion Studio
REACT_APP_LEGAL_ADDRESS=
REACT_APP_PRIVACY_EMAIL=
REACT_APP_PROCESSING_BASIS_SUMMARY=
REACT_APP_DATA_PROCESSORS_SUMMARY=
REACT_APP_DATA_RETENTION_SUMMARY=
REACT_APP_POLICIES_PUBLISHED=false
```

The summaries must identify lawful processing grounds (including sensitive data
where applicable), actual hosting/email/push providers, countries and transfer
arrangements, and category-specific retention periods including backups and
exports. Confirm operating jurisdictions and have the final wording reviewed by
qualified counsel. Do not invent periods or promise protections not implemented.
Pages show a draft notice until all disclosures are present and
`REACT_APP_POLICIES_PUBLISHED=true`. The flag controls presentation only; it is
not a compliance check. Increment `POLICY_VERSION` in `src/data/policies.js` and
notify users when material policy changes require notice. Policies alone do not
implement retention, rights-request handling, incident response, or provider
agreements; the operator must establish those processes separately.

If commercial subscriptions or optional tracking are added, implement appropriate
contract/consent handling and update the policies before enabling those features.
Reference guidance used in preparing these drafts:
[Jamaica OIC data protection standards](https://oic.gov.jm/page/data-protection-standards)
and [ICO privacy notices and cookies](https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/cookies-and-privacy-notices-in-detail/).
