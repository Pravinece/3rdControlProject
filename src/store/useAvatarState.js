import { useRef } from "react";
import useAvatarStore from "../store/avatarStore";

/**
 * Attach this ref to the avatar's RigidBody to track live position/rotation.
 * Call getAvatarState() anywhere to get a snapshot.
 *
 * Usage in CharacterControl.jsx:
 *   const { rbRef, getAvatarState } = useAvatarState()
 *   <RigidBody ref={rbRef} ... />
 */
export function useAvatarState() {
  const rbRef = useRef();

  const getAvatarState = () => {
    const animation = useAvatarStore.getState().animation;

    if (!rbRef.current) return { position: null, rotation: null, animation };

    const t = rbRef.current.translation();
    const r = rbRef.current.rotation(); // quaternion { x, y, z, w }

    return {
      position: [
        parseFloat(t.x.toFixed(2)),
        parseFloat(t.y.toFixed(2)),
        parseFloat(t.z.toFixed(2)),
      ],
      rotation: {
        x: parseFloat(r.x.toFixed(2)),
        y: parseFloat(r.y.toFixed(2)),
        z: parseFloat(r.z.toFixed(2)),
        w: parseFloat(r.w.toFixed(2)),
      },
      animation,
    };
  };

  return { rbRef, getAvatarState };
}
