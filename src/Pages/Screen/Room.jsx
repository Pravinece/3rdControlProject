// import { useAnimations, useGLTF } from "@react-three/drei";
// import { RigidBody } from "@react-three/rapier";
// import { useEffect, useRef } from "react";

// export const Room = ({ model, ...props }) => {
//   const { scene, animations } = useGLTF(model);
//   const group = useRef();
//   const { actions } = useAnimations(animations, group);
//   useEffect(() => {
//     scene.traverse((child) => {
//       if (child.isMesh) {
//         child.castShadow = true;
//         child.receiveShadow = true;
//       }
//     });
//   }, [scene]);

//   useEffect(() => {
//     if (actions && animations.length > 0) {
//       actions[animations[0].name].play();
//     }
//   }, [actions]);

//   return (
//     <group>
//       <RigidBody type="fixed" colliders="trimesh">
//         <primitive object={scene} {...props} ref={group} />
//       </RigidBody>
//     </group>
//   );
// };

import { useAnimations, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";

import { init } from "recast-navigation";
import {
  threeToSoloNavMesh,
  NavMeshHelper,
} from "@recast-navigation/three";

import { MeshBasicMaterial, DoubleSide } from "three";

const ROOM_POSITION = [2.4, -1.5, 0];
const ROOM_ROTATION = [0.07, -1.5, 0];
const ROOM_SCALE = 1;

export const Room = ({ model }) => {
  const { scene, animations } = useGLTF(model);
  const group = useRef();
  const { actions } = useAnimations(animations, group);

  const [navHelper, setNavHelper] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const generateNavMesh = async () => {
      await init();

      if (cancelled || !group.current) return;

      // Apply the room's fixed transformation
      group.current.updateWorldMatrix(true, true);

      const meshes = [];

      const ignored = /curtain|lamp|light|pillow|vase/i;

      group.current.traverse((child) => {
        if (!child.isMesh || ignored.test(child.name)) return;

        meshes.push(child);
      });

      const { success, navMesh } = threeToSoloNavMesh(meshes, {
        cs: 0.05,
        ch: 0.1,
        walkableSlopeAngle: 45,
        walkableHeight: 18,
        walkableClimb: 3,
        walkableRadius: 5,
      });

      if (cancelled) {
        navMesh?.destroy();
        return;
      }

      if (!success || !navMesh) return;

      const helper = new NavMeshHelper(navMesh, {
        navMeshMaterial: new MeshBasicMaterial({
          color: "green",
          side: DoubleSide,
          transparent: true,
          opacity: 0.7,
          depthWrite: false,
        }),
      });

      setNavHelper(helper);
    };

    generateNavMesh();

    return () => {
      cancelled = true;
    };
  }, [scene]);

  useEffect(() => {
    actions[Object.keys(actions)[0]]?.play();
  }, [actions]);

  return (
    <>
      <group
        ref={group}
        position={ROOM_POSITION}
        rotation={ROOM_ROTATION}
        scale={ROOM_SCALE}
      >
        <RigidBody type="fixed" colliders="trimesh">
          <primitive object={scene} />
        </RigidBody>
      </group>

      {navHelper && <primitive object={navHelper} />}
    </>
  );
};