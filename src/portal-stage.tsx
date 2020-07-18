import React, { forwardRef, ReactNode, useCallback, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { Stage } from 'react-konva';
import Layer from './portal-layer';
import Provider from './stage-context';
import type { ForwardedRef, ManagerCommand, PortalManagerRef, PortalStageProps } from './types';
import { mountCmd, notUnmountByKey, PORTAL_LAYER_ID, unmountCmd, updateCmd, warnIfDev } from './utils';

function StageComponent({ children, portalLayerProps, ...props }: PortalStageProps, ref: ForwardedRef<Stage>) {
  const seqRef = useRef(0);
  const stageRef = useRef<Stage | null>(null);
  const queueRef = useRef<Record<string, ManagerCommand[]>>({});
  const managersRef = useRef<Record<string, PortalManagerRef | null>>({});

  useImperativeHandle<Stage | null, Stage | null>(ref, () => stageRef.current, [stageRef.current]);

  useLayoutEffect(() => {
    const fallback = managersRef.current[PORTAL_LAYER_ID];
    Object.keys(queueRef.current).forEach(id => (managersRef.current[id] ?? fallback)?.handle(queueRef.current[id]));
    queueRef.current = {};
  }, []);

  const addManager = useCallback((auditName: string, id: string, manager: PortalManagerRef) => {
    if (managersRef.current[id]) {
      warnIfDev(`Fond ${auditName} with duplicate id "${id}".`);
    }
    managersRef.current[id] = manager;
  }, []);

  const removeManager = useCallback((auditName: string, id: string) => {
    if (!managersRef.current[id]) {
      warnIfDev(`You are trying to remove unknown ${auditName} instance with id "${id}".`);
    }
    delete managersRef.current[id];
  }, []);

  const mount = useCallback((id: string, zIndex: number, children: ReactNode) => {
    const key = ++seqRef.current;
    const managerReady = managersRef.current[id];
    if (managerReady) managerReady.handle(mountCmd(id, key, zIndex, children));
    else {
      const queue = queueRef.current[id] || [];
      queueRef.current[id] = queue;
      queue.push(mountCmd(id, key, zIndex, children));
    }
    return key;
  }, []);

  const update = useCallback((id: string, key: number, zIndex: number, children: ReactNode) => {
    const managerReady = managersRef.current[id];
    if (managerReady) managerReady.handle(updateCmd(id, key, zIndex, children));
    else {
      const queue = queueRef.current[id] || [];
      queueRef.current[id] = queue;
      const index = queue.findIndex(notUnmountByKey(key));
      if (index === -1) queue.push(mountCmd(id, key, zIndex, children));
      else queue.splice(index, 1, mountCmd(id, key, zIndex, children));
    }
  }, []);

  const unmount = useCallback((id: string, key: number) => {
    const managerReady = managersRef.current[id];
    if (managerReady) managerReady.handle(unmountCmd(id, key));
    else {
      const queue = queueRef.current[id] || [];
      queueRef.current[id] = queue;
      queue.push(unmountCmd(id, key));
    }
  }, []);

  return (
    <Stage ref={stageRef} {...props}>
      <Provider mount={mount} update={update} unmount={unmount} addManager={addManager} removeManager={removeManager}>
        {children}
        <Layer {...portalLayerProps} id={PORTAL_LAYER_ID} />
      </Provider>
    </Stage>
  );
}

const PortalStage = forwardRef<Stage, PortalStageProps>(StageComponent);
export default PortalStage;
