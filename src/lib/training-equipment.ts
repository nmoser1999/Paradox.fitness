export type EquipmentKind = 'plate' | 'dumbbell' | 'kettlebell';
export interface Point {
  x: number;
  y: number;
}
type Command =
  ['L', number, number] | ['C', number, number, number, number, number, number];

function curvedOutline(start: Point, commands: Command[]) {
  const points: Point[] = [start];
  let current = start;
  let path = `M${start.x} ${start.y}`;
  for (const command of commands) {
    path += command[0] + command.slice(1).join(' ');
    if (command[0] === 'L') {
      current = { x: command[1], y: command[2] };
      points.push(current);
    } else {
      const [, x1, y1, x2, y2, x, y] = command;
      for (let step = 1; step <= 20; step++) {
        const t = step / 20,
          u = 1 - t;
        points.push({
          x:
            u ** 3 * current.x +
            3 * u ** 2 * t * x1 +
            3 * u * t ** 2 * x2 +
            t ** 3 * x,
          y:
            u ** 3 * current.y +
            3 * u ** 2 * t * y1 +
            3 * u * t ** 2 * y2 +
            t ** 3 * y,
        });
      }
      current = { x, y };
    }
  }
  return { path: path + 'Z', points };
}

function roundedRectangle(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const right = x + width,
    bottom = y + height;
  const path = `M${x + radius} ${y}H${right - radius}A${radius} ${radius} 0 0 1 ${right} ${y + radius}V${bottom - radius}A${radius} ${radius} 0 0 1 ${right - radius} ${bottom}H${x + radius}A${radius} ${radius} 0 0 1 ${x} ${bottom - radius}V${y + radius}A${radius} ${radius} 0 0 1 ${x + radius} ${y}Z`;
  const points: Point[] = [];
  const corners = [
    [right - radius, y + radius, -Math.PI / 2],
    [right - radius, bottom - radius, 0],
    [x + radius, bottom - radius, Math.PI / 2],
    [x + radius, y + radius, Math.PI],
  ];
  for (const [cx, cy, angle] of corners) {
    for (let step = 0; step <= 8; step++) {
      const a = angle + (step * Math.PI) / 16;
      points.push({
        x: cx + radius * Math.cos(a),
        y: cy + radius * Math.sin(a),
      });
    }
  }
  return { path, points };
}

function circlePath(x: number, y: number, radius: number) {
  return `M${x + radius} ${y}A${radius} ${radius} 0 1 1 ${x - radius} ${y}A${radius} ${radius} 0 1 1 ${x + radius} ${y}Z`;
}

const dumbbellParts = [
  roundedRectangle(82, 76, 116, 8, 2),
  roundedRectangle(61, 33, 21, 94, 5),
  roundedRectangle(43, 48, 18, 64, 4),
  roundedRectangle(198, 33, 21, 94, 5),
  roundedRectangle(219, 48, 18, 64, 4),
  roundedRectangle(27, 76, 16, 8, 1),
  roundedRectangle(237, 76, 16, 8, 1),
];
const dumbbellSilhouette = dumbbellParts.map((part) => part.path).join('');
const kettlebellOuter = curvedOutline({ x: 58, y: 82 }, [
  ['L', 50, 57],
  ['C', 45, 28, 65, 12, 100, 12],
  ['C', 135, 12, 155, 28, 150, 57],
  ['L', 142, 82],
  ['C', 164, 97, 179, 121, 179, 148],
  ['C', 179, 177, 161, 202, 146, 208],
  ['L', 54, 208],
  ['C', 39, 202, 21, 177, 21, 148],
  ['C', 21, 121, 36, 97, 58, 82],
]);

// Each interior detail is a complete contour. Keeping the body's shoulder
// joined to both side curves avoids the gaps from separate highlight strokes.
const kettlebellHandle = curvedOutline({ x: 76, y: 76 }, [
  ['L', 69, 55],
  ['C', 66, 42, 78, 32, 100, 32],
  ['C', 122, 32, 134, 42, 131, 55],
  ['L', 124, 76],
  ['C', 109, 72, 91, 72, 76, 76],
]);
const kettlebellInset = curvedOutline({ x: 54, y: 104 }, [
  ['C', 36, 132, 40, 169, 62, 185],
  ['L', 138, 185],
  ['C', 160, 169, 164, 132, 146, 104],
  ['C', 134, 86, 120, 82, 100, 82],
  ['C', 80, 82, 66, 86, 54, 104],
]);

// One top-centred 20 KG stamp; canvas and fallback SVG share this vector path.
const plateWeightStrokes = [
  [
    [0, 2],
    [0, 1],
    [1, 0],
    [6, 0],
    [7, 1],
    [7, 3],
    [6, 4],
    [0, 10],
    [7, 10],
  ],
  [
    [12, 0],
    [16, 0],
    [17, 1],
    [17, 9],
    [16, 10],
    [12, 10],
    [11, 9],
    [11, 1],
    [12, 0],
  ],
  [
    [23, 0],
    [23, 10],
  ],
  [
    [30, 0],
    [23, 5],
    [30, 10],
  ],
  [
    [42, 2],
    [40, 0],
    [36, 0],
    [34, 2],
    [34, 8],
    [36, 10],
    [40, 10],
    [42, 8],
    [42, 5],
    [38, 5],
  ],
];
const plateWeightMark = plateWeightStrokes
  .map((stroke) =>
    stroke
      .map(([x, y], i) => {
        const px = Math.round((94.8 + x * 1.2) * 10) / 10,
          py = Math.round((74 + y * 1.2) * 10) / 10;
        return `${i ? 'L' : 'M'}${px} ${py}`;
      })
      .join(''),
  )
  .join('');

// Shared unlettered plate for small icons; the field adds its weight stamp.
export const PLATE_OUTLINE_PATH =
  [108, 96, 22, 14].map((r) => circlePath(120, 120, r)).join('') +
  'M83 43a84 84 0 0 1 74 0l-8 17a65 65 0 0 0-58 0zM157 197a84 84 0 0 1-74 0l8-17a65 65 0 0 0 58 0zM43 157a84 84 0 0 1 0-74l17 8a65 65 0 0 0 0 58zM197 83a84 84 0 0 1 0 74l-17-8a65 65 0 0 0 0-58zM52 52l9 9m118 118 9 9M52 188l9-9M179 61l9-9';

export const EQUIPMENT_GEOMETRY = {
  plate: {
    x: 120,
    y: 120,
    radius: 108,
    silhouette: circlePath(120, 120, 108),
    path: PLATE_OUTLINE_PATH + plateWeightMark,
    boundaries: [] as Point[][],
  },
  dumbbell: {
    x: 140,
    y: 80,
    radius: 126,
    silhouette: dumbbellSilhouette,
    path: dumbbellSilhouette,
    boundaries: dumbbellParts.map((part) => part.points),
  },
  kettlebell: {
    x: 100,
    y: 110,
    radius: 100,
    silhouette: kettlebellOuter.path,
    path: kettlebellOuter.path + kettlebellHandle.path + kettlebellInset.path,
    boundaries: [kettlebellOuter.points],
  },
};

// Derive broad-phase bounds once from the same contact contours. The bell's
// bottom corners extend beyond its nominal drawing scale.
function boundRatio(shape: (typeof EQUIPMENT_GEOMETRY)[EquipmentKind]) {
  return (
    Math.max(
      ...shape.boundaries.flatMap((boundary) =>
        boundary.map((point) =>
          Math.hypot(point.x - shape.x, point.y - shape.y),
        ),
      ),
    ) / shape.radius
  );
}
const boundRatios = {
  plate: 1,
  dumbbell: boundRatio(EQUIPMENT_GEOMETRY.dumbbell),
  kettlebell: boundRatio(EQUIPMENT_GEOMETRY.kettlebell),
};

export interface ShapeAnchor extends Point {
  radius: number;
  kind?: 'dot' | EquipmentKind;
  angle?: number;
}

export function connectionBound(anchor: ShapeAnchor) {
  return (
    anchor.radius *
    (anchor.kind && anchor.kind !== 'dot' ? boundRatios[anchor.kind] : 1)
  );
}

function contains(point: Point, polygon: Point[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i],
      b = polygon[j];
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    )
      inside = !inside;
  }
  return inside;
}

/** Closest visible surface, using the same origin/scale/rotation as the drawing. */
export function attachmentPoint(
  anchor: ShapeAnchor,
  target: Point,
): Point | null {
  if (!anchor.kind || anchor.kind === 'dot' || anchor.kind === 'plate') {
    const dx = target.x - anchor.x,
      dy = target.y - anchor.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= anchor.radius) return null;
    if (anchor.kind === 'plate') {
      // Sixteen physical rim positions rotate with the plate. Links aim at a
      // nearby rim junction rather than converging toward the center hub.
      const phase = anchor.angle || 0;
      const step = Math.PI / 8;
      const angle =
        phase + Math.round((Math.atan2(dy, dx) - phase) / step) * step;
      const x = Math.cos(angle),
        y = Math.sin(angle);
      // A visible junction must face its neighbor, keeping the segment outside.
      if (dx * x + dy * y < anchor.radius) return null;
      return {
        x: anchor.x + x * anchor.radius,
        y: anchor.y + y * anchor.radius,
      };
    }
    return {
      x: anchor.x + (dx * anchor.radius) / distance,
      y: anchor.y + (dy * anchor.radius) / distance,
    };
  }
  const shape = EQUIPMENT_GEOMETRY[anchor.kind];
  const scale = anchor.radius / shape.radius;
  const cosine = Math.cos(anchor.angle || 0),
    sine = Math.sin(anchor.angle || 0);
  const dx = target.x - anchor.x,
    dy = target.y - anchor.y;
  const local = {
    x: (dx * cosine + dy * sine) / scale + shape.x,
    y: (-dx * sine + dy * cosine) / scale + shape.y,
  };
  if (shape.boundaries.some((boundary) => contains(local, boundary)))
    return null;
  let best = Infinity;
  let closest: Point | null = null;
  for (const boundary of shape.boundaries) {
    for (let i = 0; i < boundary.length; i++) {
      const a = boundary[i],
        b = boundary[(i + 1) % boundary.length];
      const vx = b.x - a.x,
        vy = b.y - a.y;
      const length = vx * vx + vy * vy;
      const t = length
        ? Math.max(
            0,
            Math.min(1, ((local.x - a.x) * vx + (local.y - a.y) * vy) / length),
          )
        : 0;
      const x = a.x + t * vx,
        y = a.y + t * vy;
      const distance = (local.x - x) ** 2 + (local.y - y) ** 2;
      if (distance < best) {
        best = distance;
        closest = { x, y };
      }
    }
  }
  if (!closest) return null;
  const x = (closest.x - shape.x) * scale,
    y = (closest.y - shape.y) * scale;
  return {
    x: anchor.x + x * cosine - y * sine,
    y: anchor.y + x * sine + y * cosine,
  };
}
