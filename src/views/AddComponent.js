import { useState } from "react";
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
import LoadingCircle from "../components/LoadingCircle";
import SideBar from "../components/SideBar";
import AddCharasteristicModal from "../components/AddCharacteristModal";

const AddComponent = () => {
  const BACKEND_URL = process.env.REACT_APP_BACK_URL;
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("activo");
  const [caracteristicas, setCaracteristicas] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");

  if (!token) {
    window.location.href = "/login";
  } 

  localStorage.removeItem("selectedComponent");

  const handleSubmit = () => {
    setLoading(true);
    const validDescriptions = caracteristicas.filter(
      (c) => c.name.trim() && c.description.trim()
    );
  
    const payload = {
      name: nombre.trim(),
      type: tipo.trim(),
      status: estado,
      descriptions: validDescriptions.length > 0 ? validDescriptions : undefined
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
    }).finally(setLoading(false));
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
      name: newNombre.trim(),
      description: newDescripcion.trim()
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

  if (loading)
    return (
      <LoadingCircle></LoadingCircle>
    );

  return (
    <Box sx={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      background: 'var(--color-bg-gradient)',
      position: "fixed",
      top: 0,
      left: 0,
    }}>
      <SideBar />
  
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
        height: "80vh",
        width: "100%",
        minHeight: 0, 
        overflow: 'hidden', 
      }}>
        <FormControl component={Paper} sx={{
          flex: 1,
          px: { xs: 2, md: 6 }, 
          py: { xs: 2, md: 5 },
          borderRadius: '16px',
          backgroundColor: 'var(--bg-paper)',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          color: 'var(--color-text-base)',

          width: { xs: '100%', md: '80%' },
          maxWidth: 700,
          minWidth: 320,
          maxHeight: '90vh',
          overflowY: 'hidden', 
        }}>
          <Typography variant="h4" sx={{ color: 'var(--color-title-secondary)', mb: 3, textAlign: 'center', fontFamily: 'var(--font-montserrat)' }}>
            Agregar Componente
          </Typography>
  
          <FormGroup sx={{ gap: 2 }}>
            <TextField
              label="Nombre"
              variant="filled"
              fullWidth
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              sx={{ bgcolor: 'var(--bg-inputs)'}}
            />
  
            <TextField
              label="Tipo"
              variant="filled"
              fullWidth
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              sx={{ bgcolor: 'var(--bg-inputs)' }}
            />
  
            <TextField
              label="Estado"
              variant="filled"
              select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              sx={{ bgcolor: 'var(--bg-inputs)', textAlign: 'left' }}
            >
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="de baja">De baja</MenuItem>
            </TextField>
  
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: 'var(--bg-inputs)',
                  borderRadius: 1,
                  width: '100%',
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgb(96, 96, 96)' }}>
                  Características
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    maxHeight: '150px',
                    overflowY: 'auto',
                    py: 1,
                  }}
                >
                  {caracteristicas.map((c, index) => (
                    <Chip
                      key={index}
                      label={`${c.name}: ${c.description}`}
                      onDelete={() => handleDeleteCaracteristica(index)}
                      size="medium"
                      sx={{ m: 1, maxWidth: '100%', fontFamily: 'var(--font-source)' }}
                    />
                  ))}
                </Box>
              </Box>
              <Button
                variant="outlined"
                onClick={handleOpenModal}
                sx={{
                  borderColor: 'var(--color-bg-secondary)',
                    backgroundColor: 'var(--color-bg-gradient)',
                    color: 'var(--color-title-primary)',
                    height: 'fit-content',
                    fontFamily: 'var(--font-source)',
                    '&:hover': {
                      borderColor: 'var(--color-bg-secondary-hover)',
                      backgroundColor: 'var(--color-bg-secondary-hover)',
                    },
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
              backgroundColor: 'var(--color-bg-gradient)',
              color: 'var(--color-title-primary)',
              fontFamily: 'var(--font-source)',
              '&:hover': {
                backgroundColor: 'var(--color-bg-secondary-hover)',
              },
              '&:disabled': {
                backgroundColor: '#fff',
                color: "rgb(65, 92, 117)",
              },
            }}
            onClick={handleSubmit}
            disabled={!nombre || !tipo || !estado || loading}
          >
            Guardar Componente
          </Button>
        </FormControl>
      </Box>
  
      <AddCharasteristicModal
        open={isModalOpen}
        onClose={handleCloseModal}
        title="Agregar Característica"
        onConfirm={handleAddCaracteristica}
        confirmText="Agregar"
        confirmDisabled={!newNombre.trim() || !newDescripcion.trim()}
        sxBox={{ transform: 'translate(-12.5%, -75%)' }}
      >
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
      </AddCharasteristicModal>
    </Box>
  );    
};

export default AddComponent;