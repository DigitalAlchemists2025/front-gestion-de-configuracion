import { useEffect, useState } from 'react';
import { Box, Button, Divider, Link, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';


function Register() {
  const [register, setRegister] = useState({ username: '', email: '', password: '' });
  const [isLoading, setLoading] = useState(false);
  const [id, setId] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACK_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
        username: register.username.trim(),
        email: register.email.trim(),
        password: register.password,
        role: 'usuario',
      });
      alert('Te has registrado correctamente');
      window.location.replace("/login");
    } catch (error) {
      console.error('Error al registrar:', error);
      alert('Ocurrió un error. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
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
    setRegister({
      ...register,
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
          Registrarse
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
            Continuar con Google
        </Button>

        <Divider sx={{ borderColor: 'black', my: 5 }} />

        <Typography sx={{ ml: 1, mb: 2, fontFamily: 'var(--font-source)', }}>Ingresa tus credenciales:</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            type="string"
            name="username"
            value={register.username}
            onChange={handleChange}
            fullWidth
            size="small"
            label="Nombre de usuario"
            sx={{ '& .MuiInputBase-input': { height: '24px' } }}
          />
          <TextField
            type="email"
            name="email"
            value={register.email}
            onChange={handleChange}
            fullWidth
            size="small"
            label="Correo"
            sx={{ '& .MuiInputBase-input': { height: '24px' } }}
          />
          <TextField
            type="password"
            name="password"
            value={register.password}
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
          disabled={isLoading || register.username === "" || register.password === "" || register.email === ""}
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
        
        <Divider sx={{ borderColor: 'black', my: 5 }} />
        <Typography sx={{ ml: 1, mb: 2, fontFamily: 'var(--font-source)', justifySelf: "center"}}>Ya tiene cuenta? <Link href="/register">Inicie sesión aquí</Link></Typography>
      </Paper>
    </Box>
  );
}

export default Register;