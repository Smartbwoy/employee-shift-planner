// import logo from './logo.svg';
import './App.css';
import React from 'react';
import NavigationBar from './components/navigation/NavigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router-dom';
import ShiftPlanner from './components/shift-planner/ShiftPlanner';
import Employee from './components/employee/Employee'
import HomePage from './components/HomePage';
import Login from './components/Login';

function App() {
    return (
        <>
            <NavigationBar/>
            <Routes>
                <Route exact path="/" element={<HomePage/>}/>
                <Route exact path="/employee-shift-planner" element={<HomePage/>}/>
                <Route path='/shiftplanner' element={<ShiftPlanner/>}/>
                <Route path='/employee' element={<Employee/>}/>
                <Route path='/login' element={<Login/>}/>
            </Routes>
        </>
    )
}

export default App;
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
