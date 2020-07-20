import Konva from 'konva';
import { Group } from 'react-konva';
import createPortalContainer from './create-container';

const PortalGroup = createPortalContainer<Konva.Group, Konva.NodeConfig, typeof Group>(Group);
export default PortalGroup;
