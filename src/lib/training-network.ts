import {
  beginEquipmentDrag,
  finishEquipmentDrag,
  pickEquipment,
  positionEquipmentDrag,
  raiseEquipment,
  type EquipmentDrag,
} from './training-drag';
import {
  advancePointerField,
  createPointerField,
  networkViewportTop,
  POINTER_STRIDE,
  type FieldPointer,
} from './training-interaction';
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
  // Add 20% to the existing dot density, independently of the three equipment nodes.
  const dotCount = Math.round(Math.round((previousCount - 2) * 1.5) * 1.2);
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
  const surface = host.parentElement;
  if (!canvas || !viewport || !context || !surface) return null;

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
  let pointerField = createPointerField(0);
  let fieldSettled = true;
  let equipmentOrder: number[] = [];
  let drag: EquipmentDrag | null = null;
  let hoveredEquipment = -1;
  let canDragHere = true;
  let suppressClick = false;
  let dropCount = 0;
  const cursor = { x: 0, y: 0, active: false };
  const pointer: FieldPointer = { x: 0, y: 0, active: false };
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let listening = false;
  let overControl = false;
  let sceneLeft = 0,
    sceneTop = 0,
    sceneHeight = 0;
  // At most four links can touch the plate; reuse their junction markers.
  const rimJunctions = new Float32Array(12);
  let rimJunctionCount = 0;
  let frame = 0;
  let running = false;
  let last = 0;
  let ready = false;

  function cacheSceneGeometry() {
    const rect = host.getBoundingClientRect();
    sceneLeft = rect.left;
    sceneTop = rect.top + window.scrollY;
    sceneHeight = rect.height;
  }
  const interactiveSurface =
    'a, button, input, textarea, select, summary, label, [contenteditable]';
  // Plain text can sit over visible equipment. Only controls and opaque surfaces
  // block pickup; a heading's full rectangle must not cut holes in the grab area.
  const protectedDragSurface = `${interactiveSurface}, figure, picture, img, .pillars, .section:not(.home-hero):not([data-network-open]), .page-heading:not([data-network-open]), .contact-grid, .content-block, .prose, .service-alternative, .coach-panel, .coach-copy, .service-card, .content-panel, .contact-form, [data-network-drag-ignore]`;
  function updateLocalPointer() {
    pointer.x = cursor.x - sceneLeft;
    pointer.y =
      cursor.y -
      networkViewportTop(sceneTop, sceneHeight, height, window.scrollY);
    pointer.active =
      cursor.active &&
      !drag &&
      pointer.x >= 0 &&
      pointer.x <= width &&
      pointer.y >= 0 &&
      pointer.y <= height;
  }
  function updateAnchors(shift: number) {
    for (let i = 0; i < nodes.length; i++) {
      const offset = i * POINTER_STRIDE;
      anchors[i].x = nodes[i].x + pointerField[offset];
      anchors[i].y =
        nodes[i].y - shift * nodes[i].depth + pointerField[offset + 1];
      anchors[i].angle = nodes[i].angle + pointerField[offset + 2];
    }
  }
  function setGrabHint(index: number) {
    if (drag || hoveredEquipment === index) return;
    hoveredEquipment = index;
    if (index >= 0) surface!.dataset.equipmentPointer = 'grab';
    else delete surface!.dataset.equipmentPointer;
  }
  function endDrag(cancel = false) {
    const active = drag;
    if (!active) return;
    drag = null;
    if (!cancel) {
      updateLocalPointer();
      positionEquipmentDrag(
        active,
        nodes,
        pointer,
        width,
        height,
        window.scrollY * 0.018,
      );
    }
    finishEquipmentDrag(active, nodes, cancel);
    suppressClick = !cancel;
    if (!cancel && active.moved)
      host.dataset.networkDrops = String(++dropCount);
    window.removeEventListener('keydown', dragKey);
    try {
      if (surface!.hasPointerCapture(active.pointerId))
        surface!.releasePointerCapture(active.pointerId);
    } catch {}
    delete surface!.dataset.equipmentPointer;
    hoveredEquipment = -1;
    clearPointer();
    host.dataset.networkDrag = listening ? 'idle' : 'disabled';
    if (!cancel && listening) resumePointerHover();
  }
  function dragKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && drag) {
      event.preventDefault();
      endDrag(true);
    }
  }
  function cancelInteraction() {
    endDrag(true);
    clearPointer();
    setGrabHint(-1);
  }
  function leavePointer() {
    if (!drag) {
      clearPointer();
      setGrabHint(-1);
    }
  }
  function downPointer(event: PointerEvent) {
    suppressClick = false;
    if (
      drag ||
      event.pointerType !== 'mouse' ||
      event.button !== 0 ||
      !event.isPrimary ||
      !(event.target instanceof Element)
    )
      return;
    updatePointerTarget(event.target);
    if (!canDragHere) return;
    cacheSceneGeometry();
    cursor.x = event.clientX;
    cursor.y = event.clientY;
    updateLocalPointer();
    updateAnchors(window.scrollY * 0.018);
    const index = pickEquipment(anchors, pointer, equipmentOrder);
    if (index < 0) return;
    try {
      surface!.setPointerCapture(event.pointerId);
    } catch {
      return;
    }
    drag = beginEquipmentDrag(
      nodes,
      anchors,
      pointerField,
      index,
      pointer,
      event.pointerId,
      window.scrollY * 0.018,
    );
    if (!drag) return;
    event.preventDefault();
    raiseEquipment(equipmentOrder, index);
    clearPointer();
    hoveredEquipment = -1;
    surface!.dataset.equipmentPointer = 'dragging';
    host.dataset.networkDrag = nodes[index].kind;
    window.addEventListener('keydown', dragKey);
  }
  function upPointer(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    cursor.x = event.clientX;
    cursor.y = event.clientY;
    endDrag();
  }
  function lostPointer(event: PointerEvent) {
    if (drag && event.pointerId === drag.pointerId) cancelInteraction();
  }
  function clickPointer(event: MouseEvent) {
    const blocked = suppressClick;
    suppressClick = false;
    if (blocked && event.detail > 0) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  function setPointerActive(active: boolean) {
    if (cursor.active === active) return;
    cursor.active = active;
    host.dataset.networkPointer = active
      ? 'active'
      : listening
        ? 'idle'
        : 'disabled';
  }
  function clearPointer() {
    setPointerActive(false);
  }
  function enterPointer(event: PointerEvent) {
    if (event.pointerType === 'mouse') cacheSceneGeometry();
  }
  function updatePointerTarget(target: EventTarget | null) {
    overControl =
      target instanceof Element && !!target.closest(interactiveSurface);
    canDragHere =
      target instanceof Element && !target.closest(protectedDragSurface);
    if (overControl) clearPointer();
    if (!canDragHere) setGrabHint(-1);
  }
  function overPointer(event: PointerEvent) {
    updatePointerTarget(event.target);
  }
  function resumePointerHover() {
    // Capture retargets release to main. Check the actual surface once on drop,
    // then restore the grab cursor without requiring another mouse movement.
    const target = document.elementFromPoint(cursor.x, cursor.y);
    updatePointerTarget(target);
    setPointerActive(!!target && surface!.contains(target) && !overControl);
    updateLocalPointer();
    updateAnchors(window.scrollY * 0.018);
    setGrabHint(
      pointer.active && canDragHere
        ? pickEquipment(anchors, pointer, equipmentOrder)
        : -1,
    );
  }
  function movePointer(event: PointerEvent) {
    // Coalesce input into the existing frame loop. No drawing/layout in this handler.
    cursor.x = event.clientX;
    cursor.y = event.clientY;
    if (drag) {
      if (event.pointerId === drag.pointerId && !(event.buttons & 1)) endDrag();
      return;
    }
    setPointerActive(
      event.pointerType === 'mouse' && event.buttons === 0 && !overControl,
    );
  }
  function syncPointerInput() {
    const enabled = running && finePointer.matches;
    if (enabled === listening) return;
    listening = enabled;
    if (enabled) {
      cacheSceneGeometry();
      surface!.addEventListener('pointerenter', enterPointer, {
        passive: true,
      });
      surface!.addEventListener('pointerover', overPointer, { passive: true });
      surface!.addEventListener('pointermove', movePointer, { passive: true });
      surface!.addEventListener('pointerleave', leavePointer, {
        passive: true,
      });
      surface!.addEventListener('pointercancel', cancelInteraction, {
        passive: true,
      });
      surface!.addEventListener('pointerdown', downPointer, { passive: false });
      surface!.addEventListener('pointerup', upPointer, { passive: true });
      surface!.addEventListener('lostpointercapture', lostPointer, {
        passive: true,
      });
      surface!.addEventListener('click', clickPointer, true);
      window.addEventListener('blur', cancelInteraction, { passive: true });
    } else {
      cancelInteraction();
      surface!.removeEventListener('pointerenter', enterPointer);
      surface!.removeEventListener('pointerover', overPointer);
      surface!.removeEventListener('pointermove', movePointer);
      surface!.removeEventListener('pointerleave', leavePointer);
      surface!.removeEventListener('pointercancel', cancelInteraction);
      surface!.removeEventListener('pointerdown', downPointer);
      surface!.removeEventListener('pointerup', upPointer);
      surface!.removeEventListener('lostpointercapture', lostPointer);
      surface!.removeEventListener('click', clickPointer, true);
      window.removeEventListener('blur', cancelInteraction);
    }
    overControl = false;
    clearPointer();
    host.dataset.networkPointer = enabled ? 'idle' : 'disabled';
    host.dataset.networkDrag = enabled ? 'idle' : 'disabled';
  }

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
    updateAnchors(window.scrollY * 0.018);
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
    // Paint back-to-front so dragged equipment cleanly occludes lower objects.
    for (const i of equipmentOrder) {
      context.globalAlpha = 1;
      context.globalCompositeOperation = 'destination-out';
      paintEquipment(nodes[i], anchors[i], true);
      context.globalCompositeOperation = 'source-over';
      paintEquipment(nodes[i], anchors[i], false);
      if (nodes[i].kind === 'plate') {
        for (let j = 0; j < rimJunctionCount; j++) {
          const offset = j * 3;
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
      }
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
    context.rotate(anchor.angle ?? node.angle);
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
    const nextWidth = viewport.clientWidth,
      nextHeight = viewport.clientHeight;
    if (nextWidth === 0 || nextHeight === 0) return;
    cacheSceneGeometry();
    // Cap both density and total pixels, including on large Retina displays.
    const nextRatio = Math.min(
      window.devicePixelRatio || 1,
      1.5,
      Math.sqrt(2500000 / (nextWidth * nextHeight)),
    );
    if (nextWidth === width && nextHeight === height && nextRatio === ratio) {
      draw();
      return;
    }
    endDrag(true);
    setGrabHint(-1);
    width = nextWidth;
    height = nextHeight;
    ratio = nextRatio;
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
    equipmentOrder = [];
    for (let i = 0; i < nodes.length; i++)
      if (nodes[i].kind !== 'dot') equipmentOrder.push(i);
    degrees = new Uint8Array(nodes.length);
    pointerField = createPointerField(nodes.length);
    fieldSettled = true;
    host.dataset.networkNodes = String(nodes.length);
    draw();
  }

  function tick(now: number) {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    if (last && now - last < 1000 / 30 - 0.5) return;
    const elapsed = last ? (now - last) / 1000 : 0;
    const scrollY = window.scrollY;
    advanceParticles(nodes, elapsed, width, height);
    if (cursor.active || drag || !fieldSettled) updateLocalPointer();
    if (drag)
      positionEquipmentDrag(
        drag,
        nodes,
        pointer,
        width,
        height,
        scrollY * 0.018,
      );
    else if (pointer.active && canDragHere) {
      updateAnchors(scrollY * 0.018);
      setGrabHint(pickEquipment(anchors, pointer, equipmentOrder));
    } else setGrabHint(-1);
    if (elapsed > 0 && (cursor.active || !fieldSettled)) {
      fieldSettled = !advancePointerField(
        nodes,
        pointerField,
        pointer,
        elapsed,
        scrollY * 0.018,
        hoveredEquipment,
      );
    }
    last = now;
    draw();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);
  resizeObserver.observe(host);
  // Header dismissal and other layout shifts can move main without resizing it.
  resizeObserver.observe(document.body);
  finePointer.addEventListener('change', syncPointerInput);
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
    syncPointerInput();
  }

  return {
    start() {
      if (running) return;
      running = true;
      host.dataset.networkState = 'running';
      syncPointerInput();
      frame = requestAnimationFrame(tick);
    },
    stop,
    destroy() {
      stop();
      resizeObserver.disconnect();
      paletteObserver.disconnect();
      finePointer.removeEventListener('change', syncPointerInput);
      canvas.width = canvas.height = 0;
      delete host.dataset.networkReady;
      delete host.dataset.networkNodes;
      host.dataset.networkPointer = 'disabled';
      host.dataset.networkDrag = 'disabled';
      delete host.dataset.networkDrops;
      host.dataset.networkState = 'disabled';
    },
  };
}
