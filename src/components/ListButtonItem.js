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
                fontSize: '1.1rem',
                border: 'none',
                borderRadius: '15px',
                backgroundColor: 'var(--bg-inputs)',
                color: 'var(--color-text-base)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                transform: 'scale(1.03)',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                cursor: 'pointer',
                },
            }}
            onClick={onClick}
        >
            {nombre}
        </Card>
    );
};

export default ListButtonItem;