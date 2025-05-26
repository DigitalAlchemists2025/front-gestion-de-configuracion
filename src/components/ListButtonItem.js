import { Card } from "@mui/material";

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
                backgroundColor: 'var(--color-bg-gradient)',
                color: 'var(--color-title-primary)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                minHeight: "1.5rem",
                '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'var(--color-bg-secondary-hover)',
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