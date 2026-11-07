import type { NetworkNode } from './training-network';

export interface FieldPointer {
  x: number;
  y: number;
  active: boolean;
}

// Position/rotation offsets followed by their velocities. One allocation per size.
export const POINTER_STRIDE = 6;
export function createPointerField(count: number) {
  return new Float32Array(count * POINTER_STRIDE);
}

/** Sticky canvas position from cached document geometry; no frame layout reads. */
export function networkViewportTop(
  documentTop: number,
  mainHeight: number,
  viewportHeight: number,
  scrollY: number,
) {
  const travel = Math.max(0, mainHeight - viewportHeight);
  return (
    documentTop - scrollY + Math.max(0, Math.min(travel, scrollY - documentTop))
  );
}

/** Bounded, critically damped cursor pressure without changing the base drift. */
export function advancePointerField(
  nodes: NetworkNode[],
  field: Float32Array,
  pointer: FieldPointer,
  elapsed: number,
  scrollShift = 0,
  ignoreIndex = -1,
) {
  const seconds = Math.max(0, Math.min(elapsed, 0.05));
  if (field.length !== nodes.length * POINTER_STRIDE) return false;
  if (!seconds) return field.some((value) => value !== 0);
  let moving = false;
  const dotDecay = Math.exp(-14 * seconds);
  const equipmentDecay = Math.exp(-7 * seconds);

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i],
      offset = i * POINTER_STRIDE;
    const equipment = node.kind !== 'dot';
    let targetX = 0,
      targetY = 0,
      targetAngle = 0;
    if (pointer.active && i !== ignoreIndex) {
      let dx = node.x - pointer.x;
      const dy = node.y - scrollShift * node.depth - pointer.y;
      const radius = equipment ? 210 + node.radius * 0.4 : 180;
      let squared = dx * dx + dy * dy;
      if (squared < radius * radius) {
        // A coincident cursor has a deterministic direction, never a singularity.
        if (squared < 0.001) {
          dx = 1;
          squared = 1 + dy * dy;
        }
        const distance = Math.sqrt(squared);
        const pressure = (1 - distance / radius) ** 2;
        const displacement = equipment ? 14 : 28;
        targetX = (dx / distance) * displacement * pressure;
        targetY = (dy / distance) * displacement * pressure;
        if (equipment)
          targetAngle = Math.max(
            -0.08,
            Math.min(0.08, (-dx / radius) * pressure * 0.5),
          );
      }
    }

    const frequency = equipment ? 7 : 14;
    const decay = equipment ? equipmentDecay : dotDecay;
    for (let axis = 0; axis < 3; axis++) {
      const target = axis === 0 ? targetX : axis === 1 ? targetY : targetAngle;
      const position = offset + axis,
        velocity = position + 3;
      const delta = field[position] - target;
      const impulse = field[velocity] + frequency * delta;
      field[position] = target + (delta + impulse * seconds) * decay;
      field[velocity] =
        (field[velocity] - frequency * impulse * seconds) * decay;
      if (
        Math.abs(field[position]) < 0.001 &&
        Math.abs(field[velocity]) < 0.01
      ) {
        field[position] = field[velocity] = 0;
      }
      moving ||= field[position] !== 0 || field[velocity] !== 0;
    }

    const limit = equipment ? 16 : 32;
    const magnitude = field[offset] ** 2 + field[offset + 1] ** 2;
    if (magnitude > limit * limit) {
      const scale = limit / Math.sqrt(magnitude);
      field[offset] *= scale;
      field[offset + 1] *= scale;
      field[offset + 3] = field[offset + 4] = 0;
    }
    field[offset + 2] = Math.max(-0.09, Math.min(0.09, field[offset + 2]));
  }
  return moving;
}
