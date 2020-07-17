import Konva from 'konva';
import React, { useCallback, useEffect, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Portal } from 'react-konva-portal';

export interface ElementProps extends Omit<Konva.NodeConfig, 'width' | 'height'> {
  size: number;
  zIndex?: number;
  usePortal: boolean;
  onMouseEnter?(): void;
  onMouseLeave?(): void;
  onMouseDown?(): void;
  onMouseUp?(): void;
}

export function Element({
  x,
  y,
  size,
  zIndex,
  usePortal,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  ...props
}: ElementProps) {
  const xyRef = useRef<Konva.Vector2d>({ x, y });

  useEffect(() => {
    xyRef.current.x = x;
    xyRef.current.y = y;
  }, [x, y]);

  const handleDragEvent = useCallback(({ currentTarget }: Konva.KonvaEventObject<DragEvent>) => {
    xyRef.current.x = currentTarget.x();
    xyRef.current.y = currentTarget.y();
  }, []);

  const content = (
    <Group
      width={size}
      height={size}
      draggable={true}
      x={xyRef.current.x}
      y={xyRef.current.y}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onDragStart={handleDragEvent}
      onDragMove={handleDragEvent}
      onDragEnd={handleDragEvent}
    >
      <Rect
        {...props}
        fill="#f3f9d2"
        width={size}
        height={size}
        stroke="#b1b695"
        strokeWidth={4}
        cornerRadius={Math.max(size / 2, 0)}
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
