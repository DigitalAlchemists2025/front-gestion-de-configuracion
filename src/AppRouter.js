import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Home from './views/Home';
import AgregarComponentes from './views/AgregarComponentes';
import DetalleComponente from './views/DetalleComponente';

function AppRouter() {
    const token = localStorage.getItem('token');
    const isOne = localStorage.getItem('role') === '1';
  
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={ token? '/home' : '/login'}/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/home" element={token? <Home/> : <Login/>} />
          <Route path="/agregar-componentes" element={token? (!isOne? <AgregarComponentes/> : <Home/>) : <Login/>} />
          <Route path="/components/:id" element={token? <DetalleComponente/> : <Login/>} />
        </Routes>
      </Router>
    );
}
  
export default AppRouter;