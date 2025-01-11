import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import './HomePage.css'; // Import custom CSS for the homepage

const HomePage = () => {
  return (
    <Container className="homepage-container">
      <header className="homepage-header text-center">
        <h1>Employees Shift Planner</h1>
        <p>Manage your employee schedules efficiently and effortlessly.</p>
      </header>
      <nav className="homepage-nav text-center">
        <Button variant="primary" href="/shiftplanner" className="m-2">Shift Planner</Button>
        <Button variant="secondary" href="/employee" className="m-2">Manage Employees</Button>
      </nav>
      <section className="homepage-features text-center">
        <Row>
          <Col md={4}>
            <Card className="feature-card">
              <Card.Body>
                <Card.Title>Create New Shift</Card.Title>
                <Card.Text>
                  Easily create and assign new shifts to your employees.
                </Card.Text>
                <Button variant="primary" href="/shiftplanner">Create Shift</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="feature-card">
              <Card.Body>
                <Card.Title>View Schedule</Card.Title>
                <Card.Text>
                  View and manage the complete schedule of your employees.
                </Card.Text>
                <Button variant="primary" href="/shiftplanner">View Schedule</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="feature-card">
              <Card.Body>
                <Card.Title>Manage Employees</Card.Title>
                <Card.Text>
                  Add, edit, and manage employee details and availability.
                </Card.Text>
                <Button variant="secondary" href="/employee">Manage Employees</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
      <footer className="homepage-footer text-center mt-4">
        <p>&copy; 2025 Employees Shift Planner. All rights reserved.</p>
      </footer>
    </Container>
  );
};

export default HomePage;