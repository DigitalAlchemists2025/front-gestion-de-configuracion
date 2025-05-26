import { Avatar, Box, Input, InputAdornment, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import axios from "axios";
import LoadingCircle from "../components/LoadingCircle";

function Home() {
  const navigate = useNavigate();
  const [allComponents, setAllComponents] = useState([]);
  const [components, setComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const BACKEND_URL = process.env.REACT_APP_BACK_URL;
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.replace('/login');
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
        
        const componentsSorted = response.data.sort((a, b) => {
          if (a.updatedAt < b.updatedAt) return 1;
          if (a.updatedAt > b.updatedAt) return -1;
          return 0;
        });
        
        setAllComponents(componentsSorted);
        setComponents(componentsSorted); 
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response.data.error.statusCode === 401) {
          localStorage.clear();
          window.location.replace("/login")
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  
    const searched = allComponents.filter((c) =>
      c.name.toLowerCase().includes(value.toLowerCase()) ||
      c.type.toLowerCase().includes(value.toLowerCase()) 
      /* || c.hijos.name || c.hijos.type */
    );
  
    setComponents(searched);
  };  
  
  if (loading)
    return (
      <LoadingCircle></LoadingCircle>
    );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        height: "100vh",
        width: '100%',
        background: 'var(--color-bg-gradient)', 
        overflow: 'hidden',
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      {/* Barra lateral de opciones */}
      <SideBar />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: "relative",
          width: '85%',
          maxHeight: '100vh',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'var(--color-blur-bg)',
          borderRadius: '15px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          mx: 'auto',
          p: 4,
          overflow: 'hidden',
        }}
      >

        {/* Barra de Búsqueda */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 5,
            mb: 4,
          }}
        >
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
                    filter: 'invert(20%)',
                  }}
                  className="search-icon"
                />
              </InputAdornment>
            }
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar"
            sx={{
              borderRadius: '8px',
              backgroundColor: 'var(--bg-inputs)',
              padding: '0.5rem 1rem',
              width: '100%',
              maxWidth: '30rem',
              color: 'var(--color-text-base)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
              '& input': {
                color: 'var(--color-text-base)',
              },
              '&:focus-within': {
                backgroundColor: 'var(--color-celeste-focus)',
                boxShadow: '0 0 5px var(--color-celeste-focus)',
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

        {/* Tabla de Componentes */}
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
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <DataGrid
              rows={components}
              columns={columns}
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
                border: '1px solid #e0e0e0',
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
                  backgroundColor: 'var(--color-bg-secondary)',
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
                '.MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '.MuiDataGrid-columnHeader:focus, .MuiDataGrid-columnHeader:focus-within': {
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
    </Box>
  );
}

export default Home;