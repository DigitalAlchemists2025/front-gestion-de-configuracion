import { useEffect, useState } from 'react';
import { Box, Button, Divider, Link, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';


function Login() {
  const [login, setLogin] = useState({ email: '', password: '' });
  const [isLoading, setLoading] = useState(false);
  const [id, setId] = useState(null);
  const [errors, setErrors] = useState({});

  const BACKEND_URL = process.env.REACT_APP_BACK_URL;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailRegex.test(login.email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Correo inválido',
      }));
      return;
    }

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
        console.error("EL usuario no está registrado");
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

  // Al cargar el id por inicio de sesión exitoso, 
  // se obtiene el rol del usuario desde backend
  useEffect(() => {
    if (!id) return;  
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No se encontró token");
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
          throw new Error("Rol desconocido");
        }
  
        window.location.replace('/home');
  
      } catch (error) {
        console.error("Error al obtener el rol del usuario:", error);
      }
    };
  
    fetchUser();
  }, [id]);
  
  // Popup de auth de google
  const handleGoogleLogin = () => {
    setLoading(true);
    /* 
      Google Firebase tiene su propio metodo de autenticación, 
      por lo que se verifica el correo por backend y se asignan 
      las propiedades de usuario necesarias para el correcto
      funcionamiento de la applicación
    */
    signInWithPopup(auth, provider).then(async (result) => {
      const _user = result.user;
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/auth/email/${_user.email}`);
        console.log(response)
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('role', response.data.role === 'administrador' ? '0' : '1');
        alert(`¡Bienvenido/a ${_user.displayName.split(' ')[0] || _user.email}!`);
        window.location.replace("/home");
      } catch(error) {
        console.error("Error al iniciar sesión con google", error);
        if (error.response.data.error.statusCode === 404) {
          alert("Correo no registrado, registrese para continuar")
          localStorage.setItem("EMAIL_TEMP", _user.email);
          window.location.replace("/register");
        }
      }
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
    setLogin(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'email') {
      setErrors(prev => ({
        ...prev,
        email: !emailRegex.test(value) ? 'Correo inválido' : undefined,
      }));
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--color-bg-secondary)',
      height: '100vh',
      width: "100vw",
      position: "fixed",
      top: 0,
      left: 0,
    }}>
      <Box sx={{
        maxWidth: "50%",
        display: "flex",
        gap: 5,
        justifyContent: "center",
        alignItems: "center",
        my: 2,
      }}>
        <img style={{ width: "5rem", objectFit: "contain", }} src="/logoUCN.png"></img>
        <img style={{ width: "10rem", objectFit: "contain", }} src="/logoEIC.png"></img>
      </Box>
      <Typography
        variant="h1"
        sx={{
          fontSize: '2.5rem',
          fontFamily: 'var(--font-source)',
          mb: 3,
          color: 'var(--color-title-secondary)',
          textAlign: 'center',
        }}
      >
        Gestión de Configuración
      </Typography>

      <Paper
        elevation={3}
        sx={{
          px: 4,
          py: 3,
          borderRadius: 3,
          width: '30rvw',
          minWidth: '20vw',
          minHeight: "30vh",
          height: "50rvh",
          objectFit: "contain",
          maxWidth: 400,
          boxShadow: 'var(--login-paper-shadow)',
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: '1.8rem',
            fontFamily: 'var(--font-source)',
            my: 1,
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
            my: 1,
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

        <Divider sx={{ borderColor: 'black', my: '2rem' }} />

        <Typography sx={{ ml: 1, mb: 2, fontFamily: 'var(--font-source)', }}>O iniciar sesión con credenciales:</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
           <TextField
            name="email"
            value={login.email}
            onChange={handleChange}
            fullWidth
            size="small"
            label="Correo"
            error={!!errors.email}
            helperText={errors.email}
            sx={{ '& .MuiInputBase-input': { height: '1.5rem' }, textJustify: "center" }}
          />
          <TextField
            type="password"
            name="password"
            value={login.password}
            onChange={handleChange}
            fullWidth
            size="small"
            label="Contraseña"
            sx={{ '& .MuiInputBase-input': { height: '1.5rem' } }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={ isLoading || !login.email || !login.password || !!errors.email } 
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
        <Typography sx={{ ml: 1, my: 2, fontFamily: 'var(--font-source)', justifySelf: "center"}}>No tiene cuenta? <Link href="/register">Registrese aquí</Link></Typography>
      </Paper>
    </Box>
  );
}

export default Login;