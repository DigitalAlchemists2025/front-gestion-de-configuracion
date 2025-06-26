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
    const token = localStorage.getItem('token');
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
          <Route path="/gestionar-componentes" element={token? <ManageComponents/> : <Login/>} />
          <Route path="/ver-historial" element={token? <History/> : <Login/>} />
          <Route path="/users" element={token? <ManageUsers/> : <Login/>} />
        </Routes>
      </Router>
    );
}
  
export default AppRouter;