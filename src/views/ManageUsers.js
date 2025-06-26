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
    const [allUsers, setAllUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [userModalOpen, setUserModalOpen] = useState(false);

    const [editUser, setEditUser] = useState({ username: "", email: "", role: "usuario" });
    const [saving, setSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); // Cuando no edita, crea

    const navigate = useNavigate();
    const BACKEND_URL = process.env.REACT_APP_BACK_URL;
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    useEffect(() => {
        if (!token || role !== "0") navigate("/login");
    }, [token, role, navigate]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BACKEND_URL}/users`, {
                    headers: { Authorization: `Bearer ${token}` },       
                })
                console.log(response.data);
                setUsers(response.data);
                setAllUsers(response.data);
            } catch(err) {
                console.log(err)
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token])
    
    useEffect(() => {
        if (!searchTerm || searchTerm.trim() === "") {
            setUsers(allUsers);
        } else {
            const terms = searchTerm.toLowerCase().split(" ").filter(Boolean);
            setRecords(
                records.filter((u) => {
                    const haystack = [u.username, u.email]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();
                    return terms.every((t) => haystack.includes(t));
              })
            );
        }
    }, [searchTerm, users]);
    
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
      setEditUser({ username: "", email: "", role: "usuario" });
      setIsEditMode(false);
      setUserModalOpen(true);
    };

    
    const handleRowClick = (params) => {
      setSelectedUser(params.row);
      setEditUser({ 
          username: params.row.username || "",
          email: params.row.email || "",
          role: params.row.role || "usuario"
      });
      setIsEditMode(true);
      setUserModalOpen(true);
    };
    
      const handleCloseUser = () => {
        setUserModalOpen(false);
        setSelectedUser(null);
        setEditUser({ username: "", email: "", role: "usuario" });
        setSaving(false);
      };

      const handleEditChange = (field, value) => {
          setEditUser((prev) => ({ ...prev, [field]: value }));
      };
    
      const handleSaveUser = async () => {
        setSaving(true);
        try {
          if (isEditMode && selectedUser) {
            await axios.put(
              `${BACKEND_URL}/users/${selectedUser._id}`,
              editUser,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } else {
            await axios.post(
              `${BACKEND_URL}/users`,
              editUser,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
          const response = await axios.get(`${BACKEND_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsers(response.data);
          setAllUsers(response.data);
          setUserModalOpen(false);
          setSelectedUser(null);
        } catch (err) {
          alert("Error guardando usuario");
        } finally {
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
              <Button variant="outlined" sx={{ height: "2rem" }} onClick={handleAddUser}>
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
                  rows={users.filter((u) =>
                    [u.username, u.email]
                      .join(" ")
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )}
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
                        <option value="usuario">Usuario</option>
                        <option value="admin">Administrador</option>
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
                      disabled={saving || !editUser.username || !editUser.email}
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