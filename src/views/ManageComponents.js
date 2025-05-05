import { Box, Paper, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ManageComponents = () => {
    const navigate = useNavigate();
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(false);
    const rol = localStorage.getItem('role');  
    
    const BACKEND_URL = process.env.REACT_APP_BACK_URL;
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    };
    const columns = [
        { field: 'name', headerName: 'Nombre', flex: 1, },
        { field: 'type', headerName: 'Tipo', flex: 1 },
        {
          field: 'status',
          headerName: 'Estado',
          flex: 1,
          cellClassName: (params) => {
            if (params.value === 'activo') {
              return 'estado-activo';
            } else if (params.value === 'de baja') {
              return 'estado-baja';
            }
            return '';
          }
        }
      ];
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BACKEND_URL}/components`, {
                    headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    },
                });
                setComponents(response.data); 
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);
    
    return (
        <Box 
            sx={{
                minHeight: "100vh",
                minWidth: "100vw",
                background: "var(--color-bg-gradient)",
                color: "var(--color-text-base)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "start",
                alignItems: "center",
            }}
            >
            <Typography variant="h4" sx={{ margin: '2em 0', textAlign: 'center' }}>
                Gestión de Componentes
            </Typography>
            
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    width: '100%',
                    overflow: 'hidden',
                }}
            >
                <Paper
                    sx={{
                        flexGrow: 1,
                        mx: 'auto',
                        my: 4,
                        width: '90%',
                        borderRadius: '16px',
                        backgroundColor: 'transparent',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column', 
                    }}
                    >
                    <DataGrid
                        rows={components}
                        columns={columns}
                        showCellVerticalBorder
                        showColumnVerticalBorder
                        getRowId={(row) => row._id}
                        onRowClick={(params) => navigate(`/components/${params.row._id}`)}
                        getRowClassName={(params) => {
                            if (params.row.status === 'activo') return 'fila-activa';
                            if (params.row.status === 'de baja') return 'fila-baja';
                            return '';
                        }}
                        initialState={{
                            pagination: { paginationModel: { page: 0, pageSize: 10 } },
                        }}
                        pageSizeOptions={[5, 10, 15]}
                        sx={{
                            flex: 1,
                            minHeight: '100%',
                            border: '1px solid white',
                            borderRadius: '25px',
                            color: 'var(--color-text-base)',
                            fontSize: '1rem',
                            background: 'transparent',
                            '& .MuiDataGrid-columnHeader': {
                                backgroundColor: 'var(--color-dg-header-bg)',
                                borderBottom: 'none',
                                color: '#fff',
                            },
                            '.MuiDataGrid-cell': {
                                borderBottom: 'none',
                                backgroundColor: 'var(--color-dg-cell-bg)',
                                color: 'var(--color-datagrid-cell-text)',
                            },
                            '.MuiDataGrid-footerContainer': {
                                bgcolor: 'rgb(141, 169, 201)',
                                borderTop: 'none',
                                position: 'sticky', // Mantiene el footer visible
                                bottom: 0, // Lo ancla abajo
                            },
                        }}
                    />
                </Paper>
            </Box>
        </Box>
    )
}

export default ManageComponents;