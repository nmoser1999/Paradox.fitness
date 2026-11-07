import {
  connectionBound,
  type Point,
  type ShapeAnchor,
} from './training-equipment';
import { POINTER_STRIDE } from './training-interaction';
import type { NetworkNode } from './training-network';

export interface EquipmentDrag {
  index: number;
  pointerId: number;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  startAngle: number;
  vx: number;
  vy: number;
  spin: number;
  moved: boolean;
}

/** Stable screen-aligned squares enclose each piece at every rotation. */
export function pickEquipment(
  anchors: ShapeAnchor[],
  point: Point,
  order: number[],
  padding = 6,
) {
  for (let i = order.length - 1; i >= 0; i--) {
    const index = order[i],
      anchor = anchors[index];
    if (!anchor || !anchor.kind || anchor.kind === 'dot') continue;
    const bound = connectionBound(anchor) + padding;
    if (
      Math.abs(point.x - anchor.x) <= bound &&
      Math.abs(point.y - anchor.y) <= bound
    )
      return index;
  }
  return -1;
}

/** Bake the current visual pose into the drift so pickup never jumps. */
export function beginEquipmentDrag(
  nodes: NetworkNode[],
  anchors: ShapeAnchor[],
  field: Float32Array,
  index: number,
  point: Point,
  pointerId: number,
  scrollShift = 0,
): EquipmentDrag | null {
  const node = nodes[index],
    anchor = anchors[index];
  if (!node || !anchor || node.kind === 'dot') return null;
  const drag: EquipmentDrag = {
    index,
    pointerId,
    offsetX: anchor.x - point.x,
    offsetY: anchor.y - point.y,
    startX: anchor.x,
    startY: anchor.y + scrollShift * node.depth,
    startAngle: anchor.angle ?? node.angle,
    vx: node.vx,
    vy: node.vy,
    spin: node.spin,
    moved: false,
  };
  node.x = drag.startX;
  node.y = drag.startY;
  node.angle = drag.startAngle;
  node.vx = node.vy = node.spin = 0;
  field.fill(0, index * POINTER_STRIDE, (index + 1) * POINTER_STRIDE);
  return drag;
}

export function positionEquipmentDrag(
  drag: EquipmentDrag,
  nodes: NetworkNode[],
  point: Point,
  width: number,
  height: number,
  scrollShift = 0,
) {
  const node = nodes[drag.index];
  if (!node || width <= 0 || height <= 0) return;
  const insetX = Math.min(8, width / 2),
    insetY = Math.min(8, height / 2);
  const shift = scrollShift * node.depth;
  const maxY = Math.max(insetY, height - insetY - shift);
  node.x = Math.max(insetX, Math.min(width - insetX, point.x + drag.offsetX));
  node.y = Math.max(insetY, Math.min(maxY, point.y + drag.offsetY)) + shift;
  if ((node.x - drag.startX) ** 2 + (node.y - drag.startY) ** 2 > 9)
    drag.moved = true;
}

export function finishEquipmentDrag(
  drag: EquipmentDrag,
  nodes: NetworkNode[],
  cancel = false,
) {
  const node = nodes[drag.index];
  if (!node) return;
  if (cancel) {
    node.x = drag.startX;
    node.y = drag.startY;
    node.angle = drag.startAngle;
  }
  node.vx = drag.vx;
  node.vy = drag.vy;
  node.spin = drag.spin;
}

export function raiseEquipment(order: number[], index: number) {
  const position = order.indexOf(index);
  if (position < 0) return;
  for (let i = position; i < order.length - 1; i++) order[i] = order[i + 1];
  order[order.length - 1] = index;
}
