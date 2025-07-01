import { Avatar, Box, Button, Card, CardContent, Chip, Input, InputAdornment, ListItem, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import axios from "axios";
import LoadingCircle from "../components/LoadingCircle";
import { GridCloseIcon } from "@mui/x-data-grid";

function Home() {
  let initialSearch = localStorage.getItem('searchedComponent');
  if (initialSearch === (null || undefined)) {
    localStorage.removeItem('searchedComponent');
    initialSearch = '';
  }
  localStorage.removeItem('selectedComponent');
  
  const [allComponents, setAllComponents] = useState([]);
  const [components, setComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [count, setCount] = useState(6);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const BACKEND_URL = process.env.REACT_APP_BACK_URL;
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.replace('/login');
  };

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

        if (initialSearch) {
          const response = await axios.get(`${BACKEND_URL}/components/search`,
            { 
              params: { q: initialSearch }, 
              headers: { 'Authorization': `Bearer ${token}` } 
            }
          );
          setComponents(response.data);
          setSearchTerm(initialSearch);
        } else {
          setComponents(componentsSorted);
        }

        setCount(6);
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
  }, [token, BACKEND_URL]);

  const handleSearch = async (value) => {
    setSearchTerm(value);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/components/search`,
        {
          params: { q: value },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComponents(response.data);
    } catch (error) {
      console.error(error);
    }
    setCount(6);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        height: "100vh",
        width: '100%',
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
          backgroundColor: 'var(--color-bg-gradient)',
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
            endAdornment={
              <InputAdornment position="end">
                <Button onClick={() => {handleSearch("");}}>
                  <GridCloseIcon/>
                </Button>
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

        {loading && (
          <LoadingCircle />
        )}
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
          {!loading && components.length <= 0 ? (
            <Typography color="text.secondary">No hay componentes disponibles.</Typography>
          ) : (
            components.slice(0, count).map((c, idx) => (
              <Card key={idx} sx={{ 
                width: '30%', 
                minWidth: "30%", 
                height: "55%", 
                minHeight: "300px",
                m: 2, 
                borderRadius: '15px', 
                boxShadow: 3, 
                display: 'grid',
                gridTemplateRows: 'auto 1fr auto', 
                color: "var(--color-title-primary)",
                fontFamily:"var(--font-source)", 
              }}>
                <Box sx={{ px: 2, pt: 2, gap: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h4" sx={{ color: "var(--color-title-primary)", fontFamily:"var(--font-montserrat)" }}>
                    {c.name.length > 30? `${c.name.slice(0, 30)}...` : c.name}
                  </Typography>
                  <Typography variant="h6" component="div" gutterBottom fontFamily={"var(--font-source)"}>
                    {c.type}
                  </Typography>
                </Box>
                <CardContent sx={{ px: 2, maxHeight: '100%', overflowY: 'auto'  }}>
                  <Typography variant="body1" color={c.status === 'de baja' ? 'textSecondary' : 'var(--color-title-primary)'} fontFamily={'var(--font-source)'} sx={{ mb: 1 }}>
                    Estado: {c.status}
                  </Typography>
                  {c.descriptions.length > 0 && (
                    <Typography fontFamily={'var(--font-source)'}>Características:</Typography>
                  )}
                  {c.descriptions.length > 0 && c.descriptions.slice(0, 3).map((d, index) => (
                    <Chip
                      key={index}
                      label={`${d.name}: ${d.description}`}
                      size="small"
                      sx={{ mt: 1, maxWidth: '90%', fontFamily:'var(--font-source)', mx: 0.25 }}
                    />
                  ))}
                  {c.components.length > 0 && (
                    <Typography sx={{ mt: 2, mb: 1, fontFamily: 'var(--font-source)' }}>Sub Componentes:</Typography>
                  )}
                  {c.components.length > 0 && c.components.slice(0, 3).map((sub, index) => (
                    <ListItem
                      key={index}
                      size="small"
                      sx={{ maxWidth: '90%' }}
                    >
                      {`${sub.name}`}
                    </ListItem>
                  ))}
                </CardContent>
                <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Button variant="contained" size="small"
                    onClick={() => {
                      localStorage.setItem("searchedComponent", `${searchTerm}`);
                      navigate(`/components/${c._id}`);
                    }}
                    sx={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      color: 'var(--color-title-secondary)',
                      maxHeight: '30px',
                      fontFamily:'var(--font-source)', 
                      '&:hover': {
                        backgroundColor: 'var(--color-bg-primary-hover)',
                      },
                    }}
                  >
                    Ver Detalles
                  </Button>
                </Box>
              </Card>
          )))}
          {count < components.length && (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setCount((prev) => prev + 6)}
                sx={{
                  fontFamily: 'var(--font-source)',
                  color: 'var(--color-title-primary)',
                }}
              >
                Ver más
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Home;