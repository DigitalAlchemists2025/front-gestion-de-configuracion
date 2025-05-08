import { Box } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import ListButtonItem from "./ListButtonItem";
import { getAuth, signOut } from "firebase/auth";

function SideBar() {
    const navigate = useNavigate();
    const rol = localStorage.getItem('role');

    const HandleCerrarSesion = () => {
        const auth = getAuth();
        if (auth.currentUser) {
            signOut(auth).then(() => {
                console.log("Sesión cerrada correctamente");
            }).catch((error) => {
                console.error("Error al cerrar sesión:", error);
            });
        }
        alert("Ha cerrado sesión correctamente");
        localStorage.clear();
        navigate('/login');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '15%',
                backgroundColor: 'var(--bg-paper)',
                color: 'var(--color-text-base)',
                p: 2,
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: '15px',
                height: '95vh',
            }}
        >
            <ListButtonItem nombre="Ver Componentes" onClick={() => navigate('/home')} />
            
            {rol === '0' && (
                <ListButtonItem nombre="Gestionar Componentes" onClick={() => navigate('/gestionar-componentes')} />
            )}
            {rol === '0' && (
                <ListButtonItem nombre="Agregar Componentes" onClick={() => navigate('/agregar-componentes')} />
            )}
            <ListButtonItem nombre="Ver Historial" onClick={() => navigate('/ver-historial')} />
            <ListButtonItem nombre="Cerrar Sesión" onClick={HandleCerrarSesion} />
        </Box>
    );
}

export default SideBar;