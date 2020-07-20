import Konva from 'konva';
import { MutableRefObject, ReactNode } from 'react';
import { StageProps } from 'react-konva';

export interface PortalStageProps extends StageProps {
  portalLayerProps?: Partial<Konva.LayerConfig>;
}

export interface PortalStageContext {
  mount: (id: string, zIndex: number, children: ReactNode) => number;
  update: (id: string, key: number, zIndex: number, children: ReactNode) => void;
  unmount: (id: string, key: number) => void;
  addManager: (id: string, manager: PortalManagerRef) => void;
  removeManager: (id: string) => void;
}

export interface PortalManagerProps {
  id?: string;
}

export interface PortalManagerRef {
  handle(input: ManagerCommand | ManagerCommand[]): void;
}

export interface PortalProps {
  containerId?: string;
  zIndex?: number;
  children?: ReactNode;
}

export enum PortalState {
  WILL_MOUNT,
  DID_MOUNT,
  WILL_UNMOUNT,
}

export interface PortalMeta {
  key: number;
  zIndex?: number;
  children: ReactNode;
}

export type MountCommand = { type: 'mount'; key: number; zIndex: number; children: ReactNode };
export type UpdateCommand = { type: 'update'; key: number; zIndex: number; children: ReactNode };
export type UnmountCommand = { type: 'unmount'; key: number };
export type ManagerCommand = MountCommand | UpdateCommand | UnmountCommand;

export type CommandHandler<Command = ManagerCommand> = (cmd: Command) => void;

export type ForwardedRef<T> = ((instance: T | null) => void) | MutableRefObject<T | null> | null;
