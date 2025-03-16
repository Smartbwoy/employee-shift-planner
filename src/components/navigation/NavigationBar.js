"use client"

import { useState } from "react"
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap"
import { Calendar, People, Gear } from "react-bootstrap-icons"
import "./NavigationBar.css"

const NavigationBar = () => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Navbar expand="lg" className="navbar-custom" expanded={expanded} onToggle={setExpanded} sticky="top">
      <Container>
        <Navbar.Brand href="/employee-shift-planner" className="brand-custom">
          <div className="d-flex align-items-center">
            <Calendar className="brand-icon me-2" />
            <span className="brand-text">Employees Shift Planner</span>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-toggler-custom" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/shiftplanner" className="nav-link-custom" onClick={() => setExpanded(false)}>
              <Calendar className="nav-icon" />
              <span>Planner</span>
            </Nav.Link>

            <Nav.Link href="/employee" className="nav-link-custom" onClick={() => setExpanded(false)}>
              <People className="nav-icon" />
              <span>Manage Employees</span>
            </Nav.Link>

            <NavDropdown
              title={
                <div className="d-inline-flex align-items-center">
                  <Gear className="nav-icon" />
                  <span>Settings</span>
                </div>
              }
              id="basic-nav-dropdown"
              className="nav-dropdown-custom"
            >
              <NavDropdown.Item href="/profile">User Profile</NavDropdown.Item>
              <NavDropdown.Item href="/preferences">Preferences</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="/logout">Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavigationBar