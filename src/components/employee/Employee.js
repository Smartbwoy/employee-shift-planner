"use client"

import React, { useState, useEffect } from "react"
import {
  Button,
  Modal,
  Form,
  Table,
  Container,
  Row,
  Col,
  Card,
  InputGroup,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap"
import {
  Search,
  PersonPlusFill,
  PencilSquare,
  TrashFill,
  SortAlphaDown,
  SortAlphaUp,
  ChevronLeft,
  ChevronRight,
  EnvelopeFill,
  BriefcaseFill,
  PersonBadgeFill,
} from "react-bootstrap-icons"
import axios from "axios"
import { useTable, usePagination, useSortBy, useGlobalFilter } from "react-table"
import "./Employee.css"

function Employee() {
  // State management
  const [employees, setEmployees] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [submitLoading, setSubmitLoading] = useState(false)

  const baseApiUrl = "http://localhost:5113/api"

  // Fetch employees from the database on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${baseApiUrl}/Employee`)
        setEmployees(response.data)
        setError(null)
      } catch (error) {
        console.error("Error fetching employees:", error)
        setError("Failed to load employees. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  const validateForm = (formData) => {
    const errors = {}

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required"
    }

    if (!formData.position.trim()) {
      errors.position = "Position is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
    }

    return errors
  }

  const handleShowModal = (employee = null) => {
    setSelectedEmployee(employee)
    setIsEditing(!!employee)
    setShowModal(true)
    setFormErrors({})
  }

  const handleCloseModal = () => {
    setSelectedEmployee(null)
    setIsEditing(false)
    setShowModal(false)
    setFormErrors({})
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)

    const form = e.target
    const formData = {
      firstName: form.firstName.value,
      middleName: form.middleName.value,
      lastName: form.lastName.value,
      position: form.position.value,
      email: form.email.value,
    }

    // Validate form
    const errors = validateForm(formData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setSubmitLoading(false)
      return
    }

    try {
      if (isEditing && selectedEmployee) {
        // Update employee via API
        await axios.put(`${baseApiUrl}/Employee/${selectedEmployee.employeeID}`, {
          employeeID: selectedEmployee.employeeID,
          ...formData,
          status: true,
        })

        setEmployees((prev) =>
          prev.map((emp) => (emp.employeeID === selectedEmployee.employeeID ? { ...emp, ...formData } : emp)),
        )

        // Show success message or notification here
      } else {
        // Add new employee via API
        const response = await axios.post(`${baseApiUrl}/Employee`, {
          employeeID: "empID", // This seems to be a placeholder in your original code
          ...formData,
          status: true,
        })

        setEmployees((prev) => [...prev, response.data])
        // Show success message or notification here
      }

      handleCloseModal()
    } catch (error) {
      console.error("Error saving employee:", error)
      setError("Failed to save employee. Please try again.")
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`${baseApiUrl}/Employee/${id}`)
        setEmployees((prev) => prev.filter((employee) => employee.employeeID !== id))
        // Show success message or notification here
      } catch (error) {
        console.error("Error deleting employee:", error)
        setError("Failed to delete employee. Please try again.")
      }
    }
  }

  // React-Table Setup
  const columns = React.useMemo(
    () => [
      {
        Header: "ID",
        accessor: "employeeID",
        Cell: ({ value }) => <Badge bg="secondary">{value}</Badge>,
      },
      {
        Header: "First Name",
        accessor: "firstName",
      },
      {
        Header: "Last Name",
        accessor: "lastName",
      },
      {
        Header: "Position",
        accessor: "position",
        Cell: ({ value }) => (
          <div className="d-flex align-items-center">
            <BriefcaseFill className="me-2 text-primary" />
            {value}
          </div>
        ),
      },
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ value }) => (
          <div className="d-flex align-items-center">
            <EnvelopeFill className="me-2 text-primary" />
            <a href={`mailto:${value}`}>{value}</a>
          </div>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        disableSortBy: true,
        Cell: ({ row }) => (
          <div className="action-buttons">
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2 action-button"
              onClick={() => handleShowModal(row.original)}
              title="Edit Employee"
            >
              <PencilSquare />
              <span className="action-text">Edit</span>
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="action-button"
              onClick={() => handleDeleteEmployee(row.original.employeeID)}
              title="Delete Employee"
            >
              <TrashFill />
              <span className="action-text">Delete</span>
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state,
    setGlobalFilter,
    pageOptions,
    gotoPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data: employees,
      initialState: { pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
  )

  const { globalFilter, pageIndex, pageSize } = state

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p>Loading employees...</p>
      </div>
    )
  }

  return (
    <Container fluid className="employee-container py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="align-items-center mb-4">
            <Col>
              <h1 className="employee-title">
                <PersonBadgeFill className="me-2 text-primary" />
                Employee Management
              </h1>
            </Col>
            <Col xs="auto">
              <Button variant="primary" onClick={() => handleShowModal()} className="add-employee-btn">
                <PersonPlusFill className="me-2" />
                Add Employee
              </Button>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Row className="mb-3">
            <Col md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  value={globalFilter || ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search employees..."
                  className="search-input"
                />
              </InputGroup>
            </Col>
            <Col md={6} lg={2} className="ms-auto">
              <Form.Select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                }}
                className="page-size-select"
              >
                {[10, 20, 30, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table {...getTableProps()} striped hover className="employee-table">
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        className={column.isSorted ? "sorted-column" : ""}
                        key={column.id}
                      >
                        <div className="d-flex align-items-center">
                          {column.render("Header")}
                          <span className="ms-2">
                            {column.isSorted ? (
                              column.isSortedDesc ? (
                                <SortAlphaDown className="sort-icon" />
                              ) : (
                                <SortAlphaUp className="sort-icon" />
                              )
                            ) : (
                              ""
                            )}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-5">
                      No employees found. Add a new employee to get started.
                    </td>
                  </tr>
                ) : (
                  page.map((row) => {
                    prepareRow(row)
                    return (
                      <tr {...row.getRowProps()} className="employee-row">
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                        ))}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </Table>
          </div>

          <Row className="align-items-center mt-4">
            <Col xs={12} md={6} className="d-flex align-items-center mb-3 mb-md-0">
              <span className="me-3">
                Page{" "}
                <strong>
                  {pageIndex + 1} of {pageOptions.length}
                </strong>
              </span>
              <span className="me-3">| Go to page:</span>
              <Form.Control
                type="number"
                min={1}
                max={pageOptions.length}
                value={pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0
                  gotoPage(page)
                }}
                style={{ width: "70px" }}
                className="me-3"
              />
            </Col>
            <Col xs={12} md={6}>
              <div className="d-flex justify-content-md-end">
                <Button
                  variant="outline-primary"
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                  className="me-2 pagination-btn"
                >
                  <ChevronLeft /> Previous
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => nextPage()}
                  disabled={!canNextPage}
                  className="pagination-btn"
                >
                  Next <ChevronRight />
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Add/Edit Employee Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? (
              <>
                <PencilSquare className="me-2" />
                Edit Employee
              </>
            ) : (
              <>
                <PersonPlusFill className="me-2" />
                Add New Employee
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit} noValidate>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group controlId="formFirstName" className="mb-3">
                  <Form.Label>
                    First Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    placeholder="Enter first name"
                    defaultValue={selectedEmployee ? selectedEmployee.firstName : ""}
                    isInvalid={!!formErrors.firstName}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.firstName}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formLastName" className="mb-3">
                  <Form.Label>
                    Last Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    placeholder="Enter last name"
                    defaultValue={selectedEmployee ? selectedEmployee.lastName : ""}
                    isInvalid={!!formErrors.lastName}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.lastName}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="formMiddleName" className="mb-3">
              <Form.Label>Middle Name</Form.Label>
              <Form.Control
                type="text"
                name="middleName"
                placeholder="Enter middle name (optional)"
                defaultValue={selectedEmployee ? selectedEmployee.middleName : ""}
              />
            </Form.Group>

            <Form.Group controlId="formPosition" className="mb-3">
              <Form.Label>
                Position <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <BriefcaseFill />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  name="position"
                  placeholder="Enter position"
                  defaultValue={selectedEmployee ? selectedEmployee.position : ""}
                  isInvalid={!!formErrors.position}
                />
                <Form.Control.Feedback type="invalid">{formErrors.position}</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>
                Email <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <EnvelopeFill />
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  defaultValue={selectedEmployee ? selectedEmployee.email : ""}
                  isInvalid={!!formErrors.email}
                />
                <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitLoading}>
              {submitLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  {isEditing ? "Saving..." : "Adding..."}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Employee"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}

export default Employee