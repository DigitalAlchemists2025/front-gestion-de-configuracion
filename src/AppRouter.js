import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Register from './auth/Register';
import Home from './views/Home';
import ComponentDetail from './views/ComponentDetail';
import AddComponent from './views/AddComponent';
import ManageComponents from './views/ManageComponents';
import History from './views/History';
import ManageUsers from './views/ManageUsers';

function AppRouter() {
    // constante para gestionar el acceso a las vistas según sesión iniciada
    const token = localStorage.getItem('token');

    // constante para gestionar el acceso a las vistas según rol del usuario
    const isOne = localStorage.getItem('role') === '1';
  
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={ token? '/home' : '/login'}/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/home" element={token? <Home/> : <Login/>} />
          <Route path="/agregar-componentes" element={token? (!isOne? <AddComponent/> : <Home/>) : <Login/>} />
          <Route path="/components/:id" element={token? <ComponentDetail/> : <Login/>} />
          <Route path="/gestionar-componentes" element={token? (!isOne? <ManageComponents/> : <Home/>) : <Login/>} />
          <Route path="/ver-historial" element={token? (!isOne? <History/> : <Home/>) : <Login/>} />
          <Route path="/users" element={token? (!isOne? <ManageUsers/> : <Home/>) : <Login/>} />
          <Route path="*" element={<Home/>} /> 
        </Routes>
      </Router>
    );
}
  
export default AppRouter;