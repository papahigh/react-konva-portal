import React, { ReactElement, ReactNode, useCallback, useEffect, useRef } from 'react';
import { useStageContext } from './stage-context';
import { PortalProps, PortalState } from './types';
import { PORTAL_LAYER_ID, Z_INDEX } from './utils';

function Transporter({ children, containerId = PORTAL_LAYER_ID, zIndex = Z_INDEX }: PortalProps) {
  const stage = useStageContext();
  const keyRef = useRef<number>(0);
  const phaseRef = useRef<PortalState>(PortalState.NONE);

  useEffect(
    () => () => {
      phaseRef.current = PortalState.WILL_UNMOUNT;
    },
    [],
  );

  const mountAsync = useCallback(async () => {
    await Promise.resolve();
    keyRef.current = stage?.mount(containerId, zIndex, children) as number;
  }, [stage, containerId, zIndex, children]);

  useEffect(() => {
    if (phaseRef.current === PortalState.NONE) {
      phaseRef.current = PortalState.WILL_MOUNT;
      mountAsync().then(() => {
        phaseRef.current = PortalState.DID_MOUNT;
      });
    }
    if (phaseRef.current === PortalState.DID_MOUNT) {
      stage?.update(containerId, keyRef.current, zIndex, children);
    }
    return () => {
      if (phaseRef.current === PortalState.WILL_UNMOUNT) {
        stage?.unmount(containerId, keyRef.current);
      }
    };
  }, [mountAsync, stage, containerId, zIndex, children]);

  return (null as ReactNode) as ReactElement;
}

function Portal({ containerId, ...props }: PortalProps) {
  return <Transporter {...props} key={containerId} containerId={containerId} />;
}

export default Portal;
