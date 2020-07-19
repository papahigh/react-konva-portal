import Konva from 'konva';
import React, { ReactElement, ReactNode } from 'react';
import { Rect } from 'react-konva';

export interface OverlayProps extends Konva.RectConfig {
  showOverlay: boolean;
}

export function Overlay({ showOverlay, ...props }: OverlayProps) {
  const element: ReactNode = !showOverlay ? null : <Rect fill="#c1f7ff" {...props} />;
  return element as ReactElement;
}
