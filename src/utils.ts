import { ReactNode, useReducer } from 'react';
import { ManagerCommand, MountCommand, PortalMeta, PortalStageContext, UnmountCommand, UpdateCommand } from './types';

export const Z_INDEX = 0;
export const PORTAL_LAYER_ID = 'react-konva-portals';
export const ERROR_MESSAGE =
  'You should wrap your root component with <Stage /> from "react-konva-portal" in order for Portals to work';

export type RenderFunction = () => void;

export function useForceRender(): RenderFunction {
  const [, forceRender] = useReducer(i => i + 1, 0);
  return forceRender;
}

export function isStageContext(val: any): val is PortalStageContext {
  return (
    val &&
    typeof val === 'object' &&
    typeof val.mount === 'function' &&
    typeof val.update === 'function' &&
    typeof val.unmount === 'function' &&
    typeof val.addManager === 'function' &&
    typeof val.removeManager === 'function'
  );
}

export function assertStageContext(val: any) {
  if (!isStageContext(val)) throw new Error(ERROR_MESSAGE);
}

export function zIndexComparator(a: PortalMeta, b: PortalMeta) {
  const { zIndex: zIndexA = Z_INDEX } = a;
  const { zIndex: zIndexB = Z_INDEX } = b;
  if (zIndexA === zIndexB) return 0;
  return zIndexA > zIndexB ? -1 : 1;
}

export function mountCmd(id: string, key: number, zIndex: number, children: ReactNode): MountCommand {
  return { type: 'mount', id, key, zIndex, children };
}

export function updateCmd(id: string, key: number, zIndex: number, children: ReactNode): UpdateCommand {
  return { type: 'update', id, key, zIndex, children };
}

export function unmountCmd(id: string, key: number): UnmountCommand {
  return { type: 'unmount', key, id };
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
