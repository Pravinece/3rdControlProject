import { useFrame } from '@react-three/fiber';

const MORPH_MAP = {
  jawOpen: ['jawOpen', 'JawOpen', 'jaw_open'],
  mouthFunnel: ['mouthFunnel', 'MouthFunnel', 'mouth_funnel'],
  mouthSmileLeft: ['mouthSmileLeft', 'MouthSmileLeft', 'mouth_smile_left'],
  mouthSmileRight: ['mouthSmileRight', 'MouthSmileRight', 'mouth_smile_right'],
};

export default function useMorphTargets(scene, morphValues) {
  useFrame(() => {
    if (!scene || !morphValues) return;

    scene.traverse((child) => {
      if (!child.isMesh || !child.morphTargetDictionary || !child.morphTargetInfluences) return;

      for (const [key, aliases] of Object.entries(MORPH_MAP)) {
        const value = morphValues[key] ?? 0;
        for (const alias of aliases) {
          const idx = child.morphTargetDictionary[alias];
          if (idx !== undefined) {
            child.morphTargetInfluences[idx] = value;
            break;
          }
        }
      }
    });
  });
}
