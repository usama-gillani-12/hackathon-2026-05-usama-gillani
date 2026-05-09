import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop, Circle } from 'react-native-svg';
import { ms } from '../theme/responsive';

type Props = {
  /** Series of values; rendered left → right. Last value is the "current" highlighted point. */
  values: number[];
  /** Stroke + glow color. */
  color: string;
  /** Width of the rendered chart. Defaults to 80. */
  width?: number;
  /** Height of the rendered chart. Defaults to 24. */
  height?: number;
};

/**
 * Smooth sparkline with a gradient stroke and a glowing dot at the latest data
 * point. Uses Catmull-Rom → Bézier conversion for a buttery curve, and an
 * SVG <Defs> linear gradient so the line fades from transparent on the left
 * to fully opaque at the latest point.
 */
export const SparklineSvg: React.FC<Props> = ({ values, color, width = 80, height = 24 }) => {
  const path = useMemo(() => buildSmoothPath(values, width, height), [values, width, height]);
  const last = values[values.length - 1] ?? 0;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const lastX = width;
  const lastY = height - ((last - min) / range) * height;
  const gradientId = `spark-grad-${color.replace('#', '')}`;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={color} stopOpacity={0.15} />
            <Stop offset="0.6" stopColor={color} stopOpacity={0.7} />
            <Stop offset="1" stopColor={color} stopOpacity={1} />
          </LinearGradient>
        </Defs>

        <Path
          d={path}
          stroke={`url(#${gradientId})`}
          strokeWidth={ms(1.4)}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Glow halo around the latest point */}
        <Circle cx={lastX - ms(1)} cy={lastY} r={ms(2.8)} fill={color} opacity={0.2} />
        {/* Solid dot */}
        <Circle cx={lastX - ms(1)} cy={lastY} r={ms(1.4)} fill={color} />
      </Svg>
    </View>
  );
};

function buildSmoothPath(values: number[], width: number, height: number): string {
  if (values.length === 0) return '';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = width / Math.max(values.length - 1, 1);

  const points = values.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * height,
  }));

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  // Catmull-Rom → cubic Bézier (tension 0.5) for smooth curves.
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}
