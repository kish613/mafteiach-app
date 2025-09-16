import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Modal, Pressable, Dimensions } from "react-native";
import Svg, { Line as SvgLine, Circle as SvgCircle, Path as SvgPath, Text as SvgText } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from "react-native-reanimated";
import { TorahSource } from "../state/searchStore";
import { buildSugyaGraph, ERA_ORDER } from "../utils/sugya-graph";
import { layoutGraph } from "../utils/sugya-layout";

interface Props {
  visible: boolean;
  onClose: () => void;
  sources: TorahSource[];
}

export default function SugyaMap({ visible, onClose, sources }: Props) {
  const win = Dimensions.get("window");
  const width = win.width - 24;
  const height = Math.min(520, Math.max(320, win.height * 0.7));

  // Build graph + layout in world coordinates
  const { nodes, edges } = useMemo(() => buildSugyaGraph(sources || []), [sources]);
  const layout = useMemo(() => layoutGraph(nodes, edges, { width, height }), [nodes, edges, width, height]);

  // Camera shared values
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const fitS = useSharedValue(1);
  const fitTx = useSharedValue(0);
  const fitTy = useSharedValue(0);

  // Store fitted transform so double-tap can toggle
  const fitRef = useRef<{ s: number; tx: number; ty: number }>({ s: 1, tx: 0, ty: 0 });

  // Initial fit to view
  useEffect(() => {
    if (!visible) return;
    const b = layout.bounds;
    const sx = (width - 48) / Math.max(1, b.width);
    const sy = (height - 48) / Math.max(1, b.height);
    const s = Math.max(0.5, Math.min(1.8, Math.min(sx, sy)));
    const ntx = -b.x * s + (width - b.width * s) / 2;
    const nty = -b.y * s + (height - b.height * s) / 2;
    scale.value = s;
    tx.value = ntx;
    ty.value = nty;
    savedScale.value = s; savedTx.value = ntx; savedTy.value = nty;
    fitS.value = s; fitTx.value = ntx; fitTy.value = nty;
    fitRef.current = { s, tx: ntx, ty: nty };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, layout.bounds.x, layout.bounds.y, layout.bounds.width, layout.bounds.height]);

  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

  // Gestures
  const pan = Gesture.Pan()
    .onStart(() => { savedTx.value = tx.value; savedTy.value = ty.value; })
    .onUpdate((e) => { tx.value = savedTx.value + e.translationX; ty.value = savedTy.value + e.translationY; });

  const pinch = Gesture.Pinch()
    .onStart(() => { savedScale.value = scale.value; savedTx.value = tx.value; savedTy.value = ty.value; })
    .onUpdate((e) => {
      const clampv = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
      const next = clampv(savedScale.value * e.scale, 0.5, 3);
      const fx = e.focalX; const fy = e.focalY;
      const dx = fx - savedTx.value; const dy = fy - savedTy.value;
      const k = next / savedScale.value;
      scale.value = next;
      tx.value = fx - dx * k;
      ty.value = fy - dy * k;
    });

  const doubleTap = Gesture.Tap().numberOfTaps(2).onStart((e) => {
    const nearFit = Math.abs(scale.value - fitS.value) < 0.05;
    if (!nearFit) {
      scale.value = withTiming(fitS.value, { duration: 180 });
      tx.value = withTiming(fitTx.value, { duration: 180 });
      ty.value = withTiming(fitTy.value, { duration: 180 });
    } else {
      const fx = e.x; const fy = e.y;
      const clampv = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
      const target = clampv(scale.value * 1.4, 0.5, 3);
      const dx = fx - tx.value; const dy = fy - ty.value;
      const k = target / scale.value;
      scale.value = withTiming(target, { duration: 160 });
      tx.value = withTiming(fx - dx * k, { duration: 160 });
      ty.value = withTiming(fy - dy * k, { duration: 160 });
    }
  });

  const tapSelect = Gesture.Tap()
    .maxDuration(220)
    .onEnd((e) => {
      const wx = (e.x - tx.value) / scale.value;
      const wy = (e.y - ty.value) / scale.value;
      let nearest: { id: string; d: number; sx: number; sy: number } | null = null;
      for (const n of layout.nodes) {
        const ddx = n.x - wx; const ddy = n.y - wy;
        const d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d <= n.r * 1.4) {
          const sx = n.x * scale.value + tx.value;
          const sy = n.y * scale.value + ty.value;
          if (!nearest || d < nearest.d) nearest = { id: n.id, d, sx, sy };
        }
      }
      if (nearest) {
        runOnJS(setFocused)(nearest.id);
        runOnJS(setTooltip)({ x: nearest.sx, y: nearest.sy - 24 });
      } else {
        runOnJS(setFocused)(null);
        runOnJS(setTooltip)(null);
      }
    });

  const gestures = Gesture.Simultaneous(pan, pinch, doubleTap, tapSelect);

  // Animated style to apply camera
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  // Focused node and tooltip
  const [focused, setFocused] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

  const screenToWorld = (sx: number, sy: number) => ({ x: (sx - tx.value) / scale.value, y: (sy - ty.value) / scale.value });
  const worldToScreen = (wx: number, wy: number) => ({ x: wx * scale.value + tx.value, y: wy * scale.value + ty.value });

  const edgeColor = (t: "support" | "argue" | "quote") => (t === "support" ? "#3BA55D" : t === "argue" ? "#D9534F" : "#9AA0A6");

  const focusedSet = useMemo(() => new Set([focused || ""]), [focused]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 items-center justify-center">
        <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#22140E" }}>
          <View className="flex-row justify-between items-center px-4 py-3 border-b" style={{ borderColor: "#8A5B2A" }}>
            <Text className="text-base" style={{ color: "#E7D1A8" }}>Sugya Map</Text>
            <Pressable onPress={onClose}><Text style={{ color: "#C7954B" }}>Close</Text></Pressable>
          </View>

          {layout.nodes.length === 0 ? (
            <View style={{ width, height }} className="items-center justify-center">
              <Text style={{ color: "#C7B08B" }}>No sources to map</Text>
            </View>
          ) : (
            <GestureDetector gesture={gestures}>
              <View style={{ width, height }}>
                {/* Era stripes in background (non-animated) */}
                <Svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
                  {ERA_ORDER.map((_, idx) => {
                    const y = (idx + 0.5) * (height / ERA_ORDER.length);
                    return <SvgLine key={`lane-${idx}`} x1={0} y1={y} x2={width} y2={y} stroke="#3B1D0F" strokeWidth={1} />;
                  })}
                </Svg>

                {/* Animated world */}
                <Animated.View style={[{ width, height }, aStyle]}> 
                  <Svg width={width} height={height}>
                    {/* Edges */}
                    {layout.edges.map((e) => (
                      <SvgPath
                        key={`${e.from}-${e.to}`}
                        d={`M ${e.path.x1} ${e.path.y1} Q ${e.path.cx} ${e.path.cy} ${e.path.x2} ${e.path.y2}`}
                        stroke={edgeColor(e.type)}
                        strokeWidth={1.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={focused ? (focusedSet.has(e.from) || focusedSet.has(e.to) ? 1 : 0.25) : 1}
                      />
                    ))}

                    {/* Nodes */}
                    {layout.nodes.map((n) => (
                      <SvgCircle
                        key={n.id}
                        cx={n.x}
                        cy={n.y}
                        r={focused === n.id ? n.r + 2 : n.r}
                        fill={focused === n.id ? "#D2A35C" : "#C7954B"}
                      />
                    ))}

                    {/* Labels (lightweight) */}
                    {layout.nodes.map((n) => (
                      <SvgText key={`lbl-${n.id}`} x={n.x + n.r + 6} y={n.y + 4} fill="#E7D1A8" fontSize="10">
                        {n.label}
                      </SvgText>
                    ))}
                  </Svg>
                </Animated.View>

                {/* Controls */}
                <View style={{ position: "absolute", right: 8, bottom: 8, pointerEvents: "box-none" }}>
                  <View className="mb-2 rounded-lg overflow-hidden" style={{ borderColor: "#8A5B2A", borderWidth: 1 }}>
                    <Pressable onPress={() => { scale.value = clamp(scale.value * 1.15, 0.5, 3); }} className="px-3 py-2" style={{ backgroundColor: "#2F1B12" }}>
                      <Text style={{ color: "#E7D1A8" }}>+</Text>
                    </Pressable>
                    <Pressable onPress={() => { scale.value = clamp(scale.value / 1.15, 0.5, 3); }} className="px-3 py-2" style={{ backgroundColor: "#2F1B12", borderTopColor: "#8A5B2A", borderTopWidth: 1 }}>
                      <Text style={{ color: "#E7D1A8" }}>−</Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={() => { const f = fitRef.current; scale.value = withTiming(f.s, { duration: 160 }); tx.value = withTiming(f.tx, { duration: 160 }); ty.value = withTiming(f.ty, { duration: 160 }); }} className="px-3 py-2 rounded-lg" style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}>
                    <Text style={{ color: "#E7D1A8" }}>Fit</Text>
                  </Pressable>
                </View>

                {/* Legend */}
                <View style={{ position: "absolute", left: 8, bottom: 8 }}>
                  <View className="flex-row items-center" style={{ columnGap: 12 }}>
                    <View className="flex-row items-center" style={{ columnGap: 6 }}>
                      <View style={{ width: 10, height: 2, backgroundColor: "#3BA55D" }} />
                      <Text style={{ color: "#C7B08B", fontSize: 12 }}>Support</Text>
                    </View>
                    <View className="flex-row items-center" style={{ columnGap: 6 }}>
                      <View style={{ width: 10, height: 2, backgroundColor: "#D9534F" }} />
                      <Text style={{ color: "#C7B08B", fontSize: 12 }}>Argue</Text>
                    </View>
                    <View className="flex-row items-center" style={{ columnGap: 6 }}>
                      <View style={{ width: 10, height: 2, backgroundColor: "#9AA0A6" }} />
                      <Text style={{ color: "#C7B08B", fontSize: 12 }}>Quote</Text>
                    </View>
                  </View>
                </View>

                {/* Tooltip */}
                {focused && tooltip && (
                  <View style={{ position: "absolute", left: tooltip.x + 8, top: tooltip.y - 34 }}>
                    <View className="rounded-lg px-3 py-2" style={{ backgroundColor: "#2F1B12", borderColor: "#8A5B2A", borderWidth: 1 }}>
                      <Text style={{ color: "#E7D1A8", fontSize: 12 }} numberOfLines={1}>
                        {nodes.find(n => n.id === focused)?.label || ""}
                      </Text>
                      <View className="flex-row mt-2" style={{ columnGap: 12 }}>
                        <Pressable onPress={() => {
                          const n = layout.nodes.find(n => n.id === focused);
                          if (!n) return;
                          const target = clamp(scale.value, 0.8, 1.4);
                          const sx = n.x * target; const sy = n.y * target;
                          scale.value = withTiming(target, { duration: 180 });
                          tx.value = withTiming(width / 2 - sx, { duration: 180 });
                          ty.value = withTiming(height / 2 - sy, { duration: 180 });
                        }}>
                          <Text style={{ color: "#C7954B", fontSize: 12 }}>Center</Text>
                        </Pressable>
                        <Pressable onPress={() => { setFocused(null); setTooltip(null); }}>
                          <Text style={{ color: "#C7954B", fontSize: 12 }}>Close</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </GestureDetector>
          )}
        </View>
      </View>
    </Modal>
  );
}
