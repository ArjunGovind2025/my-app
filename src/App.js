// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SchoolDetails from './Components/SchoolDetails';
import Header from './Header'; 
import CollegeList from './CollegeList';
import MessageBox from './MessageBox';
import Home2 from './Components/Home2';
import './global.css';
//import './App.css';
import Auth from './Auth';
import { CombinedProvider } from './Components/CollegeContext'; 
import CollegeSpreadsheet from './Components/CollegeSpreadsheet'
import ScholarshipSpreadsheet from './Components/ScholarshipSpreadsheet'; 
import Checkout from './Components/Checkout'; // Adjust the import path accordingly
import Success from './Components/Success';
import ProfileScreen from './Components/ProfileScreen';
import { Elements } from '@stripe/react-stripe-js';





function App() {
  return (
  <CombinedProvider>
      <Router>
      <Header />
        <Routes>
          <Route path="/school/:ipedsId" element={<SchoolDetails />} />
          <Route path="/my-colleges-spreadsheet" element={<CollegeSpreadsheet />} /> {/* Corrected route */}
          <Route path="/my-scholarships-spreadsheet" element={<ScholarshipSpreadsheet />} /> {/* Add the new link */}
          <Route path="/Upgrade" element={<Checkout/>} /> {/* Add the new link */}
          <Route path="/ProfileScreen" element={<ProfileScreen/>} /> {/* Add the new link */}
          <Route path="/success" element={<Success />} /> {/* Add the Success route */}
          <Route path="/" element={<Home2 />} />
        </Routes>
      </Router>
  </CombinedProvider>
  );
}

export default App;
