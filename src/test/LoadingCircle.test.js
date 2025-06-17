import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import LoadingCircle from '../components/LoadingCircle';

test('renders content', () => {
    const component = render(<LoadingCircle/>);
    component.unmount(); 
})