import { Node, NodeConfig } from 'konva/types/Node';
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
import { ForwardedRef, PortalManagerRef } from './types';

export function createPortalContainer<
  KonvaNode extends Node,
  KonvaProps extends NodeConfig,
  KonvaComponent extends KonvaNodeComponent<KonvaNode, KonvaProps>
>(Component: KonvaComponent): ForwardRefExoticComponent<PropsWithoutRef<KonvaProps> & RefAttributes<KonvaNode>> {
  function PortalContainer(props: PropsWithChildren<KonvaProps>, ref: ForwardedRef<KonvaNode>) {
    const { id, children } = props;
    const konvaRef = useRef<KonvaNode | null>(null);
    const managerRef = useRef<PortalManagerRef | null>(null);

    const stage = useStageContext();
    const Konva = Component as React.ComponentType<KonvaProps>;

    useImperativeHandle<KonvaNode | null, KonvaNode | null>(ref, () => konvaRef.current, [konvaRef.current]);

    useLayoutEffect(() => {
      if (id != null && managerRef.current) stage?.addManager(id, managerRef.current);
      return () => {
        if (id != null) stage?.removeManager(id);
      };
    }, [id, stage]);

    return (
      <Konva {...props} id={id} ref={konvaRef}>
        {children}
        <PortalManager id={id} ref={managerRef} key={id} />
      </Konva>
    );
  }

  return forwardRef<KonvaNode, PropsWithChildren<KonvaProps>>(PortalContainer);
}

export default createPortalContainer;
