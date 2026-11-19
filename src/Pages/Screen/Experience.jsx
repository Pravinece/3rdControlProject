import { Canvas } from '@react-three/fiber'
import React from 'react'
import CharacterControl from './CharacterControl'
import { KeyboardControls } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { Room } from './Room';
import { useControls } from 'leva';

function Experience() {
    
const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "run", keys: ["Shift"] },
];

const { posX, posY, posZ, rotX, rotY, rotZ, scale } = useControls('Room', {
  posX: { value: 2.4, min: -20, max: 20, step: 0.1 },
  posY: { value: -1.5, min: -20, max: 20, step: 0.1 },
  posZ: { value: 0.0,  min: -20, max: 20, step: 0.1 },
  rotX: { value: 0.07,           min: -Math.PI, max: Math.PI, step: 0.01 },
  rotY: { value: -1.5,     min: -Math.PI, max: Math.PI, step: 0.01 },
  rotZ: { value: -0,           min: -Math.PI, max: Math.PI, step: 0.01 },
  scale: { value: 1, min: 0.1, max: 10, step: 0.1 },
});


  return (
    <div className='canvas'>

    <KeyboardControls map={keyboardMap}>
        <Canvas camera={{ position: [0, 0, 6], fov: 75 }}  >
            <ambientLight intensity={2} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} />
                  <Physics debug >
                    <Room
                  scale={scale}
                  position={[posX, posY, posZ]}
                  rotation={[rotX, rotY, rotZ]}
                  model={`models/vintage_living_room.glb`}
                    />
                    <RigidBody type="fixed">
                      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                        <planeGeometry args={[50, 50]} />
                        <meshBasicMaterial visible={false} />
                      </mesh>
                    </RigidBody>
                    <CharacterControl />
                </Physics>
            {/* <OrbitControls  enableRotate={true}/> */}
        </Canvas>
    </KeyboardControls>
    </div>
  )
}

export default Experience