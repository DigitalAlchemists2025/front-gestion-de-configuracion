import { Avatar, Box, Button, Input, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import React from "react";
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";

function Home() {
    const navigate = useNavigate();

    const columns = [
        { field: 'nombre', headerName: 'Nombre', flex: 1 },
        { field: 'id', headerName: 'ID', flex: 1 },
        { field: 'tipo', headerName: 'Tipo', flex: 1 },
        { 
            field: 'estado', 
            headerName: 'Estado', 
            flex: 1,
            cellClassName: (params) => {
                if (params.value === 'activo') {
                  return 'estado-activo';
                } else if (params.value === 'dado de baja') {
                  return 'estado-baja';
                }
                return '';
              }
        }
    ];

    const rows = [
        { id: 1, nombre: 'Disco Duro', tipo: 'electrónica', estado: 'activo' },
        { id: 2, nombre: 'Monitor', tipo: 'electrónica', estado: 'activo' },
        { id: 3, nombre: 'mouse', tipo: 'electrónica', estado: 'dado de baja' },
        { id: 4, nombre: 'Disco Duro', tipo: 'electrónica', estado: 'activo' },
        { id: 5, nombre: 'Monitor', tipo: 'electrónica', estado: 'activo' },
        { id: 6, nombre: 'mouse', tipo: 'electrónica', estado: 'dado de baja' },
        { id: 7, nombre: 'Disco Duro', tipo: 'electrónica', estado: 'activo' },
        { id: 8, nombre: 'Monitor', tipo: 'electrónica', estado: 'activo' },
        { id: 9, nombre: 'mouse', tipo: 'electrónica', estado: 'dado de baja' },
        { id: 10, nombre: 'Monitor', tipo: 'electrónica', estado: 'activo' },
        { id: 11, nombre: 'mouse', tipo: 'electrónica', estado: 'dado de baja' },
        { id: 12, nombre: 'Disco Duro', tipo: 'electrónica', estado: 'activo' },
        { id: 13, nombre: 'Monitor', tipo: 'electrónica', estado: 'activo' },
        { id: 14, nombre: 'mouse', tipo: 'electrónica', estado: 'dado de baja' },
        { id: 15, nombre: 'Disco Duro', tipo: 'electrónica', estado: 'activo' },
        { id: 16, nombre: 'Monitor', tipo: 'electrónica', estado: 'activo' },
        { id: 17, nombre: 'mouse', tipo: 'electrónica', estado: 'dado de baja' },
        { id: 18, nombre: 'Disco Duro', tipo: 'electrónica', estado: 'activo' },
        { id: 19, nombre: 'Monitor', tipo: 'electrónica', estado: 'activo' },
        { id: 20, nombre: 'mouse', tipo: 'electrónica', estado: 'dado de baja' },
        { id: 21, nombre: 'Disco Duro', tipo: 'electrónica', estado: 'activo' },
        { id: 22, nombre: 'Monitor', tipo: 'electrónica', estado: 'activo' },
        { id: 23, nombre: 'mouse', tipo: 'electrónica', estado: 'dado de baja' },
        { id: 24, nombre: 'Monitor', tipo: 'electrónica', estado: 'activo' },
        { id: 25, nombre: 'mouse', tipo: 'electrónica', estado: 'dado de baja' },
        { id: 26, nombre: 'Disco Duro', tipo: 'electrónica', estado: 'activo' },
        { id: 27, nombre: 'Monitor', tipo: 'electrónica', estado: 'activo' },
        { id: 28, nombre: 'mouse', tipo: 'electrónica', estado: 'dado de baja' },
    ];

    const paginationModel = { page: 0, pageSize: 5 };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                maxHeight: '100vh',
                width: '100%',
                background: 'linear-gradient(180deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)',
                overflow: 'hidden'
            }}
        >
            {/* Barra lateral */}
            <SideBar />

            {/* Contenido principal */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '85%',
                maxHeight: '90hv',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '15px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                mx: 'auto',
                my: '2rem',
                p: 4
            }}>
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 5,
                    mb: 4,
                }}>
                    {/* Barra de búsqueda */}
                    <Input
                    startAdornment={
                        <InputAdornment position="start">
                            <Avatar
                                variant="square"
                                src="/search-icon.png"
                                sx={{
                                    p: 1,
                                    mr: 1,
                                    left: 0,
                                    height: '20px',
                                    width: '20px',
                                    backgroundColor: 'rgba(33, 57, 85, 0.23)',
                                    border: 'none',
                                    borderRadius: '4px',
                                }}
                            />
                        </InputAdornment>
                    }
                    placeholder="Buscar"
                    sx={{
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        backgroundColor: 'rgba(46, 76, 133, 0.26)',
                        padding: '0.5rem',
                        width: '100%',
                        maxWidth: '30rem',
                        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                        outline: 'none',
                        border: 'none',
                        color: 'rgb(174, 212, 255)',
                        '&:hover': {
                            borderColor: 'transparent',
                        },
                        '&:focus': {
                            outline: 'none',
                            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                        },
                    }}
                    size="small"
                />
                </Box>

                {/* Tabla */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    height: '100%',
                    overflow: 'hidden',
                }}>
                    <Paper
                        sx={{
                            flexGrow: 1,
                            mx: 'auto',
                            my: 4,
                            width: '90%',
                            overflow: 'hidden',
                            borderRadius: '16px',
                            backgroundColor: 'transparent',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                        }}
                        >
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            getRowClassName={(params) => {
                                if (params.row.estado === 'activo') return 'fila-activa';
                                if (params.row.estado === 'dado de baja') return 'fila-baja';
                                return '';
                            }}
                            initialState={{
                                pagination: { paginationModel: { page: 0, pageSize: 10 } },
                            }}
                            pageSizeOptions={[5, 10, 15]}
                            sx={{
                                border: 'none',
                                color: 'rgb(174, 212, 255)',
                                fontSize: '1rem',
                                background: 'transparent',
                                '& .fila-activa': {
                                    color: '#00eaff',
                                },
                                '& .fila-baja': {
                                    color: '#a0a0a0',
                                    fontStyle: 'italic',
                                },
                                '.MuiDataGrid-columnHeader': {
                                    backgroundColor: 'rgb(43, 43, 117)',
                                    borderBottom: 'none',
                                },
                                '.MuiDataGrid-cell': {
                                    borderBottom: 'none',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                },
                                '.MuiDataGrid-row:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    cursor: 'pointer',
                                },
                                '.MuiDataGrid-footerContainer': {
                                    bgcolor: 'transparent',
                                    borderTop: 'none',
                                },
                                '[class*="MuiTablePagination"]': {
                                    color: 'rgb(0, 51, 109)',
                                },
                                '.MuiDataGrid-cell:focus': {
                                    outline: 'none',
                                },
                                '.MuiDataGrid-columnHeader:focus, .MuiDataGrid-columnHeader:focus-within': {
                                    outline: 'none',
                                },
                            }}
                        />
                        </Paper>
                </Box>
            </Box>
        </Box>
    );
}

export default Home;