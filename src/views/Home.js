import { Avatar, Box, CircularProgress, Input, InputAdornment, Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import axios from "axios";

function Home() {
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const rol = localStorage.getItem('role');
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    _id: rol === '0',
  });
  
  
  const BACKEND_URL = process.env.REACT_APP_BACK_URL;
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
  };

  const columns = [
    { field: '_id', headerName: 'ID', flex: 1, },
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
        console.log(response.data); 
        setComponents(response.data); 
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);

  if (loading) return <CircularProgress />;
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        maxHeight: '100vh',
        width: '100%',
        background: 'var(--color-bg-gradient)',  // Uso de variable
        overflow: 'hidden',
      }}
    >
      {/* Barra lateral */}
      <SideBar />

      {/* Contenido principal */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '85%',
          maxHeight: '90vh',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'var(--color-blur-bg)',
          borderRadius: '15px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
          mx: 'auto',
          my: '2rem',
          p: 4
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 5,
            mb: 4,
          }}
        >
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
                    height: '20px',
                    width: '20px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    transition: 'filter 0.3s, transform 0.3s',
                    filter: 'invert(70%)',
                    '&.focus-icon': {
                      filter: 'invert(100%)',
                      transform: 'scale(1.1)',
                    },
                  }}
                  className="search-icon"
                />
              </InputAdornment>
            }
            placeholder="Buscar"
            sx={{
              borderRadius: '8px',
              backgroundColor: 'var(--color-celeste-claro)',
              padding: '0.5rem 1rem',
              width: '100%',
              maxWidth: '30rem',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
              color: 'var(--color-text-base)',
              transition: 'all 0.3s ease',
              '& input': {
                color: 'var(--color-text-base)',
              },
              '&:focus-within': {
                backgroundColor: 'var(--color-celeste-focus)',
                boxShadow: '0px 0px 8px var(--color-celeste-focus)',
              },
            }}
            onFocus={() => {
              const icon = document.querySelector('.search-icon');
              icon?.classList.add('focus-icon');
            }}
            onBlur={() => {
              const icon = document.querySelector('.search-icon');
              icon?.classList.remove('focus-icon');
            }}
            size="small"
          />
        </Box>

        {/* Tabla */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            height: '100%',
            overflow: 'hidden',
          }}
        >
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
              rows={components}
              columns={columns}
              columnVisibilityModel={columnVisibilityModel}
              showCellVerticalBorder
              showColumnVerticalBorder
              getRowId={(row) => row._id}
              onRowClick={(params) => {
                navigate(`/components/${params.row._id}`);
              }}
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
                border: '1px solid white',
                borderRadius: '25px',
                color: 'var(--color-text-base)',
                fontSize: '1rem',
                background: 'transparent',
                '& .fila-activa': {
                  color: 'var(--color-text-active)',
                },
                '& .fila-baja': {
                  color: 'var(--color-text-baja)',
                  fontStyle: 'italic',
                },
                '.MuiDataGrid-columnHeader': {
                  backgroundColor: 'var(--color-dg-header-bg)',
                  borderBottom: 'none',
                  color: '#fff',
                },
                '.MuiDataGrid-cell': {
                  borderBottom: 'none',
                  backgroundColor: 'var(--color-dg-cell-bg)',
                  color: 'var(--color-datagrid-cell-text)',
                },
                '.MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                },
                '.MuiDataGrid-footerContainer': {
                  bgcolor: 'rgb(141, 169, 201)',
                  borderTop: 'none',
                },
                '[class*="MuiTablePagination"]': {
                  color: 'var(--color-pagination)',
                },
                '.MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '.MuiDataGrid-columnHeader:focus, .MuiDataGrid-columnHeader:focus-within': {
                  outline: 'none',
                },
                // Filas pares e impares con color alterno
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
    </Box>
  );
}

export default Home;