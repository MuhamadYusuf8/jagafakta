"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { GraphData, GraphNode, GraphEdge } from "@/app/api/graph/route";

const REPULSION = 6000;
const ATTRACTION = 0.004;
const IDEAL_EDGE_LEN = 160;
const DAMPING = 0.82;
const CENTER_FORCE = 0.025;

interface SimNode extends GraphNode {
  x: number; y: number; vx: number; vy: number;
}

function buildSimNodes(nodes: GraphNode[], w: number, h: number): SimNode[] {
  return nodes.map((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2;
    const r = Math.min(w, h) * 0.3;
    return { ...n, x: w / 2 + Math.cos(angle) * r + (Math.random() - 0.5) * 40, y: h / 2 + Math.sin(angle) * r + (Math.random() - 0.5) * 40, vx: 0, vy: 0 };
  });
}

function tick(nodes: SimNode[], edges: GraphEdge[], w: number, h: number, dragId: string | null) {
  const cx = w / 2, cy = h / 2;
  for (const n of nodes) { if (n.id === dragId) continue; n.vx += (cx - n.x) * CENTER_FORCE; n.vy += (cy - n.y) * CENTER_FORCE; }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const f = REPULSION / (dist * dist);
      const nx = dx / dist, ny = dy / dist;
      if (a.id !== dragId) { a.vx -= f * nx; a.vy -= f * ny; }
      if (b.id !== dragId) { b.vx += f * nx; b.vy += f * ny; }
      const minD = (a.size + b.size) * 1.5;
      if (dist < minD) { const p = (minD - dist) * 0.5; if (a.id !== dragId) { a.vx -= p * nx; a.vy -= p * ny; } if (b.id !== dragId) { b.vx += p * nx; b.vy += p * ny; } }
    }
  }
  for (const e of edges) {
    const s = nodes.find(n => n.id === e.source), t = nodes.find(n => n.id === e.target);
    if (!s || !t) continue;
    const dx = t.x - s.x, dy = t.y - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
    const stretch = (dist - IDEAL_EDGE_LEN) * ATTRACTION * e.strength;
    const nx = dx / dist, ny = dy / dist;
    if (s.id !== dragId) { s.vx += stretch * nx; s.vy += stretch * ny; }
    if (t.id !== dragId) { t.vx -= stretch * nx; t.vy -= stretch * ny; }
  }
  const pad = 60;
  for (const n of nodes) {
    if (n.id === dragId) continue;
    n.vx *= DAMPING; n.vy *= DAMPING;
    n.x = Math.max(pad, Math.min(w - pad, n.x + n.vx));
    n.y = Math.max(pad, Math.min(h - pad, n.y + n.vy));
  }
}

let dashOffset = 0;
function lighten(hex: string, a: number): string {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgb(${Math.min(255,r+a)},${Math.min(255,g+a)},${Math.min(255,b+a)})`;
}

function draw(ctx: CanvasRenderingContext2D, nodes: SimNode[], edges: GraphEdge[], hovered: SimNode | null, tr: {x:number;y:number;scale:number}) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(tr.x, tr.y);
  ctx.scale(tr.scale, tr.scale);
  dashOffset = (dashOffset - 0.4) % 20;

  for (const e of edges) {
    const s = nodes.find(n => n.id === e.source), t = nodes.find(n => n.id === e.target);
    if (!s || !t) continue;
    const hi = hovered?.id === s.id || hovered?.id === t.id;
    const alpha = hi ? 0.75 : e.strength * 0.3;
    const grad = ctx.createLinearGradient(s.x, s.y, t.x, t.y);
    grad.addColorStop(0, s.color + Math.round(alpha*255).toString(16).padStart(2,"0"));
    grad.addColorStop(1, t.color + Math.round(alpha*255).toString(16).padStart(2,"0"));
    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y);
    ctx.strokeStyle = grad; ctx.lineWidth = hi ? 2.5 : 1.2;
    ctx.setLineDash(hi ? [] : [6,6]); ctx.lineDashOffset = dashOffset;
    ctx.shadowBlur = hi ? 10 : 0; ctx.shadowColor = s.color;
    ctx.stroke(); ctx.setLineDash([]); ctx.shadowBlur = 0;
  }

  for (const n of nodes) {
    const isH = hovered?.id === n.id;
    ctx.beginPath(); ctx.arc(n.x, n.y, n.size * 1.6, 0, Math.PI*2);
    ctx.fillStyle = n.color + (isH ? "22" : "0D"); ctx.fill();
    if (isH) { ctx.beginPath(); ctx.arc(n.x, n.y, n.size * 2, 0, Math.PI*2); ctx.strokeStyle = n.color + "33"; ctx.lineWidth = 2; ctx.stroke(); }
    const g = ctx.createRadialGradient(n.x - n.size*0.3, n.y - n.size*0.3, 0, n.x, n.y, n.size);
    g.addColorStop(0, lighten(n.color, 40)); g.addColorStop(1, n.color);
    ctx.beginPath(); ctx.arc(n.x, n.y, n.size, 0, Math.PI*2);
    ctx.shadowBlur = isH ? 30 : 14; ctx.shadowColor = n.color; ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = n.color + (isH ? "FF" : "99"); ctx.lineWidth = isH ? 2.5 : 1.5; ctx.stroke(); ctx.shadowBlur = 0;
    const fs = Math.max(9, Math.min(13, n.size * 0.52));
    ctx.font = `600 ${fs}px Inter,sans-serif`; ctx.fillStyle = "#FFF"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowBlur = 4; ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.fillText(n.label, n.x, n.y); ctx.shadowBlur = 0;
  }
  ctx.restore();
}

function hitTest(nodes: SimNode[], cx: number, cy: number, tr: {x:number;y:number;scale:number}): SimNode | null {
  const wx = (cx - tr.x) / tr.scale, wy = (cy - tr.y) / tr.scale;
  let best: SimNode | null = null, bd = Infinity;
  for (const n of nodes) { const d = Math.hypot(wx - n.x, wy - n.y); if (d < n.size * 1.4 && d < bd) { best = n; bd = d; } }
  return best;
}

const CATEGORY_LABELS: Record<string, string> = { kesehatan:"Kesehatan", politik:"Politik", ekonomi:"Ekonomi", teknologi:"Teknologi", agama:"Agama", bencana:"Bencana", sosial:"Sosial" };

export default function HoaxGraph({ data }: { data: GraphData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const rafRef = useRef<number>(0);
  const tr = useRef({ x: 0, y: 0, scale: 1 });
  const drag = useRef<{ nodeId: string|null; isPan: boolean }>({ nodeId: null, isPan: false });
  const panStart = useRef({ tx:0, ty:0, mx:0, my:0 });
  const ticks = useRef(0);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [simRunning, setSimRunning] = useState(true);

  const initSim = useCallback((w: number, h: number) => {
    nodesRef.current = buildSimNodes(data.nodes, w, h);
    ticks.current = 0; setSimRunning(true);
  }, [data.nodes]);

  useEffect(() => {
    const canvas = canvasRef.current!, container = containerRef.current!;
    const ro = new ResizeObserver(() => {
      canvas.width = container.clientWidth; canvas.height = container.clientHeight;
      if (nodesRef.current.length === 0) initSim(canvas.width, canvas.height);
    });
    ro.observe(container);
    canvas.width = container.clientWidth; canvas.height = container.clientHeight;
    initSim(canvas.width, canvas.height);
    const ctx = canvas.getContext("2d")!;
    function loop() {
      const { width: w, height: h } = canvas;
      if (ticks.current < 280 || drag.current.nodeId) {
        tick(nodesRef.current, data.edges, w, h, drag.current.nodeId);
        if (ticks.current < 280) { ticks.current++; if (ticks.current === 280) setSimRunning(false); }
      }
      const hov = hoveredNode ? nodesRef.current.find(n => n.id === hoveredNode.id) || null : null;
      draw(ctx, nodesRef.current, data.edges, hov, tr.current);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, initSim]);

  const xy = (e: React.MouseEvent) => { const r = canvasRef.current!.getBoundingClientRect(); return { cx: e.clientX - r.left, cy: e.clientY - r.top }; };

  const onMouseMove = (e: React.MouseEvent) => {
    const { cx, cy } = xy(e);
    if (drag.current.nodeId) {
      const wx = (cx - tr.current.x) / tr.current.scale, wy = (cy - tr.current.y) / tr.current.scale;
      const node = nodesRef.current.find(n => n.id === drag.current.nodeId);
      if (node) { node.x = wx; node.y = wy; node.vx = 0; node.vy = 0; } return;
    }
    if (drag.current.isPan) {
      tr.current.x = panStart.current.tx + (cx - panStart.current.mx);
      tr.current.y = panStart.current.ty + (cy - panStart.current.my); return;
    }
    const hov = hitTest(nodesRef.current, cx, cy, tr.current);
    setHoveredNode(hov); if (hov) setTooltipPos({ x: cx, y: cy });
    canvasRef.current!.style.cursor = hov ? "pointer" : "grab";
  };
  const onMouseDown = (e: React.MouseEvent) => {
    const { cx, cy } = xy(e);
    const hov = hitTest(nodesRef.current, cx, cy, tr.current);
    if (hov) { drag.current.nodeId = hov.id; drag.current.isPan = false; ticks.current = Math.min(ticks.current, 279); }
    else { drag.current.isPan = true; drag.current.nodeId = null; panStart.current = { tx: tr.current.x, ty: tr.current.y, mx: cx, my: cy }; canvasRef.current!.style.cursor = "grabbing"; }
  };
  const onMouseUp = () => { drag.current.nodeId = null; drag.current.isPan = false; canvasRef.current!.style.cursor = hoveredNode ? "pointer" : "grab"; };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const { cx, cy } = xy(e);
    const d = e.deltaY > 0 ? 0.9 : 1.1, ns = Math.max(0.3, Math.min(3, tr.current.scale * d));
    tr.current.x = cx - (cx - tr.current.x) * (ns / tr.current.scale);
    tr.current.y = cy - (cy - tr.current.y) * (ns / tr.current.scale);
    tr.current.scale = ns;
  };

  const categories = Array.from(new Set(data.nodes.map(n => n.category)));
  const catColors: Record<string,string> = {};
  data.nodes.forEach(n => { catColors[n.category] = n.color; });

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
        {categories.map(cat => (
          <div key={cat} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: catColors[cat]+"15", color: catColors[cat], border: `1px solid ${catColors[cat]}40` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: catColors[cat] }} />
            {CATEGORY_LABELS[cat]||cat}
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {simRunning && <span className="text-xs text-text-muted flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse inline-block"/>Simulasi fisika berjalan...</span>}
          <button onClick={() => { tr.current = {x:0,y:0,scale:1}; }} className="px-3 py-1 text-xs rounded-lg glass text-text-muted hover:text-text-primary transition-all">Reset</button>
        </div>
      </div>

      <div ref={containerRef} className="relative flex-1 overflow-hidden">
        <canvas ref={canvasRef} className="block w-full h-full" style={{cursor:"grab"}}
          onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp} onWheel={onWheel} />

        {hoveredNode && (
          <div className="pointer-events-none absolute z-10 w-52 rounded-xl glass-strong p-3 shadow-xl" style={{ left: Math.min(tooltipPos.x+16, (containerRef.current?.clientWidth||400)-220), top: Math.max(tooltipPos.y-80, 8), borderColor: hoveredNode.color+"44", borderWidth:1 }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:hoveredNode.color}}/>
              <span className="font-jakarta font-bold text-sm text-text-primary">{hoveredNode.label}</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">{hoveredNode.description}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{background:hoveredNode.color+"22",color:hoveredNode.color}}>{CATEGORY_LABELS[hoveredNode.category]||hoveredNode.category}</span>
              <span className="text-[10px] text-text-muted">~{hoveredNode.hoaksCount} kasus</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 glass rounded-xl p-3 space-y-1.5">
          <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-2">Legenda</p>
          {categories.map(cat => (
            <div key={cat} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{background:catColors[cat]}}/>
              <span className="text-[11px] text-text-muted">{CATEGORY_LABELS[cat]||cat}</span>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 right-4 glass rounded-xl px-3 py-2">
          <p className="text-[10px] text-text-muted">🖱️ Drag node • Scroll zoom • Hover info</p>
        </div>
      </div>
    </div>
  );
}
