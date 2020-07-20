import React, { ReactElement, ReactNode, useLayoutEffect, useRef } from 'react';
import { useStageContext } from './stage-context';
import { PortalProps, PortalState } from './types';
import { PORTAL_LAYER_ID, Z_INDEX } from './utils';

function Transporter({ children, containerId = PORTAL_LAYER_ID, zIndex = Z_INDEX }: PortalProps) {
  const stage = useStageContext();
  const keyRef = useRef<number>(-1);
  const phaseRef = useRef<PortalState>(PortalState.WILL_MOUNT);

  useLayoutEffect(
    () => () => {
      phaseRef.current = PortalState.WILL_UNMOUNT;
    },
    [],
  );

  useLayoutEffect(() => {
    if (phaseRef.current === PortalState.WILL_MOUNT) {
      keyRef.current = stage?.mount(containerId, zIndex, children) as number;
      phaseRef.current = PortalState.DID_MOUNT;
    }
    if (phaseRef.current === PortalState.DID_MOUNT) {
      stage?.update(containerId, keyRef.current, zIndex, children);
    }
    return () => {
      if (phaseRef.current === PortalState.WILL_UNMOUNT) {
        stage?.unmount(containerId, keyRef.current);
      }
    };
  }, [stage, containerId, zIndex, children]);

  return (null as ReactNode) as ReactElement;
}

function Portal({ containerId, ...props }: PortalProps) {
  return <Transporter {...props} key={containerId} containerId={containerId} />;
}

export default Portal;
