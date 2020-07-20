import Konva from 'konva';
import React, {
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithChildren,
  PropsWithoutRef,
  RefAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { KonvaNodeComponent } from 'react-konva';
import PortalManager from './portal-manager';
import { useStageContext } from './stage-context';
import { ForwardedRef, PortalManagerRef } from './types';
import { warnIfDev } from './utils';

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
    const konvaRef = useRef<KonvaNode | null>(null);
    const managerRef = useRef<PortalManagerRef | null>(null);

    const stage = useStageContext();
    const Konva = Component as React.ComponentType<KonvaProps>;

    useImperativeHandle<KonvaNode | null, KonvaNode | null>(ref, () => konvaRef.current, [konvaRef.current]);

    useEffect(() => {
      if (id == null) {
        warnIfDev(`${auditName} is missing id prop and cannot be used as portals container.`);
      }
    }, [id, auditName]);

    useEffect(() => {
      if (id != null && managerRef.current) stage?.addManager(auditName, id!, managerRef.current);
      return () => {
        if (id != null) stage?.removeManager(auditName, id!);
      };
    }, [id, stage, auditName]);

    return (
      <Konva {...props} id={id} ref={konvaRef}>
        {children}
        <PortalManager id={id} ref={managerRef} auditName={auditName} key={id} />
      </Konva>
    );
  }

  return forwardRef<KonvaNode, PropsWithChildren<KonvaProps>>(PortalContainer);
}

export default createPortalContainer;
