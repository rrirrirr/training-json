import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithAlertProvider } from '@/tests/helpers/test-utils';
import { GlobalAlert } from '@/components/layout/GlobalAlert';
import { useAlert } from '@/contexts/alert-context';
import { act } from 'react-dom/test-utils';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  Info: () => <div data-testid="info-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Ban: () => <div data-testid="ban-icon" />,
}));

// Create a test component that allows us to trigger alerts
const TestComponent = ({ canCollapse = false }) => {
  const { showAlert, hideAlert } = useAlert();
  
  return (
    <div>
      <button onClick={() => showAlert('Info message', 'info')}>Show Info</button>
      <button onClick={() => showAlert('Warning message', 'warning')}>Show Warning</button>
      <button onClick={() => showAlert('Error message', 'error')}>Show Error</button>
      <button onClick={() => showAlert('Edit mode active', 'edit')}>Show Edit</button>
      <button onClick={() => hideAlert()}>Hide Alert</button>
      <GlobalAlert canCollapse={canCollapse} />
    </div>
  );
};

describe('GlobalAlert', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });
  
  test('renders nothing when no alert is active', () => {
    renderWithAlertProvider(<GlobalAlert />);
    
    // The container should be empty or have opacity-0 class
    const alertContainer = screen.getByRole('alert', { hidden: true });
    expect(alertContainer).toHaveClass('opacity-0');
  });
  
  test('shows info alert with correct styling', () => {
    renderWithAlertProvider(<TestComponent />);
    
    // Trigger info alert
    fireEvent.click(screen.getByText('Show Info'));
    
    // Check the alert is visible
    const alertContainer = screen.getByRole('alert');
    expect(alertContainer).toHaveClass('opacity-100');
    
    // Check content
    expect(screen.getByText('Info message')).toBeInTheDocument();
    
    // Check icon
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    
    // Check styling (should have info-related classes)
    const alertContent = alertContainer.querySelector('div[class*="bg-blue-100"]');
    expect(alertContent).toBeInTheDocument();
  });
  
  test('shows warning alert with correct styling', () => {
    renderWithAlertProvider(<TestComponent />);
    
    // Trigger warning alert
    fireEvent.click(screen.getByText('Show Warning'));
    
    // Check the alert is visible
    const alertContainer = screen.getByRole('alert');
    expect(alertContainer).toHaveClass('opacity-100');
    
    // Check content
    expect(screen.getByText('Warning message')).toBeInTheDocument();
    
    // Check icon
    expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    
    // Check styling (should have warning-related classes)
    const alertContent = alertContainer.querySelector('div[class*="bg-yellow-100"]');
    expect(alertContent).toBeInTheDocument();
  });
  
  test('shows error alert with correct styling', () => {
    renderWithAlertProvider(<TestComponent />);
    
    // Trigger error alert
    fireEvent.click(screen.getByText('Show Error'));
    
    // Check the alert is visible
    const alertContainer = screen.getByRole('alert');
    expect(alertContainer).toHaveClass('opacity-100');
    
    // Check content
    expect(screen.getByText('Error message')).toBeInTheDocument();
    
    // Check icon
    expect(screen.getByTestId('ban-icon')).toBeInTheDocument();
    
    // Check styling (should have error-related classes)
    const alertContent = alertContainer.querySelector('div[class*="bg-red-100"]');
    expect(alertContent).toBeInTheDocument();
  });
  
  test('shows edit alert with correct styling', () => {
    renderWithAlertProvider(<TestComponent />);
    
    // Trigger edit alert
    fireEvent.click(screen.getByText('Show Edit'));
    
    // Check the alert is visible
    const alertContainer = screen.getByRole('alert');
    expect(alertContainer).toHaveClass('opacity-100');
    
    // Check content
    expect(screen.getByText('Edit mode active')).toBeInTheDocument();
    
    // Check icon
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
    
    // Check styling (should have edit-related classes)
    const alertContent = alertContainer.querySelector('div[class*="bg-\\[var\\(--edit-mode-bg\\)\\]"]');
    expect(alertContent).toBeInTheDocument();
  });
  
  test('dismisses alert when close button is clicked', () => {
    renderWithAlertProvider(<TestComponent />);
    
    // Trigger alert
    fireEvent.click(screen.getByText('Show Info'));
    
    // Check alert is visible
    expect(screen.getByRole('alert')).toHaveClass('opacity-100');
    
    // Click dismiss button
    const dismissButton = screen.getByRole('button', { name: /dismiss alert/i });
    fireEvent.click(dismissButton);
    
    // Check alert is hidden
    expect(screen.getByRole('alert', { hidden: true })).toHaveClass('opacity-0');
  });
  
  test('collapses after specified delay when canCollapse is true', async () => {
    // Using 500ms for the test to make it faster
    renderWithAlertProvider(<TestComponent canCollapse={true} />);
    
    // Trigger alert
    fireEvent.click(screen.getByText('Show Info'));
    
    // Initially not collapsed
    expect(screen.getByText('Info message')).toBeVisible();
    
    // Advance timers by default collapse delay (3000ms)
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // Should be collapsed now (content not visible)
    // This is testing implementation details which isn't ideal, but for visual collapse
    // we need to check that certain elements become hidden due to conditional rendering
    const alertContent = screen.queryByText('Info message');
    expect(alertContent).not.toBeVisible();
  });
  
  test('expands on hover when collapsed', async () => {
    renderWithAlertProvider(<TestComponent canCollapse={true} />);
    
    // Trigger alert
    fireEvent.click(screen.getByText('Show Info'));
    
    // Make it collapse
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // Hover over the alert
    const alertContainer = screen.getByRole('alert');
    fireEvent.mouseEnter(alertContainer);
    
    // Content should be visible again
    expect(screen.getByText('Info message')).toBeVisible();
    
    // Mouse leave should hide content again
    fireEvent.mouseLeave(alertContainer);
    expect(screen.queryByText('Info message')).not.toBeVisible();
  });
});
