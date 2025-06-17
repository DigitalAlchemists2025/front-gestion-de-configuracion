import React, { useEffect, useState, useMemo } from "react";
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
  Menu,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import AddLinkIcon from '@mui/icons-material/AddLink';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import DateTimeParser from "../utils/DateTimeParser";

const HistoryTableView = () => {
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACK_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
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
        const sorted = data
          .map(r => ({
            ...r,
            date: DateTimeParser(r.date),
            username: r.user_id?.username || 'Desconocido',
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecords(sorted);
        setFiltered(sorted);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [BACKEND_URL, token]);

  useEffect(() => {
    if (!searchTerm) return setFiltered(records);
    const terms = searchTerm.toLowerCase().split(' ').filter(t => t);
    setFiltered(
      records.filter(r => {
        const haystack = [
          r.username,
          r.action,
          r.component_name,
          r.subcomponent_name || '',
          r.date,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return terms.every(t => haystack.includes(t));
      })
    );
  }, [searchTerm, records]);

  const columns = useMemo(() => [
    { field: 'username', headerName: 'Usuario', flex: 1 },
    { field: 'action', headerName: 'Acción', flex: 1 },
    { field: 'component_name', headerName: 'Componente', flex: 1 },
    { field: 'subcomponent_name', headerName: 'Subcomponente', flex: 1 },
    { field: 'date', headerName: 'Fecha', flex: 1 },
  ], []);

  const handleRowClick = (params) => {
    setSelectedRecord(params.row);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRecord(null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, color: 'var(--color-text-base)' }}>
      <SideBar />
      <Box sx={{ flex: 1, p: 2, bgcolor: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontFamily: 'var(--font-montserrat)', color: 'var(--color-title-primary)', my: 3 }}>
          Historial de Cambios
        </Typography>
        <TextField
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar"
          size="small"
          sx={{
            width: '60%',
            maxWidth: 400,
            mb: 2,
            backgroundColor: 'var(--bg-inputs)',
            borderRadius: 1,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Avatar src="/search-icon.png" sx={{ width: 20, height: 20, filter: 'invert(20%)' }} />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box sx={{ pt: 10 }}><CircularProgress /></Box>
        ) : (
          <Paper sx={{ width: '80%', borderRadius: 2, overflow: 'hidden', flex: 1 }}>
            <DataGrid
              rows={filtered}
              columns={columns}
              getRowId={row => row._id}
              pageSizeOptions={[5, 10, 15]}
              onRowClick={handleRowClick}
              sx={{
                border: 'none',
                '& .MuiDataGrid-root': { background: 'var(--color-bg-secondary)' },
                '& .MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: 'var(--color-dg-cell-bg-odd)' },
                '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: 'var(--color-dg-cell-bg-even)' },
                '& .MuiDataGrid-columnHeaders': { backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-title-secondary)' },
                '& .MuiDataGrid-cell': { borderBottom: 'none', color: 'var(--color-text-base)' },
                '& .MuiDataGrid-footerContainer': { backgroundColor: 'var(--color-bg-secondary)', borderTop: 'none' },
                '& .MuiDataGrid-pagination': { color: 'var(--color-pagination)' },
                '& .MuiDataGrid-root, .MuiDataGrid-cell, .MuiDataGrid-columnHeader': { fontFamily: 'var(--font-source)' },
                borderRadius: '16px',
              }}
            />
          </Paper>
        )}

        <Modal open={detailModalOpen} onClose={handleCloseDetail} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper sx={{ width: '40vw', height: '50vh', p: 3, position: 'relative', borderRadius: 2 }}>
            <IconButton onClick={handleCloseDetail} sx={{ position: 'absolute', top: 8, right: 8, color: 'var(--color-text-base)' }}>
              <CloseIcon />
            </IconButton>
            {selectedRecord && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2, color: 'var(--color-text-base)' }}>
                <Typography variant="body1"><strong>Usuario:</strong> {selectedRecord.username}</Typography>
                <Typography variant="body1"><strong>Acción:</strong> {selectedRecord.action}</Typography>
                <Typography variant="body1"><strong>Componente:</strong> {selectedRecord.component_name}</Typography>
                {selectedRecord.subcomponent_name && <Typography variant="body1"><strong>Subcomponente:</strong> {selectedRecord.subcomponent_name}</Typography>}
                <Typography variant="body1"><strong>Fecha:</strong> {selectedRecord.date}</Typography>
              </Box>
            )}
          </Paper>
        </Modal>
      </Box>
    </Box>
  );
};

export default HistoryTableView;
