import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Home from './views/Home';
import AgregarComponentes from './views/AgregarComponentes';

function AppRouter() {
    const token = localStorage.getItem('token');
  
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={ token? '/home' : '/login'}/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/home" element={token? <Home/> : <Login/>} />
          <Route path="/agregar-componentes" element={<AgregarComponentes/>} />
        </Routes>
      </Router>
    );
}
  
export default AppRouter;