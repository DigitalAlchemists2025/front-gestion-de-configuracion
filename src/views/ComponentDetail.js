import { Box, CircularProgress, Typography, Paper, Button, Modal, TextField } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingCircle from "../components/LoadingCircle";

const ComponentDetail = () => {
  const { id } = useParams();
  const [component, setComponent] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("role");
  if (!token) {
    navigate("/login");
  }

  const BACKEND_URL = process.env.REACT_APP_BACK_URL;

  useEffect(() => {
    const fetchComponent = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/components/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });  
        setComponent(response.data);
      } catch (error) {
        console.error("Error al obtener componente:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchComponent();
  }, [id]);
  
  const handleAddDescripcion = async () => {
    const payload = {
      name: newNombre,
      description: newDescripcion,
    };
    setLoading(true);

    try {
      await axios.post(`${BACKEND_URL}/components/${id}/descriptions`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComponent((prev) => ({
        ...prev,
        descriptions: [...prev.descriptions, payload],
      }));

      setNewNombre("");
      setNewDescripcion("");
      handleCloseModal();
    }
    catch (error) {
      console.error("Error al agregar descripción:", error);
    } finally {
      setLoading(false);
    }
  }

  const cambiarEstado = async () => {
    const payload = {
      status: component.status === "activo" ? "de baja" : "activo",
    };
    try {
      await axios.put(`${BACKEND_URL}/components/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComponent((prev) => ({
        ...prev,
        status: payload.status,
      }));
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setNewNombre("");
    setNewDescripcion("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading)
    return (
      <LoadingCircle></LoadingCircle>
    );

  if (!component)
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">No se encontró el componente</Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        height: "90vh",
        background: "var(--color-bg-gradient)",
        color: "var(--color-text-base)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 5,
        overflowY: "hidden",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          backgroundColor: "var(--bg-paper)",
          borderRadius: "16px",
          padding: "2rem 3rem",
          width: "100%",
          maxWidth: "600px",
          boxShadow: "0px 8px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{ mb: 2, color: 'var(--color-text-base)', borderColor: 'rgba(0,0,0,0.2)' }}
        >
          ← Volver
        </Button>
  
        <Typography variant="h4" sx={{ mb: 3, color: "var(--color-dg-header-bg)" }}>
          {component.name}
        </Typography>
  
        <Typography><strong>Tipo:</strong> {component.type}</Typography>
  
        <Typography
          sx={{
            color:
              component.status === "activo"
                ? "var(--color-text-active)"
                : "var(--color-text-baja)",
          }}
        >
          <strong>Estado:</strong> {component.status}
        </Typography>
  
        <Button
          variant="contained"
          color="primary"
          onClick={cambiarEstado}
          sx={{ mt: 2, backgroundColor: "var(--login-button-bg)", "&:hover": { backgroundColor: "var(--login-button-hover)" } }}
        >
          {component.status === "activo" ? "Dar de baja" : "Activar"}
        </Button>
  
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          <strong>Características:</strong>
        </Typography>
        {component.descriptions?.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <ul style={{ paddingLeft: "1.5rem" }}>
              {component.descriptions.map((desc, idx) => (
                <li key={desc._id}>
                  {desc.name}: {desc.description}
                </li>
              ))}
            </ul>
          </Box>
        ) || (
          <Typography sx={{ mt: 2 }}>
            No hay características disponibles para este componente.
          </Typography>
        )}
  
        {rol === '0' && (
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenModal}
              sx={{ mt: 2 }}
            >
              + Agregar Característica
            </Button>
          </Box>
        )}
  
        {component.createdAt && (
          <Typography sx={{ mt: 2 }}>
            <strong>Creado:</strong> {new Date(component.createdAt).toLocaleString()}
          </Typography>
        )}
  
        {component.updatedAt && (
          <Typography>
            <strong>Actualizado:</strong> {new Date(component.updatedAt).toLocaleString()}
          </Typography>
        )}
      </Paper>
  
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "white",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
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
              onClick={handleAddDescripcion}
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

export default ComponentDetail;
