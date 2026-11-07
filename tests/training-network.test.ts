import { describe, expect, it } from 'vitest';
import {
  advanceParticles,
  connectionBetween,
  createParticles,
} from '../src/lib/training-network';

describe('Training particle proximity', () => {
  it('connects only when the gap is smaller than the connection radius', () => {
    const a = { x: 0, y: 0, radius: 2 };
    expect(connectionBetween(a, { x: 104, y: 0, radius: 2 }, 100)).toBeNull();
    expect(
      connectionBetween(a, { x: 103, y: 0, radius: 2 }, 100),
    ).not.toBeNull();
    expect(connectionBetween(a, { x: 50, y: 0, radius: 2 }, 0)).toBeNull();
  });
  it('fades an edge as its particles move apart', () => {
    const a = { x: 0, y: 0, radius: 2 };
    const near = connectionBetween(a, { x: 20, y: 0, radius: 2 }, 100)!;
    const far = connectionBetween(a, { x: 90, y: 0, radius: 2 }, 100)!;
    expect(near.opacity).toBeGreaterThan(far.opacity);
    expect(far.opacity).toBeGreaterThan(0);
  });
  it('clips circular particle endpoints to their radii', () => {
    const link = connectionBetween(
      { x: 20, y: 20, radius: 100 },
      { x: 200, y: 260, radius: 2 },
      250,
    )!;
    expect(Math.hypot(link.ax - 20, link.ay - 20)).toBeCloseTo(100);
    expect(Math.hypot(link.bx - 200, link.by - 260)).toBeCloseTo(2);
  });
  it.each([0, Math.PI / 6, Math.PI / 2, -Math.PI / 3])(
    'connects to a rotating plate rim junction instead of aiming at its center (%f)',
    (angle) => {
      const plate = {
        x: 200,
        y: 200,
        radius: 100,
        kind: 'plate' as const,
        angle,
      };
      const dot = {
        x: 200 + 190 * Math.cos(angle) - 60 * Math.sin(angle),
        y: 200 + 190 * Math.sin(angle) + 60 * Math.cos(angle),
        radius: 2,
        kind: 'dot' as const,
      };
      const link = connectionBetween(plate, dot, 200)!;
      const expectedAngle = angle + Math.PI / 8;
      expect(link.ax).toBeCloseTo(200 + 100 * Math.cos(expectedAngle));
      expect(link.ay).toBeCloseTo(200 + 100 * Math.sin(expectedAngle));
      expect(Math.hypot(link.ax - 200, link.ay - 200)).toBeCloseTo(100);
      // An outward line cannot pass back through the disk, including its hub.
      expect(
        (link.bx - link.ax) * (link.ax - 200) +
          (link.by - link.ay) * (link.ay - 200),
      ).toBeGreaterThan(0);
      expect(
        Math.abs(
          (link.bx - link.ax) * (link.ay - 200) -
            (link.by - link.ay) * (link.ax - 200),
        ),
      ).toBeGreaterThan(100);
      const reversed = connectionBetween(dot, plate, 200)!;
      expect(reversed.bx).toBeCloseTo(link.ax);
      expect(reversed.by).toBeCloseTo(link.ay);
    },
  );
  it('rejects plate contacts hidden behind the rim or inside the disk', () => {
    const plate = { x: 0, y: 0, radius: 100, kind: 'plate' as const };
    expect(
      connectionBetween(plate, { x: 40, y: 30, radius: 2 }, 200),
    ).toBeNull();
    const angle = Math.PI / 16;
    expect(
      connectionBetween(
        plate,
        {
          x: 100.1 * Math.cos(angle),
          y: 100.1 * Math.sin(angle),
          radius: 0.01,
        },
        200,
      ),
    ).toBeNull();
  });
  it('connects both directions to the closed dumbbell end cap', () => {
    const equipment = { x: 0, y: 0, radius: 126, kind: 'dumbbell' as const };
    const dot = { x: -200, y: 0, radius: 2, kind: 'dot' as const };
    const outward = connectionBetween(equipment, dot, 250)!;
    const inward = connectionBetween(dot, equipment, 250)!;
    expect(outward.ax).toBeCloseTo(-113);
    expect(outward.ay).toBeCloseTo(0);
    expect(inward.bx).toBeCloseTo(-113);
    expect(inward.by).toBeCloseTo(0);
    expect(outward.bx).toBeCloseTo(-198);
    expect(inward.ax).toBeCloseTo(-198);
  });
  it('accepts a nearby dot outside the shaft but inside the old circular bound', () => {
    const link = connectionBetween(
      { x: 0, y: 0, radius: 126, kind: 'dumbbell' },
      { x: 0, y: 30, radius: 2, kind: 'dot' },
      200,
    );
    expect(link).not.toBeNull();
    expect(link!.ay).toBeCloseTo(4);
    expect(link!.by).toBeCloseTo(28);
  });
  it.each([0, Math.PI / 4, Math.PI / 2, -Math.PI / 3])(
    'keeps dumbbell end contacts aligned at rotation %f',
    (angle) => {
      const scale = 86 / 126;
      const node = {
        x: 250,
        y: 200,
        radius: 86,
        kind: 'dumbbell' as const,
        angle,
      };
      const dot = {
        x: 250 - 210 * scale * Math.cos(angle),
        y: 200 - 210 * scale * Math.sin(angle),
        radius: 2,
        kind: 'dot' as const,
      };
      const link = connectionBetween(node, dot, 250)!;
      expect(link.ax).toBeCloseTo(250 - 113 * scale * Math.cos(angle), 5);
      expect(link.ay).toBeCloseTo(200 - 113 * scale * Math.sin(angle), 5);
    },
  );
  it.each([0, Math.PI / 4, Math.PI / 2, -Math.PI / 3])(
    'attaches to the kettlebell handle at rotation %f',
    (angle) => {
      const node = {
        x: 250,
        y: 200,
        radius: 68,
        kind: 'kettlebell' as const,
        angle,
      };
      const dot = {
        x: 250 + 160 * Math.sin(angle),
        y: 200 - 160 * Math.cos(angle),
        radius: 2,
        kind: 'dot' as const,
      };
      const link = connectionBetween(node, dot, 250)!;
      expect(link.ax).toBeCloseTo(250 + 98 * 0.68 * Math.sin(angle), 5);
      expect(link.ay).toBeCloseTo(200 - 98 * 0.68 * Math.cos(angle), 5);
    },
  );
  it('connects to the curved kettlebell body and flat bottom', () => {
    const node = { x: 0, y: 0, radius: 100, kind: 'kettlebell' as const };
    const side = connectionBetween(node, { x: 240, y: 38, radius: 2 }, 250)!;
    const bottom = connectionBetween(node, { x: 0, y: 180, radius: 2 }, 250)!;
    expect(side.ax).toBeCloseTo(79);
    expect(side.ay).toBeCloseTo(38);
    expect(bottom.ax).toBeCloseTo(0);
    expect(bottom.ay).toBeCloseTo(98);
  });
  it('keeps bell bottom-corner links within range beyond the nominal round bound', () => {
    const link = connectionBetween(
      { x: 0, y: 0, radius: 100, kind: 'kettlebell' },
      { x: -100, y: 213, radius: 2, kind: 'dot' },
      130,
    );
    expect(link).not.toBeNull();
    expect(link!.opacity).toBeGreaterThan(0);
    expect(Math.hypot(link!.bx - link!.ax, link!.by - link!.ay)).toBeLessThan(
      130,
    );
  });
  it('rejects dots inside the bell silhouette and closed shaft caps', () => {
    expect(
      connectionBetween(
        { x: 0, y: 0, radius: 100, kind: 'kettlebell' },
        { x: 0, y: -60, radius: 2 },
        200,
      ),
    ).toBeNull();
    expect(
      connectionBetween(
        { x: 0, y: 0, radius: 126, kind: 'dumbbell' },
        { x: -112, y: 0, radius: 2 },
        200,
      ),
    ).toBeNull();
  });
  it('does not connect overlapping glyphs or coincident particles', () => {
    expect(
      connectionBetween(
        { x: 0, y: 0, radius: 100 },
        { x: 50, y: 0, radius: 2 },
        100,
      ),
    ).toBeNull();
    expect(
      connectionBetween(
        { x: 10, y: 10, radius: 2 },
        { x: 10, y: 10, radius: 2 },
        100,
      ),
    ).toBeNull();
  });
});

describe('Training particle work budget', () => {
  it('adds 50% more dots and a kettlebell while retaining a fixed cap', () => {
    const nodes = createParticles(5120, 2880);
    expect(nodes.length).toBeLessThanOrEqual(63);
    expect(nodes.filter((node) => node.kind === 'dot')).toHaveLength(60);
    expect(nodes.filter((node) => node.kind === 'plate')).toHaveLength(1);
    expect(nodes.filter((node) => node.kind === 'dumbbell')).toHaveLength(1);
    expect(nodes.filter((node) => node.kind === 'kettlebell')).toHaveLength(1);
    expect(
      nodes.every(
        (node) => node.x > 0 && node.x < 5120 && node.y > 0 && node.y < 2880,
      ),
    ).toBe(true);
  });
  it('does no particle work for a zero-size surface', () => {
    expect(createParticles(0, 900)).toEqual([]);
    expect(createParticles(1280, 0)).toEqual([]);
  });
  it('caps catch-up motion when a tab resumes after a long pause', () => {
    const nodes = createParticles(1280, 900);
    const before = nodes.map((node) => ({ ...node }));
    advanceParticles(nodes, 60, 1280, 900);
    nodes.forEach((node, i) => {
      expect(Math.abs(node.x - before[i].x)).toBeLessThanOrEqual(
        Math.abs(node.vx) * 0.05 + 1e-8,
      );
      expect(Math.abs(node.y - before[i].y)).toBeLessThanOrEqual(
        Math.abs(node.vy) * 0.05 + 1e-8,
      );
    });
  });
  it('reflects drifting particles at the viewport edge', () => {
    const [node] = createParticles(1280, 900);
    Object.assign(node, { x: 7, y: 893, vx: -10, vy: 10 });
    advanceParticles([node], 0.05, 1280, 900);
    expect(node.x).toBe(8);
    expect(node.y).toBe(892);
    expect(node.vx).toBeGreaterThan(0);
    expect(node.vy).toBeLessThan(0);
  });
});
