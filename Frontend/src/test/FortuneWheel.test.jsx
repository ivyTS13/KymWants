import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FortuneWheel from '../components/FortuneWheel';
import { calculateWinnerIndex, SPIN_DURATION_MS } from '../utils/wheelMath';

describe('FortuneWheel logic', () => {
  it('has consistent spin duration', () => {
    expect(SPIN_DURATION_MS).toBe(5000);
  });

  it('calculates correct winner index for 0 rotation', () => {
    expect(calculateWinnerIndex(0, 4)).toBe(0);
  });

  it('calculates correct index for rotation quarter turns', () => {
    // 4 slices: 90 deg each
    // When wheel rotates 90 deg clockwise, slice 3 moves under the top pointer
    expect(calculateWinnerIndex(90, 4)).toBe(3);
    expect(calculateWinnerIndex(180, 4)).toBe(2);
    expect(calculateWinnerIndex(270, 4)).toBe(1);
    expect(calculateWinnerIndex(360, 4)).toBe(0);
  });

  it('stays within valid slice index bounds across many random rotations', () => {
    const numSlices = 7;
    for (let r = 0; r <= 3600; r += 23) {
      const idx = calculateWinnerIndex(r, numSlices);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(numSlices);
    }
  });

  it('handles edge case of 1 slice', () => {
    expect(calculateWinnerIndex(1234, 1)).toBe(0);
  });

  it('handles 0 slices safely', () => {
    expect(calculateWinnerIndex(100, 0)).toBe(0);
  });
});

describe('FortuneWheel component & adaptive display', () => {
  it('renders empty wheel view when no dishes are provided', () => {
    render(<FortuneWheel dishes={[]} onWinnerSelected={vi.fn()} />);
    expect(screen.getByText(/The wheel is currently empty/i)).toBeInTheDocument();
  });

  it('renders dish names directly when dishes <= 10 without Dish Guide', () => {
    const dishes = [
      { id: '1', name: 'Matcha Latte' },
      { id: '2', name: 'Tonkatsu Ramen' },
      { id: '3', name: 'Boba Tea' },
    ];

    render(<FortuneWheel dishes={dishes} onWinnerSelected={vi.fn()} />);

    expect(screen.getByText('Matcha Latte')).toBeInTheDocument();
    expect(screen.getByText('Tonkatsu Ramen')).toBeInTheDocument();
    expect(screen.getByText('Boba Tea')).toBeInTheDocument();
    expect(screen.queryByText(/Dish Guide/i)).not.toBeInTheDocument();
  });

  it('renders numbered slices and Dish Guide legend when dishes > 10', () => {
    const dishes = Array.from({ length: 12 }, (_, i) => ({
      id: `dish-${i + 1}`,
      name: `Dish Item ${i + 1}`,
    }));

    render(<FortuneWheel dishes={dishes} onWinnerSelected={vi.fn()} />);

    expect(screen.getByText('Dish Guide')).toBeInTheDocument();
    expect(screen.getByText(/12 dishes on wheel/i)).toBeInTheDocument();
    expect(screen.getByText('Dish Item 1')).toBeInTheDocument();
    expect(screen.getByText('Dish Item 12')).toBeInTheDocument();
  });
});
