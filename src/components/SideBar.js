import { Box } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import ListButtonItem from "./ListButtonItem";

function SideBar() {
    const navigate = useNavigate();

    const HandleCerrarSesion = () => {
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
                color: '#ffffff', // Texto blanco
                p: 2, // Padding interno
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Sombra suave
                borderRadius: '15px', // Bordes redondeados
                height: '100vh', // Ocupar toda la altura de la pantalla
            }}
        >
            {/* Botones de navegación */}
            <ListButtonItem nombre="Ver Componentes" onClick={() => navigate('/ver-componentes')} />
            <ListButtonItem nombre="Agregar Componentes" onClick={() => navigate('/agregar-componentes')} />
            <ListButtonItem nombre="Ver Historial" onClick={() => navigate('/ver-historial')} />
            <ListButtonItem nombre="Cerrar Sesión" onClick={HandleCerrarSesion} />
        </Box>
    );
}

export default SideBar;