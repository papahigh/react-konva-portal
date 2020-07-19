import css from 'dom-css';
import Konva from 'konva';
import React, { useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Portal } from 'react-konva-portal';

export interface ElementProps {
  x: number;
  y: number;
  size: number;
  zIndex?: number;
  usePortal: boolean;
}

export function Element({ x, y, size, zIndex, usePortal, ...props }: ElementProps) {
  const [XY, setXY] = useState<Konva.Vector2d>({ x, y });
  const content = (
    <Group
      x={XY.x}
      y={XY.y}
      width={size}
      height={size}
      draggable={true}
      onMouseEnter={() => css(document.body, { cursor: 'grab' })}
      onMouseLeave={() => css(document.body, { cursor: 'default' })}
      onMouseDown={() => css(document.body, { cursor: 'grabbing' })}
      onMouseUp={() => css(document.body, { cursor: 'grab' })}
      onDragEnd={({ currentTarget }: Konva.KonvaEventObject<DragEvent>) => {
        setXY({ x: currentTarget.x(), y: currentTarget.y() });
      }}
    >
      <Rect
        {...props}
        fill="#f3f9d2"
        width={size}
        height={size}
        stroke="#b1b695"
        strokeWidth={4}
        cornerRadius={size / 2}
      />
      <Text
        text={`zIndex ${zIndex}`}
        fill="#7fbb71"
        width={size}
        height={size}
        fontSize={16}
        fontStyle="bold"
        verticalAlign="middle"
        align="center"
      />
    </Group>
  );

  return usePortal ? <Portal zIndex={zIndex}>{content}</Portal> : content;
}
