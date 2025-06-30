const mockNavigate = jest.fn();
import "react-router-dom";

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('axios');

jest.mock('@mui/x-data-grid', () => ({
  ...jest.requireActual('@mui/x-data-grid'),
  DataGrid: jest.fn(() => <div>MockedDataGrid</div>),
}));

const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ManageComponents from './ManageComponents';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

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
    window.localStorage.getItem.mockClear();
    axios.get.mockClear();
    mockNavigate.mockClear();

    window.localStorage.getItem.mockReturnValue('mock-token');
    axios.get.mockResolvedValue({ data: mockComponents });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Renderiza el componente correctamente', async () => {
    render(
      <MemoryRouter>
        <ManageComponents />
      </MemoryRouter>
    );

    expect(screen.getByText('Gestión de componentes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('MockedDataGrid')).toBeInTheDocument();
    });
  });

  test('Fetch a los componentes al montar', async () => {
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

  test('Filtra componentes al buscar', async () => {
    render(
      <MemoryRouter>
        <ManageComponents />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Buscar');
    fireEvent.change(searchInput, { target: { value: 'Componente 1' } });

    await waitFor(() => {
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

  test('Redirige a login si no hay token', () => {
    window.localStorage.getItem.mockReturnValue(null);

    render(
      <MemoryRouter>
        <ManageComponents />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});