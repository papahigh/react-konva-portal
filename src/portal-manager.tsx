import React, { forwardRef, ReactElement, ReactNode, useEffect, useImperativeHandle, useRef } from 'react';
import {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      function mount({ type, ...meta }: MountCommand) {
        portalsByIdRef.current[meta.key] = meta;
        portalsRef.current.push(meta);
        portalsRef.current = portalsRef.current.sort(zIndexComparator);
      }

      function update(cmd: UpdateCommand) {
        const target = portalsByIdRef.current[cmd.key];
        if (target) {
          const resort = target.zIndex !== cmd.zIndex;
          target.zIndex = cmd.zIndex;
          target.children = cmd.children;
          if (resort) portalsRef.current = portalsRef.current.sort(zIndexComparator);
        }
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
