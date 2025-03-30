import { Card } from "@mui/material";
import React from "react";

const ListButtonItem = ({nombre, onClick}) => {
    return (
        <Card
            sx={{
                width: '100%',
                py: '2rem',
                textAlign: 'center',
                fontSize: '1.2em',
                border: '1px black solid',
                borderRadius: 0
            }} 
            onClick={onClick}
        >
            {nombre}
        </Card>
    )
}

export default ListButtonItem;