import { Container, Row, Col, Button, Card } from "react-bootstrap"
import { Calendar, People, PlusCircleFill, Clock, ArrowRight } from "react-bootstrap-icons"
import "./HomePage.css"

const HomePage = () => {
  return (
    <Container className="homepage-container">
      {/* Hero Section */}
      <header className="homepage-header text-center py-5">
        <h1 className="display-4 fw-bold">Employees Shift Planner</h1>
        <p className="lead mb-4">Streamline your workforce management with our intuitive scheduling solution</p>
        <div className="d-flex justify-content-center gap-3 mb-5">
          <Button variant="primary" href="/shiftplanner" size="lg" className="d-flex align-items-center gap-2">
            Get Started <ArrowRight />
          </Button>
          <Button variant="outline-secondary" href="/employee" size="lg" className="d-flex align-items-center gap-2">
            Manage Employees <People />
          </Button>
        </div>
      </header>

      {/* Features Section */}
      <section className="homepage-features py-5">
        <h2 className="text-center mb-5 fw-bold">Key Features</h2>
        <Row className="g-4">
          <Col md={4}>
            <Card className="feature-card h-100">
              <Card.Body className="d-flex flex-column">
                <div className="text-center mb-3">
                  <PlusCircleFill className="feature-icon" />
                </div>
                <Card.Title className="text-center fw-bold">Create New Shift</Card.Title>
                <Card.Text className="text-center mb-4">
                  Easily create and assign new shifts to your employees.
                </Card.Text>
                <Card.Text className="text-muted small mb-4">
                  Set up recurring shifts, define roles, and assign employees with just a few clicks.
                </Card.Text>
                <div className="mt-auto">
                  <Button variant="primary" href="/shiftplanner" className="w-100 d-flex align-items-center justify-content-center gap-2">
                    Create Shift <ArrowRight />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="feature-card h-100">
              <Card.Body className="d-flex flex-column">
                <div className="text-center mb-3">
                  <Calendar className="feature-icon" />
                </div>
                <Card.Title className="text-center fw-bold">View Schedule</Card.Title>
                <Card.Text className="text-center mb-4">
                  View and manage the complete schedule of your employees.
                </Card.Text>
                <Card.Text className="text-muted small mb-4">
                  Get a clear overview of all shifts, filter by employee or department, and make adjustments as needed.
                </Card.Text>
                <div className="mt-auto">
                  <Button variant="primary" href="/shiftplanner" className="w-100 d-flex align-items-center justify-content-center gap-2">
                    View Schedule <ArrowRight />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="feature-card h-100">
              <Card.Body className="d-flex flex-column">
                <div className="text-center mb-3">
                  <People className="feature-icon" />
                </div>
                <Card.Title className="text-center fw-bold">Manage Employees</Card.Title>
                <Card.Text className="text-center mb-4">
                  Add, edit, and manage employee details and availability.
                </Card.Text>
                <Card.Text className="text-muted small mb-4">
                  Keep track of employee information, preferences, and availability to optimize your scheduling.
                </Card.Text>
                <div className="mt-auto">
                  <Button variant="secondary" href="/employee" className="w-100 d-flex align-items-center justify-content-center gap-2">
                    Manage Employees <ArrowRight />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5 my-5">
        <h2 className="text-center mb-5 fw-bold">Why Choose Our Planner?</h2>
        <Row className="text-center g-4">
          <Col sm={6} lg={3}>
            <div className="stat-item">
              <Clock className="stat-icon" />
              <h3 className="fw-bold">Save Time</h3>
              <p className="text-muted">Reduce scheduling time by up to 80%</p>
            </div>
          </Col>
          <Col sm={6} lg={3}>
            <div className="stat-item">
              <People className="stat-icon" />
              <h3 className="fw-bold">Happy Employees</h3>
              <p className="text-muted">Improve employee satisfaction</p>
            </div>
          </Col>
          <Col sm={6} lg={3}>
            <div className="stat-item">
              <Calendar className="stat-icon" />
              <h3 className="fw-bold">Flexible Scheduling</h3>
              <p className="text-muted">Adapt to changing needs quickly</p>
            </div>
          </Col>
          <Col sm={6} lg={3}>
            <div className="stat-item">
              <PlusCircleFill className="stat-icon" />
              <h3 className="fw-bold">Easy to Use</h3>
              <p className="text-muted">Intuitive interface for all users</p>
            </div>
          </Col>
        </Row>
      </section>

      {/* CTA Section */}
      <section className="text-center py-5">
        <h2 className="fw-bold mb-4">Ready to Get Started?</h2>
        <p className="lead mb-4">Join thousands of businesses that trust our shift planning solution</p>
        <Button variant="primary" size="lg" href="/shiftplanner" className="d-flex align-items-center gap-2 mx-auto">
          Start Planning Now <ArrowRight />
        </Button>
      </section>

      {/* Footer */}
      <footer className="homepage-footer text-center py-4">
        <p className="text-muted">&copy; {new Date().getFullYear()} Employees Shift Planner. All rights reserved.</p>
      </footer>
    </Container>
  )
}

export default HomePage