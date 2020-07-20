import React, { forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { Stage } from 'react-konva';
import Layer from './portal-layer';
import Provider from './stage-context';
import { ForwardedRef, ManagerCommand, PortalManagerRef, PortalStageProps } from './types';
import { mountCmd, notUnmountByKey, PORTAL_LAYER_ID, unmountCmd, updateCmd, warnIfDev } from './utils';

function StageComponent({ children, portalLayerProps, ...props }: PortalStageProps, ref: ForwardedRef<Stage>) {
  const seqRef = useRef(0);
  const stageRef = useRef<Stage | null>(null);
  const queueRef = useRef<Record<string, ManagerCommand[]>>({});
  const managersRef = useRef<Record<string, PortalManagerRef | null>>({});
  const deferRef = useRef(true);

  useImperativeHandle<Stage | null, Stage | null>(ref, () => stageRef.current, [stageRef.current]);

  useEffect(() => {
    Object.keys(queueRef.current).forEach(id => managersRef.current[id]?.handle(queueRef.current[id]));
    queueRef.current = {};
    deferRef.current = false;
    return () => {
      deferRef.current = true;
    };
  }, []);

  const addManager = useCallback((auditName: string, id: string, manager: PortalManagerRef) => {
    if (managersRef.current[id]) {
      warnIfDev(`Found ${auditName} with duplicate id "${id}".`);
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
    if (managerReady && !deferRef.current) managerReady.handle(mountCmd(key, zIndex, children));
    else {
      const queue = queueRef.current[id] || [];
      queue.push(mountCmd(key, zIndex, children));
      queueRef.current[id] = queue;
    }
    return key;
  }, []);

  const update = useCallback((id: string, key: number, zIndex: number, children: ReactNode) => {
    const managerReady = managersRef.current[id];
    if (managerReady && !deferRef.current) managerReady.handle(updateCmd(key, zIndex, children));
    else {
      const queue = queueRef.current[id] || [];
      const index = queue.findIndex(notUnmountByKey(key));
      if (index === -1) queue.push(mountCmd(key, zIndex, children));
      else queue.splice(index, 1, mountCmd(key, zIndex, children));
      queueRef.current[id] = queue;
    }
  }, []);

  const unmount = useCallback((id: string, key: number) => {
    const managerReady = managersRef.current[id];
    if (managerReady && !deferRef.current) managerReady.handle(unmountCmd(key));
    else {
      const queue = queueRef.current[id] || [];
      queue.push(unmountCmd(key));
      queueRef.current[id] = queue;
    }
  }, []);

  useEffect(
    () => () => {
      Object.keys(queueRef.current).forEach(id => managersRef.current[id]?.handle(queueRef.current[id]));
      queueRef.current = {};
      deferRef.current = false;
    },
    [],
  );

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
