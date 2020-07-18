import Konva from 'konva';
import React, {
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithChildren,
  PropsWithoutRef,
  RefAttributes,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import { KonvaNodeComponent } from 'react-konva';
import PortalManager from './portal-manager';
import { useStageContext } from './stage-context';
import type { ForwardedRef, PortalManagerRef } from './types';
import { useForceRender, warnIfDev } from './utils';

export function createPortalContainer<
  KonvaNode extends Konva.Node,
  KonvaProps extends Konva.NodeConfig,
  KonvaComponent extends KonvaNodeComponent<KonvaNode, KonvaProps>
>(
  Component: KonvaComponent,
  auditName: string,
): ForwardRefExoticComponent<PropsWithoutRef<KonvaProps> & RefAttributes<KonvaNode>> {
  function PortalContainer(props: PropsWithChildren<KonvaProps>, ref: ForwardedRef<KonvaNode>) {
    const { id, children } = props;
    const idRef = useRef(id);
    const konvaRef = useRef<KonvaNode | null>(null);
    const managerRef = useRef<PortalManagerRef | null>(null);
    const forceRender = useForceRender();

    const stage = useStageContext();
    const hasId = idRef.current != null;
    const Konva = Component as React.ComponentType<KonvaProps>;

    useImperativeHandle<KonvaNode | null, KonvaNode | null>(ref, () => konvaRef.current, [konvaRef.current]);

    useLayoutEffect(() => {
      if (id !== idRef.current) {
        idRef.current = id;
        forceRender();
      }
      if (!hasId) {
        warnIfDev(`Portals are not unavailable for ${auditName} without id.`);
      }
    }, [auditName, id, hasId, forceRender]);

    useLayoutEffect(() => {
      if (hasId && managerRef.current) {
        stage?.addManager(auditName, idRef.current!, managerRef.current);
      }
      return () => {
        if (hasId) {
          stage?.removeManager(auditName, idRef.current!);
        }
      };
    }, [auditName, hasId, stage]);

    return (
      <Konva {...props} id={idRef.current} ref={konvaRef}>
        {children}
        <PortalManager ref={managerRef} key={idRef.current} />
      </Konva>
    );
  }

  return forwardRef<KonvaNode, PropsWithChildren<KonvaProps>>(PortalContainer);
}

export default createPortalContainer;
