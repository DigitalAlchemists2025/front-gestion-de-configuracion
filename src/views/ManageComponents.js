import { Box, Paper, Typography, IconButton, Menu, MenuItem, Input, InputAdornment, Avatar } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingCircle from "../components/LoadingCircle";
import SideBar from "../components/SideBar";
import { GridMoreVertIcon } from "@mui/x-data-grid";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import DateTimeParser from "../utils/DateTimeParser";

const ManageComponents = () => {
    let initialSearch = localStorage.getItem('searchedComponentManagment');
    if (initialSearch === (null || undefined)) {
        localStorage.removeItem('searchedComponentManagment');
        initialSearch = '';
    }
    
    const navigate = useNavigate();
    const [allComponents, setAllComponents] = useState([]);
    const [components, setComponents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');    const [loading, setLoading] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const [expandedRows, setExpandedRows] = useState({});

    const BACKEND_URL = process.env.REACT_APP_BACK_URL;
    const token = localStorage.getItem('token');
    localStorage.removeItem('selectedComponent');
    if (!token) navigate('/login');

    /* Columnas visibles en la tabla */
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
            disableColumnMenu: true,
            disableReorder: true,
            stopPropagation: true,
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
            disableColumnMenu: true,
            disableReorder: true,
            renderCell: (params) => (
                <IconButton
                    onClick={(event) => {
                        handleMenuOpen(event, params.row);
                        event.stopPropagation();
                    }}
                    aria-label="more"
                    aria-controls="long-menu"
                    aria-haspopup="true"
                    sx={{
                        color: 'var(--color-text-base)',
                        '&:hover': { backgroundColor: 'transparent' }
                    }}
                >
                    <GridMoreVertIcon />
                </IconButton>
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
                
                /* Se transforma el formato de las características genéricas y las horas a hora chile */
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

                if (initialSearch) {
                    const response = await axios.get(`${BACKEND_URL}/components/search`, { 
                        params: { q: initialSearch }, 
                        headers: { 'Authorization': `Bearer ${token}` } 
                    });
                    setComponents(response.data);
                    setSearchTerm(initialSearch);
                } else {
                    setComponents(componentesMappedAndSorted);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const handleSearch = async (value) => {
        setSearchTerm(value);
        try {
          const response = await axios.get(
            `${BACKEND_URL}/components/search`,
            {
              params: { q: value },
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setComponents(response.data);
        } catch (error) {
          console.error(error);
        }
    };

    const handleMenuOpen = (event, row) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    };
      
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    /* Función recursiva para cambiar el estado de subcomponentes junto a su padre */
    const changeStatusRecursive = async (component, updateSubcomponents) => {
        const idComponent = component._id;
        const newStatus = component.status === "activo" ? "de baja" : "activo";
        const payload = { status: newStatus };

        try {
            await axios.put(`${BACKEND_URL}/components/${idComponent}`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });

            if (updateSubcomponents && component.components && component.components.length > 0) {
                for (const childId of component.components) {
                    const child = components.find(c => c._id === (childId._id || childId));
                    if (child && child.status !== newStatus) {
                        await changeStatusRecursive(child, true);
                    }
                }
            }

            setComponents(prev =>
                prev.map(comp =>
                    comp._id === component._id
                    ? { ...comp, status: newStatus }
                    : comp
                )
            );
        } catch (error) {
            console.error("Error al cambiar estado:", error);
        }
    };

    const handleChangeStatus = async (component) => {
        const newStatus = component?.status === "activo" ? "de baja" : "activo";

        if (newStatus === "de baja") {
            const updateSubcomponents = window.confirm("¿Desea también dar de baja todos los subcomponentes y sub-subcomponentes?");
            if (updateSubcomponents) {
                await changeStatusRecursive(component, true);
            } else {
                await changeStatusRecursive(component, false);
            }
        } else {
            await changeStatusRecursive(component, false);
        }
    };

    const handleDeleteComponent = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este componente?")) {
            try {
                setLoading(true);
                if(selectedRow.components?.length > 0) {
                    alert("No puede eliminar a un componente con subcomponentes");
                    setLoading(false);
                    return;
                }

                await axios.delete(`${BACKEND_URL}/components/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setComponents((prev) => prev.filter((comp) => comp._id !== id));
                setAllComponents((prev) => prev.filter((comp) => comp._id !== id));
                window.location.reload();
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

                const populated = res.data.components.slice(0, 3);

                const subRows = populated.map((sub, i) => ({
                    ...sub,
                    _id: `${sub._id}-sub-${i}`,
                    parentId: row._id,
                    name: `> ${sub.name}`,
                    status: sub.status,
                    type: sub.type,
                    createdAt: DateTimeParser(sub.createdAt),
                    updatedAt: DateTimeParser(sub.updatedAt),
                    isSub: true
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

    return (
        <Box sx={{
            display: 'flex',
            height: "100vh",
            width: "100%",
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
                height: '90vh',
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
                    <Typography variant="h5" sx={{ p: 1, color: "var(--color-bg-secondary)", fontFamily: "var(--font-montserrat)" }}>Gestión de componentes</Typography>
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

                {loading && <LoadingCircle />}

                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: "center",
                        my: 5,
                        height: "100%",
                        overflowY: "auto",
                    }}
                >

                    <Paper sx={{
                        flexGrow: 1,
                        width: '90%',
                        borderRadius: '16px',
                        backgroundColor: 'transparent',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        height: '100%',
                    }}>
                        <DataGrid
                            rows={components}
                            columns={columns}
                            getRowId={(row) => row._id}
                            isRowSelectable={() => false}
                            getRowClassName={(params) => {
                                if (params.row.isSub) return 'fila-subcomponente';
                                if (params.row.status === 'activo') return 'fila-activa';
                                if (params.row.status === 'de baja') return 'fila-baja';
                                return '';
                            }}
                            initialState={{
                                pagination: { paginationModel: { page: 0, pageSize: 10 } },
                            }}
                            onRowClick={(params) => {
                                localStorage.setItem("searchedComponentManagment", `${searchTerm}`);
                                if (!params.isSub){
                                    navigate(`/components/${params.row._id}`)
                                } else {
                                    const newId = params.row._id.split('-')[0];
                                    navigate(`/components/${newId}`);
                                }
                            }}
                            pageSizeOptions={[5, 10, 15]}
                            sx={{
                                height: '100%',
                                border: '1px solid #e0e0e0',
                                borderRadius: '25px',
                                fontSize: '1rem',
                                background: 'transparent',
                                color: 'var(--color-text-base)',
                                fontFamily: "var(--font-source)",
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
                                },
                                '& .MuiDataGrid-columnHeaderMenuIconButton-root, & .MuiDataGrid-columnHeaderMenuIconButton-root svg, & .css-1ckov0h-MuiSvgIcon-root': {
                                    color: 'white !important',
                                    fill: 'white !important',
                                },
                                '& .MuiDataGrid-iconButtonContainer button': {
                                    color: '#fff !important',
                                },
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
                            if (!selectedRow.isSub){
                                navigate(`/components/${selectedRow._id}`)
                            } else {
                                const newId = selectedRow._id.split('-sub-')[0];
                                navigate(`/components/${newId}`);
                            }
                        }}
                        sx={{ fontFamily: 'var(--font-source)', color: 'var(--color-text-primary)' }}
                    >
                        Ver / Editar
                    </MenuItem>
                    <MenuItem onClick={() => {
                            handleChangeStatus(selectedRow);
                            handleMenuClose();
                        }}
                        sx={{ fontFamily: 'var(--font-source)', color: 'var(--color-text-primary)' }}
                    >
                        {selectedRow?.status === "activo" ? "Retirar" : "Activar"}  
                    </MenuItem>
                    <MenuItem onClick={() => {
                            if (!selectedRow.isSub){
                                handleDeleteComponent(selectedRow._id);
                            } else {
                                const newId = selectedRow._id.split('-sub-')[0];
                                handleDeleteComponent(newId);
                            }
                            handleMenuClose();
                        }}
                        sx={{ fontFamily: 'var(--font-source)', color: 'var(--color-text-primary)' }}
                    >
                        Eliminar
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );
};

export default ManageComponents;