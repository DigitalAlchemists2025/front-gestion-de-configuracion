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
                console.log("Historial de cambios:", sortedHistory);
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
    
    const getActionDescription = (action) => {
        switch (action.toLowerCase().trim()) {
            case "crear componente":
                return (
                    <Typography variant="body1" fontSize={"1.1rem"} color="success" fontFamily={"var(--font-source)"}>
                        <strong> Se creó el componente:</strong>
                    </Typography>
                );
            case "editar componente":
                return (
                    <Typography variant="body1" fontSize={"1.1rem"} color="warning" fontFamily={"var(--font-source)"}>
                        <strong>Componente actualizado:</strong>
                    </Typography>
                );
            case "eliminar componente":
                return (
                    <Typography variant="body1" fontSize={"1.1rem"} color="error" fontFamily={"var(--font-source)"}>
                        <strong>Componente eliminado:</strong>
                    </Typography>
                );
            case "asociar subcomponente":
                return (
                    <Typography variant="body1" fontSize={"1.1rem"} color="info" fontFamily={"var(--font-source)"}>
                        <strong>Se asoció el componente:</strong>
                    </Typography>
                );
            case "desasociar subcomponente":
                return (
                    <Typography variant="body1" fontSize={"1.1rem"} color="primary" fontFamily={"var(--font-source)"}>
                        <strong>Se desasoció el componente:</strong> 
                    </Typography>
                );
            default:
                return (
                    <Typography variant="body1" fontSize={"1.1rem"} fontFamily={"var(--font-source)"}>
                        <strong>Descripción:</strong> Acción desconocida.
                    </Typography>
                );
        }
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
                        fontFamily: "var(--font-montserrat)",
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
                            gap: 3,
                            fontSize: "1.1rem",
                            height: "80%",
                            overflowY: "auto",
                        }}>
                            {historyRecords.length > 0 ? (historyRecords.map((record, i) => (
                                <Card
                                    key={i}
                                    sx={{
                                        bgcolor: "var(--color-bg-secondary)",
                                        color: "var(--color-title-secondary)",
                                        fontFamily: "var(--font-source)",
                                        width: "90%",
                                        height: "80%",
                                        p: '2rem',
                                        cursor: "pointer",
                                        boxShadow: 1,
                                        overflowY: "hidden",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        "&:hover": {
                                            boxShadow: 4,
                                            backgroundColor: "var(--color-bg-primary-hover)",
                                        },
                                    }}
                                    onClick={() => handleOpenDetail(record)}
                                >
                                    {`${record.user_id?.username} - ${record.action}: ${record.component_name}`}
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
                    bgcolor: "transparent",
                    backdropFilter: "blur(4px)",
                }}
            >
                <Paper sx={{
                    p: 4,
                    borderRadius: 3,
                    position: "relative",
                    boxShadow: 24,
                    width: "50vw",
                    height: "50vh",
                    overflowY: "auto",
                }}>
                    <IconButton
                        onClick={handleCloseDetail}
                        sx={{ position: "absolute", right: 10, top: 10, color: "var(--color-title-primary)" }}
                        size="small"
                    >
                        <CloseIcon/>
                    </IconButton>

                    {selectedRecord ? (
                        <Box sx={{ display: "flex", flexDirection: "row", py: 5 }}>
                            <Box sx={{ color: "var(--color-title-primary)", width: "50%", display: "flex", flexDirection: "column", gap: 5}}>
                                <Typography variant="h5" sx={{ fontFamily: "var(--font-montserrat)" }}>
                                    <strong>Detalles de Configuración</strong>
                                </Typography>
                                <Typography variant="body1" fontSize={"1.1rem"} fontFamily={"var(--font-source)"}>
                                    <strong>Usuario:</strong> {selectedRecord.user_id?.username || "Desconocido"}
                                </Typography>
                                <Typography variant="body1" fontSize={"1.1rem"} fontFamily={"var(--font-source)"}>
                                    <strong>Acción:</strong> {selectedRecord.action}
                                </Typography>
                                <Typography variant="body1" fontSize={"1.1rem"} fontFamily={"var(--font-source)"}>
                                    <strong>Componente:</strong> {selectedRecord.component_name || "Desconocido"}
                                </Typography>
                                <Typography variant="body1" fontSize={"1.1rem"} fontFamily={"var(--font-source)"}>
                                    <strong>Fecha:</strong>{" "}
                                    {selectedRecord.date
                                    ? new Date(selectedRecord.date).toLocaleString("es-CL")
                                    : "Sin fecha"}
                                </Typography>
                            </Box>    
                            <Box sx={{ width: "50%", color: "var(--color-title-primary) ", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                { selectedRecord.component_id && (<Alert variant="filled" severity="info" sx={{ color: "var(--color-title-secondary)", fontSize: "0.7rem", position: "relative", mb: 5}} >
                                    Pulse el cuadro para ver más detalles
                                </Alert>)}
                                {selectedRecord.action && getActionDescription(selectedRecord.action)}
                                {selectedRecord.subcomponent_id && (
                                    <Box sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>    
                                        <Box 
                                            sx={{ 
                                                border: "1px solid", 
                                                borderRadius: 5,
                                                height: "auto", 
                                                display: "flex",  
                                                flexDirection: "column",
                                                justifyContent: "flex-start",
                                                p: 2,
                                                my: 2,
                                            }} 
                                            onClick={() => {
                                                navigate(`/components/${selectedRecord.subcomponent_id}`);
                                            }}
                                        >
                                            <Typography variant="body1" fontSize={"1.1rem"}>
                                                <strong>Nombre:</strong> {selectedRecord.subcomponent_name || "Desconocido"}
                                            </Typography>
                                            <Typography variant="body1" fontSize={"1.1rem"}>
                                                <strong>Tipo:</strong> {selectedRecord.subcomponent_type}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" color="info" fontSize={"1.1rem"} fontFamily={"var(--font-source)"}>
                                            {selectedRecord.action.toLowerCase() == ("asociar subcomponente") ? "A:" : "De:"}
                                        </Typography>
                                    </Box>
                                )}
                                {selectedRecord.details && (
                                    <Box sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>    
                                        <Box 
                                            sx={{ 
                                                border: "1px solid", 
                                                borderRadius: 5,
                                                height: "auto", 
                                                display: "flex",  
                                                flexDirection: "column",
                                                justifyContent: "flex-start",
                                                p: 2,
                                                my: 2,
                                            }} 
                                            onClick={() => {
                                                navigate(`/components/${selectedRecord.component_id?._id}`);
                                            }}
                                        >
                                            <Typography variant="body1" fontSize={"1.1rem"}>
                                                <strong>Nombre:</strong> {selectedRecord.details.name.nombre_original || "Desconocido"}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" color="warning" fontSize={"1.1rem"}>
                                            <strong>A:</strong>
                                        </Typography>
                                    </Box>
                                )}
                                <Box 
                                    sx={{ 
                                        border: "1px solid", 
                                        borderRadius: 5,
                                        height: "auto", 
                                        display: "flex",  
                                        flexDirection: "column",
                                        justifyContent: "flex-start",
                                        p: 2,
                                        mt: 2,
                                    }} 
                                    onClick={() => {
                                        navigate(`/components/${selectedRecord.component_id?._id}`);
                                    }}
                                >
                                    <Typography variant="body1" fontSize={"1.1rem"}>
                                        <strong>Nombre:</strong> {selectedRecord.component_name || "Desconocido"}
                                    </Typography>
                                    <Typography variant="body1" fontSize={"1.1rem"}>
                                        <strong>Tipo:</strong> {selectedRecord.component_type}
                                    </Typography>
                                    {selectedRecord.component_id?.status && (<Typography variant="body1" fontSize={"1.1rem"}>
                                        <strong>Estado:</strong> {selectedRecord.component_id?.status || "Desconocido"}
                                    </Typography>)}
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
