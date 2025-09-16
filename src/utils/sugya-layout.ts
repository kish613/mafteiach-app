import { ERA_ORDER, Era, GraphEdge, GraphNode } from "./sugya-graph";

export interface PositionedNode extends GraphNode { x: number; y: number; r: number }
export interface PositionedEdge extends GraphEdge { path: { x1: number; y1: number; cx: number; cy: number; x2: number; y2: number } }
export interface LayoutResult { nodes: PositionedNode[]; edges: PositionedEdge[]; bounds: { x: number; y: number; width: number; height: number } }

export function layoutGraph(nodes: GraphNode[], edges: GraphEdge[], viewport: { width: number; height: number }): LayoutResult {
  const laneCount = ERA_ORDER.length;
  const laneH = Math.max(80, viewport.height / laneCount);
  const laneY = (era: Era) => ERA_ORDER.indexOf(era) * laneH + laneH / 2;

  // Group nodes by era and assign initial x
  const byEra = new Map<Era, GraphNode[]>();
  for (const era of ERA_ORDER) byEra.set(era, []);
  nodes.forEach((n) => byEra.get(n.era)!.push(n));

  const positioned: PositionedNode[] = [];
  const padding = 24;
  const minStep = 100;

  for (const era of ERA_ORDER) {
    const lane = byEra.get(era)!;
    const step = Math.max(minStep, (viewport.width - padding * 2) / Math.max(1, lane.length));
    lane.forEach((n, idx) => {
      positioned.push({ ...n, x: padding + idx * step, y: laneY(era), r: 16 });
    });
  }

  // Build quick lookup
  const nodeById = new Map<string, PositionedNode>(positioned.map((n) => [n.id, n] as const));

  // Simple edge routing with vertical curve between lanes
  const pedges: PositionedEdge[] = edges.map((e) => {
    const a = nodeById.get(e.from)!;
    const b = nodeById.get(e.to)!;
    const midY = (a.y + b.y) / 2;
    const cx = (a.x + b.x) / 2;
    return { ...e, path: { x1: a.x, y1: a.y, cx, cy: midY, x2: b.x, y2: b.y } };
  });

  // Compute bounds
  const xs = positioned.map((n) => n.x);
  const ys = positioned.map((n) => n.y);
  const minX = Math.min(...xs, 0) - padding;
  const maxX = Math.max(...xs, viewport.width) + padding;
  const minY = Math.min(...ys, 0) - padding;
  const maxY = Math.max(...ys, viewport.height) + padding;

  return { nodes: positioned, edges: pedges, bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY } };
}
