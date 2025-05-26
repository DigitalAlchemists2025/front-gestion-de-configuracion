import { Box, Card, Paper, Typography, Modal, IconButton, CircularProgress, Alert } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

const History = () => {
    const [historyRecords, setHistoryRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const BACKEND_URL = process.env.REACT_APP_BACK_URL;
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const navigate = useNavigate();

    if (!token || role !== "0") window.location.replace("/login");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${BACKEND_URL}/histories`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                const sortedHistory = response.data.sort((a, b) => {
                    if (a.date < b.date) return 1;
                    if (a.date > b.date) return -1;
                    return 0;
                });
                setHistoryRecords(sortedHistory);
            } catch (error) {
                console.log("Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [token]);

    const handleOpenDetail = (record) => {
        setSelectedRecord(record);
        setDetailModalOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailModalOpen(false);
        setSelectedRecord(null);
    };

    return (
        <Box sx={{
            position: "fixed",
            top: 0,
            left: 0,
            display: "flex",
            width: "100vw",
            height: "100vh",
        }}>
            <SideBar/>
            <Box sx={{
                bgcolor: "var(--color-bg-secondary)",
                height: "100vh",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <Paper sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    width: "100%",
                    py: 2,
                    px: { xs: 2, md: 10 },
                    overflow: "auto",
                }}>
                    <Typography sx={{
                        color: "var(--color-title-primary)",
                        fontSize: "2rem",
                        py: { xs: 2, md: 6 },
                        textAlign: "center",
                    }}>
                        Historial de cambios
                    </Typography>

                    {isLoading ? (
                        <Box sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flex: 1,
                            minHeight: 200,
                        }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            fontSize: "1.2rem",
                            maxHeight: "70vh",
                            overflowY: "auto",
                            mt: 2,
                        }}>
                            {historyRecords.length > 0 ? (historyRecords.map((record, i) => (
                                <Card
                                    key={i}
                                    sx={{
                                        bgcolor: "var(--color-bg-secondary)",
                                        color: "var(--color-title-secondary)",
                                        p: 3,
                                        cursor: "pointer",
                                        boxShadow: 1,
                                        overflowY: "auto",
                                        "&:hover": {
                                            boxShadow: 4,
                                            backgroundColor: "var(--color-bg-primary-hover)",
                                        },
                                    }}
                                    onClick={() => handleOpenDetail(record)}
                                >
                                    <strong>{record.user_id?.username || "Usuario desconocido"}</strong> - {record.action}: <em>{record.component_id?.name || "Componente desconocido"}</em>
                                </Card>
                            ))) : (
                                <Typography color="text.secondary" fontSize="0.95rem"> No existen registros.</Typography>
                            )}
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* Modal para detalle */}
            <Modal
                open={detailModalOpen}
                onClose={handleCloseDetail}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                    bgcolor: "var(--color-blur-bg)",
                }}
            >
                <Paper sx={{
                    p: 4,
                    borderRadius: 3,
                    position: "relative",
                    boxShadow: 24,
                    width: "70vw",
                    height: "50vh",
                    overflowY: "auto",
                }}>
                    <IconButton
                        onClick={handleCloseDetail}
                        sx={{ position: "absolute", right: 8, top: 8 }}
                        size="small"
                    >
                        <CloseIcon/>
                    </IconButton>

                    {selectedRecord ? (
                        <Box sx={{ display: "flex", flexDirection: "row", py: 5 }}>
                            <Box sx={{ color: "var(--color-title-primary)", width: "50%", display: "flex", flexDirection: "column", gap: 5}}>
                                <Typography variant="h5" sx={{ my: 2 }}>
                                    <strong>Detalles de Configuración</strong>
                                </Typography>
                                <Typography variant="body1" fontSize={"1.1rem"}>
                                    <strong>Usuario:</strong> {selectedRecord.user_id?.username || "Desconocido"}
                                </Typography>
                                <Typography variant="body1" fontSize={"1.1rem"}>
                                    <strong>Acción:</strong> {selectedRecord.action}
                                </Typography>
                                <Typography variant="body1" fontSize={"1.1rem"}>
                                    <strong>Componente:</strong> {selectedRecord.component_id?.name || "Desconocido"}
                                </Typography>
                                <Typography variant="body1" fontSize={"1.1rem"}>
                                    <strong>Fecha:</strong>{" "}
                                    {selectedRecord.date
                                    ? new Date(selectedRecord.date).toLocaleString("es-CL")
                                    : "Sin fecha"}
                                </Typography>
                            </Box>    
                            <Box sx={{ width: "50%", color: "var(--color-title-primary)"}}>
                                <Typography variant="h5" sx={{ my: 2 }}>
                                    <strong>Componente actualizado:</strong>
                                </Typography>
                                <Box 
                                    sx={{ 
                                        border: "1px solid", 
                                        height: "80%", 
                                        display: "flex",  
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        p: 2,
                                    }} 
                                    onClick={() => {
                                        navigate(`/components/${selectedRecord.component_id?._id}`);
                                    }}
                                >
                                    <Typography variant="body1" fontSize={"1.1rem"}>
                                        <strong>Nombre:</strong> {selectedRecord.component_id?.name || "Desconocido"}
                                    </Typography>
                                    <Typography variant="body1" fontSize={"1.1rem"}>
                                        <strong>Tipo:</strong> {selectedRecord.component_id?.type}
                                    </Typography>
                                    <Typography variant="body1" fontSize={"1.1rem"}>
                                        <strong>Estado:</strong> {selectedRecord.component_id?.status || "Desconocido"}
                                    </Typography>
                                    <Alert variant="filled" severity="info" sx={{ color: "var(--color-title-secondary)", fontSize: "0.7rem"}} >
                                        Pulse el cuadro para ver más detalles
                                    </Alert>
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Typography>No hay datos.</Typography>
                    )}
                </Paper>
            </Modal>
        </Box>
    );
};

export default History;
