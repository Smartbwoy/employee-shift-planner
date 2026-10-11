import { scheduleGrid } from "./scheduleExport";

beforeEach(() => localStorage.setItem("organization-timezone", "America/Jamaica"));
afterEach(() => localStorage.removeItem("organization-timezone"));

const week = new Date(2026, 9, 12);
const employees = [{ employeeId: "E1", fullName: "John Brown" }, { employeeId: "E2", fullName: "Alicia Reid" }];

test("builds a seven-day roster with shaded-cell OFF values and organization-local overnight times", () => {
  const shifts = [
    { employeeId: "E1", startTime: "2026-10-13T03:00:00Z", endTime: "2026-10-13T11:00:00Z" },
    { employeeName: "Guest worker", startTime: "2026-10-12T13:00:00Z", endTime: "2026-10-12T21:00:00Z" },
  ];
  const grid = scheduleGrid(week, shifts, employees);
  expect(grid.headers).toEqual(["NAMES", "12\nMON", "13\nTUE", "14\nWED", "15\nTHU", "16\nFRI", "17\nSAT", "18\nSUN"]);
  expect(grid.rows).toEqual([
    ["JOHN BROWN", "10p-6a (+1d)", ...Array(6).fill("OFF")],
    ["ALICIA REID", ...Array(7).fill("OFF")],
    ["GUEST WORKER", "8a-4p", ...Array(6).fill("OFF")],
  ]);
});

test("keeps multiple shifts in time order in one cell and excludes shifts outside the week", () => {
  const grid = scheduleGrid(week, [
    { employeeId: "E1", startTime: "2026-10-12T17:30:00-05:00", endTime: "2026-10-12T21:00:00-05:00" },
    { employeeId: "E1", startTime: "2026-10-11T08:00:00-05:00", endTime: "2026-10-11T12:00:00-05:00" },
    { employeeId: "E1", startTime: "2026-10-12T08:00:00-05:00", endTime: "2026-10-12T12:00:00-05:00" },
  ], employees);
  expect(grid.rows[0][1]).toBe("8a-12p\n5:30p-9p");
  expect(scheduleGrid(week, [], []).rows).toEqual([]);
});
