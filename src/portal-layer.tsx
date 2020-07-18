import Konva from 'konva';
import { Layer } from 'react-konva';
import createPortalContainer from './create-container';

const PortalLayer = createPortalContainer<Konva.Layer, Konva.LayerConfig, typeof Layer>(Layer, 'Layer');
export default PortalLayer;

