"use client"

import { useState, useCallback, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Container, Row, Col, Button, Form, Modal, Alert, Card, Badge, Accordion } from "react-bootstrap"
import { FileEarmarkPdf, FileEarmarkExcel, Printer } from "react-bootstrap-icons"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import ExcelJS from "exceljs"
import "./ShiftPlanner.css"
import config from "../../config/config"

// Date localizer setup
const locales = { "en-US": enUS }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

function ShiftPlanner() {
  // State management
  const [staff, setStaff] = useState([])
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [currentShift, setCurrentShift] = useState(null)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [notes, setNotes] = useState("")
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [color, setColor] = useState("#4285f4")
  const [error, setError] = useState(null)
  const [view, setView] = useState(Views.WEEK)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const queryClient = useQueryClient()

  // Fetch schedules
  const {
    data: shifts = [],
  } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${config.api.baseUrl}${config.api.endpoints.schedule}`)
        return response.data
      } catch (error) {
        console.error("Error fetching schedules:", error)
        throw error
      }
    },
  })

  // Fetch employees
  const {
    data: employees = [],
  } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${config.api.baseUrl}${config.api.endpoints.employees}`)
        return response.data
      } catch (error) {
        console.error("Error fetching employees:", error)
        throw error
      }
    },
  })

  // Update staff state when employees data is fetched
  useEffect(() => {
    if (employees.length > 0) {
      setStaff(
        employees.map((emp) => {
          const shift = shifts.find((shift) => shift.employeeId === emp.employeeID)
          return {
            id: emp.employeeID,
            name: `${emp.firstName} ${emp.lastName}`,
            title: emp.position || "Staff",
            color: shift?.assignedColor || getRandomColor(),
          }
        }),
      )
    }
  }, [employees, shifts])

  // Helper function to generate random colors
  const getRandomColor = () => {
    const colors = [
      "#4285f4", // Google blue
      "#ea4335", // Google red
      "#fbbc05", // Google yellow
      "#34a853", // Google green
      "#673ab7", // Deep Purple
      "#ff5722", // Deep Orange
      "#795548", // Brown
      "#607d8b", // Blue Grey
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Mutations
  const saveShiftMutation = useMutation({
    mutationFn: async (shift) => {
      if (shift.id) {
        return axios.put(`${config.api.baseUrl}${config.api.endpoints.schedule}/${shift.id}`, shift)
      } else {
        return axios.post(`${config.api.baseUrl}${config.api.endpoints.schedule}`, shift)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
    },
    onError: (err) => {
      setError(`Failed to save shift: ${err.message}`)
    },
  })

  const deleteShiftMutation = useMutation({
    mutationFn: async (id) => {
      return axios.delete(`${config.api.baseUrl}${config.api.endpoints.schedule}/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
    },
    onError: (err) => {
      setError(`Failed to delete shift: ${err.message}`)
    },
  })

  // Event handlers
  const handleSelectSlot = useCallback(({ start, end }) => {
    setCurrentShift(null)
    setStartDate(start)
    setEndDate(end)
    setNotes("")
    setSelectedStaff(null)
    setColor("#4285f4") // Reset to default blue
    setModalIsOpen(true)
  }, [])

  const handleSelectEvent = useCallback(
    (event) => {
      setCurrentShift(event)
      setStartDate(new Date(event.start))
      setEndDate(new Date(event.end))
      setNotes(event.notes || "")

      const staffMember = staff.find((s) => s.id === event.employeeId)
      setSelectedStaff(staffMember || null)

      setColor(event.assignedColor || "#4285f4")
      setModalIsOpen(true)
    },
    [staff],
  )

  const handleSaveShift = async () => {
    if (!startDate || !endDate || !selectedStaff) {
      setError("Please fill in all required fields.")
      return
    }

    try {
      const shift = {
        id: currentShift?.id,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        title: `${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`,
        notes,
        employeeId: selectedStaff.id,
        assignedColor: color,
        status: true,
      }

      await saveShiftMutation.mutateAsync(shift)
      setModalIsOpen(false)
      setError(null)
    } catch (err) {
      setError(`Failed to save shift: ${err.message}`)
    }
  }

  const handleDeleteShift = async () => {
    if (!currentShift?.id) return

    try {
      await deleteShiftMutation.mutateAsync(currentShift.id)
      setModalIsOpen(false)
      setError(null)
    } catch (err) {
      setError(`Failed to delete shift: ${err.message}`)
    }
  }

  // Export functions
  const exportToPDF = () => {
    // Initialize jsPDF with autoTable
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text("Employee Shift Schedule", 14, 15)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${format(new Date(), "MMMM d, yyyy")}`, 14, 22)
    
    // Prepare table data
    const tableColumn = ["Employee", "Date", "Start Time", "End Time", "Notes"]
    const tableRows = []

    shifts.forEach((shift) => {
      const employee = staff.find((s) => s.id === shift.employeeId)
      const shiftData = [
        employee?.name || "Unassigned",
        format(new Date(shift.startTime), "MMM dd, yyyy"),
        format(new Date(shift.startTime), "HH:mm"),
        format(new Date(shift.endTime), "HH:mm"),
        shift.notes || "",
      ]
      tableRows.push(shiftData)
    })

    // Add table using autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 70 },
      },
    })

    // Save the PDF
    doc.save("shift-schedule.pdf")
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Shift Schedule');

    // Add headers
    worksheet.columns = [
      { header: 'Employee', key: 'employee', width: 30 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Start Time', key: 'startTime', width: 15 },
      { header: 'End Time', key: 'endTime', width: 15 },
      { header: 'Notes', key: 'notes', width: 40 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4285F4' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' } };

    // Add data
    shifts.forEach((shift) => {
      const employee = staff.find((s) => s.id === shift.employeeId);
      worksheet.addRow({
        employee: employee?.name || "Unassigned",
        date: format(new Date(shift.startTime), "MMM dd, yyyy"),
        startTime: format(new Date(shift.startTime), "HH:mm"),
        endTime: format(new Date(shift.endTime), "HH:mm"),
        notes: shift.notes || ""
      });
    });

    // Add borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Generate and download the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shift-schedule.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const printSchedule = () => {
    window.print()
  }

  // Enhanced toolbar with dropdown and search bar
  const CustomToolbar = ({ label, onNavigate, onView, views }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (e) => {
      setSearchTerm(e.target.value);
      // Implement filtering logic here
    };

    // Month selection logic
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();

    const handleMonthChange = (e) => {
      const monthIndex = months.indexOf(e.target.value);
      if (monthIndex !== -1) {
        setSelectedDate(new Date(currentYear, monthIndex, 1));
      }
    };

    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <Button variant="outline-primary" onClick={() => onNavigate("PREV")} size="sm">‹</Button>
          <Button variant="outline-primary" onClick={() => onNavigate("TODAY")} size="sm">Today</Button>
          <Button variant="outline-primary" onClick={() => onNavigate("NEXT")} size="sm">›</Button>
        </span>
        <span className="rbc-toolbar-label">
          <select
            className="form-select form-select-sm"
            value={months[currentMonth]}
            onChange={handleMonthChange}
          >
            {months.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </span>
        <span className="rbc-btn-group">
          {views.map((viewType) => (
            <Button
              key={viewType}
              variant={viewType === view ? "primary" : "outline-primary"}
              onClick={() => onView(viewType)}
              size="sm"
            >
              {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
            </Button>
          ))}
        </span>
        <input
          type="text"
          className="form-control form-control-sm mt-2"
          placeholder="Search shifts..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
    );
  };

  // Add tooltips for event details
  const EventComponent = ({ event }) => {
    const staffMember = staff.find((s) => s.id === event.employeeId);
    return (
      <div className="custom-event" title={`${staffMember?.name || "Unassigned"}: ${event.notes || "No notes"}`}>
        <strong>{staffMember?.name || "Unassigned"}</strong>
        <div>{format(new Date(event.start), "HH:mm")} - {format(new Date(event.end), "HH:mm")}</div>
      </div>
    );
  };

  // Updated modal with collapsible sections and validation indicators
  const ShiftModal = () => (
    <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{currentShift ? "Edit Shift" : "Create New Shift"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Shift Details</Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date & Time</Form.Label>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        showTimeSelect
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className={`form-control ${!startDate ? "is-invalid" : ""}`}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date & Time</Form.Label>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        showTimeSelect
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className={`form-control ${!endDate ? "is-invalid" : ""}`}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Employee & Notes</Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Employee</Form.Label>
                  <Form.Select
                    value={selectedStaff?.id || ""}
                    onChange={(e) => {
                      const staffMember = staff.find((s) => s.id === e.target.value);
                      setSelectedStaff(staffMember);
                    }}
                    className={!selectedStaff ? "is-invalid" : ""}
                  >
                    <option value="">Select an employee</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this shift..."
                  />
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {currentShift && (
          <Button variant="danger" onClick={handleDeleteShift} className="me-auto">
            Delete Shift
          </Button>
        )}
        <Button variant="secondary" onClick={() => setModalIsOpen(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveShift}>
          Save Shift
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Updated main component to remove sidebar
  return (
    <Container fluid className="shift-planner-container">
      <Row>
        <Col md={12}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h1 className="text-center mb-4">
                <i className="bi bi-calendar-week me-2"></i>
                Employee Shift Planner
              </h1>
              {/* Export Buttons */}
              <div className="export-buttons">
                <Button
                  variant="outline-primary"
                  className="export-button"
                  onClick={exportToPDF}
                >
                  <FileEarmarkPdf /> Export PDF
                </Button>
                <Button
                  variant="outline-success"
                  className="export-button"
                  onClick={exportToExcel}
                >
                  <FileEarmarkExcel /> Export Excel
                </Button>
                <Button
                  variant="outline-secondary"
                  className="export-button"
                  onClick={printSchedule}
                >
                  <Printer /> Print Schedule
                </Button>
              </div>

              {/* Staff Legend */}
              <div className="staff-legend d-flex flex-wrap justify-content-center">
                {staff.map((member) => (
                  <Badge
                    key={member.id}
                    className="staff-badge"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name}
                  </Badge>
                ))}
              </div>

              {/* Calendar */}
              <div className="calendar-container">
                <Calendar
                  localizer={localizer}
                  events={shifts.map((shift) => ({
                    id: shift.id,
                    title: `${format(new Date(shift.startTime), "HH:mm")} - ${format(new Date(shift.endTime), "HH:mm")}`,
                    start: new Date(shift.startTime),
                    end: new Date(shift.endTime),
                    notes: shift.notes,
                    employeeId: shift.employeeId,
                    assignedColor: shift.assignedColor,
                  }))}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 600 }}
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  selectable
                  views={[Views.MONTH, Views.WEEK, Views.DAY]}
                  view={view}
                  onView={setView}
                  date={selectedDate}
                  onNavigate={setSelectedDate}
                  components={{
                    event: EventComponent,
                    toolbar: CustomToolbar,
                  }}
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: event.assignedColor || "#4285f4",
                      border: "none",
                      borderRadius: "4px",
                      opacity: 0.9,
                      color: "#fff",
                      padding: "2px 5px",
                    },
                  })}
                  dayLayoutAlgorithm="no-overlap"
                  popup
                  popupOffset={30}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <ShiftModal />
    </Container>
  )
}

export default ShiftPlanner