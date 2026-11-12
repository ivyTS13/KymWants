import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import useFocusTrap from '../hooks/useFocusTrap';

function TrapModal({ isActive, onClose }) {
  const containerRef = useFocusTrap(isActive);

  return (
    <div>
      <button data-testid="outside-btn">Outside</button>
      {isActive && (
        <div ref={containerRef} role="dialog" aria-modal="true">
          <input data-testid="input-1" placeholder="First" />
          <button data-testid="button-2">Middle</button>
          <button data-testid="button-close" onClick={onClose}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

describe('useFocusTrap', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('focuses the first focusable element when activated and restores focus when deactivated', () => {
    const { rerender } = render(<TrapModal isActive={false} />);
    const outsideBtn = screen.getByTestId('outside-btn');
    outsideBtn.focus();
    expect(document.activeElement).toBe(outsideBtn);

    // Activate modal
    rerender(<TrapModal isActive={true} />);
    
    // Fast-forward 50ms timer for auto-focus
    act(() => {
      vi.advanceTimersByTime(50);
    });

    const firstInput = screen.getByTestId('input-1');
    expect(document.activeElement).toBe(firstInput);

    // Deactivate modal
    rerender(<TrapModal isActive={false} />);
    expect(document.activeElement).toBe(outsideBtn);
  });

  it('cycles focus from last element back to first on Tab', () => {
    render(<TrapModal isActive={true} />);

    act(() => {
      vi.advanceTimersByTime(50);
    });

    const firstInput = screen.getByTestId('input-1');
    const closeBtn = screen.getByTestId('button-close');

    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);

    // Press Tab on last element
    const container = screen.getByRole('dialog');
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(tabEvent);

    expect(document.activeElement).toBe(firstInput);
  });

  it('cycles focus from first element back to last on Shift+Tab', () => {
    render(<TrapModal isActive={true} />);

    act(() => {
      vi.advanceTimersByTime(50);
    });

    const firstInput = screen.getByTestId('input-1');
    const closeBtn = screen.getByTestId('button-close');

    firstInput.focus();
    expect(document.activeElement).toBe(firstInput);

    // Press Shift+Tab on first element
    const container = screen.getByRole('dialog');
    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(shiftTabEvent);

    expect(document.activeElement).toBe(closeBtn);
  });
});
