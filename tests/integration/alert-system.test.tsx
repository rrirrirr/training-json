import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { AlertProvider } from '@/contexts/alert-context';
import { AlertExample } from '@/examples/alert-usage-example';
import { act } from 'react-dom/test-utils';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  Info: () => <div data-testid="info-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Ban: () => <div data-testid="ban-icon" />,
}));

describe('Alert System Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('AlertExample shows different types of alerts', async () => {
    render(
      <AlertProvider>
        <AlertExample />
      </AlertProvider>
    );
    
    // Initially, no alert should be visible
    expect(screen.queryByRole('alert', { hidden: false })).not.toBeInTheDocument();
    
    // Test info alert
    fireEvent.click(screen.getByText('Show Info Alert'));
    expect(screen.getByText('This is an information message.')).toBeInTheDocument();
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    
    // Info alert should auto-close after 5000ms
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.queryByText('This is an information message.')).not.toBeInTheDocument();
    
    // Test warning alert
    fireEvent.click(screen.getByText('Show Warning Alert'));
    expect(screen.getByText('Warning! This action may have consequences.')).toBeInTheDocument();
    expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    
    // Test error alert (should replace warning alert)
    fireEvent.click(screen.getByText('Show Error Alert'));
    expect(screen.getByText('An error occurred while processing your request.')).toBeInTheDocument();
    expect(screen.getByTestId('ban-icon')).toBeInTheDocument();
    expect(screen.queryByText('Warning! This action may have consequences.')).not.toBeInTheDocument();
    
    // Test manual dismissal
    fireEvent.click(screen.getByText('Hide Current Alert'));
    await waitFor(() => {
      expect(screen.queryByText('An error occurred while processing your request.')).not.toBeInTheDocument();
    });
    
    // Test edit mode alert
    fireEvent.click(screen.getByText('Show Edit Mode Alert'));
    expect(screen.getByText('You are in edit mode. Don\'t forget to save your changes!')).toBeInTheDocument();
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
  });
});
