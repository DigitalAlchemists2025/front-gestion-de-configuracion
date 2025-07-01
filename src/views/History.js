import { useEffect, useState, useMemo } from "react";
import { Box, Paper, Typography, Modal, IconButton, CircularProgress, Divider, List, ListItem, Button, Input, InputAdornment, Avatar } from "@mui/material";
import { DataGrid, GridCloseIcon } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import { getChangeDetails } from "../utils/HistoryParser";  
import DateTimeParser from "../utils/DateTimeParser";
import LoadingCircle from "../components/LoadingCircle";

/* Coloreado de los distintos cambios al abrir el detalle de historial */
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

  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [componentExists, setComponentExists] = useState(null);
  const [checkingComponent, setCheckingComponent] = useState(false);
  const [changeDetails, setChangeDetails] = useState([]);

  if (!token) navigate("/login");

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
        setAllRecords(sortedHistory);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [BACKEND_URL, token]);

  useEffect(() => {
    if (selectedRecord) {
      const detail = getChangeDetails(selectedRecord);
      setChangeDetails(detail);
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

  const normalize = str =>
    (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filterHistoryRecords = (value, list = []) => {
    const terms = value
      .toLowerCase()
      .split(" ")
      .filter(t => t.trim() !== "")
      .map(normalize);

    return list.filter(r => {
      const haystack = [
        r.user_id?.username,
        r.action,
        r.component_name,
        r.component_type,
        r.subcomponent_name,
        r.subcomponent_type
      ]
        .filter(Boolean)
        .map(normalize)
        .join(" ");

      return terms.every(term => haystack.includes(term));
    });
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setRecords(allRecords);
    } else {
      setRecords(filterHistoryRecords(value, allRecords));
    }
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRecord(null);
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
        <Typography variant="h4" sx={{
          fontFamily: "var(--font-montserrat)",
          color: "var(--color-title-primary)",
          my: 5,
          textAlign: "center",
        }}>
          Historial de Cambios
        </Typography>

        {/* Barra de Búsqueda */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 5,
            mb: 4,
          }}
        >
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
              width: '100%',
              maxWidth: '30rem',
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
              rows={records}
              columns={columns}
              getRowId={(row) => row._id}
              pageSizeOptions={[10, 25, 50, 1000]}
              onRowClick={handleRowClick}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
                sorting: { sortModel: [{ field: "date", sort: "desc" }] },
              }}
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
            <Box sx={{ p: 3, borderBottom: "1px solid #ececec", bgcolor: "var(--color-bg-secondary)", borderRadius: "16px 16px 0 0", position: "relative" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "var(--color-title-secondary)", pr: 5 }}>
                {selectedRecord?.action || "Detalle"}
              </Typography>
              <IconButton
                onClick={handleCloseDetail}
                sx={{ position: "absolute", top: 18, right: 18, color: "var(--color-title-secondary)" }}
              >
                <CloseIcon/>
              </IconButton>
            </Box>
            {/* Datos del histórico */}
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
                {/* Detalles de cambios con ayuda de parser */}
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
                      <Typography variant="body2" sx={{ fontWeight: 500, color: COLOR_MAP[change.type]?.color || "#555", mb: 1 }}>
                        {change.label}
                      </Typography>
                      <List dense>
                          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start", gap: 1 }}>
                            {change.items.map((item, i) => (
                              <ListItem disablePadding key={i}>
                                <Paper
                                  elevation={1}
                                  sx={{
                                    display: 'inline-block',
                                    mb: 1,
                                    px: 2,
                                    py: 0.5,
                                    bgcolor: COLOR_MAP[change.type]?.bg || "#f5f5f5",
                                    color: COLOR_MAP[change.type]?.color || "#555",
                                    borderRadius: 2,
                                    fontFamily: "var(--font-source)",
                                    maxWidth: 260,
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {item}
                                </Paper>
                              </ListItem>
                            ))}
                          </Box>
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