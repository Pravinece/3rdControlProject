import { useState } from 'react';
import { Canvas } from '@react-three/fiber'
import React, { useMemo } from 'react'
import CharacterControl from './CharacterControl'
import { Html, KeyboardControls, OrbitControls } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { Room } from './Room';
import { useControls } from 'leva';
import { AVATAR_POSITIONS, buttons } from '../../datas/positions'
import useAvatarStore from '../../store/avatarStore';
import { CameraFromTo } from './CameraFromTo';

function Experience({ morphValues, isPlaying }) {
    
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

const setStoreMode   = useAvatarStore((state) => state.setMode);
const setIsSpeaking  = useAvatarStore((state) => state.setIsSpeaking);
const setAnimation   = useAvatarStore((state) => state.setAnimation);

let [mode, setMode] = useState("freeStyle")
let positions = useMemo(()=>{
  return AVATAR_POSITIONS[mode]
},[mode,])

const handleMode = (id) => {
  setMode(id);
  setStoreMode(id);
  setIsSpeaking(false);
  if (id === 'sitAndTalk') setAnimation('Sitting');
  else setAnimation('idle');
};



  return (
    <div className='canvas'>

    <KeyboardControls map={keyboardMap}>
        <Canvas camera={{ position: positions.camPosition, fov: positions.fov }}  >
            <ambientLight intensity={2} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} />
                  <Physics >
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
                    <CharacterControl morphValues={morphValues} isPlaying={isPlaying} position={positions} />
                </Physics>
                {/* <OrbitControls enableRotate={true} /> */}
            <CameraFromTo mode={mode} />

            {buttons.map((item,i)=>
            (<Html position={item.position} center>
              <button
                onClick={() => handleMode(item.id)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#111827",
                  color: "#ffffff",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </button>
            </Html>))}
        </Canvas>
    </KeyboardControls>
    </div>
  )
}

export default Experience