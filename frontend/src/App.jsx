import './App.css'

// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeRoute from './routes/HomeRoute'; // Import HomeRoute from the routes folder

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        {/* Add more routes here, like about and contact */}
      </Routes>
    </Router>
  );
}

export default App;
