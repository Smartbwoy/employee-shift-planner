import useRecordList from "../lib/useRecordList";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import { QueryState } from "../components/ui/StateMessage";
import EmployeeTable from "../components/employees/EmployeeTable";
import { useRoster } from "../api/employees";
import { useNavigate } from "react-router-dom";

export default function EmployeesPage() {
  const roster = useRoster();
  const navigate = useNavigate();
  const list = useRecordList(roster.data, "employees", item => `${item.fullName} ${item.positionTitle ?? ""} ${item.employeeId}`, item => item.fullName);

  return (
    <Shell
      active="Employees"
      title="Employees"
      copy="Manage profiles, roles, availability and scheduled hours."
      actions={<Button onClick={() => navigate("/employees/new")}>+ Add employee</Button>}
    >
      <QueryState
        query={roster}
        empty={{
          title: "No employees yet",
          detail: "Add your first team member to start building schedules.",
        }}
      >
        {() => <>{list.controls}{list.rows.length ? <EmployeeTable employees={list.rows} /> : <p role="status">No employees match your search.</p>}</>}
      </QueryState>
    </Shell>
  );
}
