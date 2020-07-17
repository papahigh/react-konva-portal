import React, { createContext, PropsWithChildren, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { Layer, Stage, StageProps } from 'react-konva';
import { PortalManager, PortalManagerRef } from './portal-manager';

export interface PortalStageProps extends StageProps {}

export interface PortalStageContextValue {
  mount: (children: ReactNode, zIndex: number) => number;
  update: (key: number, children: ReactNode, zIndex: number) => void;
  unmount: (key: number) => void;
}

export type MountBufferedAction = { type: 'mount'; key: number; children: ReactNode; zIndex: number };
export type UpdateBufferedAction = { type: 'update'; key: number; children: ReactNode; zIndex: number };
export type UnmountBufferedAction = { type: 'unmount'; key: number };
export type BufferedAction = MountBufferedAction | UpdateBufferedAction | UnmountBufferedAction;

export function pendingPredicate(key: number) {
  return function (item: BufferedAction) {
    return key === item.key && (item.type === 'mount' || item.type === 'update');
  };
}

export const PortalStageContext = createContext<PortalStageContextValue | null>(null);

function PortalStageContextProvider({ mount, unmount, update, children }: PropsWithChildren<PortalStageContextValue>) {
  const contextValue = useMemo(() => ({ mount, unmount, update }), [mount, unmount, update]);
  return <PortalStageContext.Provider value={contextValue}>{children}</PortalStageContext.Provider>;
}

export function PortalStage({ children, ...stageProps }: PortalStageProps) {
  const seqRef = useRef(0);
  const queueRef = useRef<BufferedAction[]>([]);
  const managerRef = useRef<PortalManagerRef | null>(null);

  useEffect(() => {
    const handlers = {
      mount: (o: BufferedAction) => {
        if (o.type === 'mount') managerRef.current?.mount(o.key, o.children, o.zIndex);
      },
      update: (op: BufferedAction) => {
        if (op.type === 'update') managerRef.current?.update(op.key, op.children, op.zIndex);
      },
      unmount: (op: BufferedAction) => {
        if (op.type === 'unmount') managerRef.current?.unmount(op.key);
      },
    };

    while (queueRef.current.length && managerRef.current) {
      const action = queueRef.current.pop();
      if (action) handlers[action.type].call(null, action);
    }
  }, []);

  const mount = useCallback((children: ReactNode, zIndex: number) => {
    const key = ++seqRef.current;
    if (managerRef.current) managerRef.current.mount(key, children, zIndex);
    else queueRef.current.push({ type: 'mount', key, children, zIndex });
    return key;
  }, []);

  const update = useCallback((key: number, children: ReactNode, zIndex: number) => {
    if (managerRef.current) managerRef.current.update(key, children, zIndex);
    else {
      const index = queueRef.current.findIndex(pendingPredicate(key));
      if (index === -1) queueRef.current.push({ type: 'mount', key, children, zIndex });
      else queueRef.current[index] = { type: 'mount', key, children, zIndex };
    }
  }, []);

  const unmount = useCallback((key: number) => {
    if (managerRef.current) managerRef.current.unmount(key);
    else queueRef.current.push({ type: 'unmount', key });
  }, []);

  return (
    <Stage {...stageProps}>
      <PortalStageContextProvider mount={mount} update={update} unmount={unmount}>
        {children}
        <Layer>
          <PortalManager ref={managerRef} />
        </Layer>
      </PortalStageContextProvider>
    </Stage>
  );
}
