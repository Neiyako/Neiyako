import { describe, expect, it } from 'vitest';
import { clamp, createSeededRandom, easeOutCubic, lerp } from '../../src/utils/math';

describe('clamp', () => {
  it('returns the value when it is inside the range', () => {
    expect(clamp(0.25, 0, 1)).toBe(0.25);
    expect(clamp(-3, -5, 2)).toBe(-3);
  });

  it('clamps values at both bounds', () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(2, 0, 1)).toBe(1);
  });

  it('handles equal bounds and negative ranges', () => {
    expect(clamp(10, 4, 4)).toBe(4);
    expect(clamp(-20, -10, -5)).toBe(-10);
    expect(clamp(0, -10, -5)).toBe(-5);
  });
});

describe('lerp', () => {
  it('returns the endpoints exactly at t=0 and t=1', () => {
    expect(lerp(10, 30, 0)).toBe(10);
    expect(lerp(10, 30, 1)).toBe(30);
  });

  it('interpolates between two values', () => {
    expect(lerp(10, 30, 0.5)).toBe(20);
    expect(lerp(-4, 8, 0.25)).toBeCloseTo(-1, 12);
  });

  it('preserves linear extrapolation', () => {
    expect(lerp(10, 20, 2)).toBe(30);
    expect(lerp(10, 20, -1)).toBe(0);
  });
});

describe('easeOutCubic', () => {
  it('pins the curve to 0 and 1', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });

  it('matches the cubic easing value at the midpoint', () => {
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 12);
  });

  it('is monotonically non-decreasing over the unit interval', () => {
    const samples = Array.from({ length: 21 }, (_, index) => easeOutCubic(index / 20));

    for (let index = 1; index < samples.length; index += 1) {
      expect(samples[index]).toBeGreaterThanOrEqual(samples[index - 1]);
    }
  });
});

describe('createSeededRandom', () => {
  it('replays the same sequence for the same seed', () => {
    const first = createSeededRandom(42);
    const second = createSeededRandom(42);

    const firstSequence = Array.from({ length: 32 }, () => first());
    const secondSequence = Array.from({ length: 32 }, () => second());

    expect(firstSequence).toEqual(secondSequence);
  });

  it('returns finite values in the half-open unit interval', () => {
    const random = createSeededRandom(2026);
    const values = Array.from({ length: 256 }, () => random());

    for (const value of values) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('produces a different sequence for a different seed', () => {
    const first = createSeededRandom(7);
    const second = createSeededRandom(8);

    const firstSequence = Array.from({ length: 32 }, () => first());
    const secondSequence = Array.from({ length: 32 }, () => second());

    expect(firstSequence).not.toEqual(secondSequence);
  });
});
