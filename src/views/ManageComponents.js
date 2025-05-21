import { Box, Paper, Typography, IconButton, Menu, MenuItem, Input, InputAdornment, Avatar } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingCircle from "../components/LoadingCircle";
import SideBar from "../components/SideBar";
import { GridMoreVertIcon } from "@mui/x-data-grid";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import DateTimeParser from "../components/DateTimeParser";

const ManageComponents = () => {
    const navigate = useNavigate();
    const [allComponents, setAllComponents] = useState([]);
    const [components, setComponents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');    const [loading, setLoading] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const [expandedRows, setExpandedRows] = useState({});

    const BACKEND_URL = process.env.REACT_APP_BACK_URL;
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');

    const columns = [
        { field: 'name', headerName: 'Nombre', flex: 1, },
        { field: 'type', headerName: 'Tipo', flex: 1 },
        {
            field: 'status',
            headerName: 'Estado',
            flex: 1,
            cellClassName: (params) => {
                if (params.value === 'activo') return 'estado-activo';
                if (params.value === 'de baja') return 'estado-baja';
                return '';
            },
        },
        { field: 'createdAt', headerName: 'Creado', flex: 1 },
        { field: 'updatedAt', headerName: 'Actualizado', flex: 1 },
        {
            field: 'components', 
            headerName: '', 
            width: 20,
            sortable: false,
            filterable: false, 
            renderCell: (params) => {
                const isExpanded = expandedRows[params.row._id];
                return (
                    params.row.components?.length > 0 && !params.row.isSub ? (
                        <IconButton onClick={(e) => {
                            e.stopPropagation();
                            showSubComponents(e, params.row);
                        }}>
                            {isExpanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                        </IconButton>
                    ) : null
                );
            }
        },
        {
            field: 'options',
            headerName: '',
            sortable: false,
            filterable: false,
            width: 50,
            renderCell: (params) => (
              <>
                <IconButton onClick={(e) => {
                    e.stopPropagation();
                    handleMenuOpen(e, params.row)
                }}>
                    <GridMoreVertIcon/>
                </IconButton>
              </>
            )
        },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BACKEND_URL}/components`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const componentesMappedAndSorted = response.data.map((component) => {
                    const parsedCreatedAt = DateTimeParser(component.createdAt);
                    const parsedUpdatedAt = DateTimeParser(component.updatedAt);

                    return {
                    ...component,
                    descriptionsText: component.descriptions
                        .map((d) => `${d.name}: ${d.description}`)
                        .join(", "),
                    createdAt: parsedCreatedAt,
                    updatedAt: parsedUpdatedAt,
                    };
                }).sort((a, b) => a.name.localeCompare(b.name)); 

                setAllComponents(componentesMappedAndSorted);
                setComponents(componentesMappedAndSorted);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const handleSearch = (value) => {
        setSearchTerm(value);
      
        const searched = allComponents.filter((c) =>
            c.name.toLowerCase().includes(value.toLowerCase()) ||
            c.type.toLowerCase().includes(value.toLowerCase()) ||
            (Array.isArray(c.descriptions) && c.descriptions.some((desc) =>
                desc.description?.toLowerCase().includes(value.toLowerCase())
            ))
            /* || c.hijos.name || c.hijos.type */
        );
      
        setComponents(searched);
    };  

    const handleMenuOpen = (event, row) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    };
      
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    const changeStatus = async () => {
        const payload = {
          status: selectedRow.status === "activo" ? "de baja" : "activo",
        };
        try {
            await axios.put(`${BACKEND_URL}/components/${selectedRow._id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setComponents((prev) =>
                prev.map((comp) =>
                    comp._id === selectedRow._id
                    ? { ...comp, status: payload.status }
                    : comp
                )
            );
        } catch (error) {
          console.error("Error al cambiar estado:", error);
        } finally {
          setLoading(false);
        }
    };

    const handleDeleteComponent = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este componente?")) {
            try {
                setLoading(true);
                await axios.delete(`${BACKEND_URL}/components/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setComponents((prev) => prev.filter((comp) => comp._id !== id));
                setAllComponents((prev) => prev.filter((comp) => comp._id !== id));
            } catch (error) {
                console.error("Error al eliminar componente:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const showSubComponents = async (event, row) => {
        const isExpanded = expandedRows[row._id];
        
        if (isExpanded) {
            setComponents((prev) => prev.filter((c) => c.parentId !== row._id));
            setExpandedRows((prev) => ({ ...prev, [row._id]: false }));
        } else {
            try {
                const res = await axios.get(`${BACKEND_URL}/components/${row._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                /* Falta arreglar la linea subcomponente desfazada */
                const populated = res.data.components.slice(0, 3);

                const subRows = populated.map((sub, i) => ({
                    ...sub,
                    _id: `${row._id}-sub${i}`,
                    parentId: row._id,
                    name: `> ${sub.name}`,
                    status: sub.status,
                    type: sub.type,
                    createdAt: DateTimeParser(sub.createdAt),
                    updatedAt: DateTimeParser(sub.updatedAt),
                    isSub: true,
                }));

                const index = components.findIndex((c) => c._id === row._id);
                const newList = [
                    ...components.slice(0, index + 1),
                    ...subRows,
                    ...components.slice(index + 1),
                ];

                setComponents(newList);
                setExpandedRows((prev) => ({ ...prev, [row._id]: true }));
            } catch (error) {
                console.error("Error cargando subcomponentes:", error);
            }
        }
    };

    if (loading) return <LoadingCircle />;

    return (
        <Box sx={{
            display: 'flex',
            height: "100vh",
            width: "100%",
            background: "var(--color-bg-gradient)",
            color: "var(--color-text-base)",
            position: "fixed",
            top: 0,
            left: 0,
        }}>
            <SideBar />
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                textAlign: 'center',
                my: 5,
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    gap: 5,
                    mx: "1.5rem",
                }}>
                    <Typography variant="h4" sx={{ fontSize: "1.5rem", p: 1, color: "var(--color-bg-secondary)"}}>Gestión de componentes</Typography>
                    <Input
                        startAdornment={
                        <InputAdornment position="start">
                            <Avatar
                            variant="square"
                            src="/search-icon.png"
                            sx={{
                                height: '20px',
                                width: '20px',
                                p: 1,
                                backgroundColor: 'transparent',
                                filter: 'invert(20%)',
                            }}
                            className="search-icon"
                            />
                        </InputAdornment>
                        }
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Buscar"
                        sx={{
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-inputs)',
                            width: '100%',
                            maxWidth: '30rem',
                            color: 'var(--color-text-base)',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                            '& input': {
                                color: 'var(--color-text-base)',
                            },
                            '&:focus-within': {
                                backgroundColor: 'var(--color-celeste-focus)',
                                boxShadow: '0 0 5px var(--color-celeste-focus)',
                            },
                            }}
                            onFocus={() => {
                            const icon = document.querySelector('.search-icon');
                            icon?.classList.add('focus-icon');
                        }}
                        onBlur={() => {
                        const icon = document.querySelector('.search-icon');
                        icon?.classList.remove('focus-icon');
                        }}
                        size="small"
                    />
                </Box>
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: "center",
                        my: 5,
                        overflowY: "auto",
                    }}
                >

                    <Paper sx={{
                        flexGrow: 1,
                        width: '90%',
                        borderRadius: '16px',
                        backgroundColor: 'transparent',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}>
                        <DataGrid
                            rows={components}
                            columns={columns}
                            getRowId={(row) => row._id}
                            getRowClassName={(params) => {
                                if (params.row.isSub) return 'fila-subcomponente';
                                if (params.row.status === 'activo') return 'fila-activa';
                                if (params.row.status === 'de baja') return 'fila-baja';
                                return '';
                            }}
                            initialState={{
                                pagination: { paginationModel: { page: 0, pageSize: 10 } },
                            }}
                            pageSizeOptions={[5, 10, 15]}
                            sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '25px',
                                fontSize: '1rem',
                                background: 'transparent',
                                color: 'var(--color-text-base)',
                                '& .fila-activa': {
                                    color: 'var(--color-text-active)',
                                },
                                '& .fila-baja': {
                                    color: 'var(--color-text-baja)',
                                    fontStyle: 'italic',
                                },
                                '.MuiDataGrid-columnHeader': {
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    color: '#ffffff',
                                    borderBottom: 'none',
                                },
                                '.MuiDataGrid-cell': {
                                    borderBottom: 'none',
                                    backgroundColor: 'var(--color-dg-cell-bg)',
                                    color: 'var(--color-datagrid-cell-text)',
                                },
                                '.MuiDataGrid-row:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                                    cursor: 'pointer',
                                },
                                '.MuiDataGrid-footerContainer': {
                                    bgcolor: '#e3f2fd',
                                    borderTop: 'none',
                                },
                                '[class*="MuiTablePagination"]': {
                                    color: 'var(--color-pagination)',
                                },
                                '.MuiDataGrid-cell:focus, .MuiDataGrid-columnHeader:focus, .MuiDataGrid-columnHeader:focus-within': {
                                    outline: 'none',
                                },
                                '& .MuiDataGrid-row:nth-of-type(even) .MuiDataGrid-cell': {
                                    backgroundColor: 'var(--color-dg-cell-bg-even)',
                                },
                                '& .MuiDataGrid-row:nth-of-type(odd) .MuiDataGrid-cell': {
                                    backgroundColor: 'var(--color-dg-cell-bg-odd)',
                                },
                                '& .MuiDataGrid-row.fila-subcomponente': {
                                    fontStyle: 'italic',
                                },
                                '& .MuiDataGrid-row.fila-subcomponente .MuiDataGrid-cell': {
                                    backgroundColor:"var(--color-dg-cell-child)" ,
                                    pl: 2,
                                }
                            }}
                        />
                    </Paper>
                </Box>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => {
                        handleMenuClose();
                        navigate(`/components/${selectedRow._id}`)
                    }}>
                        Editar
                    </MenuItem>
                    <MenuItem onClick={() => {
                        changeStatus();
                        handleMenuClose();
                    }}>
                        {selectedRow?.status === "activo" ? "Retirar" : "Activar"}  
                    </MenuItem>
                    <MenuItem onClick={() => {
                        handleDeleteComponent(selectedRow._id);
                        handleMenuClose();
                    }}>
                        Eliminar
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );
};

export default ManageComponents;