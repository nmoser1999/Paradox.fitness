import {
  EQUIPMENT_GEOMETRY,
  attachmentPoint,
  connectionBound,
  type ShapeAnchor,
} from './training-equipment';

export interface NetworkNode {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  depth: number;
  angle: number;
  spin: number;
  kind: 'dot' | 'plate' | 'dumbbell' | 'kettlebell';
}

type Anchor = ShapeAnchor;

/** Equipment links attach to their contours; only dots use center-directed rays. */
export function connectionBetween(a: Anchor, b: Anchor, reach: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const outer = a.radius + b.radius;
  const broadOuter = connectionBound(a) + connectionBound(b);
  const squared = dx * dx + dy * dy;
  if (reach <= 0 || squared === 0 || squared >= (broadOuter + reach) ** 2)
    return null;
  const aShaped =
    a.kind === 'plate' || a.kind === 'dumbbell' || a.kind === 'kettlebell';
  const bShaped =
    b.kind === 'plate' || b.kind === 'dumbbell' || b.kind === 'kettlebell';
  if (!aShaped && !bShaped) {
    if (squared <= outer * outer) return null;
    const distance = Math.sqrt(squared);
    return {
      ax: a.x + (dx * a.radius) / distance,
      ay: a.y + (dy * a.radius) / distance,
      bx: b.x - (dx * b.radius) / distance,
      by: b.y - (dy * b.radius) / distance,
      opacity: 0.38 * (1 - (distance - outer) / reach) ** 1.5,
    };
  }
  let from, to;
  if (aShaped && !bShaped) {
    from = attachmentPoint(a, b);
    to = from && attachmentPoint(b, from);
  } else if (!aShaped && bShaped) {
    to = attachmentPoint(b, a);
    from = to && attachmentPoint(a, to);
  } else {
    from = attachmentPoint(a, b);
    to = from && attachmentPoint(b, from);
    from = to && attachmentPoint(a, to);
    to = from && attachmentPoint(b, from);
  }
  if (!from || !to) return null;
  const gap = Math.hypot(to.x - from.x, to.y - from.y);
  if (gap < 0.001 || gap >= reach) return null;
  return {
    ax: from.x,
    ay: from.y,
    bx: to.x,
    by: to.y,
    opacity: 0.38 * (1 - gap / reach) ** 1.5,
  };
}

export function createParticles(width: number, height: number): NetworkNode[] {
  if (width <= 0 || height <= 0) return [];
  const dumbbellRadius = 111.8; // 30% larger than the original 86px scale.
  let seed = 1943;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const previousCount = Math.min(
    42,
    Math.max(22, Math.round((width * height) / 24000)),
  );
  // Increase dots by 50%, independently of the three equipment nodes.
  const dotCount = Math.round((previousCount - 2) * 1.5);
  const count = dotCount + 3;
  const columns = Math.ceil(Math.sqrt((dotCount * width) / height));
  const rows = Math.ceil(dotCount / columns);
  return Array.from({ length: count }, (_, i) => {
    const dot = i - 3;
    return {
      kind:
        i === 0
          ? 'plate'
          : i === 1
            ? 'dumbbell'
            : i === 2
              ? 'kettlebell'
              : 'dot',
      x:
        i === 0
          ? width * 0.075
          : i === 1
            ? Math.min(width * 0.91, width - dumbbellRadius - 8)
            : i === 2
              ? width * 0.82
              : (((dot % columns) + 0.2 + random() * 0.6) * width) / columns,
      y:
        i === 0
          ? height * 0.28
          : i === 1
            ? height * 0.43
            : i === 2
              ? height * 0.115
              : ((Math.floor(dot / columns) + 0.15 + random() * 0.7) * height) /
                rows,
      radius:
        i === 0
          ? 100
          : i === 1
            ? dumbbellRadius
            : i === 2
              ? 68
              : 1.2 + random() * 1.2,
      vx: i < 3 ? (i === 0 ? 3 : i === 1 ? -3 : -2.2) : (random() - 0.5) * 20,
      vy: i < 3 ? (i === 0 ? -2 : i === 1 ? 2 : 3.2) : (random() - 0.5) * 16,
      depth: 0.5 + random(),
      angle: i === 0 ? -0.25 : i === 1 ? -0.35 : i === 2 ? 0.12 : 0,
      spin: i === 0 ? 0.025 : i === 1 ? -0.018 : i === 2 ? 0.016 : 0,
    };
  });
}

export function advanceParticles(
  nodes: NetworkNode[],
  elapsed: number,
  width: number,
  height: number,
) {
  // A resumed or busy tab must never make the scene jump across the screen.
  const seconds = Math.max(0, Math.min(elapsed, 0.05));
  for (const node of nodes) {
    node.x += node.vx * seconds;
    node.y += node.vy * seconds;
    node.angle += node.spin * seconds;
    if (node.x < 8 || node.x > width - 8) {
      node.x = Math.max(8, Math.min(width - 8, node.x));
      node.vx = node.x === 8 ? Math.abs(node.vx) : -Math.abs(node.vx);
    }
    if (node.y < 8 || node.y > height - 8) {
      node.y = Math.max(8, Math.min(height - 8, node.y));
      node.vy = node.y === 8 ? Math.abs(node.vy) : -Math.abs(node.vy);
    }
  }
}

export function createTrainingNetwork(host: HTMLElement) {
  const canvas = host.querySelector<HTMLCanvasElement>('canvas');
  const viewport = host.querySelector<HTMLElement>('.atmosphere-window');
  const context = canvas?.getContext('2d');
  if (!canvas || !viewport || !context) return null;

  // Drawing, occlusion, and attachment calculations share one geometry catalog.
  const cacheGeometry = (
    shape: (typeof EQUIPMENT_GEOMETRY)[keyof typeof EQUIPMENT_GEOMETRY],
  ) => ({
    ...shape,
    path: new Path2D(shape.path),
    mask: new Path2D(shape.silhouette),
  });
  const equipment = {
    plate: cacheGeometry(EQUIPMENT_GEOMETRY.plate),
    dumbbell: cacheGeometry(EQUIPMENT_GEOMETRY.dumbbell),
    kettlebell: cacheGeometry(EQUIPMENT_GEOMETRY.kettlebell),
  };

  let width = 0;
  let height = 0;
  let ratio = 1;
  let color = getComputedStyle(host).color;
  let nodes: NetworkNode[] = [];
  let anchors: Anchor[] = [];
  let degrees = new Uint8Array(0);
  // At most four links can touch the plate; reuse their junction markers.
  const rimJunctions = new Float32Array(12);
  let rimJunctionCount = 0;
  let frame = 0;
  let running = false;
  let last = 0;
  let ready = false;

  // Fade toward the middle to keep text and calls to action visually dominant.
  const clarity = (x: number) =>
    0.38 + 0.62 * Math.min(1, Math.abs(x - width / 2) / (width * 0.4));

  function draw() {
    if (!canvas || !context || width === 0 || height === 0) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 0.75;
    degrees.fill(0);
    rimJunctionCount = 0;
    const shift = window.scrollY * 0.018;
    for (let i = 0; i < nodes.length; i++) {
      anchors[i].x = nodes[i].x;
      anchors[i].y = nodes[i].y - shift * nodes[i].depth;
      anchors[i].angle = nodes[i].angle;
    }
    let edges = 0;
    const reach = Math.min(210, Math.max(145, width * 0.16));
    for (let i = 0; i < anchors.length && edges < 64; i++) {
      for (
        let j = i + 1;
        j < anchors.length && edges < 64 && degrees[i] < 4;
        j++
      ) {
        if (degrees[j] >= 4) continue;
        const link = connectionBetween(anchors[i], anchors[j], reach);
        if (!link) continue;
        context.globalAlpha = link.opacity * clarity((link.ax + link.bx) / 2);
        context.beginPath();
        // A tiny overlap lets the exact native mask remove sampling/seam gaps.
        const length = Math.hypot(link.bx - link.ax, link.by - link.ay);
        const ux = (link.bx - link.ax) / length;
        const uy = (link.by - link.ay) / length;
        const aPad = anchors[i].kind === 'dot' ? 0 : 1.5;
        const bPad = anchors[j].kind === 'dot' ? 0 : 1.5;
        context.moveTo(link.ax - ux * aPad, link.ay - uy * aPad);
        context.lineTo(link.bx + ux * bPad, link.by + uy * bPad);
        context.stroke();
        const aRim = anchors[i].kind === 'plate';
        if ((aRim || anchors[j].kind === 'plate') && rimJunctionCount < 4) {
          const offset = rimJunctionCount++ * 3;
          rimJunctions[offset] = aRim ? link.ax : link.bx;
          rimJunctions[offset + 1] = aRim ? link.ay : link.by;
          rimJunctions[offset + 2] = context.globalAlpha;
        }
        degrees[i]++;
        degrees[j]++;
        edges++;
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.kind !== 'dot') continue;
      const anchor = anchors[i];
      context.globalAlpha = 0.62 * clarity(anchor.x);
      context.beginPath();
      context.arc(anchor.x, anchor.y, node.radius, 0, Math.PI * 2);
      context.fill();
    }
    // Erase ALL network marks beneath equipment, not only direct connections.
    // The same local transform is used for masking and drawing each silhouette.
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].kind !== 'dot') paintEquipment(nodes[i], anchors[i], true);
    }
    context.globalCompositeOperation = 'source-over';
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].kind !== 'dot') paintEquipment(nodes[i], anchors[i], false);
    }
    // Draw explicit contact nodes on top of the outline after occlusion.
    for (let i = 0; i < rimJunctionCount; i++) {
      const offset = i * 3;
      context.globalAlpha = rimJunctions[offset + 2];
      context.beginPath();
      context.arc(
        rimJunctions[offset],
        rimJunctions[offset + 1],
        1.6,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
    context.globalAlpha = 1;
    if (!ready) {
      ready = true;
      host.dataset.networkReady = 'true';
    }
  }

  function paintEquipment(node: NetworkNode, anchor: Anchor, erase: boolean) {
    if (!context || node.kind === 'dot') return;
    const glyph = equipment[node.kind];
    context.save();
    context.translate(anchor.x, anchor.y);
    context.rotate(node.angle);
    const scale = node.radius / glyph.radius;
    context.scale(scale, scale);
    context.translate(-glyph.x, -glyph.y);
    context.lineWidth = 1.25;
    if (erase) {
      context.fill(glyph.mask);
      context.stroke(glyph.mask);
    } else {
      context.globalAlpha = 0.18 * clarity(anchor.x);
      context.stroke(glyph.path);
    }
    context.restore();
  }

  function resize() {
    if (!canvas || !viewport || !context) return;
    width = viewport.clientWidth;
    height = viewport.clientHeight;
    if (width === 0 || height === 0) return;
    // Cap both density and total pixels, including on large Retina displays.
    ratio = Math.min(
      window.devicePixelRatio || 1,
      1.5,
      Math.sqrt(2500000 / (width * height)),
    );
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    nodes = createParticles(width, height);
    anchors = nodes.map(({ x, y, radius, kind, angle }) => ({
      x,
      y,
      radius,
      kind,
      angle,
    }));
    degrees = new Uint8Array(nodes.length);
    host.dataset.networkNodes = String(nodes.length);
    draw();
  }

  function tick(now: number) {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    if (last && now - last < 1000 / 30 - 0.5) return;
    advanceParticles(nodes, last ? (now - last) / 1000 : 0, width, height);
    last = now;
    draw();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);
  const paletteObserver = new MutationObserver(() => {
    color = getComputedStyle(host).color;
    draw();
  });
  paletteObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-mode'],
  });
  resize();

  function stop() {
    running = false;
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    host.dataset.networkState = 'paused';
  }

  return {
    start() {
      if (running) return;
      running = true;
      host.dataset.networkState = 'running';
      frame = requestAnimationFrame(tick);
    },
    stop,
    destroy() {
      stop();
      resizeObserver.disconnect();
      paletteObserver.disconnect();
      canvas.width = canvas.height = 0;
      delete host.dataset.networkReady;
      delete host.dataset.networkNodes;
      host.dataset.networkState = 'disabled';
    },
  };
}
