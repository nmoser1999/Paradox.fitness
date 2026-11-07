import { describe, expect, it } from 'vitest';
import { createParticles, type NetworkNode } from '../src/lib/training-network';
import {
  advancePointerField,
  createPointerField,
  networkViewportTop,
  POINTER_STRIDE,
} from '../src/lib/training-interaction';

const node = (kind: NetworkNode['kind'] = 'dot'): NetworkNode => ({
  kind,
  x: 140,
  y: 100,
  radius: kind === 'dot' ? 2 : 100,
  vx: 3,
  vy: 2,
  angle: 0.2,
  spin: 0.01,
  depth: 1,
});
const pointer = { x: 100, y: 100, active: true };

describe('Bounded mouse pressure', () => {
  it('leaves distant nodes and the underlying drift untouched', () => {
    const nodes = [node()],
      before = nodes.map((n) => ({ ...n }));
    const field = createPointerField(nodes.length);
    advancePointerField(nodes, field, { x: 900, y: 900, active: true }, 1 / 30);
    expect([...field]).toEqual([0, 0, 0, 0, 0, 0]);
    expect(nodes).toEqual(before);
  });
  it('reports a settled field so idle interaction work can be skipped', () => {
    const field = createPointerField(1);
    expect(
      advancePointerField(
        [node()],
        field,
        { ...pointer, active: false },
        1 / 30,
      ),
    ).toBe(false);
    expect(advancePointerField([node()], field, pointer, 1 / 30)).toBe(true);
  });
  it('pushes a nearby dot away from the mouse', () => {
    const field = createPointerField(1);
    advancePointerField([node()], field, pointer, 1 / 30);
    expect(field[0]).toBeGreaterThan(0);
    expect(field[1]).toBe(0);
    expect(field[2]).toBe(0);
  });
  it('gives equipment a heavier, slower response than dots', () => {
    const nodes = [node(), node('plate')],
      field = createPointerField(2);
    advancePointerField(nodes, field, pointer, 1 / 30);
    expect(field[POINTER_STRIDE]).toBeGreaterThan(0);
    expect(field[POINTER_STRIDE]).toBeLessThan(field[0]);
    expect(field[POINTER_STRIDE + 2]).toBeLessThan(0);
  });
  it('bounds translation and rotation during rapid mouse changes', () => {
    const nodes = createParticles(5120, 2880),
      before = nodes.map((n) => ({ ...n }));
    const field = createPointerField(nodes.length);
    for (let frame = 0; frame < 240; frame++) {
      const target = nodes[frame % nodes.length];
      advancePointerField(
        nodes,
        field,
        { x: target.x + (frame % 2 ? 10 : -10), y: target.y, active: true },
        1 / 30,
      );
      nodes.forEach((n, i) => {
        const o = i * POINTER_STRIDE;
        expect(Math.hypot(field[o], field[o + 1])).toBeLessThanOrEqual(
          n.kind === 'dot' ? 32.001 : 16.001,
        );
        expect(Math.abs(field[o + 2])).toBeLessThanOrEqual(0.090001);
      });
    }
    expect(nodes).toEqual(before);
  });
  it('settles back to the drifting positions when the cursor leaves', () => {
    const nodes = [node(), node('dumbbell'), node('kettlebell')],
      field = createPointerField(3);
    for (let frame = 0; frame < 60; frame++)
      advancePointerField(nodes, field, pointer, 1 / 30);
    expect(field.some((n) => n !== 0)).toBe(true);
    for (let frame = 0; frame < 150; frame++)
      advancePointerField(nodes, field, { ...pointer, active: false }, 1 / 30);
    expect([...field]).toEqual(new Array(18).fill(0));
  });
  it('has no singularity when a cursor coincides with a node', () => {
    const nodes = [node('kettlebell')],
      field = createPointerField(1);
    advancePointerField(nodes, field, { x: 140, y: 100, active: true }, 1 / 30);
    expect([...field].every(Number.isFinite)).toBe(true);
    expect(field[0]).toBeGreaterThan(0);
  });
  it('caps a resumed frame instead of applying a long pause as force', () => {
    const nodes = [node('dumbbell')],
      paused = createPointerField(1),
      normal = createPointerField(1);
    advancePointerField(nodes, paused, pointer, 120);
    advancePointerField(nodes, normal, pointer, 0.05);
    expect([...paused]).toEqual([...normal]);
  });
  it('uses the same scroll shift as drawing when measuring proximity', () => {
    const nodes = [{ ...node(), y: 200, depth: 2 }],
      field = createPointerField(1);
    advancePointerField(nodes, field, pointer, 1 / 30, 50);
    expect(field[0]).toBeGreaterThan(0);
    expect(field[1]).toBe(0);
  });
});

describe('Cached sticky canvas coordinates', () => {
  it('tracks the main start, sticky travel, and clipped end', () => {
    expect(networkViewportTop(220, 3000, 900, 0)).toBe(220);
    expect(networkViewportTop(220, 3000, 900, 400)).toBe(0);
    expect(networkViewportTop(220, 3000, 900, 3000)).toBe(-680);
  });
  it('does not invent sticky travel when main is shorter than the viewport', () => {
    expect(networkViewportTop(220, 400, 900, 100)).toBe(120);
    expect(networkViewportTop(220, 400, 900, 400)).toBe(-180);
  });
});
