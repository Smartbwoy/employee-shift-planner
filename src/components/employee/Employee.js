import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import axios from "axios"; // Ensure axios is installed: npm install axios
import { useTable, usePagination, useSortBy, useGlobalFilter } from "react-table";

function Employee() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const baseApiUrl = "http://localhost:5113/api"; // Replace with your actual API base URL

  // Fetch employees from the database on component mount
  // eslint-disable-next-line no-undef
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(baseApiUrl+"/Employee");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);
  // const [employees, setEmployees] = useState([
  //   { id: 1, name: "John Doe", position: "Software Engineer" },
  //   { id: 2, name: "Jane Smith", position: "Product Manager" },
  // ]);

  const handleShowModal = (employee = null) => {
    setSelectedEmployee(employee);
    setIsEditing(!!employee);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
    setIsEditing(false);
    setShowModal(false);
  };
/*
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const position = form.position.value;

    if (isEditing && selectedEmployee) {
      const updatedEmployees = employees.map((emp) =>
        emp.id === selectedEmployee.id ? { ...emp, name, position } : emp
      );
      setEmployees(updatedEmployees);
    } else {
      const newEmployee = {
        id: employees.length + 1,
        name,
        position,
      };
      setEmployees([...employees, newEmployee]);
    }

    handleCloseModal();
  };
*/
/*
  const handleDeleteEmployee = (id) => {
    const updatedEmployees = employees.filter((employee) => employee.id !== id);
    setEmployees(updatedEmployees);
  };
  */

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const employeeID = 'empID'
    const firstName = form.firstName.value;
    const middleName = form.middleName.value;
    const lastName = form.lastName.value;
    const position = form.position.value;
    const email = form.email.value;

    if (isEditing && selectedEmployee) {
      // Update employee via API
      try {
        await axios.put(`${baseApiUrl}/Employee/${selectedEmployee.employeeID}`, { 
                                                                                  employeeID: selectedEmployee.employeeID, 
                                                                                  firstName,
                                                                                  middleName,
                                                                                  lastName, 
                                                                                  position,
                                                                                  email
                                                                                });
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.employeeID === selectedEmployee.employeeID 
              ? { ...emp, firstName,
                          lastName,
                          middleName, 
                          position,
                          email
            } : emp
          )
        );
      } catch (error) {
        console.error("Error updating employee:", error);
      }
    } else {
      // Add new employee via API
      try {
        const response = await axios.post(baseApiUrl+"/Employee", { 
          employeeID,
          firstName,
          lastName,
          middleName,
          position,
          email 
        });
        setEmployees((prev) => [...prev, response.data]);
      } catch (error) {
        console.error("Error adding employee:", error);
      }
    }

    handleCloseModal();
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await axios.delete(`${baseApiUrl}/Employee/${id}`);
      setEmployees((prev) => prev.filter((employee) => employee.employeeID !== id));
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  // React-Table Setup
  const columns = React.useMemo(
    () => [
      {
        Header: "Employee ID",
        accessor: "employeeID",
      },
      {
        Header: "First Name",
        accessor: "firstName",
      },
      {
        Header: "Middle Name",
        accessor: "middleName",
      },
      {
        Header: "Last Name",
        accessor: "lastName",
      },
      {
        Header: "Position",
        accessor: "position",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Actions",
        accessor: "actions",
        disableSortBy: true,
        Cell: ({ row }) => (
          <div>
            <Button
              variant="warning"
              size="sm"
              className="me-2"
              onClick={() => handleShowModal(row.original)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteEmployee(row.original.employeeID)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state,
    setGlobalFilter,
    pageOptions,
  } = useTable(
    {
      columns,
      data: employees,
      initialState: { pageSize: 5 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { globalFilter, pageIndex } = state;
  


  return (
    <div className="container mt-4">
      <h1>Employee Management</h1>
      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          value={globalFilter || ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="form-control w-25"
        />
        <Button variant="primary" onClick={() => handleShowModal()}>
          Add Employee
        </Button>
      </div>
      <Table {...getTableProps()} striped bordered hover>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </Table>
      <div className="d-flex justify-content-between align-items-center mt-3">
        <Button variant="secondary" onClick={previousPage} disabled={!canPreviousPage}>
          Previous
        </Button>
        <span>
          Page {pageIndex + 1} of {pageOptions.length}
        </span>
        <Button variant="secondary" onClick={nextPage} disabled={!canNextPage}>
          Next
        </Button>
      </div>

      {/* Add/Edit Employee Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Employee" : "Add Employee"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                placeholder="Enter First Name"
                defaultValue={selectedEmployee ? selectedEmployee.firstName : ""}
                required
              />
              <Form.Control
                type="text"
                name="middleName"
                placeholder="Enter Middle Name"
                defaultValue={selectedEmployee ? selectedEmployee.middleName : ""}
                required
              />
              <Form.Control
                type="text"
                name="lastName"
                placeholder="Enter Last Name"
                defaultValue={selectedEmployee ? selectedEmployee.lastName : ""}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPosition" className="mb-3">
              <Form.Label>Position</Form.Label>
              <Form.Control
                type="text"
                name="position"
                placeholder="Enter Position"
                defaultValue={selectedEmployee ? selectedEmployee.position : ""}
                required
              />
            </Form.Group>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                name="email"
                placeholder="Enter Email"
                defaultValue={selectedEmployee ? selectedEmployee.email : ""}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              {isEditing ? "Save Changes" : "Add Employee"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
//   return (
//     <Container>
//       <Row className="mb-3">
//         <Col>
//           <h1>Employee Management</h1>
//         </Col>
//         <Col className="text-end">
//           <Button variant="primary" onClick={() => handleShowModal()}>
//             Add Employee
//           </Button>
//         </Col>
//       </Row>
//       <Row>
//         <ul className="list-group">
//           {employees.map((employee) => (
//             <li key={employee.employeeID} className="list-group-item d-flex justify-content-between align-items-center">
//               <span>
//                 {employee.firstName} {employee.lastName} - {employee.position}
//               </span>
//               <div>
//                 <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowModal(employee)}>
//                   Edit
//                 </Button>
//                 <Button variant="danger" size="sm" onClick={() => handleDeleteEmployee(employee.employeeID)}>
//                   Delete
//                 </Button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </Row>

//       {/* Add/Edit Employee Modal */}
//       <Modal show={showModal} onHide={handleCloseModal}>
//         <Modal.Header closeButton>
//           <Modal.Title>{isEditing ? "Edit Employee" : "Add Employee"}</Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleFormSubmit}>
//           <Modal.Body>
//             <Form.Group controlId="formName" className="mb-3">
//               <Form.Label>Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="firstName"
//                 placeholder="Enter First Name"
//                 defaultValue={selectedEmployee ? selectedEmployee.firstName : ""}
//                 required
//               />
//               <Form.Control
//                 type="text"
//                 name="middleName"
//                 placeholder="Enter Middle Name"
//                 defaultValue={selectedEmployee ? selectedEmployee.middleName : ""}
//                 required
//               />
//               <Form.Control
//                 type="text"
//                 name="lastName"
//                 placeholder="Enter Last Name"
//                 defaultValue={selectedEmployee ? selectedEmployee.lastName : ""}
//                 required
//               />
//             </Form.Group>
//             <Form.Group controlId="formPosition" className="mb-3">
//               <Form.Label>Position</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="position"
//                 placeholder="Enter Position"
//                 defaultValue={selectedEmployee ? selectedEmployee.position : ""}
//                 required
//               />
//             </Form.Group>
//             <Form.Group controlId="formEmail" className="mb-3">
//               <Form.Label>Email</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="email"
//                 placeholder="Enter Email"
//                 defaultValue={selectedEmployee ? selectedEmployee.email : ""}
//                 required
//               />
//             </Form.Group>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Close
//             </Button>
//             <Button variant="primary" type="submit">
//               {isEditing ? "Save Changes" : "Add Employee"}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </Container>
//   );
// }

export default Employee;
