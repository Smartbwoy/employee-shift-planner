import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import NextShiftCard from "../components/mobile/NextShiftCard";
import MobileShiftRow from "../components/mobile/MobileShiftRow";
import SwapRequestDialog from "../components/mobile/SwapRequestDialog";
import { useCurrentEmployee } from "../api/employees";
import { useEmployeeShifts } from "../api/schedule";
import StateMessage from "../components/ui/StateMessage";
import { formatShiftDay, formatShiftRangeLong, startOfWeek, toDateParam, toOrganizationDateTimeInput } from "../lib/format";
import "./MobilePage.css";

export default function MobilePage() {
  const navigate = useNavigate();
  const employee = useCurrentEmployee();
  const shifts = useEmployeeShifts(employee.data?.employeeId, startOfWeek());
  const [selectedShift, setSelectedShift] = useState(null);
  const [message, setMessage] = useState("");
  const now = new Date();
  const upcoming = [...(shifts.data ?? [])].filter(shift => new Date(shift.endTime) > now).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const next = upcoming[0];
  const weekStart = startOfWeek();
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
  const weekRows = [...(shifts.data ?? [])].filter(shift => {
    const day = toOrganizationDateTimeInput(shift.startTime).slice(0, 10);
    return day >= toDateParam(weekStart) && day < toDateParam(weekEnd);
  }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const loading = employee.isPending || (Boolean(employee.data?.employeeId) && shifts.isPending);
  const error = employee.error ?? shifts.error;
  return <Shell active="My schedule" title={`Hi, ${employee.data?.firstName ?? "there"}`} copy="Your shifts, availability and requests in one place.">
    <div className="employee-home">
      {message ? <StateMessage title={message} action={<Button tone="gray" onClick={() => navigate("/operations")}>View request status</Button>} /> : null}
      <h2>Your next shift</h2>
      {error ? <StateMessage tone="error" title="Could not load your shifts" detail={error.message} action={<Button tone="gray" onClick={() => { employee.refetch(); shifts.refetch(); }}>Retry</Button>} /> : loading ? <StateMessage title="Loading your schedule…" /> : !employee.data?.employeeId ? <StateMessage title="Employee profile unavailable" detail="Ask your manager to link your account to an employee profile." /> : !next ? <StateMessage title="No upcoming shifts" detail="Your schedule is clear. Check back after your manager publishes more shifts." /> : <NextShiftCard shift={{ role: next.role || "Scheduled shift", time: formatShiftRangeLong(next.startTime, next.endTime), detail: `${formatShiftDay(next.startTime)} · ${next.breakMinutes || 0} min break` }} />}
      <div className="employee-home-actions"><Button onClick={() => navigate("/time-off")}>Request time off</Button><Button tone="gray" onClick={() => navigate("/availability")}>Manage availability</Button></div>
      {!loading && !error ? <><h2>This week</h2>{!weekRows.length ? <StateMessage title="No shifts scheduled this week" /> : weekRows.map(shift => <MobileShiftRow key={shift.id} day={formatShiftDay(shift.startTime)} time={formatShiftRangeLong(shift.startTime, shift.endTime)} action={new Date(shift.startTime) > now ? <button type="button" onClick={() => setSelectedShift(shift)}>Request swap</button> : <span>{new Date(shift.endTime) <= now ? "Completed" : "In progress"}</span>} />)}</> : null}
    </div>
    {selectedShift ? <SwapRequestDialog shift={selectedShift} onClose={() => setSelectedShift(null)} onSubmitted={() => { setSelectedShift(null); setMessage("Swap request submitted for manager review."); }} /> : null}
  </Shell>;
}
