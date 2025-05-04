import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormGroup,
  TextField,
  Typography,
  MenuItem,
  Paper,
  Modal,
  Chip
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
  const [caracteristicas, setCaracteristicas] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");

  if (!token) {
    window.location.href = "/login";
  }

  useEffect(() => {
    const fetchComponentes = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/components`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComponentes(data);
      } catch (error) {
        console.error("Error al obtener componentes:", error);
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
      //characteristics: caracteristicas
    };

    axios.post(`${BACKEND_URL}/components`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setNewNombre("");
    setNewDescripcion("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddCaracteristica = () => {
    const nueva = {
      nombre: newNombre.trim(),
      descripcion: newDescripcion.trim()
    };

    setCaracteristicas([...caracteristicas, nueva]);
    setIsModalOpen(false);
    setNewNombre("");
    setNewDescripcion("");
  };

  const handleDeleteCaracteristica = (index) => {
    const nuevas = [...caracteristicas];
    nuevas.splice(index, 1);
    setCaracteristicas(nuevas);
  };

  return (
    <Box sx={{ background: "var(--color-bg-gradient)", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pt: 10
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
            width: "90%",
            maxWidth: "500px",
            margin: "auto"
          }}
        >
          <Typography variant="h4" sx={{ color: "var(--color-text-base)", mb: 3 }}>
            Agregar Componente
          </Typography>

          <FormGroup sx={{ width: "90%", gap: 2, margin: "0 auto" }}>
            <TextField
              label="Nombre"
              variant="filled"
              fullWidth
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              sx={{ bgcolor: "var(--bg-inputs)" }}
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
              sx={{ bgcolor: "var(--bg-inputs)", textAlign: "left" }}
            >
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="de baja">De baja</MenuItem>
            </TextField>
            
            <Box sx={{ display: 'flex', flexDirection: "row", gap: 2, width: "100%", alignItems: "center" }}>
              <Box sx={{ px: 2, py: 1, bgcolor: "var(--bg-inputs)", borderRadius: 1, width: "90%" }}>
                <Typography variant="subtitle2" sx={{ mb: 1, textAlign: "left", color: "rgb(96, 96, 96)" }}>
                  Características
                </Typography>
                <Box sx={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: 1,
                  maxHeight: "150px",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}>
                  {caracteristicas.map((c, index) => (
                    <Chip
                      key={index}
                      label={`${c.nombre}: ${c.descripcion}`}
                      onDelete={() => handleDeleteCaracteristica(index)}
                      size="medium"
                      sx={{ m: 1, maxWidth: "100%" }}
                    />
                  ))}
                </Box>
              </Box>
              <Button
                variant="outlined"
                onClick={handleOpenModal}
                sx={{
                  mt: 2,
                  borderColor: "var(--color-bg-accent)",
                  color: "var(--color-text-base)",
                  maxWidth: "10%",
                  height: "80%",
                  "&:hover": {
                    borderColor: "var(--color-bg-accent-hover)",
                    backgroundColor: "rgba(0,0,0,0.05)"
                  }
                }}
              >
                +
              </Button>
            </Box>
          </FormGroup>

          <Button
            variant="contained"
            sx={{
              mt: 4,
              py: 1.5,
              borderRadius: 50,
              backgroundColor: "var(--login-button-bg)",
              "&:hover": {
                backgroundColor: "var(--login-button-hover)"
              }
            }}
            onClick={handleSubmit}
            disabled={!nombre || !tipo || !estado || loading}
          >
            Guardar Componente
          </Button>
        </FormControl>
      </Box>

      {/* Modal para agregar característica */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
      >
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "white",
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Agregar Característica
          </Typography>
          
          <TextField
            label="Nombre"
            value={newNombre}
            onChange={(e) => setNewNombre(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          
          <TextField
            label="Descripción"
            value={newDescripcion}
            onChange={(e) => setNewDescripcion(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={handleCloseModal} color="secondary">
              Cancelar
            </Button>
            <Button
              onClick={handleAddCaracteristica}
              variant="contained"
              disabled={!newNombre.trim() || !newDescripcion.trim()}
            >
              Agregar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default AgregarComponentes;