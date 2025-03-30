import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './login/Login';
import Home from './views/Home';

function AppRouter() {
    const token = localStorage.getItem('token');
  
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={'/login'}/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/home" element={<Home/>} />
        </Routes>
      </Router>
    );
}
  
export default AppRouter;