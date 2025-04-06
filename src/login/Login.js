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
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            background: 'linear-gradient(180deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)',
            minHeight: '100vh'
        }}>
            <Typography variant="h1" sx={{ fontSize: '2.5rem', mb: 6, color: '#ffffff', textAlign: 'center' }}>
                Gestión de Configuración
            </Typography>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, width: '30%', maxWidth: 400, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)' }}>
                <Typography variant="h2" sx={{ fontSize: '1.8rem', mb: 4, textAlign: 'center', color: 'rgb(1,9,149)' }}>
                    Iniciar Sesión
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        type="email"
                        name="username"
                        value={auth.username}
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
                    sx={{ mt: 4, py: 1.5, borderRadius: 50, backgroundColor: '#007bff', '&:hover': { backgroundColor: '#0056b3' } }}
                    fullWidth
                >
                    {isLoading ? 'Cargando...' : 'Ingresar'}
                </Button>
            </Paper>
        </Box>
    );
}

export default Login;