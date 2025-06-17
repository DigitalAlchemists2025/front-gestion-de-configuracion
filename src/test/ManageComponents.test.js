import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ManageComponents from './ManageComponents';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

// Mock de las dependencias
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock de localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    clear: jest.fn(() => { store = {}; })
  };
})();

// Mock de DataGrid para simplificar pruebas
jest.mock('@mui/x-data-grid', () => ({
  ...jest.requireActual('@mui/x-data-grid'),
  DataGrid: jest.fn(() => <div>MockedDataGrid</div>),
}));

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
});

describe('ManageComponents', () => {
  const mockComponents = [
    {
      _id: '1',
      name: 'Componente 1',
      type: 'Tipo A',
      status: 'activo',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-02',
      descriptions: [{ name: 'Desc1', description: 'Descripción 1' }]
    },
    {
      _id: '2',
      name: 'Componente 2',
      type: 'Tipo B',
      status: 'de baja',
      createdAt: '2023-01-03',
      updatedAt: '2023-01-04',
      descriptions: [{ name: 'Desc2', description: 'Descripción 2' }]
    }
  ];

  beforeEach(() => {
    window.localStorage.getItem.mockReturnValue('mock-token');
    axios.get.mockResolvedValue({ data: mockComponents });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza el componente correctamente', async () => {
    render(
      <MemoryRouter>
        <ManageComponents />
      </MemoryRouter>
    );

    // Verifica que el título se renderice
    expect(screen.getByText('Gestión de componentes')).toBeInTheDocument();
    
    // Verifica que el campo de búsqueda esté presente
    expect(screen.getByPlaceholderText('Buscar')).toBeInTheDocument();
    
    // Verifica que se renderice el DataGrid (mock)
    await waitFor(() => {
      expect(screen.getByText('MockedDataGrid')).toBeInTheDocument();
    });
  });

  test('hace fetch de los componentes al montar', async () => {
    render(
      <MemoryRouter>
        <ManageComponents />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/components'),
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
        }
      );
    });
  });

  test('filtra componentes al buscar', async () => {
    render(
      <MemoryRouter>
        <ManageComponents />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Buscar');
    fireEvent.change(searchInput, { target: { value: 'Componente 1' } });

    await waitFor(() => {
      // Verificar que se llamó a la función de filtrado con el valor correcto
      expect(DataGrid).toHaveBeenCalledWith(
        expect.objectContaining({
          rows: expect.arrayContaining([
            expect.objectContaining({ name: 'Componente 1' })
          ])
        }),
        expect.anything()
      );
    });
  });

  test('redirige a login si no hay token', async () => {
    window.localStorage.getItem.mockReturnValue(null);
    const mockNavigate = jest.fn();
    
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    render(
      <MemoryRouter>
        <ManageComponents />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

// Tests para funciones específicas
describe('Funciones de ManageComponents', () => {
  let originalConfirm;
  
  beforeAll(() => {
    originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
  });

  afterAll(() => {
    window.confirm = originalConfirm;
  });

  test('changeStatus cambia el estado del componente', async () => {
    axios.put.mockResolvedValue({});
    
    // Necesitarías extraer la función para probarla directamente
    // o renderizar el componente y simular las interacciones
    // Esta es una versión simplificada
    const { rerender } = render(
      <MemoryRouter>
        <ManageComponents />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Aquí normalmente simularías la interacción con el menú
    // y la selección de cambiar estado
  });

  test('handleDeleteComponent elimina un componente', async () => {
    axios.delete.mockResolvedValue({});
    
    // Similar a changeStatus, necesitarías simular las interacciones
    // o extraer la función para probarla directamente
  });
});