import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FarmerLogin from './FarmerLogin';

const Dashboard = () => (
  <div style={{ maxWidth: 600, margin: '2rem auto', padding: 20 }}>
    <h2>Farmer Dashboard</h2>
    <p>Welcome! You are logged in as a farmer.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FarmerLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
