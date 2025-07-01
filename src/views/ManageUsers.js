import { Box, Button, IconButton, Modal, Paper, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import LoadingCircle from "../components/LoadingCircle";

const ManageUsers = () => {
  const [loading, setLoading] = useState(false);
  const [loadingButtons, setLoadingButtons] = useState(false);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

  const [onChangePassword, setOnChangePassword] = useState(false)

  const [editUser, setEditUser] = useState({ username: "", email: "", password: "", confirmPassword: "", role: "usuario" });
  const [errors, setErrors] = useState({});  const [saving, setSaving] = useState(false);
  const passwordRegex = /^(?=.*\d).{6,}$/;
  const [isEditMode, setIsEditMode] = useState(false); // Cuando no edita, crea
  const allRoles = ["usuario", "administrador"];
  const roleOptions = useMemo(() => {
    if (!editUser.role) return allRoles;
    return [editUser.role, ...allRoles.filter(r => r !== editUser.role)];
  }, [editUser.role]);

  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACK_URL;
  const token = localStorage.getItem("token");
  
  if (!token) navigate("/login");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },       
        })
        setUsers(response.data);
      } catch(err) {
        console.error(err)
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token])
    
  const columns = useMemo(
    () => [
      {
        field: "username",
        headerName: "Usuario",
        flex: 1,
        renderCell: (params) => (
          params.value.charAt(0).toUpperCase() + params.value.slice(1)
        ),
      },
      {
        field: "email",
        headerName: "Correo Electrónico",
        flex: 1,
      },
      {
        field: "role",
        headerName: "Rol",
        flex: 1,
        renderCell: (params) => (
          params.value || "—"
        ),
      },
    ],
    []
  );

  const handleAddUser = () => {
    setEditUser({ username: "", email: "", password: "", confirmPassword: "", role: "usuario" });
    setIsEditMode(false);
    setOnChangePassword(false);
    setErrors({});
    setUserModalOpen(true);
  };
  
  const handleRowClick = (params) => {
    setSelectedUser(params.row);
    setEditUser({ 
      username: params.row.username || "",
      email: params.row.email || "",
      password: params.row.password || "",
      confirmPassword: "",
      role: params.row.role || "",
    });
    setIsEditMode(true);
    setOnChangePassword(false);
    setErrors({});
    setUserModalOpen(true);
  };
  
  const handleCloseUser = () => {
    setUserModalOpen(false);
    setSelectedUser(null);
    setEditUser({ username: "", email: "", password: "", role: "usuario" });
    setSaving(false);
  };

  const handleEditChange = (field, value) => {
    setEditUser((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const hasUserChanged = () => {
    if (!selectedUser) return true; // En modo creación, sí hay cambios
    if (editUser.username.trim() !== (selectedUser.username || '').trim()) return true;
    if (editUser.email.trim() !== (selectedUser.email || '').trim()) return true;
    if (editUser.role !== (selectedUser.role || '')) return true;
    if (onChangePassword && editUser.password.trim() !== '') return true;

    return false;
  };

  // Validación de errores en inputs
  const validateFields = () => {
    const newErrors = {};
    if (!editUser.username.trim()) newErrors.username = "El nombre de usuario es obligatorio.";
    if (!editUser.email.trim()) newErrors.email = "El correo es obligatorio.";
    if ((!isEditMode || onChangePassword)) {
      if (!editUser.password || !passwordRegex.test(editUser.password)) {
        newErrors.password = "Debe tener al menos 6 caracteres y un número.";
      }
      if (editUser.password !== editUser.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden.";
      }
      if (!editUser.confirmPassword) {
        newErrors.confirmPassword = "Confirma tu contraseña.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
      
  const handleSaveUser = async () => {
    setSaving(true);
    setLoadingButtons(true);

    if (!hasUserChanged()) {
      alert("No hay cambios para guardar.");
      setSaving(false);
      setLoadingButtons(false);
      return;
    }
    if (!validateFields()) {
      setSaving(false);
      setLoadingButtons(false);
      return;
    }
    if (!editUser.username.trim()) {
      alert("El nombre de usuario es obligatorio.");
      setSaving(false);
      setLoadingButtons(false);
      return;
    }
    if (!editUser.email.trim()) {
      alert("El correo es obligatorio.");
      setSaving(false);
      setLoadingButtons(false);
      return;
    }
    if (!["usuario", "administrador"].includes(editUser.role)) {
      alert("Rol inválido.");
      setSaving(false);
      setLoadingButtons(false);
      return;
    }

    try {
      const userPayload = {
        username: editUser.username.trim(),
        email: editUser.email.trim(),
        role: editUser.role,
      };

      if (onChangePassword && editUser.password.trim() !== "") {
        userPayload.password = editUser.password.trim();
      }

      if (isEditMode && selectedUser) {
        await axios.put(
          `${BACKEND_URL}/users/${selectedUser._id}`,
          userPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch((err) => console.error("Error actualizando: ", err));
        alert(`Usuario ${userPayload.username} editado correctamente`);
      } else {
        if (!userPayload.password) {
          alert("Debe ingresar una contraseña para crear un usuario.");
          setSaving(false);
          setLoadingButtons(false);
          return;
        }
        await axios.post(
          `${BACKEND_URL}/users`,
          userPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(`Usuario ${userPayload.username} creado correctamente`);
      }
      const response = await axios.get(`${BACKEND_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setOnChangePassword(false);
      setUserModalOpen(false);
      setSelectedUser(null);
      setEditUser({ username: "", email: "", password: "", confirmPassword: "", role: "usuario" });
    } catch (err) {
      alert("Error guardando usuario:", err);
      console.error(err);
    } finally {
      setLoadingButtons(false);
      setSaving(false);
    }
  };

      return (
        <Box sx={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          color: "var(--color-text-base)",
        }}>
          <SideBar />
          <Box sx={{
            flex: 1,
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            zIndex: 1,
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mx: 10 }}>
              <Typography variant="h4" sx={{
                fontFamily: "var(--font-montserrat)",
                color: "var(--color-title-primary)",
                my: 5,
                textAlign: "center",
              }}>
                Usuarios encontrados:
              </Typography>
              <Button variant="outlined" sx={{ height: "2rem" }} onClick={handleAddUser} disabled={loadingButtons}>
                Agregar usuario
              </Button>
            </Box>
    
            {loading ? (
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LoadingCircle />
              </Box>
            ) : (
              <Paper
                sx={{
                  flex: 1,
                  width: "90%",
                  maxHeight: "70vh",
                  alignSelf: "center",
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  fontSize: "1rem",
                }}
              >
                <DataGrid
                  rows={users}
                  columns={columns}
                  getRowId={(row) => row._id}
                  pageSizeOptions={[5, 10, 20]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 5, page: 0 } },
                    sorting: { sortModel: [{ field: "username", sort: "asc" }] },
                  }}
                  onRowClick={handleRowClick}
                  sx={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '0 0 16px 16px',
                    fontFamily: 'var(--font-source)',
                    fontSize: '1rem',
                    '& .MuiDataGrid-columnHeader': {
                      backgroundColor: 'var(--color-bg-secondary)',
                      color: '#ffffff',
                      borderBottom: 'none',
                      fontSize: '1.1rem',
                    },
                    '& .MuiDataGrid-columnSeparator': {
                      color: 'rgba(255,255,255,0.2)',
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottom: 'none',
                      backgroundColor: 'var(--color-dg-cell-bg)',
                      color: 'var(--color-datagrid-cell-text)',
                    },
                    '& .MuiDataGrid-row:nth-of-type(odd) .MuiDataGrid-cell': {
                      backgroundColor: 'var(--color-dg-cell-bg-odd)',
                      fontSize: "1.1rem",
                    },
                    '& .MuiDataGrid-row:nth-of-type(even) .MuiDataGrid-cell': {
                      backgroundColor: 'var(--color-dg-cell-bg-even)',
                      fontSize: "1.1rem",
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: 'rgba(25,118,210,0.08)',
                      cursor: 'pointer',
                    },
                    '& .MuiDataGrid-footerContainer': {
                      backgroundColor: '#e3f2fd',
                      borderTop: 'none',
                    },
                    '[class*="MuiTablePagination"]': {
                      color: 'var(--color-pagination)',
                    },
                    '.MuiDataGrid-cell:focus, .MuiDataGrid-columnHeader:focus, .MuiDataGrid-columnHeader:focus-within': {
                        outline: 'none',
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
            )}
    
            {/* Modal detalle */}
            <Modal
                open={userModalOpen}
                onClose={handleCloseUser}
                sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Paper
                  sx={{
                    width: { xs: "94vw", sm: "380px" },
                    maxWidth: "98vw",
                    p: 4,
                    borderRadius: 3,
                    bgcolor: "var(--color-bg-gradient)",
                    position: "relative",
                    fontFamily: "var(--font-source)",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
                  }}
                >
                  <IconButton
                    aria-label="Cerrar"
                    onClick={handleCloseUser}
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      color: "var(--color-title-primary)",
                      ":hover": { bgcolor: "var(--color-celeste-focus)" }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>

                  <Typography
                    variant="h6"
                    sx={{
                      color: "var(--color-title-primary)",
                      fontWeight: 700,
                      fontFamily: "var(--font-montserrat)",
                      mb: 3,
                      mt: 1,
                      textAlign: "left"
                    }}
                  >
                    {isEditMode ? "Editar usuario" : "Agregar usuario"}
                  </Typography>

                  <Box
                    component="form"
                    autoComplete="off"
                    sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}
                  >
                    <input style={{ display: 'none' }} autoComplete="username" />
                    <Box>
                      <Typography variant="body2" sx={{ color: "var(--color-title-primary)", fontWeight: 600, mb: 0.5, fontFamily: "var(--font-montserrat)" }}>
                        Usuario
                      </Typography>
                      <input
                        type="text"
                        value={editUser.username}
                        onChange={e => handleEditChange("username", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "10px",
                          border: "1px solid #e0e0e0",
                          background: "var(--bg-inputs)",
                          fontFamily: "var(--font-source)",
                          fontSize: "1rem"
                        }}
                        autoComplete="off"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: "var(--color-title-primary)", fontWeight: 600, mb: 0.5, fontFamily: "var(--font-montserrat)" }}>
                        Correo
                      </Typography>
                      <input
                        type="email"
                        value={editUser.email}
                        onChange={e => handleEditChange("email", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "10px",
                          border: "1px solid #e0e0e0",
                          background: "var(--bg-inputs)",
                          fontFamily: "var(--font-source)",
                          fontSize: "1rem"
                        }}
                        autoComplete="off"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: "var(--color-title-primary)", fontWeight: 600, mb: 0.5, fontFamily: "var(--font-montserrat)" }}>
                        Contraseña
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "space-between"}}>
                        <input
                          type="password"
                          value={editUser.password}
                          onChange={e => handleEditChange("password", e.target.value)}
                          disabled={isEditMode && !onChangePassword}
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "10px",
                            border: "1px solid #e0e0e0",
                            background: "var(--bg-inputs)",
                            fontFamily: "var(--font-source)",
                            fontSize: "1rem"
                          }}
                          autoComplete="off"
                          placeholder={isEditMode && onChangePassword ? "Nueva contraseña" : "Contraseña"}
                        />
                        {/* 
                          La contraseña solo se cambiará si se selecciona este botón.
                          Al intentar cambiarla se borrará la actual contraseña para crear una nueva.
                        */}
                        {isEditMode && (
                          <Button sx={{ fontSize: "0.5em" }} onClick={() => {
                            setEditUser(prev => ({ ...prev, password: "", confirmPassword: "" }));
                            setOnChangePassword(true);
                          }}>
                            Cambiar Contraseña
                          </Button>
                        )}
                      </Box>
                      {errors.password && <Typography color="error" sx={{ fontSize: "0.9em" }}>{errors.password}</Typography>}
                    </Box>
                    {(!isEditMode || onChangePassword) && (
                      <Box>
                        <Typography variant="body2" sx={{ color: "var(--color-title-primary)", fontWeight: 600, mb: 0.5, fontFamily: "var(--font-montserrat)" }}>
                          Confirmar Contraseña
                        </Typography>
                        <input
                          type="password"
                          value={editUser.confirmPassword}
                          onChange={e => handleEditChange("confirmPassword", e.target.value)}
                          disabled={isEditMode && !onChangePassword}
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "10px",
                            border: "1px solid #e0e0e0",
                            background: "var(--bg-inputs)",
                            fontFamily: "var(--font-source)",
                            fontSize: "1rem"
                          }}
                          autoComplete="off"
                          placeholder="Repite la contraseña"
                        />
                        {errors.confirmPassword && <Typography color="error" sx={{ fontSize: "0.9em" }}>{errors.confirmPassword}</Typography>}
                      </Box>
                    )}
                    <Box>
                      <Typography variant="body2" sx={{ color: "var(--color-title-primary)", fontWeight: 600, mb: 0.5, fontFamily: "var(--font-montserrat)" }}>
                        Rol
                      </Typography>
                      <select
                        value={editUser.role}
                        onChange={e => handleEditChange("role", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "10px",
                          border: "1px solid #e0e0e0",
                          background: "var(--bg-inputs)",
                          fontFamily: "var(--font-source)",
                          fontSize: "1rem"
                        }}
                      >
                        {roleOptions.map(role => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={handleCloseUser}
                      sx={{
                        fontFamily: "var(--font-montserrat)",
                        color: "var(--color-title-primary)",
                        borderColor: "var(--color-title-primary)",
                        ":hover": { bgcolor: "var(--color-celeste-focus)" }
                      }}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSaveUser}
                      sx={{
                        fontFamily: "var(--font-montserrat)",
                        bgcolor: "var(--login-button-bg)",
                        ":hover": { bgcolor: "var(--login-button-hover)" }
                      }}
                      /* El botón estará deshabilitado para cualquier itento de actualización inválido */
                      disabled={saving || !editUser.username || !editUser.email || loadingButtons || (isEditMode && !hasUserChanged())}
                    >
                      {saving ? (isEditMode ? "Guardando..." : "Agregando...") : (isEditMode ? "Guardar" : "Agregar")}
                    </Button>
                  </Box>
                </Paper>
              </Modal>
            </Box>
        </Box>
    );
}

export default ManageUsers;