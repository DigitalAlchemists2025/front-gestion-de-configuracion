import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Modal,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  CircularProgress,
  Divider,
  List,
  ListItem,
  Chip,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import { getChangeDetails } from "../utils/HistoryParser";  
import DateTimeParser from "../utils/DateTimeParser";
import LoadingCircle from "../components/LoadingCircle";

const COLOR_MAP = {
  added:   { bg: "#e8f5e9", color: "#43a047" },
  edited:  { bg: "#fffde7", color: "#fbc02d" },
  deleted: { bg: "#ffebee", color: "#e53935" },
  associated: { bg: "#e3f2fd", color: "#1976d2" },
  disassociated: { bg: "#f3e5f5", color: "#8e24aa" },
};

const History = () => {
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACK_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [componentExists, setComponentExists] = useState(null);
  const [checkingComponent, setCheckingComponent] = useState(false);
  const [changeDetails, setChangeDetails] = useState([]);

  useEffect(() => {
    if (!token || role !== "0") navigate("/login");
  }, [token, role, navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${BACKEND_URL}/histories`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sortedHistory = [...data].sort((a, b) => {
          if (a.date < b.date) return 1;
          if (a.date > b.date) return -1;
          return 0;
        });
        setRecords(sortedHistory);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [BACKEND_URL, token]);

  useEffect(() => {
    if (!searchTerm) {
      setRecords(records);
    } else {
      const terms = searchTerm.toLowerCase().split(" ").filter(Boolean);
      setRecords(
        records.filter((r) => {
          const haystack = [
            r.username,
            r.action,
            r.component_name,
            r.subcomponent_name || "",
            r.date,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return terms.every((t) => haystack.includes(t));
        })
      );
    }
  }, [searchTerm, records]);

  useEffect(() => {
    if (selectedRecord) {
      setChangeDetails(getChangeDetails(selectedRecord));
    }
}, [selectedRecord]);

  const columns = useMemo(
    () => [
      {
        field: "user_id",
        headerName: "Usuario",
        flex: 1,
        renderCell: (params) => (
          params.row.user_id?.username ?? "Desconocido"
        ),
      },
      {
        field: "action",
        headerName: "Acción",
        flex: 1,
        renderCell: (params) => (
          params.value.charAt(0).toUpperCase() + params.value.slice(1)
        ),
      },
      {
        field: "component_name",
        headerName: "Componente",
        flex: 1,
      },
      {
        field: "subcomponent_name",
        headerName: "Subcomponente",
        flex: 1,
        renderCell: (params) => (
          params.value || "—"
        ),
      },
      {
        field: "date",
        headerName: "Fecha",
        flex: 1,
        renderCell: (params) => (
          DateTimeParser(params.value)
        ),
      },
    ],
    []
  );

  const handleRowClick = async (params) => {
    setSelectedRecord(params.row);
    setDetailModalOpen(true);
    setCheckingComponent(true);
    setComponentExists(null);
    getChangeDetails(params.row);
    try {
      const checkId = params.row.component_id?._id;
      if (!checkId) {
        setComponentExists(false);
        setCheckingComponent(false);
        return;
      }
      const response = await axios.get(`${BACKEND_URL}/components/${checkId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComponentExists(response.status === 200);
    } catch (error) {
      setComponentExists(false);
    }
    setCheckingComponent(false);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRecord(null);
  };

  async function checkComponent() {
    const checkId = selectedRecord.component_id._id;
    const checked = false;
    try {
      const response = await axios.get(`${BACKEND_URL}/components/${checkId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }) 
      if (response.status === 200) {checked = true;}
    } catch(error) {
    }
    return checked
  }

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
        <Typography variant="h4" sx={{
          fontFamily: "var(--font-montserrat)",
          color: "var(--color-title-primary)",
          my: 5,
          textAlign: "center",
        }}>
          Historial de Cambios
        </Typography>

        {loading ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LoadingCircle />
          </Box>
        ) : (
          <Paper
            sx={{
              flex: 1,
              width: "90%",
              maxHeight: "75vh",
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
              rows={records.filter((r) =>
                [r.user_id?.username, r.action, r.component_name, r.subcomponent_name]
                  .join(" ")
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )}
              columns={columns}
              getRowId={(row) => row._id}
              pageSizeOptions={[10, 25, 50, 1000]}
              onRowClick={handleRowClick}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
                sorting: { sortModel: [{ field: "date", sort: "desc" }] },
              }}
              /* onRowClick={handleRowClick} */
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
          open={detailModalOpen}
          onClose={handleCloseDetail}
          aria-labelledby="modal-history-detail-title"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            px: 2,
          }}
        >
          <Paper
            elevation={4}
            sx={{
              width: "100%",
              maxWidth: "25vw",
              maxHeight: "90vh",
              overflow: "auto",
              borderRadius: 4,
              transform: "translate(25%, 0%)",
              position: "relative",
              p: 0,
            }}
          >
            {/* Encabezado */}
            <Box sx={{ p: 3, borderBottom: "1px solid #ececec", bgcolor: "var(--color-bg-secondary)", borderRadius: "16px 16px 0 0", position: "relative" }}>
              <Typography id="modal-history-detail-title" variant="h5" sx={{ fontWeight: 700, color: "var(--color-title-secondary)", pr: 5 }}>
                {selectedRecord?.action || "Detalle"}
              </Typography>
              <IconButton
                onClick={handleCloseDetail}
                sx={{ position: "absolute", top: 18, right: 18, color: "var(--color-text-base)" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            {/* Datos generales */}
            {selectedRecord && (
              <Box sx={{ p: 3, pt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    <strong>Autor: </strong>{selectedRecord.user_id?.username}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  <b>Componente:</b> {selectedRecord.component_name}
                </Typography>
                {selectedRecord.subcomponent_name && (
                  <Typography variant="body2"><b>Subcomponente:</b> {selectedRecord.subcomponent_name}</Typography>
                )}
                <Typography variant="body2">
                  <b>Tipo:</b> {selectedRecord.component_type}
                </Typography>
                <Typography variant="body2">
                  <b>Fecha:</b> {DateTimeParser(selectedRecord.date)}
                </Typography>
                {/* Botón ir a componente */}
                {selectedRecord.component_id?._id && (
                  <Box sx={{ mt: 1, mb: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={checkingComponent || !componentExists}
                      onClick={() => navigate(`/components/${selectedRecord.component_id._id}`)}
                      sx={{ minWidth: 160 }}
                    >
                      {checkingComponent
                        ? <CircularProgress size={18} />
                        : componentExists
                          ? "Ir al componente"
                          : "No disponible"}
                    </Button>
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
                {/* Detalles de cambios */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Detalles del cambio:
                  </Typography>
                  {changeDetails.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No se registraron cambios detallados.
                    </Typography>
                  )}
                  {changeDetails.map((change, idx) => (
                    <Box key={idx} sx={{ mb: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: COLOR_MAP[change.type]?.color || "#555" }}>
                        {change.label}
                      </Typography>
                      <List dense sx={{ pl: 2 }}>
                        {change.items.map((item, i) => (
                          <ListItem key={i} disablePadding>
                            <Chip
                              label={item}
                              size="small"
                              sx={{
                                mr: 1,
                                mb: 0.5,
                                bgcolor: COLOR_MAP[change.type]?.bg || "#f5f5f5",
                                color: COLOR_MAP[change.type]?.color || "#555",
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Modal>
      </Box>
    </Box>
  );
};

export default History;