import { ReactElement, ReactNode, useCallback, useLayoutEffect, useRef } from 'react';
import { useStageContext } from './stage-context';
import { PortalProps, PortalState } from './types';
import { PORTAL_LAYER_ID, Z_INDEX } from './utils';

function Portal({ children, containerId = PORTAL_LAYER_ID, zIndex = Z_INDEX }: PortalProps) {
  const stage = useStageContext();
  const keyRef = useRef(-1);
  const phaseRef = useRef<PortalState>(PortalState.WILL_MOUNT);
  const containerIdRef = useRef(containerId);

  useLayoutEffect(
    () => () => {
      phaseRef.current = PortalState.WILL_UNMOUNT;
    },
    [],
  );

  const mountAsync = useCallback(async () => {
    await Promise.resolve();
    keyRef.current = stage?.mount(containerId, zIndex, children) as number;
  }, [stage, containerId, zIndex, children]);

  useLayoutEffect(() => {
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
      const force = containerIdRef.current !== containerId;
      containerIdRef.current = containerId;
      if (force || phaseRef.current === PortalState.WILL_UNMOUNT) {
        stage?.unmount(containerId, keyRef.current);
        phaseRef.current = PortalState.NONE;
      }
    };
  }, [mountAsync, stage, containerId, zIndex, children]);

  return (null as ReactNode) as ReactElement;
}

export default Portal;
