"use client"

import { useState, useCallback, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { ChromePicker } from "react-color"
import { Container, Row, Col, Button, Form, Spinner, Modal, Alert, Card, Badge } from "react-bootstrap"
import "./ShiftPlanner.css"

// API configuration
const API_CONFIG = {
  baseUrl: "http://localhost:5113/api",
  endpoints: {
    schedule: "/Schedule",
    employee: "/Employee",
  },
}

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
  const [color, setColor] = useState("#4285f4") // Google blue as default
  const [error, setError] = useState(null)

  const queryClient = useQueryClient()

  // Fetch schedules
  const {
    data: shifts = [],
    isLoading: isShiftsLoading,
    error: shiftsError,
  } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.schedule}`)
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
    isLoading: isEmployeesLoading,
    error: employeesError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.employee}`)
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
        return axios.put(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.schedule}/${shift.id}`, shift)
      } else {
        return axios.post(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.schedule}`, shift)
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
      return axios.delete(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.schedule}/${id}`)
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

  const handleColorChange = (color) => {
    setColor(color.hex)
  }

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

  // Loading states
  if (isShiftsLoading || isEmployeesLoading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading shift planner...</p>
      </div>
    )
  }

  // Error states
  if (shiftsError || employeesError) {
    return (
      <Alert variant="danger" className="m-4">
        <Alert.Heading>Error Loading Data</Alert.Heading>
        <p>{shiftsError?.message || employeesError?.message}</p>
      </Alert>
    )
  }

  // Prepare events for the calendar
  const calendarEvents = shifts.map((shift) => ({
    ...shift,
    start: new Date(shift.startTime),
    end: new Date(shift.endTime),
    title: `${staff.find((s) => s.id === shift.employeeId)?.name || "Unassigned"} (${format(new Date(shift.startTime), "HH:mm")} - ${format(new Date(shift.endTime), "HH:mm")})`,
  }))

  return (
    <Container fluid className="shift-planner-container">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h1 className="text-center mb-4">
            <i className="bi bi-calendar-week me-2"></i>
            Employee Shift Planner
          </h1>

          <div className="d-flex flex-wrap justify-content-center mb-4 staff-legend">
            {staff.map((member) => (
              <Badge key={member.id} className="staff-badge m-1 p-2" style={{ backgroundColor: member.color }}>
                {member.name}
              </Badge>
            ))}
          </div>

          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          <div className="calendar-container">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={(event) => {
                const staffMember = staff.find((s) => s.id === event.employeeId)
                return {
                  style: {
                    backgroundColor: staffMember?.color || "#4285f4",
                    borderRadius: "4px",
                    opacity: 0.8,
                    color: "#fff",
                    border: "0px",
                    display: "block",
                  },
                }
              }}
              dayPropGetter={(date) => {
                const today = new Date()
                return {
                  style: {
                    backgroundColor:
                      date.getDate() === today.getDate() &&
                      date.getMonth() === today.getMonth() &&
                      date.getFullYear() === today.getFullYear()
                        ? "#f8f9fa"
                        : undefined,
                  },
                }
              }}
              components={{
                toolbar: CustomToolbar,
              }}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Shift Modal */}
      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentShift ? "Edit Shift" : "New Shift"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          <Form>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                Assign Staff:<span className="text-danger">*</span>
              </Form.Label>
              <Col sm="9">
                <Form.Select
                  value={selectedStaff?.id || ""}
                  onChange={(e) => {
                    const staffId = e.target.value
                    setSelectedStaff(staff.find((s) => s.id === staffId))
                  }}
                  required
                >
                  <option value="">Select Staff</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.title}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Start Time:<span className="text-danger">*</span>
                  </Form.Label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="form-control"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    End Time:<span className="text-danger">*</span>
                  </Form.Label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="form-control"
                    required
                    minDate={startDate}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional information about this shift"
              />
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                Shift Color:
              </Form.Label>
              <Col sm="9">
                <ChromePicker color={color} onChange={handleColorChange} disableAlpha={true} className="color-picker" />
              </Col>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {currentShift && (
            <Button variant="danger" onClick={handleDeleteShift} className="me-auto">
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={() => setModalIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveShift} disabled={saveShiftMutation.isPending}>
            {saveShiftMutation.isPending ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : currentShift ? (
              "Save Changes"
            ) : (
              "Add Shift"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

// Custom toolbar component for the calendar
function CustomToolbar({ label, onNavigate, onView, views }) {
  return (
    <div className="rbc-toolbar">
      <div className="rbc-btn-group">
        <Button variant="outline-primary" onClick={() => onNavigate("TODAY")}>
          Today
        </Button>
        <Button variant="outline-primary" onClick={() => onNavigate("PREV")}>
          Back
        </Button>
        <Button variant="outline-primary" onClick={() => onNavigate("NEXT")}>
          Next
        </Button>
      </div>
      <div className="rbc-toolbar-label">{label}</div>
      <div className="rbc-btn-group">
        {views.map((view) => (
          <Button key={view} variant="outline-primary" onClick={() => onView(view)}>
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default ShiftPlanner