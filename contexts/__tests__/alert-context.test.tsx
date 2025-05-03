import { renderHook, act } from '@testing-library/react';
import { AlertProvider, useAlert, GlobalAlertState } from '@/contexts/alert-context';
import React from 'react';

describe('Alert Context', () => {
  // Setup for renderHook with provider
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AlertProvider>{children}</AlertProvider>
  );
  
  // Mock for timers
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('initial state is correct', () => {
    const { result } = renderHook(() => useAlert(), { wrapper });
    
    // Check that the initial state matches expected defaults
    expect(result.current.alertState).toEqual({
      id: 0,
      message: null,
      severity: null,
      isVisible: false,
      autoCloseDelay: null,
    });
  });
  
  test('showAlert updates state correctly', () => {
    const { result } = renderHook(() => useAlert(), { wrapper });
    
    // Show an alert
    act(() => {
      result.current.showAlert('Test message', 'info');
    });
    
    // Check that state was updated
    expect(result.current.alertState).toMatchObject({
      message: 'Test message',
      severity: 'info',
      isVisible: true,
      autoCloseDelay: null,
    });
    
    // ID should be updated (we can't check exact value as it uses Date.now())
    expect(result.current.alertState.id).toBeGreaterThan(0);
  });
  
  test('hideAlert hides the alert', () => {
    const { result } = renderHook(() => useAlert(), { wrapper });
    
    // Show an alert
    act(() => {
      result.current.showAlert('Test message', 'info');
    });
    
    // Check it's visible
    expect(result.current.alertState.isVisible).toBe(true);
    
    // Hide the alert
    act(() => {
      result.current.hideAlert();
    });
    
    // Verify it's hidden but message is preserved for animation
    expect(result.current.alertState.isVisible).toBe(false);
    expect(result.current.alertState.message).toBe('Test message');
  });
  
  test('autoCloseDelay automatically hides the alert', () => {
    const { result } = renderHook(() => useAlert(), { wrapper });
    
    // Show an alert with auto-close
    act(() => {
      result.current.showAlert('Test message', 'info', { autoCloseDelay: 3000 });
    });
    
    // Check it's visible and has the correct autoCloseDelay
    expect(result.current.alertState.isVisible).toBe(true);
    expect(result.current.alertState.autoCloseDelay).toBe(3000);
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // Check that the alert is now hidden
    expect(result.current.alertState.isVisible).toBe(false);
  });
  
  test('showing a new alert cancels previous auto-close timer', () => {
    const { result } = renderHook(() => useAlert(), { wrapper });
    
    // Show first alert with auto-close
    act(() => {
      result.current.showAlert('First message', 'info', { autoCloseDelay: 3000 });
    });
    
    // Fast-forward time but not enough to trigger auto-close
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Show a second alert with different auto-close
    act(() => {
      result.current.showAlert('Second message', 'warning', { autoCloseDelay: 5000 });
    });
    
    // Check that second alert is active
    expect(result.current.alertState.message).toBe('Second message');
    expect(result.current.alertState.severity).toBe('warning');
    
    // Fast-forward 3000ms (which would have closed the first alert)
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // The second alert should still be visible
    expect(result.current.alertState.isVisible).toBe(true);
    
    // Fast-forward 2000ms more (to reach 5000ms for the second alert)
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Now the second alert should be hidden
    expect(result.current.alertState.isVisible).toBe(false);
  });

  test('auto-close only affects the current alert', () => {
    const { result } = renderHook(() => useAlert(), { wrapper });
    
    // Show first alert with auto-close
    act(() => {
      result.current.showAlert('First message', 'info', { autoCloseDelay: 3000 });
    });
    
    const firstAlertId = result.current.alertState.id;
    
    // Fast-forward time but not enough to trigger auto-close
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Show a second alert without auto-close
    act(() => {
      result.current.showAlert('Second message', 'warning');
    });
    
    const secondAlertId = result.current.alertState.id;
    expect(secondAlertId).not.toBe(firstAlertId);
    
    // Fast-forward 2000ms more (would have closed the first alert)
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // The second alert should still be visible since it has no auto-close
    expect(result.current.alertState.isVisible).toBe(true);
    expect(result.current.alertState.message).toBe('Second message');
  });
});
