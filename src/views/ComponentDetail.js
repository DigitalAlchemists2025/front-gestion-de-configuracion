import { Box, Typography, Paper, Button, Modal, TextField, Card, FormControl, FormGroup, MenuItem, Chip, TextareaAutosize, Alert, Input, InputAdornment, Avatar, Tabs, Tab, IconButton } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingCircle from "../components/LoadingCircle";
import WestIcon from '@mui/icons-material/West';
import CloseIcon from '@mui/icons-material/Close';
import SideBar from "../components/SideBar";
import TabPanel from "../components/TabPanel";
import { DataGrid, GridCloseIcon } from "@mui/x-data-grid";
import AddCharacteristicModal from "../components/AddCharacteristModal";
import { CapitalizeFirst } from "../utils/CapitalizeFirst";

const ComponentDetail = () => {

  // Sección de columnas personalizadas para las diferentes tablas
  const columns = [
    { field: 'name', headerName: 'Nombre', flex: 1, },
    { field: 'type', headerName: 'Tipo', flex: 1 },
    {
        field: 'status',
        headerName: 'Estado',
        flex: 1,
        cellClassName: (params) => {
            if (params.value === 'activo') return 'estado-activo';
            if (params.value === 'de baja') return 'estado-baja';
            return '';
        },
    },
    {
      field: 'delete',
      headerName: '',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        rol === '0' ? (
          <IconButton
            size="small"
            disabled={loadingButtons}
            onClick={(event) => {
              event.stopPropagation();
              handleRemoveSubComponent(params.row._id);
            }}
            sx={{ color: 'error.main' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : null
    }
  ];

  const historyColumns = [
    { field: 'component_name', headerName: 'Componente', flex: 1, },
    {
      field: 'user_id',
      headerName: 'Usuario',
      flex: 1,
      renderCell: (params) => {
        const user = params.row.user_id;
        return (
            user?.username ?? 'Desconocido'
        );
      }
    },
    { field: 'action', headerName: 'Acción', flex: 1,
      renderCell: (params) => (
        params.value.charAt(0).toUpperCase() + params.value.slice(1)
      )
    },
    { field: 'date', headerName: 'Fecha', flex: 1,
      renderCell: (params) => (
        new Date(params.value).toLocaleString()
      )
    },
  ]

  const descriptionColumns = [
    { field: 'name', headerName: 'Característica', flex: 1 },
    {
      field: 'description',
      headerName: 'Descripción',
      flex: 2,
      renderCell: (params) => (
        <TextField
          size="small"
          variant="outlined"
          value={params.value}
          onChange={e => handleEditDescription(params.row._idx, 'description', e.target.value)}
          disabled={rol !== '0'}
          InputProps={{
            style: {
              padding: '0.25rem 1rem',
              fontSize: '1.1rem',
              fontFamily: "var(--font-source)",
            }
          }}
          onKeyDown={e => e.stopPropagation()}
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            bgcolor: '#ffffff',
            borderRadius: 1,
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "black",
              color: "black",
            },
          }}
        />
      )
    },
    {
      field: 'delete',
      headerName: '',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        rol === '0' ? (
          <IconButton
            size="small"
            disabled={loadingButtons}
            onClick={() => handleDeleteDescription(params.row._idx)}
            sx={{ color: 'error.main' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : null
    }
  ]

  const { id } = useParams();

  const [component, setComponent] = useState(null);
  const [changes, setChanges] = useState(false);

  const [mainComponentName, setMainComponentName] = useState("");
  const [mainComponentType, setMainComponentType] = useState("");
  const [mainDescriptions, setMainDescriptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingButtons, setLoadingButtons] = useState(false);
  const navigate = useNavigate();
  
  /* Descripciones Componente */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");

  /* Sub Componente */
  const [allComponents, setAllComponents] = useState([]);
  const [isModalChildOpen, setIsModalChildOpen] = useState(false);

  const [isModalNewChildOpen, setIsModalNewChildOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const [caracteristicas, setCaracteristicas] = useState([]);
  
  /* Características para SubComponente */
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [newSubDescription, setNewSubDescription] = useState("");
  const [newSubCharacteristics, setNewSubCharacteristics] = useState([]);
  
  /* Búsqueda de subcomponentes */
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedComponents, setSearchedComponents] = useState([]);

  /* Tabs */
  const [tabValue, setTabValue] = useState(0);

  /* Historial */
  const [history, setHistory] = useState([]);

  const token = localStorage.getItem("token").trim();
  const rol = localStorage.getItem("role");

  if (!token) {
    navigate("/login");
  }

  if (!id || id === undefined) {
    navigate(-1);
  }
  const BACKEND_URL = process.env.REACT_APP_BACK_URL;

  /* 
    Al montar la página con un componente existente, se
    hace fetch a sus datos incluyendo su historial de cambios
  */
  useEffect(() => {
    const fetchComponent = async () => {
      try {
        const componentResponse = await axios.get(`${BACKEND_URL}/components/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = componentResponse.data;
        setComponent(data);
        setMainComponentName(data.name);
        setMainComponentType(data.type);
        setMainDescriptions(data.descriptions.map(d => ({ ...d })));

        const historyResponse = await axios.get(`${BACKEND_URL}/histories/components/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHistory(historyResponse.data);
      } catch (error) {
        console.error("Error al obtener componente:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComponent();
  }, [id]);

  /* Editar características del componente principal */
  const handleEditName = (e) => {
    setMainComponentName(e.target.value);
    setChanges(true);
  };

  const handleEditType = (e) => {
    setMainComponentType(e.target.value);
    setChanges(true);
  };

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

  const handleAddDescripcion = async () => {
    const payload = {
      name: CapitalizeFirst(newNombre),
      description: CapitalizeFirst(newDescripcion),
    };
    
    mainDescriptions.push(payload);
    setChanges(true);
    setIsModalOpen(false);
  };

  const handleEditDescription = (index, field, value) => {
    setMainDescriptions(descs =>
      descs.map((d, i) =>
        i === index
          ? { ...d, [field]: value }
          : d
      )
    );
    setChanges(true);
  };

  const handleDeleteDescription = (index) => {
    const updatedDescriptions = mainDescriptions.filter((_, i) => i !== index);
    setMainDescriptions(updatedDescriptions);
    setChanges(true);
  };

  /* Modal para características genéricas del componente principal */
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setNewNombre("");
    setNewDescripcion("");
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  /* Modal para añadir un subcomponente */
  const handleOpenModalChild = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/components`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const components = response.data.filter((c) => 
        c.parent === null && 
        String(c._id) !== String(component._id) &&
        c._id !== component.parent
      );
      setAllComponents(components);
      setSearchedComponents(components);
      setIsModalChildOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseChildModal = () => {
    setIsModalChildOpen(false);
  };

  const handleAddExistingComponentAsChild = async (childId) => {
    try {
      setLoadingButtons(true)
      const res = await axios.post(`${BACKEND_URL}/components/${component._id}/associate/${childId}`,{},
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComponent(res.data);
      alert('¡Componente añadido correctamente!');
      setSearchTerm("");
      setSearchedComponents([]);
      setIsModalChildOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingButtons(false)
    }
  };
  
  /* Modal para crear subcomponente */
  const handleOpenModalNewChild = () => {
    setIsModalNewChildOpen(true);
    setNombre("");
    setTipo("");
    setEstado("activo");
    setCaracteristicas([]);
    setNewSubCharacteristics([]);
  };
  
  const handleCloseNewChildModal = () => {
    setIsModalNewChildOpen(false);
  };

  /* Crear descripciones en nuevo subcomponente */
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
      name: CapitalizeFirst(newSubName.trim()),
      description: CapitalizeFirst(newSubDescription.trim())
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

  /* Logica de guardado de cambios (incluyendo características genéricas y datos de componente) */
  const handleSaveChanges = async () => {
    if (window.confirm("¿Esta segur@ de realizar estos cambios?")) {
      if (!changes) return;
      if (!mainComponentName || mainComponentName.trim() === "") {
        alert("Error: Debe ingresar un nombre")
        return;
      }
      if (!mainComponentType || mainComponentType.trim() === "") {
        alert("Error: Debe ingresar un Tipo")
        return;
      }
      const filteredDescriptions = mainDescriptions;
  
      const payload = {
        name: CapitalizeFirst(mainComponentName),
        type: CapitalizeFirst(mainComponentType),
        descriptions: filteredDescriptions,
      };
  
      try {
        setLoadingButtons(true);
        await axios.put(`${BACKEND_URL}/components/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setComponent({
          ...component,
          name: CapitalizeFirst(mainComponentName),
          type: CapitalizeFirst(mainComponentType),
          descriptions: mainDescriptions,
        });
        setChanges(false);
        alert(`${mainComponentName} Actualizado Correctamente`)
      } catch (error) {
        console.error("Error al guardar cambios:", error);
      } finally {
        setLoadingButtons(false);
      }
    }
  };

  const resetChanges = () => {
    setMainComponentName(component.name);
    setMainComponentType(component.type);
    setMainDescriptions(
      (component.descriptions || []).map(d => ({ ...d }))
    );
    setChanges(false);
  };

  /* Lógica para agregar o quitar subcomponente */
  const handleAddChildComponent = async () => {
    const validDescriptions = caracteristicas.filter(
      (c) => c.name.trim() && c.description.trim()
    );
    const payload = {
        name: CapitalizeFirst(nombre.trim()),
        type: CapitalizeFirst(tipo.trim()),
        status: estado,
        parent: component._id,
        descriptions: validDescriptions.length > 0 ? validDescriptions : undefined
    };
    try {
      setLoadingButtons(true);
      const response = await axios.post(`${BACKEND_URL}/components/${id}/components`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const nuevosComponentes = [...component.components, response.data];   
      setComponent((prev) => ({
        ...prev,
        components: nuevosComponentes,
      }));
      
      setNewSubCharacteristics([]);
      handleCloseChildModal();
      handleCloseNewChildModal();
    } catch (error) {
      console.error("Error al agregar componente hijo:", error);
    } finally {
      setLoadingButtons(false);
    }
  };

  const handleRemoveSubComponent = async (childId) => {
    try {
      setLoadingButtons(true);
      await axios.post(`${BACKEND_URL}/components/${id}/disassociate/${childId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setComponent((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c._id !== childId),
    }));
    } catch(error) {
      console.error(`Error: ${error}`)
    } finally {
      setLoadingButtons(false);
    }
  };

  const handleSearch = async (value) => {
    setSearchTerm(value);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/components/search`,
        {
          params: { q: value },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSearchedComponents(response.data.filter(c => 
        c.parent !== null && 
        String(c._id !== component._id &&
        c._id !== component.parent
      )));
    } catch (error) {
      console.error(error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display:'flex', height:'100vh', width: '100vw', position: 'fixed', top: 0, left: 0, color: 'var(--color-text-base)' }}>
        <SideBar/>
        <Box sx={{ flex:1, p:4 }}>
          <Paper sx={{ p:4 }}>
            <LoadingCircle/>
          </Paper>
        </Box>
      </Box>
    );
  }

  if (!component) {
    return (
      <Box sx={{ display:'flex', height:'100vh', width: '100vw', position: 'fixed', top: 0, left: 0, color: 'var(--color-text-base)' }}>
        <SideBar/>
        <Box sx={{ flex:1, p:4 }}>
          <Paper sx={{ p:4 }}>
            <Button onClick={()=>navigate(-1)}><WestIcon fontSize="small"/></Button>
            <Alert severity="warning">No se encontró el componente</Alert>
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, color: 'var(--color-text-base)' }}>
      <SideBar />
      <Box sx={{ flex: 1, bgcolor: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper
          elevation={3}
          sx={{
            backgroundColor: "var(--color-bg-gradient)",
            borderRadius: "16px",
            padding: "4% 5% 1%",
            width: "70vw",
            height: "100vh",
            boxShadow: "0px 8px 20px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Box información del component */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row',  
            width: '100%', 
            height: '30%',
            mb: 2, 
          }}>
            {/* Datos generales*/}
            <Box sx={{ display: "flex", flexDirection: 'column', width: "100%", }}>  
              <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', mb: 2}}>
                <Button
                  variant= "outlined"
                  color= "primary"
                  onClick={() => navigate(-1)}
                  sx={{ color: "var(--color-title-primary)", borderColor: "var(--color-title-primary)", width: "10%", fontFamily: "var(--font-source)", position: "absolute", }}
                >
                  <WestIcon fontSize="small"/>
                </Button>
                <TextareaAutosize
                  value={mainComponentName}
                  onChange={(e) => handleEditName(e)}
                  disabled={rol !== '0'}
                  style={{
                    fontSize: '2rem',
                    color: 'var(--color-title-primary)',
                    resize: 'none',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    overflow: 'hidden',
                    fontFamily: 'var(--font-montserrat)',
                    margin: '0 auto',
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                </TextareaAutosize>  
              </Box> 
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: "100%", height: "100%",  ml: 20, justifyContent: "center" }}>
                <Box sx={{ display: 'flex', alignItems: 'center',  }}>
                  <Typography sx={{ mr: 1, fontSize: "1.1rem", color: "var(--color-title-primary)", fontFamily: "var(--font-source)" }}><strong>Tipo:</strong></Typography>
                  <TextField
                    variant="standard"
                    value={mainComponentType}
                    onChange={handleEditType}
                    disabled={rol !== '0'}
                    InputProps={{
                      disableUnderline: true,
                      style: {
                        fontSize: '1.1rem',
                        color: 'var(--color-title-primary)',
                        fontFamily: 'var(--font-source)',
                      }
                    }}
                    sx={{
                      width: '200px',
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "inherit",
                        color: "inherit",
                      },
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    color={component.status === "activo" ? "info" : "textSecondary"}
                    sx={{
                      fontSize: "1.1rem",
                      fontFamily: "var(--font-source)",
                      mr: 5,
                    }}
                  >
                    <strong>Estado:</strong> <em>{component.status}</em>
                  </Typography>
            
                  {rol === '0' && (
                    <Button
                      variant="outlined"
                      disabled={loadingButtons}
                      onClick={cambiarEstado}
                      size="small"
                      color={component.status === "activo" ? "textSecondary" : "info"}
                      borderColor={component.status === "activo" ? "textSecondary" : "info"}
                      sx={{ fontSize: "0.7rem", fontFamily: "var(--font-source)", }}
                    >
                      {component.status === "activo" ? "Retirar" : "Activar"}
                    </Button>
                  )}
                </Box>
          
                {component.createdAt && (
                  <Typography sx={{ fontSize: "1.1rem", fontFamily: "var(--font-source)" }}>
                    <strong>Creado:</strong> {new Date(component.createdAt).toLocaleString()}
                  </Typography>
                )}
          
                {component.updatedAt && (
                  <Typography sx={{ fontSize: "1.1rem", fontFamily: "var(--font-source)"  }}>
                    <strong>Actualizado:</strong> {new Date(component.updatedAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
            
          {/* Box de tabs para características, subcomponentes e historial */}
          <Box sx={{ display: 'flex', flexDirection: "column", maxWidth: "100%", mr: 1, flexGrow: 1, overflow: "hidden", }}>  
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ position: "sticky", width: "70vw" }}
            >
              <Tab label="Características" sx={{ fontWeight: "bold" }} />
              <Tab label="Sub Componentes" sx={{ fontWeight: "bold" }} />
              {rol === '0' && (
                <Tab label="Historial" sx={{ fontWeight: "bold" }} /> 
              )}
            </Tabs>

           <TabPanel value={tabValue} index={0}>
              {mainDescriptions.length > 0 ? (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  height: '100%',
                  width: '100%',
                }}>
                  <Paper sx={{
                    flexGrow: 1,
                    width: '100%',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    height: '38vh',
                    backgroundColor: 'transparent'
                  }}>
                    <DataGrid
                      rows={mainDescriptions.map((d, i) => ({ _idx: i, ...d }))}
                      columns={descriptionColumns}
                      getRowId={(row) => row._idx}
                      pageSizeOptions={[5]}
                      initialState={{
                        pagination: { paginationModel: { page: 0, pageSize: 5 } }
                      }}
                      isRowSelectable={() => false}
                      sx={{
                        width: '100%',
                        height: '100%',
                        border: '1px solid #e0e0e0',
                        borderRadius: '25px',
                        fontSize: '1.1rem',
                        background: 'transparent',
                        color: 'var(--color-text-base)',
                        fontFamily: "var(--font-source)",
                        '.MuiDataGrid-columnHeader': {
                          backgroundColor: 'var(--color-bg-secondary)',
                          color: '#ffffff',
                          borderBottom: 'none',
                        },
                        '.MuiDataGrid-cell': {
                          borderBottom: 'none',
                          backgroundColor: 'var(--color-dg-cell-bg)',
                          color: 'var(--color-datagrid-cell-text)',
                        },
                        '.MuiDataGrid-row:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.05)',
                          cursor: 'pointer',
                        },
                        '.MuiDataGrid-footerContainer': {
                          bgcolor: '#e3f2fd',
                          borderTop: 'none',
                        },
                        '[class*="MuiTablePagination"]': {
                          color: 'var(--color-pagination)',
                        },
                        '& .MuiDataGrid-columnHeaderMenuIconButton-root, & .MuiDataGrid-columnHeaderMenuIconButton-root svg, & .css-1ckov0h-MuiSvgIcon-root': {
                          color: 'white !important',
                          fill: 'white !important',
                        },
                        '& .MuiDataGrid-iconButtonContainer button': {
                          color: '#fff !important',
                        },
                      }}
                    />
                  </Paper>
                </Box>
              ) : (
                <Typography variant="overline" sx={{ fontFamily: "var(--font-source)", m: 2 }}>
                  No hay características disponibles para este componente.
                </Typography>
              )}
              {rol === '0' && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="info"
                    size="small"
                    sx={{
                      color: "var(--color-title-primary)",
                      borderColor: "var(--color-title-primary)",
                      fontFamily: "var(--font-source)",
                    }}
                    onClick={handleOpenModal}
                  >
                    + Agregar Característica
                  </Button>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {component.components?.length > 0 ? (
                <Box sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: "center",
                  height: "100%",
                }}>
                  <Paper sx={{
                    flexGrow: 1,
                    width: '100%',
                    borderRadius: '16px',
                    backgroundColor: 'transparent',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    height: "38vh",
                  }}>
                    <DataGrid
                      rows={component.components}
                      columns={columns}
                      getRowId={(row) => row._id}
                      isRowSelectable={() => false}
                      getRowClassName={(params) => {
                        if (params.row.isSub) return 'fila-subcomponente';
                        if (params.row.status === 'activo') return 'fila-activa';
                        if (params.row.status === 'de baja') return 'fila-baja';
                        return '';
                      }}
                        initialState={{
                          pagination: { paginationModel: { page: 0, pageSize: 5 } },
                        }}
                        onRowClick={(params) => {
                          if (!params.isSub){
                            navigate(`/components/${params.row._id}`)
                          } else {
                            const newId = params.row._id.split('-sub-')[0];
                            navigate(`/components/${newId}`);
                          }
                        }}
                          pageSizeOptions={[5]}
                          sx={{
                            height: '100%',
                            border: '1px solid #e0e0e0',
                            borderRadius: '25px',
                            fontSize: '1.1rem',
                            background: 'transparent',
                            color: 'var(--color-text-base)',
                            fontFamily: "var(--font-source)",
                            '& .fila-activa': {
                              color: 'var(--color-text-active)',
                            },
                            '& .fila-baja': {
                              color: 'var(--color-text-baja)',
                              fontStyle: 'italic',
                            },
                            '.MuiDataGrid-columnHeader': {
                              backgroundColor: 'var(--color-bg-secondary)',
                              color: '#ffffff',
                              borderBottom: 'none',
                            },
                            '.MuiDataGrid-cell': {
                              borderBottom: 'none',
                              backgroundColor: 'var(--color-dg-cell-bg)',
                              color: 'var(--color-datagrid-cell-text)',
                            },
                            '.MuiDataGrid-row:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.05)',
                              cursor: 'pointer',
                            },
                            '.MuiDataGrid-footerContainer': {
                              bgcolor: '#e3f2fd',
                              borderTop: 'none',
                            },
                            '[class*="MuiTablePagination"]': {
                              color: 'var(--color-pagination)',
                            },
                            '.MuiDataGrid-cell:focus, .MuiDataGrid-columnHeader:focus, .MuiDataGrid-columnHeader:focus-within': {
                              outline: 'none',
                            },
                            '& .MuiDataGrid-row:nth-of-type(even) .MuiDataGrid-cell': {
                              backgroundColor: 'var(--color-dg-cell-bg-even)',
                            },
                            '& .MuiDataGrid-row:nth-of-type(odd) .MuiDataGrid-cell': {
                                backgroundColor: 'var(--color-dg-cell-bg-odd)',
                            },
                            '& .MuiDataGrid-row.fila-subcomponente': {
                              fontStyle: 'italic',
                            },
                            '& .MuiDataGrid-row.fila-subcomponente .MuiDataGrid-cell': {
                              backgroundColor:"var(--color-dg-cell-child)" ,
                              pl: 2,
                            },
                            '& .MuiDataGrid-columnHeaderMenuIconButton-root, & .MuiDataGrid-columnHeaderMenuIconButton-root svg, & .css-1ckov0h-MuiSvgIcon-root': {
                                color: 'white !important',
                                fill: 'white !important',
                              },
                              '& .MuiDataGrid-iconButtonContainer button': {
                                color: '#fff !important',
                              },
                        }}
                      />
                  </Paper>
              </Box>
              ) : (
                <Typography variant="overline" sx={{ mt: 2, fontFamily: "var(--font-source)" }}>
                  No hay sub componentes para este componente.
                </Typography>
              )}
            
              {rol === '0' && (
                <Box sx={{ display: "flex", justifyContent: "end", width: "100%" }}>
                  <Button 
                    size="large" 
                    sx={{ mt: 2, width: "25em", color: "var(--color-title-primary)", fontFamily: "var(--font-source)"  }} 
                    onClick={handleOpenModalChild} 
                  >
                    Agregar Sub Componente
                  </Button>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box>
                {history.length > 0 ? (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: "center",
                    height: "100%",
                  }}>
                    <Paper sx={{
                      flexGrow: 1,
                      width: '100%',
                      borderRadius: '16px',
                      backgroundColor: 'transparent',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      height: "38vh",
                    }}>
                      <DataGrid
                        rows={history}
                        columns={historyColumns}
                        getRowId={(row) => row._id}
                        isRowSelectable={() => false}
                        pageSizeOptions={[5]}
                        initialState={{
                          pagination: { paginationModel: { page: 0, pageSize: 5 } },
                        }}
                        sx={{
                          height: '100%',
                          border: '1px solid #e0e0e0',
                          borderRadius: '25px',
                          fontSize: '1.1rem',
                          background: 'transparent',
                          color: 'var(--color-text-base)',
                          fontFamily: "var(--font-source)",
                          '& .fila-activa': {
                            color: 'var(--color-text-active)',
                          },
                          '& .fila-baja': {
                            color: 'var(--color-text-baja)',
                            fontStyle: 'italic',
                          },
                          '.MuiDataGrid-columnHeader': {
                            backgroundColor: 'var(--color-bg-secondary)',
                            color: '#ffffff',
                            borderBottom: 'none',
                          },
                          '.MuiDataGrid-cell': {
                            borderBottom: 'none',
                            backgroundColor: 'var(--color-dg-cell-bg)',
                            color: 'var(--color-datagrid-cell-text)',
                          },
                          '.MuiDataGrid-row:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.05)',
                            cursor: 'pointer',
                          },
                          '.MuiDataGrid-footerContainer': {
                            bgcolor: '#e3f2fd',
                            borderTop: 'none',
                          },
                          '[class*="MuiTablePagination"]': {
                            color: 'var(--color-pagination)',
                          },
                          '.MuiDataGrid-cell:focus, .MuiDataGrid-columnHeader:focus, .MuiDataGrid-columnHeader:focus-within': {
                            outline: 'none',
                          },
                          '& .MuiDataGrid-row:nth-of-type(even) .MuiDataGrid-cell': {
                            backgroundColor: 'var(--color-dg-cell-bg-even)',
                          },
                          '& .MuiDataGrid-row:nth-of-type(odd) .MuiDataGrid-cell': {
                              backgroundColor: 'var(--color-dg-cell-bg-odd)',
                          },
                          '& .MuiDataGrid-row.fila-subcomponente': {
                            fontStyle: 'italic',
                          },
                          '& .MuiDataGrid-row.fila-subcomponente .MuiDataGrid-cell': {
                            backgroundColor:"var(--color-dg-cell-child)" ,
                            pl: 2,
                          },
                          '& .MuiDataGrid-columnHeaderMenuIconButton-root, & .MuiDataGrid-columnHeaderMenuIconButton-root svg, & .css-1ckov0h-MuiSvgIcon-root': {
                            color: 'white !important',
                            fill: 'white !important',
                          },
                          '& .MuiDataGrid-iconButtonContainer button': {
                            color: '#fff !important',
                          },
                        }}
                      />
                    </Paper>
                  </Box>
                ) : (
                  <Typography variant="overline" sx={{ mt: 2, fontFamily: "var(--font-source)" }}>
                    No hay historial para este componente.
                  </Typography>
                )}
              </Box>
            </TabPanel>
          </Box>  
          <footer>
            {rol === '0' && (
              <Box sx={{ display: 'flex', gap: 2, width: "100%", justifyContent: "space-evenly", mb: 10 }}>
                <Button
                  variant="outlined"
                  sx={{ borderColor: "var(--color-bg-secondary)", color: "var(--color-bg-secondary)", fontFamily: "var(--font-source)" }}
                  onClick={resetChanges}
                  disabled={!changes || loadingButtons}
                >
                  Descartar Cambios
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveChanges}
                  sx={{ bgcolor: "var(--color-bg-secondary)", fontFamily: "var(--font-source)" }}
                  disabled={!changes || loadingButtons}
                >
                  Guardar Cambios
                </Button>
              </Box>
            )}
          </footer>
        </Paper>

        {/* Modal para añadir característica al padre */}
        <AddCharacteristicModal
          open={isModalOpen}
          onClose={handleCloseModal}
          title="Agregar Característica"
          onConfirm={handleAddDescripcion}
          confirmText="Agregar"
          cancelText="Cancelar"
          confirmDisabled={
            !newNombre.trim() || !newDescripcion.trim() || loadingButtons
          }
          sxConfirmBtn={{ backgroundColor: 'var(--color-bg-secondary)' }}
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
        </AddCharacteristicModal>

        {/* Modal para agregar sub componentes */}
        <Modal open={isModalChildOpen} onClose={handleCloseChildModal}>
          <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70vw",
            height: "60vh",
            bgcolor: "white",
            backdropFilter: "blur(4px)",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            display: "flex",
          }}>
            <Box sx={{ 
              pr: 3, 
              display: "grid", 
              justifyContent: "flex-start",  
              height: "100%", 
              borderRight: "1px solid #e0e0e0", 
              gridTemplateRows: "auto 1fr auto"
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontSize: '2rem', color: "var(--color-title-primary)", fontFamily: "var(--font-montserrat)"  }}>
                {component.name}
              </Typography>
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, color: "var(--color-title-primary)", fontFamily: "var(--font-source)", mb: 5  }}>
                  Subcomponentes actuales:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {component.components?.length > 0
                    ? component.components.map((sub, i) => (
                        <Chip
                          key={sub._id}
                          label={sub.name}
                          sx={{ bgcolor: "var(--color-bg-secondary)", color: "var(--color-title-secondary)", fontFamily: "var(--font-source)"  }}
                          size="small"
                        />
                      ))
                    : <Typography color="text.secondary" fontFamily={"var(--font-source)"} fontSize="0.95rem">Sin subcomponentes.</Typography>
                  }
                </Box>
              </Box>
              <Button onClick={handleOpenModalNewChild} sx={{ color: "var(--color-title-primary)", bottom: 0, fontFamily: "var(--font-source)" }}>
                Crear subcomponente
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", flex: 2, pl: 3, height: "100%", width: "100%" }}>
              <Input
                startAdornment={
                  <InputAdornment position="start">
                    <Avatar
                      variant="square"
                      src="/search-icon.png"
                      sx={{
                        p: 1,
                        mr: 1,
                        height: '20px',
                        width: '20px',
                        backgroundColor: 'transparent',
                        filter: 'invert(20%)',
                      }}
                      className="search-icon"
                    />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <Button onClick={() => {handleSearch("");}}>
                      <GridCloseIcon/>
                    </Button>
                  </InputAdornment>
                }
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar"
                sx={{
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-inputs)',
                  padding: '0.5rem 1rem',
                  margin: '0 auto',
                  width: '80%',
                  color: 'var(--color-text-base)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                  '& input': {
                    color: 'var(--color-text-base)',
                  },
                  '&:focus-within': {
                    backgroundColor: 'var(--color-celeste-focus)',
                    boxShadow: '0 0 5px var(--color-celeste-focus)',
                  },
                }}
                onFocus={() => {
                  const icon = document.querySelector('.search-icon');
                  icon?.classList.add('focus-icon');
                }}
                onBlur={() => {
                  const icon = document.querySelector('.search-icon');
                  icon?.classList.remove('focus-icon');
                }}
                size="small"
              />
              <Box sx={{ mx: 3, overflowY: "auto", maxHeight: "55vh", width: "100%", mt: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: "#444", fontFamily: "var(--font-source)"  }}>
                  Componentes existentes:
                </Typography>
                {searchedComponents.length === 0 ? (
                  <Typography color="text.secondary">No hay componentes disponibles.</Typography>
                ) : (
                  searchedComponents.map((c) => (
                    <Card
                      key={c._id}
                      variant="outlined"
                      onClick={() =>{ 
                        navigate(`/components/${c._id}`)
                        setSearchTerm("");
                        handleCloseChildModal();
                      }}
                      sx={{
                        m: "1em auto",
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        width: "90%",
                        '&:hover': {
                          backgroundColor: "var(--color-bg-secondary-hover)",
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="body1" fontFamily={"var(--font-source)"}><strong>{c.name}</strong></Typography>
                        <Typography variant="caption" color="text.secondary" fontFamily={"var(--font-source)"}>{c.type}</Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        fontFamily={"var(--font-source)"}
                        sx={{ ml: 2, bgcolor: "var(--color-bg-secondary)" }}
                        onClick={(event) => {
                          handleAddExistingComponentAsChild(c._id);
                          event.stopPropagation();
                        }}
                      >
                        +
                      </Button>
                    </Card>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        </Modal>

        {/* Modal para crear nuevo componente hijo */}
        <Modal open={isModalNewChildOpen} onClose={handleCloseNewChildModal}>
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
            margin: '0 auto',
            bgcolor: "transparent",
            backdropFilter: "blur(4px)",
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
              <Typography variant="h4" sx={{ color: 'var(--color-title-secondary)', mb: 3, textAlign: 'center', fontFamily: "var(--font-montserrat)" }}>
                Agregar Componente
              </Typography>
      
              <FormGroup sx={{ gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: "row"}}>
                  <TextField
                    label="Nombre"
                    variant="filled"
                    fullWidth
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    sx={{ bgcolor: 'var(--bg-inputs)' }}
                  />
                </Box>
      
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
                  <MenuItem value="activo" sx={{ fontFamily: "var(--font-source)" }}>Activo</MenuItem>
                  <MenuItem value="de baja" sx={{ fontFamily: "var(--font-source)" }}>De baja</MenuItem>
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
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgb(96, 96, 96)', fontFamily: "var(--font-source)" }}>
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
                      sx={{ borderColor: 'var(--color-bg-secondary)', backgroundColor: 'var(--color-bg-gradient)', color: 'var(--color-title-primary)', height: 'fit-content',
                        '&:hover': { borderColor: 'var(--color-bg-secondary-hover)', backgroundColor: 'var(--color-bg-secondary-hover)' },
                      }}
                    >
                      +
                    </Button>
                  </Box>
                </FormGroup>
                  
                <Box sx={{ display: "flex", mt: 5, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center"}}>
                  <Button 
                    onClick={handleCloseNewChildModal} 
                    sx={{ py: 1.5, borderRadius: 50, color: '#fff', fontFamily: "var(--font-source)" }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="contained" 
                    sx={{ py: 1.5, borderRadius: 50, backgroundColor: 'var(--color-bg-gradient)', fontFamily: "var(--font-source)", color: 'var(--color-title-primary)',
                      '&:hover': { backgroundColor: 'var(--color-bg-secondary-hover)' }, '&:disabled': { backgroundColor: '#fff', color: "rgb(65, 92, 117)" },
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
        <AddCharacteristicModal
          open={isCharModalOpen}
          onClose={handleCloseCharModal}
          title="Agregar Característica"
          onConfirm={handleAddNewSubCharacteristics}
          confirmText="Agregar"
          cancelText="Cancelar"
          confirmDisabled={
            !newSubName.trim() || !newSubDescription.trim() || loadingButtons
          }
          sxBox={{ transform: 'translate(-50%, -50%)' }}
          sxCancelBtn={{ color: 'var(--color-title-primary)' }}
          sxConfirmBtn={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
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
        </AddCharacteristicModal>
      </Box>   
    </Box>
  );
};

export default ComponentDetail;