import { Avatar, Box, Button, Input, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import React from "react";
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";

function Home() {
    const navigate = useNavigate();

    const columns = [
        { field: 'nombre', headerName: 'Nombre', width: 150 },
        { field: 'id', headerName: 'ID', width: 150 },
        { field: 'tipo', headerName: 'Tipo', width: 150 },
        { field: 'estado', headerName: 'Estado', width: 150 }
    ];

    const rows = [
        { id: 1, nombre: 'Disco Duro', tipo: 'electrónica', estado: 'activo' },
        { id: 2, nombre: 'Monitor', tipo: 'electrónica', estado: 'activo' },
        { id: 3, nombre: 'mouse', tipo: 'electrónica', estado: 'dado de baja' },
    ]
    
    const paginationModel = { page: 0, pageSize: 5 };

    return (
        <Box 
            sx={{
                display: 'flex',
                flexDirection: 'row'
            }}
        >
            {/* Componente personalizado para la barra de navegación */}   
            <SideBar></SideBar>
            {/* Parte derecha que por el momento incluye un header de búsqueda y la tabla de datos*/}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '75%'
                }}
            >
                {/* Aquí es el box para el header */}
                <Box 
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        my: '2.5rem',
                        justifyContent: 'center',
                        gap: 5,
                        minWidth: '1000px'
                    }}
                >
                    <Box>
                        <Button variant="outlined" sx={{py: 1, px:3, gap: 1}}>
                            <Avatar variant="square" sx={{width: '1rem', height: '1rem'}} src="/filter-icon.png"></Avatar>
                            <Typography sx={{ fontSize: '1rem' }}>filtrar</Typography>
                        </Button>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'row'}}>
                        <Input
                        /* Falta hacer que la búsqueda sea responsive */
                            startAdornment = {
                            <Avatar variant='square' src="/search-icon.png"
                                sx={{
                                    p:1,
                                    borderRight: '1px solid',
                                    mr: 1,
                                    height: '20px',
                                    width: '20px'
                                }}
                            ></Avatar>
                            }
                            placeholder="Buscar"
                            sx={{
                                border: '1px solid black',
                                borderRadius: '5px',
                                width: '50em',
                                minWidth: '2rem'
                            }}
                            size="small"
                        ></Input>
                    </Box>
                </Box>
                {/* Aquí es el box para la tabla */}
                <Box>
                <Paper sx={{  width: '90%', margin: '0 auto' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{ pagination: { paginationModel } }}
                        pageSizeOptions={[5, 10]}
                        checkboxSelection
                        sx={{ border: 0 }}
                    />
                </Paper>
                </Box>
            </Box>
        </Box>
    )
}

export default Home;