import React, { useState } from 'react';
import { Box, Button, FormLabel, Paper, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Home from '../views/Home';

function Login() {
    const [auth, setAuth] = useState({ username: '', password: '' });
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mostrar alerta temporalmente
        alert('Inicio de sesión exitoso');
        navigate('/home')

        setLoading(true);
        /*        
        try {
            const resp = await axios.post(`${BACKEND_URL}auth/signin`, {
                username: auth.username.trim(),
                password: auth.password,
            });
            const { access_token } = resp.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('id_user', resp.data.id);
            if (access_token) {
                localStorage.setItem('session', 'exito');
                window.location.replace('/home');
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
        */    
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAuth({
            ...auth,
            [name]: value,
        });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', mt: '10%' }}>
            <Typography variant="h1" sx={{ fontSize: '3rem', mb: 4 }}>Gestión de Configuración</Typography>
            <Paper elevation={3} sx={{ p: 4, width: '25%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h2" sx={{ fontSize: '2.5rem', mb: 4 }}>Iniciar Sesión</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" sx={{ width: '10rem', fontWeight: 'bold' }}>Correo:</Typography>
                        <TextField
                            type="email"
                            name="username"
                            value={auth.username}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            sx={{ '& .MuiInputBase-input': { height: '24px' } }} 
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" sx={{ width: '10rem', fontWeight: 'bold' }}>Contraseña:</Typography>
                        <TextField
                            type="password"
                            name="password"
                            value={auth.password}
                            onChange={handleChange}
                            fullWidth
                            size="small" 
                            sx={{ '& .MuiInputBase-input': { height: '24px' } }}
                        />
                    </Box>
                </Box>
                <Button
                    type="submit"
                    variant="outlined"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    sx={{ mt: 4 }}
                >
                    {isLoading ? 'Cargando...' : 'Ingresar'}
                </Button>
            </Paper>
        </Box>
    );
}

export default Login;