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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import DateTimeParser from "../utils/DateTimeParser";
import LoadingCircle from "../components/LoadingCircle";

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

   const columns = useMemo(
    () => [
      {
        field: "user_id",
        headerName: "Usuario",
        flex: 1,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontFamily: "var(--font-source)" }}>
            {params.row.user_id?.username ?? "Desconocido"}
          </Typography>
        ),
      },
      {
        field: "action",
        headerName: "Acción",
        flex: 1,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontFamily: "var(--font-source)" }}>
            {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          </Typography>
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
          <Typography variant="body2" sx={{ fontFamily: "var(--font-source)" }}>
            {params.value || "—"}
          </Typography>
        ),
      },
      {
        field: "date",
        headerName: "Fecha",
        flex: 1,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontFamily: "var(--font-source)" }}>
            {DateTimeParser(params.value)}
          </Typography>
        ),
      },
    ],
    []
  );

  const handleRowClick = (params) => {
    setSelectedRecord(params.row);
    setDetailModalOpen(true);
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
      }}>
        <Typography variant="h5" sx={{
          fontFamily: "var(--font-montserrat)",
          color: "var(--color-title-primary)",
          my: 3,
          textAlign: "center",
        }}>
          Historial de Cambios
        </Typography>

        <TextField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar"
          size="small"
          sx={{
            width: "60%",
            maxWidth: 400,
            mb: 2,
            alignSelf: "center",
            backgroundColor: "var(--bg-inputs)",
            borderRadius: 1,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Avatar
                  src="/search-icon.png"
                  sx={{ width: 20, height: 20, filter: "invert(20%)" }}
                />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LoadingCircle />
          </Box>
        ) : (
          <Paper
            sx={{
              flex: 1,
              width: "90%",
              maxHeight: "80vh",
              alignSelf: "center",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              fontSize: "1.1rem",
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
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
                sorting: { sortModel: [{ field: "date", sort: "desc" }] },
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
          sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Paper sx={{ width: "40vw", height: "50vh", p: 3, position: "relative", borderRadius: 2 }}>
            <IconButton
              onClick={handleCloseDetail}
              sx={{ position: "absolute", top: 8, right: 8, color: "var(--color-text-base)" }}
            >
              <CloseIcon />
            </IconButton>
            {selectedRecord && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
                <Typography variant="body1">
                  <strong>Usuario:</strong> {selectedRecord.user_id?.username}
                </Typography>
                <Typography variant="body1">
                  <strong>Acción:</strong>{" "}
                  {selectedRecord.action.charAt(0).toUpperCase() + selectedRecord.action.slice(1)}
                </Typography>
                <Typography variant="body1">
                  <strong>Componente:</strong> {selectedRecord.component_name}
                </Typography>
                {selectedRecord.subcomponent_name && (
                  <Typography variant="body1">
                    <strong>Subcomponente:</strong> {selectedRecord.subcomponent_name}
                  </Typography>
                )}
                <Typography variant="body1">
                  <strong>Fecha:</strong> {DateTimeParser(selectedRecord.date)}
                </Typography>
              </Box>
            )}
          </Paper>
        </Modal>
      </Box>
    </Box>
  );
};

export default History;