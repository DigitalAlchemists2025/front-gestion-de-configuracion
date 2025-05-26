import { Box, CircularProgress } from "@mui/material";

const LoadingCircle = () => {
    return(
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "80vh",
                background: "var(--color-bg-gradient)",
            }}
        >
            <CircularProgress sx={{ color: "var(--color-loading)" }} />
        </Box>
    )
}

export default LoadingCircle;