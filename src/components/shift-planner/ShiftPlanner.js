import React, { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import "react-big-calendar/lib/css/react-big-calendar.css";
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Button, Form, Row, Col, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const locales = {
    "en-US": require("date-fns/locale/en-US")
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
});

const staff = [
    { id: 1, name: 'Ryan', color: '#e20000', title: 'Cloud System Engineer' },
    { id: 2, name: 'Kate', color: '#60e81a', title: 'Help Desk Specialist' },
    { id: 3, name: 'John', color: '#3ba7ff', title: 'Application Developer' },
    { id: 4, name: 'Mark', color: '#e25dd2', title: 'Network Administrator' },
    { id: 5, name: 'Sharon', color: '#f1e920', title: 'Data Quality Manager' },
    { id: 6, name: 'Emma', color: '#1ac38d', title: 'Product Tactics Agent' }
];

const defaultShifts = [
    { id: 1, start: new Date(2023, 11, 29, 7, 0), end: new Date(2023, 11, 29, 13, 0), title: '07:00 - 13:00', resourceId: 2 },
    { id: 2, start: new Date(2023, 11, 29, 12, 0), end: new Date(2023, 11, 29, 18, 0), title: '12:00 - 18:00', resourceId: 3 }
];

function ShiftPlanner() {
    const [shifts, setShifts] = useState(defaultShifts);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [currentShift, setCurrentShift] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [notes, setNotes] = useState("");
    const [selectedStaff, setSelectedStaff] = useState(null);

    const handleSelectSlot = useCallback(({ start, end }) => {
        setCurrentShift(null);
        setStartDate(start);
        setEndDate(end);
        setNotes("");
        setSelectedStaff(null);
        setIsOpen(true);
    }, []);

    const handleSelectEvent = useCallback((event) => {
        setCurrentShift(event);
        setStartDate(event.start);
        setEndDate(event.end);
        setNotes(event.notes || "");
        setSelectedStaff(staff.find((s) => s.id === event.resourceId) || null);
        setIsOpen(true);
    }, []);

    const saveShift = useCallback(() => {
        if (currentShift) {
            setShifts((prev) =>
                prev.map((shift) =>
                    shift.id === currentShift.id
                        ? { ...shift, start: startDate, end: endDate, notes, resourceId: selectedStaff?.id }
                        : shift
                )
            );
        } else {
            setShifts((prev) => [
                ...prev,
                {
                    id: Math.max(...prev.map((s) => s.id)) + 1,
                    start: startDate,
                    end: endDate,
                    title: `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`,
                    notes,
                    resourceId: selectedStaff?.id
                }
            ]);
        }
        setIsOpen(false);
    }, [currentShift, startDate, endDate, notes, selectedStaff]);

    const deleteShift = useCallback(() => {
        if (currentShift) {
            setShifts((prev) => prev.filter((shift) => shift.id !== currentShift.id));
        }
        setIsOpen(false);
    }, [currentShift]);

    return (
        <Container>
            <h1 className="text-center my-4">Shift Planner</h1>
            <Calendar
                localizer={localizer}
                events={shifts.map(shift => ({ ...shift, resource: staff.find(s => s.id === shift.resourceId)?.name }))}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500, marginBottom: "30px" }}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={(event) => {
                    const staffMember = staff.find((s) => s.id === event.resourceId);
                    return {
                        style: {
                            backgroundColor: staffMember?.color || '#3174ad',
                            color: '#fff'
                        }
                    };
                }}
            />
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setIsOpen(false)}
                contentLabel="Shift Details"
                ariaHideApp={false}
                style={{
                    overlay: { zIndex: 1050 }, // Ensure modal overlay is above other elements
                    content: {
                        maxWidth: "600px",
                        margin: "auto",
                        padding: "20px",
                        borderRadius: "8px",
                    }
                }}
            >
                <h2 className="text-center mb-4">{currentShift ? "Edit Shift" : "New Shift"}</h2>
                <Form>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="3">Start Time:</Form.Label>
                        <Col sm="9">
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                className="form-control"
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="3">End Time:</Form.Label>
                        <Col sm="9">
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                className="form-control"
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="3">Notes:</Form.Label>
                        <Col sm="9">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="3">Assign Staff:</Form.Label>
                        <Col sm="9">
                            <Form.Select
                                value={selectedStaff?.id || ""}
                                onChange={(e) =>
                                    setSelectedStaff(staff.find((s) => s.id === parseInt(e.target.value)))
                                }
                            >
                                <option value="">Select Staff</option>
                                {staff.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} - {s.title}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Form.Group>
                    <div className="text-center">
                        <Button variant="primary" onClick={saveShift} className="me-2">
                            {currentShift ? "Save" : "Add"}
                        </Button>
                        {currentShift && <Button variant="danger" onClick={deleteShift} className="me-2">Delete</Button>}
                        <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
                    </div>
                </Form>
            </Modal>
        </Container>
    );
}

export default ShiftPlanner;
