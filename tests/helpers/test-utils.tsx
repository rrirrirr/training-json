import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AlertProvider } from '@/contexts/alert-context';

// Custom render function that includes the AlertProvider
const renderWithAlertProvider = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: ({ children }) => <AlertProvider>{children}</AlertProvider>,
    ...options,
  });
};

export * from '@testing-library/react';
export { renderWithAlertProvider };
