import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import ListButtonItem from '../components/ListButtonItem';

test('renders content', () => {
    const item = {
        nombre: 'Test Item',
        onClick: jest.fn(),
    }
    const component = render(<ListButtonItem nombre={item.nombre}/>);
    component.getByText(item.nombre);
})

const mockOnClick = jest.fn();

test('calls onClick handler when clicked', () => {
    const item = {
        nombre: 'Test Item',
        onClick: mockOnClick,
    }
    const component = render(<ListButtonItem {...item} />);
    const button = component.getByText(item.nombre);
    fireEvent.click(button);
    expect(mockOnClick.mock.calls);
});