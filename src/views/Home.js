import { Avatar, Box, Button, Card, CardActions, CardContent, CardMedia, Chip, Input, InputAdornment, Paper, Typography } from "@mui/material";
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
        console.log('Componentes obtenidos:', componentsSorted);
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

        {/* Cartas de Componentes */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexGrow: 1,
            flexWrap: 'wrap',
            justifyContent: 'center',
            height: '100%',
            overflowY: 'auto',
          }}
        >
          {allComponents.length === 0 ? (
            <Typography color="text.secondary">No hay componentes disponibles.</Typography>
          ) : (
            allComponents.map((c, idx) => (
              <Card key={idx} sx={{ width: '30%', minWidth: "30%", height: "50%", m: 2, borderRadius: '15px', boxShadow: 3, display: 'grid', flexDirection: 'column', color: "var(--color-title-primary)" }}>
                <Box sx={{ px: 2, pt: 2, gap: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h4" sx={{ color: "var(--color-title-primary)" }}>
                    {c.name}
                  </Typography>
                  <Typography variant="h6" component="div" gutterBottom>
                    {c.type}
                  </Typography>
                </Box>
                <CardContent sx={{ px: 2, maxHeight: '60%', overflowY: 'auto',  }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {c.status}
                  </Typography>
                  {c.descriptions.length > 0 && (
                    <Typography sx={{ mb: 1 }}>Características:</Typography>
                  )}
                  {c.descriptions.length > 0 && c.descriptions.map((d, index) => (
                    <Chip
                      key={index}
                      label={`${d.name}: ${d.description}`}
                      size="small"
                      sx={{ m: 1, maxWidth: '90%' }}
                    />
                  ))}
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between", px: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {c.properties}
                  </Typography>
                  <Button variant="contained" size="small">
                    Ver más
                  </Button>
                </CardActions>
              </Card>
          )))}
        </Box>
      </Box>
    </Box>
  );
}

export default Home;