import { formatWeekRange, toDateParam } from "./format";

export function reportSections(report) {
  const currency = report.currency;
  return [
    { title: "Employee hours", columns: ["Employee", "Employee ID", "Scheduled hours"], rows: report.hoursByEmployee.map(row => [row.fullName, row.employeeId, row.hours]) },
    { title: "Labour cost", columns: ["Employee", "Employee ID", "Regular hours", "Overtime hours", `Rate (${currency})`, `Regular cost (${currency})`, `Overtime cost (${currency})`, `Total (${currency})`], rows: report.labourCostByEmployee.map(row => [row.fullName, row.employeeId, row.regularHours, row.overtimeHours, row.hourlyRate, row.regularCost, row.overtimeCost, row.totalCost]) },
    { title: "Coverage", columns: ["Day", "Date", "Scheduled", "Required", "Hours", "Coverage %", "Gap"], rows: report.coverageByDay.map(day => [day.day, day.date, day.scheduledEmployees, day.requiredEmployees, day.hours, day.coveragePercent, day.isGap ? "Yes" : "No"]) },
  ];
}

export async function downloadReport(format, weekStart, report) {
  const sections = reportSections(report);
  const filename = `shift-report-${toDateParam(weekStart)}`;
  if (format === "pdf") {
    const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
    const pdf = new jsPDF({ orientation: "landscape" });
    sections.forEach((section, index) => {
      if (index) pdf.addPage();
      pdf.setFontSize(16); pdf.text(`Weekly report: ${section.title}`, 14, 18);
      pdf.setFontSize(10); pdf.text(formatWeekRange(weekStart), 14, 26);
      autoTable(pdf, { startY: 33, head: [section.columns], body: section.rows.length ? section.rows : [[{ content: "No data for this week", colSpan: section.columns.length }]], styles: { fontSize: 9 } });
    });
    pdf.save(`${filename}.pdf`);
    return;
  }
  if (format !== "excel") throw new Error("Choose PDF or Excel.");
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  sections.forEach(section => {
    const sheet = workbook.addWorksheet(section.title);
    sheet.addRow([formatWeekRange(weekStart)]); sheet.addRow(section.columns);
    section.rows.forEach(row => sheet.addRow(row));
    sheet.getRow(2).font = { bold: true };
    sheet.columns.forEach(column => { column.width = 22; });
    sheet.views = [{ state: "frozen", ySplit: 2 }];
    sheet.autoFilter = { from: { row: 2, column: 1 }, to: { row: section.rows.length + 2, column: section.columns.length } };
  });
  const bytes = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const link = document.createElement("a"); link.href = url; link.download = `${filename}.xlsx`;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
