import { Box, Paper, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingCircle from "../components/LoadingCircle";
import SideBar from "../components/SideBar";

const ManageComponents = () => {
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const rol = localStorage.getItem('role');  

  const BACKEND_URL = process.env.REACT_APP_BACK_URL;
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
  }

  const columns = [
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'type', headerName: 'Tipo', flex: 1 },
    {
      field: 'status',
      headerName: 'Estado',
      flex: 1,
      cellClassName: (params) => {
        if (params.value === 'activo') return 'estado-activo';
        if (params.value === 'de baja') return 'estado-baja';
        return '';
      },
    },
    { field: 'descriptions', headerName: 'Descripciones', flex: 2 },
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

        const componentesMapped = response.data.map((component) => ({
          ...component,
          descriptions: component.descriptions.map((d) => `${d.name}: ${d.description}`).join(", "),
        }));

        setComponents(componentesMapped);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <LoadingCircle />;

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: "100vh",
        width: "100%",
        background: "var(--color-bg-gradient)",
        color: "var(--color-text-base)",
      }}
    >
      <SideBar />

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: "center",
          py: 4,
          px: 2,
        }}
      >
        <Typography variant="h4" sx={{ mb: 4 }}>
          Gestión de Componentes
        </Typography>

        <Paper
          sx={{
            flexGrow: 1,
            width: '90%',
            borderRadius: '16px',
            backgroundColor: 'transparent',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <DataGrid
            rows={components}
            columns={columns}
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
              border: '1px solid #e0e0e0',
              borderRadius: '25px',
              fontSize: '1rem',
              background: 'transparent',
              color: 'var(--color-text-base)',
              '& .fila-activa': {
                color: 'var(--color-text-active)',
              },
              '& .fila-baja': {
                color: 'var(--color-text-baja)',
                fontStyle: 'italic',
              },
              '.MuiDataGrid-columnHeader': {
                backgroundColor: 'var(--color-dg-header-bg)',
                color: '#ffffff',
                borderBottom: 'none',
              },
              '.MuiDataGrid-cell': {
                borderBottom: 'none',
                backgroundColor: 'var(--color-dg-cell-bg)',
                color: 'var(--color-datagrid-cell-text)',
              },
              '.MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.05)',
                cursor: 'pointer',
              },
              '.MuiDataGrid-footerContainer': {
                bgcolor: '#e3f2fd',
                borderTop: 'none',
              },
              '[class*="MuiTablePagination"]': {
                color: 'var(--color-pagination)',
              },
              '.MuiDataGrid-cell:focus, .MuiDataGrid-columnHeader:focus, .MuiDataGrid-columnHeader:focus-within': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:nth-of-type(even) .MuiDataGrid-cell': {
                backgroundColor: 'var(--color-dg-cell-bg-even)',
              },
              '& .MuiDataGrid-row:nth-of-type(odd) .MuiDataGrid-cell': {
                backgroundColor: 'var(--color-dg-cell-bg-odd)',
              },
            }}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default ManageComponents;