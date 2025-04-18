import { Box, Button, FormControl, FormGroup, TextField, Typography } from "@mui/material";
import React from "react";

const AgregarComponentes = () => {
    return (
        <Box sx={{ background: 'var(--color-bg-gradient)'}}>
            <Box sx={{ display: 'flex', flexDirection: 'column',justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <FormControl sx={{ bgcolor: 'var(--bg-paper)', px: 10, py: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '15px', boxShadow: 3, color: 'white', textAlign: 'center' }}>
                    <h1>Agregar Componentes</h1>
                    <FormGroup sx={{ display: 'flex', flexDirection: 'column', width: '300px', gap: 2, mt: 2 }}>
                        <Typography color="white" fontSize={'1em'}>Ingrese el nombre del componente</Typography>
                        <TextField variant="filled" sx={{ marginBottom: 2, bgcolor: 'var(--bg-inputs)' }} />
                        <Typography color="white" fontSize={'1em'}>Ingrese el tipo del componente</Typography>
                        <TextField variant="filled" sx={{ marginBottom: 2, bgcolor: 'var(--bg-inputs)' }} />
                        <Typography color="white" fontSize={'1em'}>Ingrese el estado del componente</Typography>
                        <TextField variant="filled" sx={{ marginBottom: 2, bgcolor: 'var(--bg-inputs)' }} />
                    </FormGroup>
                    <Button variant="contained" color="primary" sx={{ width: '80%', margin: '0 auto' }} onClick={() => alert("Componente agregado")}>
                        Guardar Componente
                    </Button>
                </FormControl>
            </Box>
        </Box>
    );
}

export default AgregarComponentes;