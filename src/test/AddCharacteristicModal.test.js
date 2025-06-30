import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddCharacteristicModal from '../components/AddCharacteristModal';

describe('AddCharacteristicModal', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Título de prueba',
    confirmText: 'OK',
    cancelText: 'Cancelar',
    confirmDisabled: false,
  };

  const renderModal = (props = {}) =>
    render(
      <AddCharacteristicModal {...defaultProps} {...props}>
        <div data-testid="child-content">Contenido interno</div>
      </AddCharacteristicModal>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('muestra el título y los children', () => {
    renderModal();
    expect(screen.getByText('Título de prueba')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toHaveTextContent(
      'Contenido interno'
    );
  });

  test('llama onClose al hacer click en "Cancelar"', () => {
    renderModal();
    fireEvent.click(screen.getByText('Cancelar'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('llama onConfirm al hacer click en "OK"', () => {
    renderModal();
    fireEvent.click(screen.getByText('OK'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  test('botón de confirmación está deshabilitado según la prop', () => {
    renderModal({ confirmDisabled: true });
    expect(screen.getByText('OK')).toBeDisabled();
  });

  test('no renderiza nada si open=false', () => {
    renderModal({ open: false });
    expect(screen.queryByText('Título de prueba')).not.toBeInTheDocument();
  });
});