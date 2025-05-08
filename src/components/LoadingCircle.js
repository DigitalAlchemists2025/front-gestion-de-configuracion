import { Box, CircularProgress } from "@mui/material";
import React from "react";

const LoadingCircle = () => {
    return(
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "80vh",
                background: "var(--color-bg-gradient)",
                minHeight: "100vh",
            }}
        >
            <CircularProgress sx={{ color: "var(--color-loading)" }} />
        </Box>
    )
}

export default LoadingCircle;