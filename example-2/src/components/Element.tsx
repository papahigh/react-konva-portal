import React from 'react';
import { Group, Rect, Text } from 'react-konva';

export interface ElementProps {
  x: number;
  y: number;
  label: string;
  size: number;
}

export function Element({ x, y, label, size }: ElementProps) {
  return (
    <Group x={x} y={y} width={size} height={size}>
      <Rect fill="#f3f9d2" stroke="#b1b695" strokeWidth={4} width={size} height={size} cornerRadius={size / 2} />
      <Text
        text={label}
        fill="#7fbb71"
        width={size}
        height={size}
        fontSize={32}
        fontStyle="bold"
        verticalAlign="middle"
        align="center"
      />
    </Group>
  );
}
