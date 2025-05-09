import { Box, Typography, Paper, Button, Modal, TextField, Card, FormControl, FormGroup, MenuItem, Chip } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingCircle from "../components/LoadingCircle";

const ComponentDetail = () => {
  const { id } = useParams();
  const [component, setComponent] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingButtons, setLoadingButtons] = useState(false);
  const navigate = useNavigate();
  
  /* Descripciones Componente */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  const [descriptions, setDescriptions] = useState([]);

  /* Sub Componente */
  const [isModalChildOpen, setIsModalChildOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const [caracteristicas, setCaracteristicas] = useState([]);
  
  /* Características para SubComponente */
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [newSubDescription, setNewSubDescription] = useState("");
  const [newSubCharacteristics, setNewSubCharacteristics] = useState([]);

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
        setDescriptions(response.data.descriptions || []);
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
    setLoadingButtons(true);

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
      setLoadingButtons(false);
    }
  }

  const cambiarEstado = async () => {
    const payload = {
      status: component.status === "activo" ? "de baja" : "activo",
    };
    try {
      setLoadingButtons(true);
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
      setLoadingButtons(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setNewNombre("");
    setNewDescripcion("");
  };

  const handleOpenModalChild = () => {
    setIsModalChildOpen(true);
    setNombre("");
    setTipo("");
    setEstado("activo");
    setCaracteristicas([]);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsModalChildOpen(false);
  };

  /* Características para SubComponente */
  const handleOpenCharModal = () => {
    setIsCharModalOpen(true);
    setNewNombre("");
    setNewDescripcion("");
  };

  const handleCloseCharModal = () => {
    setIsCharModalOpen(false);
  };
  
  const handleAddNewSubCharacteristics = () => {
    const newSubDesc = {
      name: newSubName.trim(),
      description: newSubDescription.trim()
    };

    setNewSubCharacteristics([...newSubCharacteristics, newSubDesc]);
    setIsModalOpen(false);
    setNewSubName("");
    setNewSubDescription("");
    handleCloseCharModal();
  };

  const handleDeleteNewSubCharacteristic = (index) => {
    const news = [...newSubCharacteristics];
    news.splice(index, 1);
    setNewSubCharacteristics(news);
  };

  const handleAddChildComponent = async () => {
    const validDescriptions = caracteristicas.filter(
      (c) => c.name.trim() && c.description.trim()
    );
    const payload = {
        name: nombre.trim(),
        type: tipo.trim(),
        status: estado,
        descriptions: validDescriptions.length > 0 ? validDescriptions : undefined
    };
    try {
      setLoadingButtons(true);
      const response = await axios.post(`${BACKEND_URL}/components/${id}/components`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Componente hijo guardado:", response.data); 
      const nuevosComponentes = [...component.components, response.data];   
      setComponent((prev) => ({
        ...prev,
        components: nuevosComponentes,
      }));
      handleCloseModal();
    } catch (error) {
      console.error("Error al agregar componente hijo:", error);
    } finally {
      setLoadingButtons(false);
    }
  };

  if (loading)
    return (
      <LoadingCircle></LoadingCircle>
    );

  if (!component)
    return (
      <Box sx={{ p: 4, justifyContent: "center", alignItems: "center" }}>
        <Typography color="error">No se encontró el componente</Typography>
      </Box>
    );

  return (
    <Box sx={{
      height: "95vh",
      background: "var(--color-bg-gradient)",
      color: "var(--color-text-base)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      overflowY: "hidden",
      width: "99.1vw"
    }}>
      <Paper
        elevation={3}
        sx={{
          backgroundColor: "var(--bg-paper)",
          borderRadius: "16px",
          padding: "2rem 3rem",
          width: "80%",
          height: "80vh",
          boxShadow: "0px 8px 20px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "row",
        }}
      >
       <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        width: '50%', 
        height: '95%',
      }}>
          <Button
            variant= "outlined"
            color= "primary"
            onClick={() => navigate(-1)}
            sx={{ mb: 2, color: 'var(--color-text-base)', borderColor: 'rgba(0,0,0,0.2)', width: "50%" }}
          >
            ← Volver
          </Button>
          <Typography
            variant="h3"
            sx={{
              mb: 3,
              color: "var(--color-dg-header-bg)",
              wordBreak: "break-word",   
              whiteSpace: "normal",      
              overflowWrap: "break-word",
              maxWidth: "70%",
            }}
          >
            {component.name}
          </Typography>
    
          <Typography sx={{fontSize: '1rem'}}><strong>Tipo:</strong> {component.type}</Typography>
    
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography
              sx={{
                fontSize: "1rem",
                width: "10rem",
                color:
                  component.status === "activo"
                    ? "var(--color-text-active)"
                    : "var(--color-text-baja)",
              }}
            >
              <strong>Estado:</strong> <em>{component.status}</em>
            </Typography>
      
            <Button
              variant="outlined"
              disabled={loadingButtons}
              onClick={cambiarEstado}
              size="small"
              sx={{
                fontSize: "0.7rem", 
                mr: 10,
                color:
                  component.status === "activo"
                    ? "var(--color-text-baja)"
                    : "var(--color-text-active)", 
                    borderColor: "rgba(0,0,0,0.2)" 
                }}
            >
              {component.status === "activo" ? "Retirar" : "Activar"}
            </Button>
          </Box>
    
          <Typography sx={{ fontSize: "1rem" }}>
            <strong>Características:</strong>
          </Typography>
          {component.descriptions?.length > 0 && (
            <Box sx={{ 
              maxHeight: "10rem",
              wordBreak: "break-word",   
              whiteSpace: "normal",      
              overflowWrap: "break-word",
              overflowY: "auto",
              mr: 10,
            }}>
              <ul style={{ paddingLeft: "1.5rem"}}>
                {component.descriptions.map((desc) => (
                  <Card 
                    key={desc._id} 
                    sx={{ 
                      mb: "0.5rem", 
                      fontSize: "1rem",   
                      width: "75%", 
                      padding: "0.5rem 1rem", 
                    }}>
                    <strong>{desc.name}:</strong> {desc.description}
                  </Card>
                ))}
              </ul>
            </Box>
          ) || (
            <Typography variant="overline">
              No hay características disponibles para este componente.
            </Typography>
          )}
    
          {rol === '0' && (
            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Button
                variant="outlined"
                color="info"
                onClick={handleOpenModal}
                size="small"
              >
                + Agregar Característica
              </Button>
            </Box>
          )}
    
          {component.createdAt && (
            <Typography sx={{ fontSize: "1rem" }}>
              <strong>Creado:</strong> {new Date(component.createdAt).toLocaleString()}
            </Typography>
          )}
    
          {component.updatedAt && (
            <Typography sx={{ fontSize: "1rem" }}>
              <strong>Actualizado:</strong> {new Date(component.updatedAt).toLocaleString()}
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 2, justifyItems: "flex-start", maxWidth: "50%" }}>
          <Typography variant="h5" sx={{ mb: 1, mt: 5, }}>
            <strong>Sub Componentes:</strong>
          </Typography>
          {component.components?.length > 0 ? (
            <Box sx={{ mt: 2, overflowY: "auto", maxHeight: "70%", width: "40vw" }}>
              {component.components.map((child, idx) => (
                <Card key={idx} sx={{ padding: 1, mb: 1, flex: 1 }} onClick={() => navigate(`/components/${child._id}`)}>
                  <Typography 
                    variant="body1"
                    sx={{
                      ml: 2,
                      mb: 1,
                      wordBreak: "break-word",   
                      whiteSpace: "normal",      
                      overflowWrap: "break-word",
                    }}
                  >
                    {child.name}</Typography>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography variant="overline" sx={{ mt: 2 }}>
              No hay sub componentes para este componente.
            </Typography>
          )}  
          <Button size="large" sx={{ mt: 2, width: "40vw" }} onClick={handleOpenModalChild} >Agregar Sub Componente</Button>
        </Box>
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
              disabled={!newNombre.trim() || !newDescripcion.trim() || loadingButtons}
            >
              Agregar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal para agregar componente hijo */}
      <Modal open={isModalChildOpen} onClose={handleCloseModal}>
        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          py: 6,
          px: 2,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          margin: '0 auto'
        }}>
          <FormControl
            component={Paper}
            sx={{
              px: 6,
              py: 5,
              borderRadius: '16px',
              backgroundColor: 'var(--bg-paper)',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              color: 'var(--color-text-base)',
              width: '100%',
              maxWidth: '600px',
            }}
          >
            <Typography variant="h4" sx={{ color: 'var(--color-text-base)', mb: 3, textAlign: 'center' }}>
              Agregar Componente
            </Typography>
    
            <FormGroup sx={{ gap: 2 }}>
              <TextField
                label="Nombre"
                variant="filled"
                fullWidth
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                sx={{ bgcolor: 'var(--bg-inputs)' }}
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
                    {newSubCharacteristics.map((c, index) => (
                      <Chip
                        key={index}
                        label={`${c.name}: ${c.description}`}
                        onDelete={() => handleDeleteNewSubCharacteristic(index)}
                        size="medium"
                        sx={{ m: 1, maxWidth: '100%' }}
                      />
                    ))}
                  </Box>
                </Box>
                  <Button
                    variant="outlined"
                    onClick={handleOpenCharModal}
                    sx={{
                      borderColor: 'var(--color-dg-header-bg)',
                      color: 'var(--color-text-base)',
                      height: 'fit-content',
                    }}
                  >
                    +
                  </Button>
                </Box>
              </FormGroup>
                
              <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center"}}>
                <Button onClick={handleCloseModal}>Cancelar</Button>
                <Button 
                  variant="contained" 
                  sx={{
                    py: 1.5,
                    borderRadius: 50,
                    backgroundColor: 'var(--login-button-bg)',
                    '&:hover': {
                      backgroundColor: 'var(--login-button-hover)',
                    },
                  }}
                  onClick={handleAddChildComponent}
                  disabled={!nombre || !tipo || !estado || loadingButtons}
                >
                  Guardar Componente
                </Button>
              </Box>
            </FormControl>
        </Box>
      </Modal>

      {/* Modal para características en Hijo */}
      <Modal open={isCharModalOpen} onClose={handleCloseCharModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'white',
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
            value={newSubName}
            onChange={(e) => setNewSubName(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
  
          <TextField
            label="Descripción"
            value={newSubDescription}
            onChange={(e) => setNewSubDescription(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
  
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleCloseCharModal} color="secondary">
              Cancelar
            </Button>
            <Button
              onClick={handleAddNewSubCharacteristics}
              variant="contained"
              disabled={!newSubName.trim() || !newSubDescription.trim() || loadingButtons}
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