import { describe, expect, it } from 'vitest';
import {
  beginEquipmentDrag,
  finishEquipmentDrag,
  pickEquipment,
  positionEquipmentDrag,
  raiseEquipment,
} from '../src/lib/training-drag';
import {
  EQUIPMENT_GEOMETRY,
  type ShapeAnchor,
} from '../src/lib/training-equipment';
import {
  advancePointerField,
  createPointerField,
} from '../src/lib/training-interaction';
import { createParticles } from '../src/lib/training-network';

const anchor = (
  kind: 'plate' | 'dumbbell' | 'kettlebell',
  angle = 0,
): ShapeAnchor => ({
  kind,
  x: 250,
  y: 250,
  radius: EQUIPMENT_GEOMETRY[kind].radius,
  angle,
});
function scene() {
  const nodes = createParticles(1280, 900),
    field = createPointerField(nodes.length);
  const anchors = nodes.map((n) => ({ ...n }));
  return { nodes, field, anchors };
}

describe('Equipment picking', () => {
  it.each([
    ['plate', 108],
    ['dumbbell', 110],
    ['kettlebell', 108],
  ] as const)(
    'accepts all square corners outside the %s silhouette',
    (kind, corner) => {
      for (const angle of [0, 0.7, Math.PI / 2, Math.PI]) {
        const equipment = anchor(kind, angle);
        for (const x of [-corner, corner])
          for (const y of [-corner, corner])
            expect(
              pickEquipment([equipment], { x: 250 + x, y: 250 + y }, [0]),
            ).toBe(0);
        expect(pickEquipment([equipment], { x: 450, y: 250 }, [0])).toBe(-1);
      }
    },
  );
  it.each([
    ['plate', 100],
    ['kettlebell', 68],
    ['dumbbell', 111.8],
  ] as const)(
    'covers every rendered %s outline point at its actual field size',
    (kind, radius) => {
      const shape = EQUIPMENT_GEOMETRY[kind];
      const outline =
        kind === 'plate'
          ? Array.from({ length: 64 }, (_, i) => ({
              x: shape.x + shape.radius * Math.cos((i * Math.PI) / 32),
              y: shape.y + shape.radius * Math.sin((i * Math.PI) / 32),
            }))
          : shape.boundaries.flat();
      for (const angle of [0, 0.12, 0.7, Math.PI / 2, Math.PI]) {
        const equipment = { ...anchor(kind, angle), x: 482, y: 314, radius };
        const scale = radius / shape.radius;
        for (const vertex of outline) {
          const dx = (vertex.x - shape.x) * scale;
          const dy = (vertex.y - shape.y) * scale;
          const point = {
            x: equipment.x + dx * Math.cos(angle) - dy * Math.sin(angle),
            y: equipment.y + dx * Math.sin(angle) + dy * Math.cos(angle),
          };
          expect(pickEquipment([equipment], point, [0])).toBe(0);
        }
      }
    },
  );
  it('picks the front equipment and never a dot', () => {
    const anchors: ShapeAnchor[] = [
      anchor('plate'),
      anchor('plate'),
      { ...anchor('plate'), kind: 'dot' },
    ];
    expect(pickEquipment(anchors, { x: 250, y: 250 }, [0, 1, 2])).toBe(1);
    expect(pickEquipment(anchors, { x: 250, y: 250 }, [1, 0, 2])).toBe(0);
    expect(pickEquipment(anchors, { x: 250, y: 250 }, [2])).toBe(-1);
    expect(pickEquipment(anchors, { x: 500, y: 500 }, [0, 1, 2])).toBe(-1);
  });
  it('includes the padded square boundary and rejects points just outside it', () => {
    for (const direction of [-1, 1]) {
      expect(
        pickEquipment(
          [anchor('plate')],
          { x: 250 + 114 * direction, y: 250 },
          [0],
        ),
      ).toBe(0);
      expect(
        pickEquipment(
          [anchor('plate')],
          { x: 250, y: 250 + 114 * direction },
          [0],
        ),
      ).toBe(0);
      expect(
        pickEquipment(
          [anchor('plate')],
          { x: 250 + 114.01 * direction, y: 250 },
          [0],
        ),
      ).toBe(-1);
      expect(
        pickEquipment(
          [anchor('plate')],
          { x: 250, y: 250 + 114.01 * direction },
          [0],
        ),
      ).toBe(-1);
    }
  });
});

describe('Rigid equipment dragging', () => {
  it('bakes the visible pressure pose, preserves the grab offset, and freezes only selected drift', () => {
    const { nodes, field, anchors } = scene(),
      original = { ...nodes[0] },
      other = { ...nodes[1] };
    field.set([12, -6, 0.04, 2, 3, 0.01]);
    anchors[0].x += 12;
    anchors[0].y -= 6 + 20 * nodes[0].depth;
    anchors[0].angle += 0.04;
    const point = { x: anchors[0].x + 30, y: anchors[0].y - 25 };
    const drag = beginEquipmentDrag(nodes, anchors, field, 0, point, 7, 20)!;
    expect(drag.offsetX).toBe(-30);
    expect(drag.offsetY).toBe(25);
    expect(nodes[0].x).toBeCloseTo(original.x + 12);
    expect(nodes[0].y).toBeCloseTo(original.y - 6);
    expect(nodes[0].angle).toBeCloseTo(original.angle + 0.04);
    expect([nodes[0].vx, nodes[0].vy, nodes[0].spin]).toEqual([0, 0, 0]);
    expect([...field.slice(0, 6)]).toEqual([0, 0, 0, 0, 0, 0]);
    expect(nodes[1]).toEqual(other);
    positionEquipmentDrag(drag, nodes, point, 1280, 900, 20);
    expect(nodes[0].x).toBeCloseTo(original.x + 12);
    expect(nodes[0].y).toBeCloseTo(original.y - 6);
    expect(drag.moved).toBe(false);
  });
  it('follows the pointer without stretching or turning, then resumes existing drift at the drop', () => {
    const { nodes, field, anchors } = scene(),
      original = { ...nodes[1] };
    const point = { x: anchors[1].x + 20, y: anchors[1].y + 10 };
    const drag = beginEquipmentDrag(nodes, anchors, field, 1, point, 3)!;
    positionEquipmentDrag(drag, nodes, { x: 500, y: 450 }, 1280, 900);
    expect(nodes[1].x).toBe(480);
    expect(nodes[1].y).toBe(440);
    expect(nodes[1].angle).toBe(original.angle);
    expect(nodes[1].radius).toBe(original.radius);
    expect(drag.moved).toBe(true);
    finishEquipmentDrag(drag, nodes);
    expect(nodes[1].x).toBe(480);
    expect(nodes[1].y).toBe(440);
    expect([nodes[1].vx, nodes[1].vy, nodes[1].spin]).toEqual([
      original.vx,
      original.vy,
      original.spin,
    ]);
  });
  it('bounds a captured pointer outside the scene and retains the scroll mapping', () => {
    const { nodes, field, anchors } = scene(),
      shift = 30;
    anchors[2].y -= shift * nodes[2].depth;
    const drag = beginEquipmentDrag(
      nodes,
      anchors,
      field,
      2,
      anchors[2],
      1,
      shift,
    )!;
    positionEquipmentDrag(
      drag,
      nodes,
      { x: -1000, y: -1000 },
      1280,
      900,
      shift,
    );
    expect(nodes[2].x).toBe(8);
    expect(nodes[2].y - shift * nodes[2].depth).toBeCloseTo(8);
    positionEquipmentDrag(drag, nodes, { x: 5000, y: 5000 }, 1280, 900, shift);
    expect(nodes[2].x).toBe(1272);
    expect(nodes[2].y).toBeCloseTo(892);
  });
  it('cancels back to the pickup pose and restores velocity', () => {
    const { nodes, field, anchors } = scene(),
      original = { ...nodes[2] };
    const drag = beginEquipmentDrag(nodes, anchors, field, 2, anchors[2], 1)!;
    positionEquipmentDrag(drag, nodes, { x: 500, y: 400 }, 1280, 900);
    finishEquipmentDrag(drag, nodes, true);
    expect(nodes[2]).toEqual(original);
  });
  it('refuses dots and keeps paint-order membership stable', () => {
    const { nodes, field, anchors } = scene();
    expect(
      beginEquipmentDrag(nodes, anchors, field, 3, anchors[3], 1),
    ).toBeNull();
    const order = [0, 1, 2];
    raiseEquipment(order, 0);
    expect(order).toEqual([1, 2, 0]);
    raiseEquipment(order, 99);
    expect(order).toEqual([1, 2, 0]);
  });
  it('keeps hovered equipment easy to grab while nearby dots still respond', () => {
    const { nodes, field } = scene();
    nodes[3].x = nodes[0].x;
    nodes[3].y = nodes[0].y;
    advancePointerField(
      nodes,
      field,
      { x: nodes[0].x - 20, y: nodes[0].y, active: true },
      1 / 30,
      0,
      0,
    );
    expect([...field.slice(0, 6)]).toEqual([0, 0, 0, 0, 0, 0]);
    expect(field[18]).toBeGreaterThan(0);
  });
});
