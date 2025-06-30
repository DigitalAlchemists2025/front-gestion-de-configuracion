import { Box, Typography } from "@mui/material";

/* 
  Componente personalizado para las tabs de la 
  vista de detalle de componente 
*/
export default function TabPanel(props) {
  const { children, value, index, } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      style={{ width: "100%", minHeight: "20vh", height: "40vh", }}
    >
      {value === index && (
        <Box sx={{ p: 3, fontWeight: "bold", }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}