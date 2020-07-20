import { ReactNode, useReducer } from 'react';
import { ManagerCommand, MountCommand, PortalMeta, UnmountCommand, UpdateCommand } from './types';

export const Z_INDEX = 0;
export const PORTAL_LAYER_ID = 'react-konva-portal';
export const ERROR_MESSAGE =
  'You should wrap your root component with <Stage /> from "react-konva-portal" in order for Portals to work';

export type RenderFunction = () => void;

export function useForceRender(): RenderFunction {
  const [, forceRender] = useReducer(i => i + 1, 0);
  return forceRender;
}

export function zIndexComparator(a: PortalMeta, b: PortalMeta) {
  const { zIndex: zIndexA = Z_INDEX } = a;
  const { zIndex: zIndexB = Z_INDEX } = b;
  if (zIndexA === zIndexB) return 0;
  return zIndexA > zIndexB ? 1 : -1;
}

export function mountCmd(key: number, zIndex: number, children: ReactNode): MountCommand {
  return { type: 'mount', key, zIndex, children };
}

export function updateCmd(key: number, zIndex: number, children: ReactNode): UpdateCommand {
  return { type: 'update', key, zIndex, children };
}

export function unmountCmd(key: number): UnmountCommand {
  return { type: 'unmount', key };
}

export function notUnmountByKey(key: number) {
  return function (item: ManagerCommand) {
    return item.key === key && item.type !== 'unmount';
  };
}

export function warnIfDev(...args: any[]) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(...args);
  }
}
