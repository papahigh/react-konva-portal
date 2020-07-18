import Konva from 'konva';
import { Group as GroupComp, Layer as LayerComp } from 'react-konva';
import createPortalContainer from './create-container';

export type { PortalProps, PortalStageProps as StageProps } from './types';

export { default as Portal } from './portal';
export { default as Stage } from './portal-stage';

export const Group = createPortalContainer<Konva.Group, Konva.NodeConfig, typeof GroupComp>(GroupComp, 'Group');
export const Layer = createPortalContainer<Konva.Layer, Konva.LayerConfig, typeof LayerComp>(LayerComp, 'Layer');

export { PORTAL_LAYER_ID, Z_INDEX } from './utils';
