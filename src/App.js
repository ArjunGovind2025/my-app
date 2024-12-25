import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SchoolDetails from "./Components/SchoolDetails";
import Header from "./Header";
import CollegeSpreadsheet from "./Components/CollegeSpreadsheet";
import ScholarshipSpreadsheet from "./Components/ScholarshipSpreadsheet";
import Checkout from "./Components/Checkout";
import Success from "./Components/Success";
import ProfileScreen from "./Components/ProfileScreen";
import Home2 from "./Components/Home2";
import Login from "./Components/Login";
import Terms from "./Components/Terms";
import About from "./Components/About"
import "./global.css";
import { CombinedProvider } from "./Components/CollegeContext";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <CombinedProvider>
      <Router>
        {/* App Header */}
        <Header />

        {/* Route Configuration */}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />

          {/* Protected Home Route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home2 />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/school/:ipedsId"
            element={
                <SchoolDetails />
            }
          />
          <Route
            path="/my-colleges-spreadsheet"
            element={
              <ProtectedRoute>
                <CollegeSpreadsheet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-scholarships-spreadsheet"
            element={
              <ProtectedRoute>
                <ScholarshipSpreadsheet />
              </ProtectedRoute>
            }
          />
          <Route path="/Upgrade" element={<Checkout />} />
          <Route
            path="/ProfileScreen"
            element={
              <ProtectedRoute>
                <ProfileScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/success"
            element={
              <ProtectedRoute>
                <Success />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </CombinedProvider>
  );
}

export default App;
