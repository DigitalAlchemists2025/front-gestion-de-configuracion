import { Button, Card, List, ListItem, ListItemText } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import ListButtonItem from "./ListButtonItem";

function SideBar () {

    const navigate = useNavigate();

    const HandleCerrarSesion = () => {
        navigate('/login')
        alert("Ha cerrado sesión correctamente")
    }

    return(
        <List sx={{
            width: '25%', 
            mr: '2rem',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <ListButtonItem nombre={'Ver Componentes'}></ListButtonItem>
            <ListButtonItem nombre={'Agregar Componentes'}></ListButtonItem>
            <ListButtonItem nombre={'Ver Historial'}></ListButtonItem>
            <ListButtonItem nombre={'Cerrar Sesión'} onClick={HandleCerrarSesion}></ListButtonItem>
        </List>
    )
}

export default SideBar;