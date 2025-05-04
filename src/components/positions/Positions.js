import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import './Positions.css';

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await axios.get(`${config.api.baseUrl}${config.api.endpoints.positions}`);
      setPositions(response.data);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.api.baseUrl}${config.api.endpoints.positions}`, formData);
      setShowModal(false);
      setFormData({ title: '', description: '', isActive: true });
      fetchPositions();
    } catch (error) {
      console.error('Error creating position:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="positions-container">
      <div className="positions-header">
        <h2>Positions Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add New Position
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(position => (
            <tr key={position.positionId}>
              <td>{position.title}</td>
              <td>{position.description}</td>
              <td>{position.isActive ? 'Active' : 'Inactive'}</td>
              <td>
                <Button variant="info" size="sm" className="me-2">Edit</Button>
                <Button variant="danger" size="sm">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Position</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isActive"
                label="Active"
                checked={formData.isActive}
                onChange={handleChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Position
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Positions; 