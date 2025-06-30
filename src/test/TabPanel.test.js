import React from 'react';
import { render, screen } from '@testing-library/react';
import TabPanel from '../components/TabPanel';

describe('TabPanel', () => {
  it('muestra el contenido cuando value === index', () => {
    render(
      <TabPanel value={0} index={0}>
        Contenido visible
      </TabPanel>
    );
    expect(screen.getByText("Contenido visible")).toBeInTheDocument();
  });

  it('no muestra el contenido cuando value !== index', () => {
    render(
      <TabPanel value={1} index={0}>
        Contenido oculto
      </TabPanel>
    );
    expect(screen.queryByText("Contenido oculto")).not.toBeInTheDocument();
  });

  it('siempre tiene el role="tabpanel"', () => {
    const { container } = render(
      <TabPanel value={0} index={0}>
        Test
      </TabPanel>
    );
    expect(container.querySelector('[role="tabpanel"]')).toBeTruthy();
  });
});