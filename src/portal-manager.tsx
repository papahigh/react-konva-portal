import React, { forwardRef, MutableRefObject, ReactElement, ReactNode, useImperativeHandle, useState } from 'react';

export interface PortalManagerProps {}

export interface PortalManagerRef {
  mount(key: number, children: ReactNode, zIndex: number): void;
  update(key: number, children: ReactNode, zIndex: number): void;
  unmount(key: number): void;
}

export interface PortalNode {
  key: number;
  children: ReactNode;
  zIndex?: number;
}

export const DEFAULT_Z_INDEX = 0;

export function zIndexComparator(a: PortalNode, b: PortalNode) {
  const { zIndex: zIndexA = DEFAULT_Z_INDEX } = a;
  const { zIndex: zIndexB = DEFAULT_Z_INDEX } = b;
  if (zIndexA === zIndexB) return 0;
  return zIndexA > zIndexB ? 1 : -1;
}

function PortalManagerComponent(
  _: PortalManagerProps,
  ref: ((instance: PortalManagerRef | null) => void) | MutableRefObject<PortalManagerRef | null> | null,
) {
  const [portals, setPortals] = useState<PortalNode[]>([]);

  useImperativeHandle<PortalManagerRef, PortalManagerRef>(
    ref,
    () => ({
      mount: (key, children, zIndex) =>
        setPortals(currValue => [...currValue, { key, children, zIndex }].sort(zIndexComparator)),
      update: (key, children, zIndex) =>
        setPortals(prevValue => {
          let zIndexChanged = false;
          const currValue = prevValue.map(item => {
            if (item.key !== key) return item;
            zIndexChanged = item.zIndex !== zIndex;
            return { key, children, zIndex };
          });
          return zIndexChanged ? currValue.sort(zIndexComparator) : currValue;
        }),
      unmount: (key: number) => setPortals(prevValue => prevValue.filter(item => item.key !== key)),
    }),
    [setPortals],
  );

  return (portals.map(({ key, children }) => (
    <React.Fragment key={key}>{children}</React.Fragment>
  )) as ReactNode) as ReactElement;
}

export const PortalManager = forwardRef<PortalManagerRef, PortalManagerProps>(PortalManagerComponent);

export default PortalManager;
