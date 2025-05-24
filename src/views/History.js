import { Box, Card, Paper, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";

const History = () => {

    const [movements, setMovements] = useState([]);

    const BACKEND_URL = process.env.REACT_APP_BACK_URL;
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('role');
    const [loading, setLoading] = useState(false);

    if (!token || rol !== '0') window.location.replace("/login");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BACKEND_URL}/histories`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                })
                console.log(response.data)
                const historySorted = response.data.sort((a,b) => {
                    if (a.date < b.date) return 1;
                    if (a.date > b.date) return -1;
                    return 0;
                });
                setMovements(historySorted);
            } catch(error) {
                console.log("Error:", error)
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [token]);

    return (
        <Box sx={{
            position: "fixed",
            top: 0,
            left: 0,
            bgcolor: "var(--color-bg-secondary)",
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <Paper sx={{
                height: "70vh",
                width: "80vw",
                display: "flex",
                flexDirection: "column",
                py: 2,
                px: 5,
            }}>
                <Typography sx={{ 
                    color: "var(--color-title-primary)",
                    fontSize: "2rem",
                    py: 2,
                }}>
                    Historial de cambios
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, flexDirection: "column" }}>
                    {console.log(movements)}
                    {movements?.length > 0 ? movements.map((mov, i) => (
                        <Card
                            key={i}
                            label={mov.action}
                            sx={{ bgcolor: "var(--color-bg-secondary)", color: "var(--color-title-secondary)", p: 3 }}
                            size="small"
                        >
                            {mov.action} {mov.component_id?.name} {mov.user_id?.username}
                        </Card>
                    )) : <Typography color="text.secondary" fontSize="0.95rem">No existen registros.</Typography>}
                </Box>
            </Paper>
        </Box>
    );
}

export default History;