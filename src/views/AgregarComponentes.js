import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormGroup,
  TextField,
  Typography,
  MenuItem,
  Autocomplete,
  Paper,
} from "@mui/material";
import axios from "axios";

const AgregarComponentes = () => {
    const BACKEND_URL = process.env.REACT_APP_BACK_URL;
    const token = localStorage.getItem("token");

    const [loading, setLoading] = useState(false);

    const [nombre, setNombre] = useState("");
    const [tipo, setTipo] = useState("");
    const [estado, setEstado] = useState("activo");
    const [descripcion, setDescripcion] = useState("");
    const [padre, setPadre] = useState(null);
    const [componentes, setComponentes] = useState([]);
    const [nombreExiste, setNombreExiste] = useState(false);

    if (!token) {
        window.location.href = "/login";
    }

    useEffect(() => {
        const normalizar = (str) => str.trim().toLowerCase();
      
        const existe = componentes.some(
            (comp) => normalizar(comp.name) === normalizar(nombre)
        );
        setNombreExiste(existe);
    }, [nombre, componentes]);
      

    useEffect(() => {
        const fetchComponentes = async () => {
        try {
            const { data } = await axios.get(`${BACKEND_URL}/components`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });
            setComponentes(data);
        } catch (error) {
            console.error("Error al obtener componentes para autocompletar:", error);
        }
        };

        fetchComponentes();
    }, []);

    const handleSubmit = () => {
        const payload = {
        name: nombre.trim(),
        type: tipo.trim(),
        status: estado,
        description: descripcion.trim() || undefined,
        componentFrom: padre?._id || undefined,
        };

        axios.post(`${BACKEND_URL}/components`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        .then((response) => {
            console.log("Componente guardado:", response.data);
            alert("Componente guardado correctamente");
            window.location.href = "/home";
        })
        .catch((error) => {
            console.error("Error al guardar componente:", error);
            alert("Error al guardar el componente. Por favor, inténtalo de nuevo.");
        });
    };

  return (
    <Box sx={{ background: "var(--color-bg-gradient)", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pt: 10,
        }}
      >
        <FormControl
          component={Paper}
          sx={{
            px: 10,
            py: 5,
            borderRadius: "15px",
            backgroundColor: "var(--bg-paper)",
            boxShadow: 3,
            color: "var(--color-text-base)",
            textAlign: "center",
          }}
        >
            <Typography variant="h4" sx={{ color: "var(--color-text-base)", mb: 3 }}>
                Agregar Componente
            </Typography>

            <FormGroup sx={{ width: "300px", gap: 2 }}>
                <TextField
                    label="Nombre"
                    variant="filled"
                    fullWidth
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    sx={{ bgcolor: "var(--bg-inputs)" }}
                                
                    error={nombreExiste}
                    helperText={nombreExiste ? "Ya existe un componente con este nombre" : ""}
                />

                <TextField
                    label="Tipo"
                    variant="filled"
                    fullWidth
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    sx={{ bgcolor: "var(--bg-inputs)" }}
                />

            <TextField
              label="Estado"
              variant="filled"
              select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              sx={{ bgcolor: "var(--bg-inputs)" }}
            >
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="de baja">De baja</MenuItem>
            </TextField>

            <TextField
              label="Descripción (opcional)"
              variant="filled"
              fullWidth
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              sx={{ bgcolor: "var(--bg-inputs)" }}
            />

            <Autocomplete
              options={componentes}
              getOptionLabel={(option) => option.name || ""}
              value={padre}
              onChange={(event, newValue) => setPadre(newValue)}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Componente padre (opcional)"
                  variant="filled"
                  sx={{ bgcolor: "var(--bg-inputs)" }}
                />
              )}
              clearOnEscape
            />
          </FormGroup>

          <Button
            variant="contained"
            sx={{
              mt: 4,
              py: 1.5,
              borderRadius: 50,
              backgroundColor: "var(--login-button-bg)",
              "&:hover": {
                backgroundColor: "var(--login-button-hover)",
              },
            }}
            onClick={handleSubmit}
            disabled={!nombre || !tipo || !estado || loading}
          >
            Guardar Componente
          </Button>
        </FormControl>
      </Box>
    </Box>
  );
};

export default AgregarComponentes;