// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SchoolDetails from './Components/SchoolDetails';
import Header from './Header'; 
import CollegeList from './CollegeList';
import MessageBox from './MessageBox';
import Home2 from './Components/Home2';
import './App.css';
import Auth from './Auth';
import { CombinedProvider } from './Components/CollegeContext'; 
import CollegeSpreadsheet from './Components/CollegeSpreadsheet'


function App() {
  return (
  <CombinedProvider>
      <Router>
      <Header />
        <Routes>
          <Route path="/school/:ipedsId" element={<SchoolDetails />} />
          <Route path="/my-colleges-spreadsheet" element={<CollegeSpreadsheet />} /> {/* Corrected route */}
          <Route path="/" element={<Home2 />} />
        </Routes>
      </Router>
  </CombinedProvider>
  );
}

export default App;
