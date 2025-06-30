import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from '../../node_modules/react-router-dom';
import AppRouter from '../AppRouter';

// Mockear páginas de la app
jest.mock('../auth/login', () => () => <div>Login Page</div>);
jest.mock('../auth/Register', () => () => <div>Register Page</div>);
jest.mock('../views/Home', () => () => <div>Home Page</div>);
jest.mock('../views/ComponentDetail', () => () => <div>ComponentDetail Page</div>);
jest.mock('../views/AddComponent', () => () => <div>AddComponent Page</div>);
jest.mock('../views/ManageComponents', () => () => <div>ManageComponents Page</div>);
jest.mock('../views/History', () => () => <div>History Page</div>);
jest.mock('../views/ManageUsers', () => () => <div>ManageUsers Page</div>);

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AppRouter', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  test('redirige a Login si no hay token', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });

  test('redirige a Home si hay token', () => {
    window.localStorage.setItem('token', '123');
    window.localStorage.setItem('role', '0');
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(screen.getByText(/home page/i)).toBeInTheDocument();
  });

  test('muestra Register en /register', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(screen.getByText(/register page/i)).toBeInTheDocument();
  });

  test('acceso a agregar-componentes solo admin', () => {
    // Como admin (role 0)
    window.localStorage.setItem('token', 'abc');
    window.localStorage.setItem('role', '0');
    render(
      <MemoryRouter initialEntries={['/agregar-componentes']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(screen.getByText(/addcomponent page/i)).toBeInTheDocument();

    // Como usuario normal (role 1)
    window.localStorage.setItem('role', '1');
    render(
      <MemoryRouter initialEntries={['/agregar-componentes']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(screen.getByText(/home page/i)).toBeInTheDocument();
  });

  test('acceso protegido: sin token muestra login', () => {
    window.localStorage.clear();
    render(
      <MemoryRouter initialEntries={['/components/123']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });

  test('ruta no encontrada muestra Home', () => {
    window.localStorage.setItem('token', 'xyz');
    window.localStorage.setItem('role', '0');
    render(
      <MemoryRouter initialEntries={['/ruta-inexistente']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(screen.getByText(/home page/i)).toBeInTheDocument();
  });

  // Puedes agregar tests similares para /gestionar-componentes, /ver-historial, /users...
});