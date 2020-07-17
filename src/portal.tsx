import { ReactElement, ReactNode, useCallback, useContext, useLayoutEffect, useRef } from 'react';
import { DEFAULT_Z_INDEX } from './portal-manager';
import { PortalStageContext, PortalStageContextValue } from './portal-stage';

export interface PortalProps {
  children?: ReactNode;
  zIndex?: number;
}

enum PortalPhase {
  INITIAL,
  WILL_MOUNT,
  DID_MOUNT,
  WILL_UNMOUNT,
}

export const ERROR_MESSAGE =
  'You should wrap your root component with <Stage /> from "react-konva-portal" in order for Portals to work';

export function isPortalManager(val: any): val is PortalStageContextValue {
  return (
    val &&
    typeof val === 'object' &&
    typeof val.mount === 'function' &&
    typeof val.update === 'function' &&
    typeof val.unmount === 'function'
  );
}

export function assertPortalManager(val: any): val is PortalStageContextValue {
  if (!isPortalManager(val)) throw new Error(ERROR_MESSAGE);
  return true;
}

export function Portal({ children, zIndex = DEFAULT_Z_INDEX }: PortalProps) {
  const keyRef = useRef(-1);
  const phaseRef = useRef<PortalPhase>(PortalPhase.INITIAL);
  const stagePortals = useContext(PortalStageContext);

  useLayoutEffect(() => {
    assertPortalManager(stagePortals);
  }, [stagePortals]);

  useLayoutEffect(
    () => () => {
      phaseRef.current = PortalPhase.WILL_UNMOUNT;
    },
    [],
  );

  const mountAsync = useCallback(async () => {
    await Promise.resolve();
    keyRef.current = stagePortals?.mount(children, zIndex) as number;
  }, []);

  useLayoutEffect(() => {
    if (phaseRef.current === PortalPhase.INITIAL) {
      phaseRef.current = PortalPhase.WILL_MOUNT;
      mountAsync().then(() => {
        phaseRef.current = PortalPhase.DID_MOUNT;
      });
    }
    if (phaseRef.current === PortalPhase.DID_MOUNT) {
      stagePortals?.update(keyRef.current, children, zIndex);
    }
    return () => {
      if (phaseRef.current === PortalPhase.WILL_UNMOUNT) {
        stagePortals?.unmount(keyRef.current);
      }
    };
  }, [children, zIndex, mountAsync, stagePortals]);

  return (null as ReactNode) as ReactElement;
}

export default Portal;
