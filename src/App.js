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
import Checkout from './Components/Checkout'; 
import Success from './Components/Success';
import ProfileScreen from './Components/ProfileScreen';
import { Elements } from '@stripe/react-stripe-js';
import ProtectedRoute from './Components/ProtectedRoute';
import Login from './Components/Login';
import Terms from './Components/Terms';





function App() {
  
  return (
  <CombinedProvider>
      <Router>
      <Header />
        <Routes>
          <Route path="/school/:ipedsId" element={<SchoolDetails />} />
          <Route path="/my-colleges-spreadsheet" element={<CollegeSpreadsheet />} /> {}
          <Route path="/my-scholarships-spreadsheet" element={<ScholarshipSpreadsheet />} /> {}
          <Route path="/Upgrade" element={<Checkout/>} /> {}
          <Route path="/ProfileScreen" element={<ProfileScreen/>} /> {}
          <Route path="/success" element={<Success />} /> {}
          <Route path="/" element={<ProtectedRoute><Home2 /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </Router>
  </CombinedProvider>
  );
}

export default App;
