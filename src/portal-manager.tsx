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

export const DEFAULT_UPDATE_STRATEGY = UpdateStrategy.INSTANT;

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
export const DEFAULT_DEBOUNCE = { wait: 0, leading: false, maxWait: undefined, trailing: true };

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

function PortalManagerComponent(
  { debounceArgs, updateStrategy }: PortalManagerProps,
  ref: ((instance: PortalManagerRef | null) => void) | MutableRefObject<PortalManagerRef | null> | null,
) {
  const portalsRef = useRef<PortalNode[]>([]);
  const unmountedRef = useRef(false);
  const forceRender = useForceRender();

  useEffect(
    () => () => {
      unmountedRef.current = true;
    },
    [],
  );

  useImperativeHandle<PortalManagerRef, PortalManagerRef>(
    ref,
    () => {
      let lastFrameId: number | undefined;

      function applyUpdate() {
        lastFrameId = undefined;
        if (!unmountedRef.current) forceRender();
      }

      function scheduleUpdate() {
        if (lastFrameId != null) cancelAnimationFrame(lastFrameId);
        lastFrameId = requestAnimationFrame(applyUpdate);
      }

      const allArgs = { ...DEFAULT_DEBOUNCE, ...debounceArgs };
      const debounceUpdate = debounce(applyUpdate, allArgs?.wait, {
        leading: allArgs?.leading,
        maxWait: allArgs?.maxWait,
        trailing: allArgs?.trailing,
      });

      function updateComponent() {
        if (!unmountedRef.current) {
          switch (updateStrategy) {
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

  return (portalsRef.current.map(({ key, children }) => (
    <React.Fragment key={key}>{children}</React.Fragment>
  )) as ReactNode) as ReactElement;
}

export const PortalManager = forwardRef<PortalManagerRef, PortalManagerProps>(PortalManagerComponent);

export default PortalManager;
