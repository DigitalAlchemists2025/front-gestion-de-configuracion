import { useState } from 'react';
import { Box, Button, Divider, Link, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';

function Register() {
  const [register, setRegister] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACK_URL;
  const tempEmail = localStorage.getItem("EMAIL_TEMP");
  if (tempEmail && register.email === "") {
    setRegister(prev => ({ ...prev, email: tempEmail }));
    localStorage.removeItem("EMAIL_TEMP");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*\d).{6,}$/;

  const validate = () => {
    const newErrors = {};
    if (!register.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    }
    if (!register.email.trim() || !emailRegex.test(register.email)) {
      newErrors.email = 'Correo inválido';
    }
    if (!register.password || !passwordRegex.test(register.password)) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres y un número';
    }
    if (register.password !== register.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
        username: register.username.trim(),
        email: register.email.trim(),
        password: register.password,
        role: 'usuario',
      });
      alert('Te has registrado correctamente, inicia sesión para continuar');
      window.location.replace("/login");
    } catch (error) {
      console.error('Error al registrar:', error);
      alert('Ocurrió un error. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegister(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
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
        <img style={{ width: "5rem", objectFit: "contain", }} src="/logoUCN.png" alt="Logo UCN" />
        <img style={{ width: "10rem", objectFit: "contain", }} src="/logoEIC.png" alt="Logo EIC" />
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
          minHeight: "35rvh",
          height: "50rvh",
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
          Registrarse
        </Typography>

        <Divider sx={{ borderColor: 'black', my: '2rem' }} />

        <Typography sx={{ ml: 1, mb: 2, fontFamily: 'var(--font-source)', }}>Ingresa tus credenciales:</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="username"
            value={register.username}
            onChange={handleChange}
            fullWidth
            size="small"
            label="Nombre de usuario"
            error={!!errors.username}
            helperText={errors.username}
            sx={{ '& .MuiInputBase-input': { height: '1.5rem' } }}
          />
          <TextField
            name="email"
            value={register.email}
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
            value={register.password}
            onChange={handleChange}
            fullWidth
            size="small"
            label="Contraseña"
            error={!!errors.password}
            helperText={errors.password}
            sx={{ '& .MuiInputBase-input': { height: '24px' } }}
          />
          <TextField
            type="password"
            name="confirmPassword"
            value={register.confirmPassword}
            onChange={handleChange}
            fullWidth
            size="small"
            label="Confirmar Contraseña"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            sx={{ '& .MuiInputBase-input': { height: '24px' } }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={
            isLoading ||
            !register.username ||
            !register.email ||
            !register.password ||
            !register.confirmPassword
          }
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
          {isLoading ? 'Cargando...' : 'Crear Cuenta'}
        </Button>
        <Typography sx={{ ml: 1, my: 2, fontFamily: 'var(--font-source)', justifySelf: "center" }}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión aquí</Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Register;