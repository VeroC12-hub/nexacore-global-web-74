import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Force-directed org graph on canvas.
 *
 * Renders people and AI agents in the same hierarchy, which is the point of
 * the platform: an agent is an org-chart citizen, not a feature. Entity kind
 * is encoded by SHAPE as well as colour so it survives greyscale and colour
 * blindness (circle = person, cut-corner = agent, diamond = tool,
 * rhombus = project, rounded square = department).
 *
 * Canvas rather than SVG because node counts grow with the org and per-node
 * DOM gets expensive fast.
 */

export type NodeKind = 'unit' | 'human' | 'agent' | 'tool' | 'project';

export interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  sub?: string;
  r: number;
  /** Held at the centre (the company root). */
  pin?: boolean;
  /** Installed/enabled: draws an accent ring. */
  live?: boolean;
  /** Needs attention: draws a warning arc. */
  risk?: boolean;
  // simulation state
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string;
  target: string;
}

interface Props {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedId: string | null;
  visibleKinds: Set<NodeKind>;
  onSelect: (id: string | null) => void;
  className?: string;
}

const KIND_COLOR: Record<NodeKind, string> = {
  human: '#4C87B8',
  agent: '#C2763F',
  tool: '#6B8593',
  project: '#8A97A2',
  unit: '#5F7686',
};

export function OrgGraph({ nodes, links, selectedId, visibleKinds, onSelect, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>();
  const hoverRef = useRef<GraphNode | null>(null);
  const dragRef = useRef<GraphNode | null>(null);
  const viewRef = useRef({ x: 0, y: 0, scale: 1 });
  // Simulation state lives outside React: mutating 60x/sec through state
  // would re-render the whole tree every frame.
  const simRef = useRef<{ nodes: GraphNode[]; adj: Map<string, Set<string>> }>({
    nodes: [],
    adj: new Map(),
  });

  // Rebuild the simulation only when the graph's shape actually changes.
  const shapeKey = `${nodes.map((n) => n.id).join(',')}|${links.length}`;
  useEffect(() => {
    const seeded = nodes.map((n, i) => {
      const ring = n.kind === 'unit' ? (n.pin ? 0 : 1) : n.kind === 'tool' || n.kind === 'project' ? 3 : 2;
      const a = (i / Math.max(nodes.length, 1)) * Math.PI * 2;
      return {
        ...n,
        x: n.pin ? 0 : Math.cos(a) * (ring * 130 + 40),
        y: n.pin ? 0 : Math.sin(a) * (ring * 130 + 40),
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
      };
    });
    const adj = new Map<string, Set<string>>(seeded.map((n) => [n.id, new Set<string>()]));
    for (const l of links) {
      adj.get(l.source)?.add(l.target);
      adj.get(l.target)?.add(l.source);
    }
    simRef.current = { nodes: seeded, adj };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapeKey]);

  const cssVar = useCallback((name: string) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v ? `hsl(${v})` : '#888';
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      viewRef.current = { x: W / 2, y: H / 2, scale: Math.min(1, Math.min(W, H) / 760) };
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const visible = (n: GraphNode) => visibleKinds.has(n.kind);

    const step = () => {
      const { nodes: ns } = simRef.current;
      const vis = ns.filter(visible);

      for (let i = 0; i < vis.length; i++) {
        const a = vis[i];
        for (let j = i + 1; j < vis.length; j++) {
          const b = vis[j];
          const dx = b.x! - a.x!;
          const dy = b.y! - a.y!;
          const d2 = dx * dx + dy * dy || 0.01;
          if (d2 > 90000) continue;
          const d = Math.sqrt(d2);
          const min = a.r + b.r + 26;
          const push = ((min * min * 1.9) / d2) * 0.05;
          const ux = dx / d;
          const uy = dy / d;
          if (a.fx == null) { a.vx! -= ux * push; a.vy! -= uy * push; }
          if (b.fx == null) { b.vx! += ux * push; b.vy! += uy * push; }
        }
      }

      const byId = new Map(ns.map((n) => [n.id, n]));
      for (const l of links) {
        const s = byId.get(l.source);
        const t = byId.get(l.target);
        if (!s || !t || !visible(s) || !visible(t)) continue;
        const dx = t.x! - s.x!;
        const dy = t.y! - s.y!;
        const d = Math.hypot(dx, dy) || 0.01;
        const rest = s.pin ? 170 : t.kind === 'tool' ? 74 : 116;
        const f = (d - rest) * 0.012;
        const ux = dx / d;
        const uy = dy / d;
        if (s.fx == null) { s.vx! += ux * f; s.vy! += uy * f; }
        if (t.fx == null) { t.vx! -= ux * f; t.vy! -= uy * f; }
      }

      for (const n of ns) {
        if (n.fx != null) { n.x = n.fx; n.y = n.fy!; n.vx = 0; n.vy = 0; continue; }
        const pull = n.pin ? 0.08 : 0.0016;
        n.vx! += (0 - n.x!) * pull;
        n.vy! += (0 - n.y!) * pull;
        n.vx! *= 0.86;
        n.vy! *= 0.86;
        n.x! += n.vx!;
        n.y! += n.vy!;
      }
    };

    const shape = (n: GraphNode, x: number, y: number, r: number) => {
      ctx.beginPath();
      if (n.kind === 'human') {
        ctx.arc(x, y, r, 0, Math.PI * 2);
      } else if (n.kind === 'agent') {
        const cut = r * 0.62;
        ctx.moveTo(x - r, y - r);
        ctx.lineTo(x + r, y - r);
        ctx.lineTo(x + r, y + r - cut);
        ctx.lineTo(x + r - cut, y + r);
        ctx.lineTo(x - r, y + r);
        ctx.closePath();
      } else if (n.kind === 'tool' || n.kind === 'project') {
        const w = n.kind === 'project' ? r * 0.92 : r;
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - w, y);
        ctx.closePath();
      } else {
        ctx.roundRect(x - r, y - r, r * 2, r * 2, r * 0.32);
      }
      ctx.fill();
    };

    const draw = () => {
      const { nodes: ns, adj } = simRef.current;
      const byId = new Map(ns.map((n) => [n.id, n]));
      const view = viewRef.current;
      const near = (n: GraphNode) => !selectedId || n.id === selectedId || adj.get(selectedId)?.has(n.id);

      const cBorder = cssVar('--border');
      const cText = cssVar('--foreground');
      const cPrimary = cssVar('--primary');
      const cRisk = cssVar('--destructive');

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(view.x, view.y);
      ctx.scale(view.scale, view.scale);

      for (const l of links) {
        const s = byId.get(l.source);
        const t = byId.get(l.target);
        if (!s || !t || !visible(s) || !visible(t)) continue;
        const hot = selectedId && (s.id === selectedId || t.id === selectedId);
        ctx.globalAlpha = hot ? 0.85 : selectedId ? 0.1 : 0.28;
        ctx.strokeStyle = hot ? cPrimary : cBorder;
        ctx.lineWidth = hot ? 1.7 : 1;
        ctx.beginPath();
        ctx.moveTo(s.x!, s.y!);
        ctx.lineTo(t.x!, t.y!);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      for (const n of ns) {
        if (!visible(n)) continue;
        const dim = selectedId ? !near(n) : false;
        const r = hoverRef.current?.id === n.id ? n.r * 1.12 : n.r;
        ctx.globalAlpha = dim ? 0.18 : 1;
        ctx.fillStyle = KIND_COLOR[n.kind];
        shape(n, n.x!, n.y!, r);

        if (n.live) {
          ctx.strokeStyle = cPrimary;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(n.x!, n.y!, r + 5, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (n.risk) {
          ctx.strokeStyle = cRisk;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(n.x!, n.y!, r + 4, -0.5, 1.6);
          ctx.stroke();
        }

        if (!dim && (n.r >= 12 || hoverRef.current?.id === n.id || n.id === selectedId)) {
          ctx.fillStyle = cText;
          ctx.font = `${n.r >= 16 ? 600 : 500} ${Math.max(10, Math.min(13, n.r * 0.72))}px ui-sans-serif, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const label = n.label.length > 26 ? `${n.label.slice(0, 25)}…` : n.label;
          ctx.fillText(label, n.x!, n.y! + r + 5);
        }
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      for (let i = 0; i < 400; i++) step();
      draw();
    } else {
      const loop = () => {
        step();
        draw();
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    }

    const toWorld = (e: PointerEvent | MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const v = viewRef.current;
      return { x: (e.clientX - rect.left - v.x) / v.scale, y: (e.clientY - rect.top - v.y) / v.scale };
    };
    const hit = (p: { x: number; y: number }) => {
      let best: GraphNode | null = null;
      let bd = Infinity;
      for (const n of simRef.current.nodes) {
        if (!visible(n)) continue;
        const d = Math.hypot(n.x! - p.x, n.y! - p.y);
        if (d < n.r + 7 && d < bd) { bd = d; best = n; }
      }
      return best;
    };

    const onMove = (e: PointerEvent) => {
      const p = toWorld(e);
      if (dragRef.current) { dragRef.current.fx = p.x; dragRef.current.fy = p.y; return; }
      const h = hit(p);
      hoverRef.current = h;
      canvas.style.cursor = h ? 'pointer' : 'grab';
      canvas.title = h ? `${h.label}${h.sub ? ` — ${h.sub}` : ''}` : '';
    };
    const onDown = (e: PointerEvent) => {
      const n = hit(toWorld(e));
      if (!n) { onSelect(null); return; }
      dragRef.current = n;
      n.fx = n.x!;
      n.fy = n.y!;
      canvas.setPointerCapture(e.pointerId);
      onSelect(n.id);
    };
    const onUp = () => { dragRef.current = null; };
    const onDbl = (e: MouseEvent) => {
      const n = hit(toWorld(e));
      if (n) { n.fx = null; n.fy = null; }
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('dblclick', onDbl);

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('dblclick', onDbl);
    };
  }, [links, selectedId, visibleKinds, onSelect, cssVar, shapeKey]);

  return (
    <div ref={wrapRef} className={className} style={{ position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', cursor: 'grab' }} />
    </div>
  );
}

export { KIND_COLOR };
