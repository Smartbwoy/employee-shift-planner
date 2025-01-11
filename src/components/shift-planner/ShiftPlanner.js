import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import "react-big-calendar/lib/css/react-big-calendar.css";
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Button, Form, Row, Col, Container, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ChromePicker } from 'react-color'

const baseApiUrl = "http://localhost:5113/api";

const locales = {
    "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
});

// const staff = [
//     { id: 1, name: 'Ryan', color: '#e20000', title: 'Cloud System Engineer' },
//     { id: 2, name: 'Kate', color: '#60e81a', title: 'Help Desk Specialist' },
//     { id: 3, name: 'John', color: '#3ba7ff', title: 'Application Developer' },
//     { id: 4, name: 'Mark', color: '#e25dd2', title: 'Network Administrator' },
//     { id: 5, name: 'Sharon', color: '#f1e920', title: 'Data Quality Manager' },
//     { id: 6, name: 'Emma', color: '#1ac38d', title: 'Product Tactics Agent' }
// ];

function ShiftPlanner() {
    const [staff, setStaff] = useState([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [currentShift, setCurrentShift] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [notes, setNotes] = useState("");
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [color, setColor] = useState('#ffffff');
    const queryClient = useQueryClient();

    // const { data: shifts = [], isLoading } = useQuery(['schedules'], async () => {
    //     const response = await axios.get(`${baseApiUrl}/Schedule`);
    //     return response.data;
    // });
    // const { data: shifts = [], isLoading } = useQuery({
    //     queryKey: ['schedules'],
    //     queryFn: async () => {
    //         const response = await axios.get(`${baseApiUrl}/Schedule`);
    //         return response.data;
    //     },
    // }); 
    const { data: shifts = [], isLoading } = useQuery({
        queryKey: ['schedules'], // Use a unique key to identify this query
        queryFn: async () => {
            const response = await axios.get(`${baseApiUrl}/Schedule`);
            return response.data;
        },
    });

    // Fetch employees using React Querya
    const { data: employees, isLoading: isStaffLoading, error } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const response = await axios.get(`${baseApiUrl}/Employee`);
            return response.data;
        },
    });

// Update staff state when employees data is fetched
React.useEffect(() => {
    if (employees) {
        setStaff(employees.map(emp => {
            const shift = shifts.find(shift => shift.employeeId === emp.employeeID);
            return {
                id: emp.employeeID,
                name: `${emp.firstName} ${emp.lastName}`,
                title: emp.position ? emp.position : 'Staff', // Adjust based on available properties
                color: shift ? shift.assignedColor : getRandomColor(), // Use the color from the shift or assign a random color
            };
        }));
    }
}, [employees, shifts]);

    // Helper function to generate random colors
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };


    const saveShiftMutation = useMutation({
        mutationFn: async (shift) => {
            if (shift.id) {
                await axios.put(`${baseApiUrl}/Schedule/${shift.id}`, shift);
            } else {
                await axios.post(`${baseApiUrl}/Schedule`, shift);
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
    });

    const deleteShiftMutation = useMutation({
        mutationFn: async (id) => {
            await axios.delete(`${baseApiUrl}/Schedule/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
    });
    /*
        const saveShiftMutation = useMutation(
            async (shift) => {
                if (shift.id) {
                    await axios.put(`${baseApiUrl}/Schedule/${shift.id}`, shift);
                } else {
                    await axios.post(`${baseApiUrl}/Schedule`, shift);
                }
            },
            {
                onSuccess: () => queryClient.invalidateQueries(['schedules']),
            }
        );
    
        const deleteShiftMutation = useMutation(
            async (id) => {
                await axios.delete(`${baseApiUrl}/Schedule/${id}`);
            },
            {
                onSuccess: () => queryClient.invalidateQueries(['schedules']),
            }
        );
    */
    const handleSelectSlot = useCallback(({ start, end }) => {
        setCurrentShift(null);
        setStartDate(start);
        setEndDate(end);
        setNotes("");
        setSelectedStaff(null);
        setColor('#ffffff'); // Reset color to default
        setIsOpen(true);
    }, []);

    const handleSelectEvent = useCallback((event) => {
        setCurrentShift(event);
        setStartDate(new Date(event.start));
        setEndDate(new Date(event.end));
        setNotes(event.notes || "");
        setSelectedStaff(staff.find((s) => s.id === event.resourceId) || null);
        setColor(event.assignedColor || '#ffffff'); // Set color to the event's color or default to white
        setIsOpen(true);
    }, []);

    const handleColorChange = (color) => {
        setColor(color.hex); // Update the color state when the color picker value changes
    };

    const saveShift = useCallback(() => {

        const shift = {
            id: currentShift?.id,
            startTime: startDate,
            endTime: endDate,
            title: `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`,
            notes,
            employeeId: selectedStaff?.id,
            status: true,
        };
        saveShiftMutation.mutate(shift);
        setIsOpen(false);
    }, [currentShift, startDate, endDate, notes, selectedStaff, saveShiftMutation]);

    // const saveShift = useCallback(() => {
    //     if (currentShift) {
    //         setShifts((prev) =>
    //             prev.map((shift) =>
    //                 shift.id === currentShift.id
    //                     ? { ...shift, start: startDate, end: endDate, notes, resourceId: selectedStaff?.id }
    //                     : shift
    //             )
    //         );
    //     } else {
    //         setShifts((prev) => [
    //             ...prev,
    //             {
    //                 id: currentShift?.id,
    //                 start: startDate,
    //                 end: endDate,
    //                 title: `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`,
    //                 notes,
    //                 resourceId: selectedStaff?.id
    //             }
    //         ]);
    //     }
    //     setIsOpen(false);
    // }, [currentShift, startDate, endDate, notes, selectedStaff]);

    const deleteShift = useCallback(() => {
        if (currentShift) {
            deleteShiftMutation.mutate(currentShift.id);
        }
        setIsOpen(false);
    }, [currentShift, deleteShiftMutation]);

    if (isLoading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }
    if (isStaffLoading) return <div>Loading staff...</div>;
    if (error) return <div>Error loading staff: {error.message}</div>;

    return (
        <Container>
            <h1 className="text-center my-4">Shift Planner</h1>
            <Calendar
                localizer={localizer}
                events={shifts.map((shift) => ({
                    ...shift,
                    start: new Date(shift.startTime),
                    end: new Date(shift.endTime),
                    title: `${shift.employeeId} ${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`,
                    resource: staff.find((s) => s.id === shift.employeeId)?.name,
                }))}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500, marginBottom: "30px" }}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={(event) => {
                    const staffMember = staff.find((s) => s.id === event.employeeId);
                    return {
                        style: {
                            backgroundColor: staffMember?.color || "#3174ad",
                            color: "#fff",
                        },
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
                    },
                }}
            >
                <h2 className="text-center mb-4">{currentShift ? "Edit Shift" : "New Shift"}</h2>
                <Form>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="3">Assign Staff:</Form.Label>
                        <Col sm="9">
                            <Form.Select
                                value={selectedStaff?.id || ""}
                                onChange={(e) =>
                                    setSelectedStaff(staff.find((s) => s.id === e.target.value))//parseInt(e.target.value)))
                                }
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
                        <Form.Label column sm="3">Color:</Form.Label>
                        <Col sm="9">
                            <ChromePicker color={color} onChange={handleColorChange} />
                        </Col>
                    </Form.Group>
                    <div className="text-center">
                        <Button
                            variant="primary"
                            onClick={async () => {
                                if (!startDate || !endDate || !selectedStaff) {
                                    alert("Please fill in all fields.");
                                    return;
                                }
                                const shift = {
                                    id: currentShift?.id,
                                    startTime: startDate.toISOString(),
                                    endTime: endDate.toISOString(),
                                    notes,
                                    employeeId: selectedStaff.id,
                                    assignedColor: color
                                };
                                await saveShiftMutation.mutateAsync(shift);
                                setIsOpen(false);
                            }}
                            className="me-2"
                        >
                            {currentShift ? "Save" : "Add"}
                        </Button>
                        {currentShift && (
                            <Button
                                variant="danger"
                                onClick={async () => {
                                    await deleteShiftMutation.mutateAsync(currentShift.id);
                                    setIsOpen(false);
                                }}
                                className="me-2"
                            >
                                Delete
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </Form>
            </Modal>
        </Container>

    );
}

export default ShiftPlanner;
