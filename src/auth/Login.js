import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';

function Login() {
  const [auth, setAuth] = useState({ email: '', password: '' });
  const [isLoading, setLoading] = useState(false);
  const [id, setId] = useState(null);
  const [user, setUser] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACK_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await axios.post(`${BACKEND_URL}/api/v1/auth/signin`, {
        email: auth.email.trim(),
        password: auth.password,
      });
      const { access_token } = resp.data;
      localStorage.setItem('token', access_token);
      setId(resp.data.id);
      if (access_token) {
        alert('Ha iniciado sesión correctamente');
      } else {
        console.log("Usuario no existe");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Usuario o contraseña incorrectos');
      } else {
        console.error('Error en el login:', error);
        alert('Ocurrió un error. Por favor, inténtalo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
  
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn("No se encontró token");
        return;
      }
  
      try {
        const response = await axios.get(`${BACKEND_URL}/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        console.log("Usuario obtenido:", response.data);
  
        const role = response.data.role;
  
        if (role === 'usuario') {
          localStorage.setItem('role', '1');
          console.log("Rol usuario guardado como 1");
        } else if (role === 'administrador') {
          localStorage.setItem('role', '0');
          console.log("Rol admin guardado como 0");
        } else {
          console.warn("Rol desconocido:", role);
        }
  
        setUser(response.data);
        window.location.replace('/home');
  
      } catch (error) {
        console.error("Error al obtener el usuario:", error);
      }
    };
  
    fetchUser();
  }, [id]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAuth({
      ...auth,
      [name]: value,
    });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: 'var(--login-gradient-bg)',
      minHeight: '100vh'
    }}>
      <Typography
        variant="h1"
        sx={{
          fontSize: '2.5rem',
          mb: 6,
          color: 'var(--login-title-color)',
          textAlign: 'center',
        }}
      >
        Gestión de Configuración
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          width: '30%',
          maxWidth: 400,
          boxShadow: 'var(--login-paper-shadow)',
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: '1.8rem',
            mb: 4,
            textAlign: 'center',
            color: 'var(--login-paper-header)',
          }}
        >
          Iniciar Sesión
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            type="email"
            name="email"
            value={auth.email}
            onChange={handleChange}
            fullWidth
            size="small"
            label="Correo"
            sx={{ '& .MuiInputBase-input': { height: '24px' } }}
          />
          <TextField
            type="password"
            name="password"
            value={auth.password}
            onChange={handleChange}
            fullWidth
            size="small"
            label="Contraseña"
            sx={{ '& .MuiInputBase-input': { height: '24px' } }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{
            mt: 4,
            py: 1.5,
            borderRadius: 50,
            backgroundColor: 'var(--login-button-bg)',
            '&:hover': {
              backgroundColor: 'var(--login-button-hover)',
            },
          }}
          fullWidth
        >
          {isLoading ? 'Cargando...' : 'Ingresar'}
        </Button>
      </Paper>
    </Box>
  );
}

export default Login;