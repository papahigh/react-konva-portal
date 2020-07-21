import { Layer as KonvaLayer, LayerConfig } from 'konva/types/Layer';
import { Layer } from 'react-konva';
import createPortalContainer from './create-container';

const PortalLayer = createPortalContainer<KonvaLayer, LayerConfig, typeof Layer>(Layer);
export default PortalLayer;
