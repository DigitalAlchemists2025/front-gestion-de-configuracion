import { Box, CircularProgress, Typography, Paper } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ComponentDetail = () => {
  const { id } = useParams();
  const [component, setComponent] = useState(null);
  const [padre, setPadre] = useState(null);

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
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
  
        if (response.data.componentFrom) {
          try {
            const padreResp = await axios.get(`${BACKEND_URL}/components/${response.data.componentFrom}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setPadre(padreResp.data.name || "Nombre desconocido");
          } catch (e) {
            setPadre("No se encontró el componente padre");
          }
        }
      } catch (error) {
        console.error("Error al obtener componente:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchComponent();
  }, [id]);
  

  const getPadre = (id) => {
    try {
        const response = axios.get(`${BACKEND_URL}/components/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status !== 200) {
            throw new Error("Error al obtener el componente padre");
        }    
        return response.data;
    } catch (error) {
        console.error("Error al obtener componente padre:", error);
        return "No se encontró el componente padre";
    } 
  }

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
          backgroundColor: "rgba(199, 199, 199, 0.77)",
          borderRadius: "16px",
          padding: "2rem 3rem",
          width: "100%",
          maxWidth: "600px",
          height: "20rem",
          boxShadow: "0px 8px 20px rgba(0,0,0,0.3)",
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
        {component.description && (
          <Typography><strong>Descripción:</strong> {component.description}</Typography>
        )}
        {component.createdAt && (
          <Typography><strong>Creado:</strong> {new Date(component.createdAt).toLocaleString()}</Typography>
        )}
        {component.updatedAt && (
          <Typography><strong>Actualizado:</strong> {new Date(component.updatedAt).toLocaleString()}</Typography>
        )}
        {component.componentFrom && (
            <Typography>
                <strong>Componente hijo de:</strong> {padre || "No hay datos del padre"}
            </Typography>
        )}

      </Paper>
    </Box>
  );
};

export default ComponentDetail;
