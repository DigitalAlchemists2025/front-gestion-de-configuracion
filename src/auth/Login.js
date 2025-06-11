import { useEffect, useState } from 'react';
import { Box, Button, Divider, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';


function Login() {
  const [login, setLogin] = useState({ email: '', password: '' });
  const [isLoading, setLoading] = useState(false);
  const [id, setId] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACK_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await axios.post(`${BACKEND_URL}/api/v1/auth/signin`, {
        email: login.email.trim(),
        password: login.password,
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
  
        const role = response.data.role;
  
        if (role === 'usuario') {
          localStorage.setItem('role', '1');
        } else if (role === 'administrador') {
          localStorage.setItem('role', '0');
        } else {
          console.warn("Rol desconocido:", role);
        }
  
        window.location.replace('/home');
  
      } catch (error) {
        console.error("Error al obtener el usuario:", error);
      }
    };
  
    fetchUser();
  }, [id]);
  
  // Login Google con Popup
  const handleGoogleLogin = () => {
    setLoading(true);
    signInWithPopup(auth, provider).then(async (result) => {
      const _user = result.user;
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/auth/email/${_user.email}`);
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('role', response.data.role === 'administrador' ? '0' : '1');
      } catch(error) {
        console.log("Email no encontrado");
      }
      alert(`¡Bienvenido/a ${_user.displayName.split(' ')[0] || _user.email}!`);
      window.location.replace("/home");
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const credential = GoogleAuthProvider.credentialFromError(error);
      alert("Error al iniciar sesión con Google. Intenta más tarde.");
      console.error("Error de Google:", errorCode, errorMessage, credential);
    });
    setLoading(false);
  }; 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLogin({
      ...login,
      [name]: value,
    });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--color-bg-secondary)',
      minHeight: '100vh',
      width: "100vw",
      position: "fixed",
      top: 0,
      left: 0,
    }}>
      <Box sx={{
        maxWidth: "50%",
        maxHeight: "15%",
        display: "flex",
        gap: 5,
        justifyContent: "center",
        alignItems: "center",
        top: "1rem",
        mb: 5,
      }}>
        <img style={{ width: "5rem", height: "15%" }} src="/logoUCN.png"></img>
        <img style={{ width: "10rem", height: "15%" }} src="/logoEIC.png"></img>
      </Box>
      <Typography
        variant="h1"
        sx={{
          fontSize: '2.5rem',
          fontFamily: 'var(--font-source)',
          mb: 6,
          color: 'var(--color-title-secondary)',
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
            fontFamily: 'var(--font-source)',
            mb: 5,
            gap: 5,
            textAlign: 'center',
            color: 'var(--login-paper-header)',
          }}
        >
          Iniciar Sesión
        </Typography>


        <Button
          onClick={handleGoogleLogin}
          variant="outlined"
          disabled={isLoading}
          color="secondary"
          fullWidth
          sx={{ 
            flex: 1, 
            flexDirection: 'row', 
            justifyContent: 'center', 
            color: 'var(--login-button-hover)',
            border: '1px solid var(--login-button-hover)',
            gap: 1, 
            borderRadius: 50,
            fontFamily: 'var(--font-source)',
            '&:hover': { 
              backgroundColor: 'var(--login-button-hover)', color: 'white' 
            } 
          }}
        >
          <FontAwesomeIcon icon={faGoogle} style={{ color: "var(--color-title-primary)"}} />
            Iniciar sesión con Google
        </Button>

        <Divider sx={{ borderColor: 'black', my: 5 }} />
          {/* Quitar comentario (deploy) */}
        <Typography sx={{ ml: 1, mb: 2, fontFamily: 'var(--font-source)', }}>O iniciar sesión con credenciales:</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            type="email"
            name="email"
            value={login.email}
            onChange={handleChange}
            fullWidth
            size="small"
            label="Correo"
            sx={{ '& .MuiInputBase-input': { height: '24px' } }}
          />
          <TextField
            type="password"
            name="password"
            value={login.password}
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
          disabled={isLoading || login.password === "" || login.email === ""}
          sx={{
            mt: 4,
            py: 1.5,
            borderRadius: 50,
            backgroundColor: 'var(--color-bg-secondary)',
            fontFamily: 'var(--font-source)', 
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