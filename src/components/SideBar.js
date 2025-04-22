import { Box } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import ListButtonItem from "./ListButtonItem";
import { getAuth, signOut } from "firebase/auth";

function SideBar() {
    const navigate = useNavigate();

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
                color: '#ffffff', 
                p: 2, 
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', 
                borderRadius: '15px',
                height: '100vh', 
            }}
        >
            {/* Botones de navegación */}
            <ListButtonItem nombre="Ver Componentes" onClick={() => navigate('/ver-componentes')} />
            {localStorage.getItem('role') === '0' && (
                <ListButtonItem nombre="Agregar Componentes" onClick={() => navigate('/agregar-componentes')} />
            )}
            <ListButtonItem nombre="Ver Historial" onClick={() => navigate('/ver-historial')} />
            <ListButtonItem nombre="Cerrar Sesión" onClick={HandleCerrarSesion} />
        </Box>
    );
}

export default SideBar;