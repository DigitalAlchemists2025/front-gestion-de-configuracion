import { Card } from "@mui/material";
import React from "react";

const ListButtonItem = ({ nombre, onClick }) => {
    return (
        <Card
            sx={{
                width: '100%',
                py: 2,
                m: '1em auto 0',
                textAlign: 'center',
                fontSize: '1.1rem bold',
                border: 'none',
                borderRadius: '15px',
                bgcolor: 'MenuText',
                color: 'rgb(255, 255, 255)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                    transform: 'scale(1.05)', 
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', 
                    cursor: 'pointer',
                    backgroundColor: 'rgba(110, 32, 255, 0.08)',
                },
            }}
            onClick={onClick}
        >
            {nombre}
        </Card>
    );
};

export default ListButtonItem;