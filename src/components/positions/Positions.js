import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import './Positions.css';

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    positionId: null,
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
      setError('Error fetching positions. Please try again later.');
      console.error('Error fetching positions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${config.api.baseUrl}${config.api.endpoints.positions}/${formData.positionId}`, formData);
      } else {
        await axios.post(`${config.api.baseUrl}${config.api.endpoints.positions}`, formData);
      }
      setShowModal(false);
      resetForm();
      fetchPositions();
    } catch (error) {
      setError(`Error ${isEditing ? 'updating' : 'creating'} position. Please try again.`);
      console.error(`Error ${isEditing ? 'updating' : 'creating'} position:`, error);
    }
  };

  const handleEdit = (position) => {
    setFormData({
      positionId: position.positionId,
      title: position.title,
      description: position.description,
      isActive: position.isActive
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (positionId) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        await axios.delete(`${config.api.baseUrl}${config.api.endpoints.positions}/${positionId}`);
        fetchPositions();
      } catch (error) {
        setError('Error deleting position. Please try again.');
        console.error('Error deleting position:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      positionId: null,
      title: '',
      description: '',
      isActive: true
    });
    setIsEditing(false);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="positions-container">
      <div className="positions-header">
        <h2>Positions Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add New Position
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

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
                <Button 
                  variant="info" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleEdit(position)}
                >
                  Edit
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDelete(position.positionId)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Position' : 'Add New Position'}</Modal.Title>
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
              {isEditing ? 'Update Position' : 'Save Position'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Positions; 