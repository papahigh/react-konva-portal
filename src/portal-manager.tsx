import React, { forwardRef, ReactElement, ReactNode, useEffect, useImperativeHandle, useRef } from 'react';
import type {
  CommandHandler,
  ForwardedRef,
  ManagerCommand,
  MountCommand,
  PortalManagerProps,
  PortalManagerRef,
  PortalMeta,
  UnmountCommand,
  UpdateCommand,
} from './types';
import { useForceRender, zIndexComparator } from './utils';

function ManagerComponent(_: PortalManagerProps, ref: ForwardedRef<PortalManagerRef>) {
  const portalsRef = useRef<PortalMeta[]>([]);
  const portalsByIdRef = useRef<Record<string, PortalMeta>>({});
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
      function mount(cmd: MountCommand) {
        portalsByIdRef.current[cmd.key] = cmd;
        portalsRef.current.push({ ...cmd });
        portalsRef.current = portalsRef.current.sort(zIndexComparator);
      }

      function update(cmd: UpdateCommand) {
        const curr = portalsByIdRef.current[cmd.key] || {};
        const resort = curr.zIndex !== cmd.zIndex;
        curr.key = cmd.key;
        curr.zIndex = cmd.zIndex;
        curr.children = cmd.children;
        portalsByIdRef.current[cmd.key] = curr;
        if (resort) portalsRef.current = portalsRef.current.sort(zIndexComparator);
      }

      function unmount(cmd: UnmountCommand) {
        delete portalsByIdRef.current[cmd.key];
        portalsRef.current = portalsRef.current.filter(item => item.key !== cmd.key);
      }

      const handlers = { mount, unmount, update } as Record<string, CommandHandler>;

      function handleCommand(cmd: ManagerCommand) {
        handlers[cmd.type].call(null, cmd);
      }

      function commitUpdate() {
        if (!unmountedRef.current) forceRender();
      }

      return {
        handle(input: ManagerCommand | ManagerCommand[]) {
          if (Array.isArray(input)) input.forEach(handleCommand);
          else handleCommand(input);
          commitUpdate();
        },
      };
    },
    [forceRender],
  );

  return (portalsRef.current.map(({ key, children }) => (
    <React.Fragment key={key}>{children}</React.Fragment>
  )) as ReactNode) as ReactElement;
}

const PortalManager = forwardRef<PortalManagerRef, PortalManagerProps>(ManagerComponent);
export default PortalManager;
