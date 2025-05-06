import { Box, CircularProgress, Typography, Paper, Button, Modal, TextField } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
        console.log(rol === 0);
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
      isModalOpen(false);
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          background: "var(--color-bg-gradient)",
        }}
      >
        <CircularProgress sx={{ color: "var(--color-text-active)" }} />
      </Box>
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
        minHeight: "100vh",
        background: "var(--color-bg-gradient)",
        color: "var(--color-text-base)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          backgroundColor: "rgba(191, 143, 255, 0.53)",
          borderRadius: "16px",
          padding: "2rem 3rem",
          width: "100%",
          maxWidth: "600px",
          height: "90hv",
          boxShadow: "0px 8px 20px rgba(0,0,0,0.3)",
          color: 'white'
        }}
      >
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
        <Button variant="contained" color="primary" onClick={cambiarEstado} sx={{ mt: 2 }}>
          {component.status === "activo" ? "Dar de baja" : "Activar"}
        </Button>
        {component.descriptions && component.descriptions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              <strong>Descripciones:</strong>
            </Typography>
            <ul style={{ paddingLeft: "1.5rem" }}>
              {component.descriptions.map((desc, idx) => (
                <li key={desc._id}>
                  {desc.name}: {desc.description}
                </li>
              ))}
            </ul>
          </Box>
        )}
        {rol == '0' && (
          <Box><Button variant="contained" color="primary" onClick={handleOpenModal} sx={{ mb: 2 }}>
            + Agregar Característica  
          </Button></Box>
        )}
        {component.createdAt && (
          <Typography><strong>Creado:</strong> {new Date(component.createdAt).toLocaleString()}</Typography>
        )}
        {component.updatedAt && (
          <Typography><strong>Actualizado:</strong> {new Date(component.updatedAt).toLocaleString()}</Typography>
        )}

      </Paper>
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
