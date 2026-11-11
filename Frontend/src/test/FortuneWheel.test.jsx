import { describe, it, expect } from 'vitest';
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
