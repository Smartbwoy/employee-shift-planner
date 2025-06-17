"use client"

import { useState, useEffect } from "react"
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap"
import { Calendar, People } from "react-bootstrap-icons"
import "./NavigationBar.css"

const ProfileIcon = ({ user }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name) => {
    const colors = [
      '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
      '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
      '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#f39c12',
      '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(user?.name || '');
  const backgroundColor = getRandomColor(user?.name || 'default');

  return (
    <div 
      className="profile-icon" 
      style={{ backgroundColor }}
      title={user?.name || 'User'}
    >
      {initials}
    </div>
  );
};

const NavigationBar = () => {
  const [expanded, setExpanded] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // TODO: Replace with actual user authentication logic
    const mockUser = {
      name: 'John Doe',
      email: 'john.doe@example.com'
    }
    setUser(mockUser)
  }, [])

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

            {user ? (
              <NavDropdown
                title={
                  <div className="d-inline-flex align-items-center">
                    <ProfileIcon user={user} />
                    <span className="ms-2 d-none d-lg-inline">{user.name}</span>
                  </div>
                }
                id="basic-nav-dropdown"
                className="nav-dropdown-custom profile-dropdown"
              >
                <NavDropdown.Item href="/profile">User Profile</NavDropdown.Item>
                <NavDropdown.Item href="/preferences">Preferences</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="/logout">Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link href="/login" className="nav-link-custom" onClick={() => setExpanded(false)}>
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavigationBar