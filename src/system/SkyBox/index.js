import { useThree } from '@react-three/fiber';
import { CubeTextureLoader } from 'three';

export default function SkyBox() {
  const { scene } = useThree();
  const loader = new CubeTextureLoader();

  scene.background = loader.load([
    'cubemap/right.png',
    'cubemap/left.png',
    'cubemap/top.png',
    'cubemap/bottom.png',
    'cubemap/front.png',
    'cubemap/back.png',
  ]);

  return null;
};
