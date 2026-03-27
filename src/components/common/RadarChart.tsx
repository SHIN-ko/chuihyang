import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, G } from 'react-native-svg';

interface RadarChartProps {
  data: { label: string; value: number }[];
  maxValue?: number;
  size?: number;
  color?: string;
  fillOpacity?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  maxValue = 5,
  size = 200,
  color = '#025830',
  fillOpacity = 0.25,
}) => {
  const center = size / 2;
  const radius = (size / 2) * 0.75;
  const angleStep = (2 * Math.PI) / data.length;
  const levels = 5;

  const getPoint = (index: number, value: number): { x: number; y: number } => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / maxValue) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridPolygons = Array.from({ length: levels }, (_, levelIdx) => {
    const levelValue = ((levelIdx + 1) / levels) * maxValue;
    const points = data
      .map((_, i) => {
        const p = getPoint(i, levelValue);
        return `${p.x},${p.y}`;
      })
      .join(' ');
    return points;
  });

  const dataPoints = data
    .map((d, i) => {
      const p = getPoint(i, d.value || 0);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const axisLines = data.map((_, i) => {
    const p = getPoint(i, maxValue);
    return { x1: center, y1: center, x2: p.x, y2: p.y };
  });

  const labelPositions = data.map((d, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const labelRadius = radius + 24;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
      label: d.label,
      value: d.value,
    };
  });

  const hasData = data.some((d) => d.value > 0);

  return (
    <View style={[localStyles.container, { width: size, height: size + 20 }]}>
      <Svg width={size} height={size}>
        <G>
          {gridPolygons.map((points, idx) => (
            <Polygon
              key={`grid-${idx}`}
              points={points}
              fill="none"
              stroke={`rgba(128,128,128,${0.15 + idx * 0.05})`}
              strokeWidth={0.8}
            />
          ))}

          {axisLines.map((line, idx) => (
            <Line
              key={`axis-${idx}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(128,128,128,0.25)"
              strokeWidth={0.8}
            />
          ))}

          {hasData && (
            <>
              <Polygon
                points={dataPoints}
                fill={color}
                fillOpacity={fillOpacity}
                stroke={color}
                strokeWidth={2}
              />
              {data.map((d, i) => {
                if (!d.value) return null;
                const p = getPoint(i, d.value);
                return <Circle key={`dot-${i}`} cx={p.x} cy={p.y} r={3.5} fill={color} />;
              })}
            </>
          )}
        </G>
      </Svg>

      {labelPositions.map((lp, idx) => (
        <View
          key={`label-${idx}`}
          style={[
            localStyles.labelContainer,
            {
              left: lp.x - 30,
              top: lp.y - 10,
            },
          ]}
        >
          <Text style={localStyles.labelText}>{lp.label}</Text>
          {lp.value > 0 && <Text style={[localStyles.labelValue, { color }]}>{lp.value}</Text>}
        </View>
      ))}
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    width: 60,
    alignItems: 'center',
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    textAlign: 'center',
  },
  labelValue: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default RadarChart;
