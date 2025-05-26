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
        window.location.replace('/login');
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '25%vw',
            minWidth: "20em",
            backgroundColor: 'var(--color-bg-secondary)',
            p: 2,
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            height: '100vh',
            position: "sticky"
        }}>
            <Box sx={{
                display: "flex",
                width: "100%",
                height: "7.5%",
                minHeight: "5em",
                py: 5,
                gap: 3,
                justifyContent: "space-evenly"
            }}>
                <img src="/logoUCN.png"></img>
                <img src="/logoEIC.png"></img>
            </Box>
            {rol === '0' && (
                <>
                    <ListButtonItem nombre="Ver Componentes" onClick={() => navigate('/home')} />
                    <ListButtonItem nombre="Gestionar Componentes" onClick={() => navigate('/gestionar-componentes')} />
                    <ListButtonItem nombre="Agregar Componentes" onClick={() => navigate('/agregar-componentes')} />
                    <ListButtonItem nombre="Ver Historial" onClick={() => navigate('/ver-historial')} />
                </>
            )}
            <ListButtonItem nombre="Cerrar Sesión" onClick={HandleCerrarSesion} />
        </Box>
    );
}

export default SideBar;