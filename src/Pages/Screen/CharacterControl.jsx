import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { useControls, button } from "leva";
import useAvatarStore from "../../store/avatarStore";
import { useEffect, useRef } from "react";
import { degToRad } from "three/src/math/MathUtils.js";
import { Avatar } from "./Avatar";
const normalizeAngle = (angle) => {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
};

const lerpAngle = (start, end, t) => {
  start = normalizeAngle(start);
  end = normalizeAngle(end);

  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += 2 * Math.PI;
    } else {
      end += 2 * Math.PI;
    }
  }

  return normalizeAngle(start + (end - start) * t);
};

export default function CharacterControl({ morphValues, isPlaying, position }) {
  console.log('position: ', position);

  const { capsuleHalfHeight, capsuleRadius, showHelper } = useControls("Capsule Collider", {
    capsuleHalfHeight: { value: 0.1, min: 0.01, max: 2, step: 0.01 },
    capsuleRadius:     { value: 0.17, min: 0.01, max: 1, step: 0.01 },
    showHelper:        true,
  });


  const rb = useRef();
  const container = useRef();
  const character = useRef();

  const animation    = useAvatarStore((state) => state.animation);
  const setAnimation = useAvatarStore((state) => state.setAnimation);
  const mode         = useAvatarStore((state) => state.mode);
  const walkingRef   = useRef(false);

  // walk to target position whenever mode changes
  useEffect(() => {
    walkingRef.current = true;
  }, [mode]);


  return (
    <RigidBody colliders={false} lockRotations ref={rb} position={position?.position}>
      <group ref={container}>
        <group ref={character}>
          <Avatar
            scale={1.3}
            animation={animation}
            morphValues={morphValues}
            isPlaying={isPlaying}
          />
        </group>
      </group>
      <CapsuleCollider args={[capsuleHalfHeight, capsuleRadius]}   />
    </RigidBody>
  );
};