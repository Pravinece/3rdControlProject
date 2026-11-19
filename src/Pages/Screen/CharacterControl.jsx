import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { useControls, button } from "leva";
import useAvatarStore from "../../store/avatarStore";
import { useRef } from "react";
import { MathUtils } from "three";
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

export default function CharacterControl() {
  const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED } = useControls(
    "Character Control",
    {
      WALK_SPEED: { value: 0.8, min: 0.1, max: 4, step: 0.1 },
      RUN_SPEED: { value: 1.6, min: 0.2, max: 12, step: 0.1 },
      ROTATION_SPEED: {
        value: degToRad(0.5),
        min: degToRad(0.1),
        max: degToRad(5),
        step: degToRad(0.1),
      },
    }
  );

  const { capsuleHalfHeight, capsuleRadius, showHelper } = useControls("Capsule Collider", {
    capsuleHalfHeight: { value: 0.1, min: 0.01, max: 2, step: 0.01 },
    capsuleRadius:     { value: 0.17, min: 0.01, max: 1, step: 0.01 },
    showHelper:        true,
  });

  const { avPosX, avPosY, avPosZ, avRotX, avRotY, avRotZ, avScale } = useControls("Avatar Transform", {
    avPosX: { value: 0,   min: -5, max: 5, step: 0.01 },
    avPosY: { value: 0,   min: -5, max: 5, step: 0.01 },
    avPosZ: { value: 0,   min: -5, max: 5, step: 0.01 },
    avRotX: { value: 0,   min: -Math.PI, max: Math.PI, step: 0.01 },
    avRotY: { value: 0,   min: -Math.PI, max: Math.PI, step: 0.01 },
    avRotZ: { value: 0,   min: -Math.PI, max: Math.PI, step: 0.01 },
    avScale:{ value: 1.3, min: 0.1, max: 5, step: 0.01 },
  });

  // const { idle, run, stand, walk, talk, sitTalk, jump } = useControls("Animations", {
  //   run: false,
  //   idle: true,
  //   stand: false
  // });

  const rb = useRef();
  const container = useRef();
  const character = useRef();

  const animation = useAvatarStore((state) => state.animation);
  const setAnimation = useAvatarStore((state) => state.setAnimation);

  useControls("Animations", {
    Idle:           button(() => setAnimation("idle")),
    Walking:        button(() => setAnimation("Walking")),
    Running:        button(() => setAnimation("Runing")),
    Jumping:        button(() => setAnimation("Jumping")),
    Sitting:        button(() => setAnimation("Sitting")),
    Stand_To_Sit:   button(() => setAnimation("Stand_To_Sit")),
    Sit_To_Stand:   button(() => setAnimation("Sit_To_Stand")),
    Talking:        button(() => setAnimation("Talking")),
    Talking2:       button(() => setAnimation("Talking2")),
    Sitting_Talking:button(() => setAnimation("Sitting_Talking")),
    Listening:      button(() => setAnimation("Listening_To_Music")),
    Walk_In_Circle: button(() => setAnimation("Walk_In_Circle")),
  });
  
  const characterRotationTarget = useRef(0);
  const rotationTarget = useRef(0);

  const [, get] = useKeyboardControls();
  
  useFrame(() => {
    if (!rb.current) return;

    const vel = rb.current.linvel();
    const movement = { x: 0, z: 0 };

    if (get().forward)  movement.z =  1;
    if (get().backward) movement.z = -1;
    if (get().left)     movement.x =  1;
    if (get().right)    movement.x = -1;

    const speed = get().run ? RUN_SPEED : WALK_SPEED;

    if (movement.x !== 0) {
      rotationTarget.current += ROTATION_SPEED * movement.x;
    }

    if (movement.x !== 0 || movement.z !== 0) {
      characterRotationTarget.current = Math.atan2(movement.x, movement.z);
      vel.x = Math.sin(rotationTarget.current + characterRotationTarget.current) * speed;
      vel.z = Math.cos(rotationTarget.current + characterRotationTarget.current) * speed;
      setAnimation(speed === RUN_SPEED ? "Runing" : "Walking");
    } else {
      vel.x = 0;
      vel.z = 0;
      setAnimation("idle");
    }

    container.current.rotation.y = MathUtils.lerp(
      container.current.rotation.y,
      rotationTarget.current,
      0.1
    );

    character.current.rotation.y = lerpAngle(
      character.current.rotation.y,
      characterRotationTarget.current,
      0.1
    );

    rb.current.setLinvel(vel, true);
  });

  return (
    <RigidBody colliders={false} lockRotations ref={rb} position={[-1, 0, 2]}>
      <group ref={container}>
        <group ref={character}>
          <Avatar
            scale={avScale}
            position={[avPosX, avPosY, avPosZ]}
            rotation={[avRotX, avRotY, avRotZ]}
            animation={animation}
          />
        </group>
      </group>
      <CapsuleCollider args={[capsuleHalfHeight, capsuleRadius]}   />
    </RigidBody>
  );
};