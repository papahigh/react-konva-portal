import { Group as KonvaGroup } from 'konva/types/Group';
import { Layer as KonvaLayer, LayerConfig } from 'konva/types/Layer';
import { NodeConfig } from 'konva/types/Node';
import { Group as ReactKonvaGroup, Layer as ReactKonvaLayer } from 'react-konva';
import createPortalContainer from './create-container';

export { default as Portal } from './portal';
export { default as Stage } from './portal-stage';

export const Group = createPortalContainer<KonvaGroup, NodeConfig, typeof ReactKonvaGroup>(ReactKonvaGroup);
export const Layer = createPortalContainer<KonvaLayer, LayerConfig, typeof ReactKonvaLayer>(ReactKonvaLayer);

export { PORTAL_LAYER_ID, Z_INDEX } from './utils';
