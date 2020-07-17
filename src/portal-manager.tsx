import debounce from 'lodash/debounce';
import React, {
  forwardRef,
  MutableRefObject,
  ReactElement,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
} from 'react';

export interface PortalManagerProps {
  debounceArgs?: DebounceArgs;
  updateStrategy: UpdateStrategy;
}

export interface DebounceArgs {
  wait: number;
  leading: boolean;
  maxWait?: number;
  trailing: boolean;
}

export enum UpdateStrategy {
  INSTANT,
  SCHEDULED,
  DEBOUNCED,
}

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
export const DEFAULT_DEBOUNCE = { wait: 24, leading: false, maxWait: undefined, trailing: true };
export const DEFAULT_STRATEGY = UpdateStrategy.INSTANT;

export function zIndexComparator(a: PortalNode, b: PortalNode) {
  const { zIndex: zIndexA = DEFAULT_Z_INDEX } = a;
  const { zIndex: zIndexB = DEFAULT_Z_INDEX } = b;
  if (zIndexA === zIndexB) return 0;
  return zIndexA > zIndexB ? 1 : -1;
}

export type ForceRenderFunction = () => void;

export function useForceRender(): ForceRenderFunction {
  const [, forceRender] = useReducer(i => i + 1, 0);
  return forceRender;
}

enum LifecyclePhase {
  WILL_MOUNT,
  DID_MOUNT,
  WILL_UNMOUNT,
}

function nextStrategy(curr: UpdateStrategy, phase: LifecyclePhase) {
  switch (phase) {
    case LifecyclePhase.WILL_MOUNT:
    case LifecyclePhase.WILL_UNMOUNT:
      return UpdateStrategy.DEBOUNCED;
    case LifecyclePhase.DID_MOUNT:
    default:
      return curr;
  }
}

function PortalManagerComponent(
  { debounceArgs, updateStrategy }: PortalManagerProps,
  ref: ((instance: PortalManagerRef | null) => void) | MutableRefObject<PortalManagerRef | null> | null,
) {
  const phaseRef = useRef<LifecyclePhase>(LifecyclePhase.WILL_MOUNT);
  const portalsRef = useRef<PortalNode[]>([]);
  const forceRender = useForceRender();

  useEffect(
    () => () => {
      phaseRef.current = LifecyclePhase.WILL_UNMOUNT;
    },
    [],
  );

  useImperativeHandle<PortalManagerRef, PortalManagerRef>(
    ref,
    () => {
      let lastFrameId: number | undefined;

      function applyUpdate() {
        lastFrameId = undefined;
        if (phaseRef.current !== LifecyclePhase.WILL_UNMOUNT) forceRender();
      }

      function scheduleUpdate() {
        if (lastFrameId != null) cancelAnimationFrame(lastFrameId);
        lastFrameId = requestAnimationFrame(applyUpdate);
      }

      const allArgs = { ...DEFAULT_DEBOUNCE, ...debounceArgs };
      const debounceUpdate = debounce(applyUpdate, allArgs?.wait, allArgs);

      function updateComponent() {
        switch (nextStrategy(updateStrategy, phaseRef.current)) {
          case UpdateStrategy.INSTANT:
            applyUpdate();
            break;
          case UpdateStrategy.SCHEDULED:
            scheduleUpdate();
            break;
          case UpdateStrategy.DEBOUNCED:
            debounceUpdate();
            break;
          default:
            break;
        }
      }

      return {
        mount: (key, children, zIndex) => {
          portalsRef.current.push({ key, children, zIndex });
          portalsRef.current = portalsRef.current.sort(zIndexComparator);
          updateComponent();
        },
        update: (key, children, zIndex) => {
          let zIndexChanged = false;
          const newValue = portalsRef.current.map(item => {
            if (item.key !== key) return item;
            zIndexChanged = item.zIndex !== zIndex;
            return { key, children, zIndex };
          });
          portalsRef.current = zIndexChanged ? newValue.sort(zIndexComparator) : newValue;
          updateComponent();
        },
        unmount: key => {
          portalsRef.current = portalsRef.current.filter(item => item.key !== key);
          updateComponent();
        },
      };
    },
    [forceRender, updateStrategy, debounceArgs],
  );

  useEffect(() => {
    phaseRef.current = LifecyclePhase.DID_MOUNT;
  }, []);

  return (portalsRef.current.map(({ key, children }) => (
    <React.Fragment key={key}>{children}</React.Fragment>
  )) as ReactNode) as ReactElement;
}

export const PortalManager = forwardRef<PortalManagerRef, PortalManagerProps>(PortalManagerComponent);

export default PortalManager;
