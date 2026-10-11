import { useState } from "react";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import StateMessage from "../components/ui/StateMessage";
import { useEmployees } from "../api/employees";
import { isManager } from "../api/auth";
import { useAttendance, useAuditLog, useReviewSwapRequest, useSaveAttendance, useSwapRequests } from "../api/operations";
import { formatShiftDay, formatShiftRangeLong, toOrganizationDateTimeInput } from "../lib/format";
import useIsMobile from "../lib/useIsMobile";
import "./OperationsPage.css";

export default function OperationsPage() {
  const mobile = useIsMobile();
  const manager = isManager();
  const swaps = useSwapRequests();
  const employees = useEmployees({ enabled: manager });
  const attendance = useAttendance(undefined, { enabled: manager });
  const audit = useAuditLog({ enabled: manager });
  const review = useReviewSwapRequest();
  const saveAttendance = useSaveAttendance();
  const [replacements, setReplacements] = useState({});
  const [records, setRecords] = useState({});
  const [message, setMessage] = useState("");
  if (!manager) return <Shell active="Operations" title="Shift Requests" copy="Track your shift-swap requests."><section className="card operations-panel"><h2>Your swap requests</h2>{swaps.isPending ? <StateMessage title="Loading requests…" /> : swaps.isError ? <StateMessage tone="error" title="Could not load requests" detail={swaps.error?.message} /> : !swaps.data?.length ? <p>No swap requests yet.</p> : swaps.data.map(x => <article key={x.id}><b>{x.role || "Shift"} · {formatShiftDay(x.startTime)} · {formatShiftRangeLong(x.startTime, x.endTime)}</b><span className={`operation-status ${x.status.toLowerCase()}`}>{x.status}</span><p>{x.reason || "No reason provided"}</p>{x.reviewNotes ? <p>Review note: {x.reviewNotes}</p> : null}</article>)}</section></Shell>;
  const error = swaps.error ?? employees.error ?? attendance.error ?? audit.error ?? review.error ?? saveAttendance.error;
  const valueFor = item => records[item.shiftId] ?? { status: item.status, clockIn: item.clockIn ? toOrganizationDateTimeInput(item.clockIn) : "", clockOut: item.clockOut ? toOrganizationDateTimeInput(item.clockOut) : "", notes: item.notes ?? "" };
  const change = (item, changes) => setRecords(current => ({ ...current, [item.shiftId]: { ...valueFor(item), ...changes } }));
  const hours = value => value == null ? "—" : `${Number(value).toFixed(2).replace(/\.00$/, "")}h`;
  const save = item => saveAttendance.mutate({ shiftId: item.shiftId, ...valueFor(item) }, { onSuccess: () => { setMessage(`Attendance saved for ${item.employeeName}.`); setRecords(current => { const next = { ...current }; delete next[item.shiftId]; return next; }); } });
  const editor = (item, field) => {
    const value = valueFor(item);
    const working = value.status === "Present" || value.status === "Late";
    if (field === "status") return <select aria-label={`Attendance status for ${item.employeeName}`} value={value.status} onChange={event => change(item, { status: event.target.value, ...(["Absent", "Excused"].includes(event.target.value) ? { clockIn: "", clockOut: "" } : {}) })}><option>Not recorded</option><option>Present</option><option>Late</option><option>Absent</option><option>Excused</option></select>;
    if (field === "save") return <Button tone="gray" disabled={value.status === "Not recorded" || (working && !value.clockIn) || saveAttendance.isPending} onClick={() => save(item)}>Save</Button>;
    const label = field === "clockIn" ? "Clock in" : "Clock out";
    return <div className="attendance-time"><input type="datetime-local" aria-label={`${label} for ${item.employeeName}`} value={value[field]} disabled={!working} onChange={event => change(item, { [field]: event.target.value })} /><button type="button" disabled={!working || (field === "clockOut" && !value.clockIn)} onClick={() => change(item, { [field]: toOrganizationDateTimeInput(new Date()) })}>Now</button></div>;
  };
  const pending = (swaps.data ?? []).filter(x => x.status === "Pending");
  return <Shell active="Operations" title="Operations" copy="Review swaps, record attendance, and inspect workforce changes.">
    {error ? <StateMessage tone="error" title="Could not update operations" detail={error.message} /> : null}
    {message ? <StateMessage title={message} /> : null}
    <section className="card operations-panel"><h2>Pending shift swaps</h2>{swaps.isPending ? <p>Loading requests…</p> : !pending.length && !swaps.isError ? <p>No swaps are waiting for review.</p> : null}{pending.map(x => <article key={x.id}><div><b>{x.employeeName} · {x.role || "Shift"}</b><span>{formatShiftDay(x.startTime)} · {formatShiftRangeLong(x.startTime, x.endTime)}</span></div><p>{x.reason || "No reason provided"}</p><label className="operation-replacement">Replacement employee<select aria-label={`Replacement for ${x.employeeName}`} value={replacements[x.id] ?? ""} disabled={employees.isPending || employees.isError || review.isPending} onChange={event => setReplacements(current => ({ ...current, [x.id]: event.target.value }))}><option value="">Select replacement</option>{(employees.data ?? []).filter(employee => employee.employeeId !== x.requestingEmployeeId).map(employee => <option key={employee.employeeId} value={employee.employeeId}>{employee.fullName}</option>)}</select></label><div className="operation-actions"><Button tone="gray" disabled={review.isPending} onClick={() => review.mutate({ id: x.id, decision: "Rejected", replacementEmployeeId: null, reviewNotes: "" }, { onSuccess: () => setMessage("Swap request rejected.") })}>Reject</Button><Button tone="success" disabled={!replacements[x.id] || review.isPending} onClick={() => review.mutate({ id: x.id, decision: "Approved", replacementEmployeeId: replacements[x.id], reviewNotes: "" }, { onSuccess: () => setMessage("Swap approved and schedule updated.") })}>Approve swap</Button></div></article>)}</section>
    <section className="card operations-panel"><h2>Attendance this week</h2>{attendance.isPending ? <p>Loading attendance…</p> : !attendance.data?.length && !attendance.isError ? <p>No shifts to record this week.</p> : mobile ? <div className="operation-cards">{(attendance.data ?? []).map(item => <details key={item.shiftId} className="operation-card"><summary><strong>{item.employeeName}</strong><span>{formatShiftDay(item.shiftStart)} · {formatShiftRangeLong(item.shiftStart, item.shiftEnd)}</span><span>{item.status}</span></summary><div className="attendance-editor"><label>Clock in{editor(item, "clockIn")}</label><label>Clock out{editor(item, "clockOut")}</label><label>Status{editor(item, "status")}</label><p>Scheduled: {hours(item.scheduledHours)} · Actual: {hours(item.actualHours)}<br />{item.lateMinutes ? `${item.lateMinutes} minutes late` : "No lateness recorded"}</p>{editor(item, "save")}</div></details>)}</div> : <div className="operations-table"><table><thead><tr><th>Employee / shift</th><th>Clock in</th><th>Clock out</th><th>Status</th><th>Scheduled</th><th>Actual</th><th>Lateness</th><th></th></tr></thead><tbody>{(attendance.data ?? []).map(item => <tr key={item.shiftId}><td><strong>{item.employeeName}</strong><small>{formatShiftDay(item.shiftStart)} · {formatShiftRangeLong(item.shiftStart, item.shiftEnd)}</small></td><td>{editor(item, "clockIn")}</td><td>{editor(item, "clockOut")}</td><td>{editor(item, "status")}</td><td>{hours(item.scheduledHours)}</td><td>{hours(item.actualHours)}</td><td>{item.lateMinutes ? `${item.lateMinutes} min` : "No lateness recorded"}</td><td>{editor(item, "save")}</td></tr>)}</tbody></table></div>}</section>
    <section className="card operations-panel"><h2>Audit history</h2>{audit.isPending ? <p>Loading history…</p> : !audit.data?.length && !audit.isError ? <p>No changes recorded yet.</p> : mobile ? <div className="operation-cards">{(audit.data ?? []).map(item => <details key={item.id} className="operation-card"><summary><b>{item.category}: {item.action}</b><span>{new Date(item.createdAt).toLocaleString()}</span></summary><p>By {item.actor}</p><p>{item.details || "No additional details"}</p></details>)}</div> : <div className="operations-table"><table><thead><tr><th>When</th><th>Actor</th><th>Change</th><th>Details</th></tr></thead><tbody>{(audit.data ?? []).map(item => <tr key={item.id}><td>{new Date(item.createdAt).toLocaleString()}</td><td>{item.actor}</td><td>{item.category}: {item.action}</td><td>{item.details || "—"}</td></tr>)}</tbody></table></div>}</section>
  </Shell>;
}
