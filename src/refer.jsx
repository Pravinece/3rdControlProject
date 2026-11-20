import React, { useState, useRef, Suspense, useActionState } from "react";
import { Html, Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import styles from "./App.module.css";
import { Button, Input, Select } from "antd";
const { TextArea } = Input;
import Chair from "./components/Chair";
import Character from "./components/Character";
import Lights from "./components/Lights";
// import { useLipSync } from "./components/useLipSync";
import CameraController from "./components/CameraController";
import axios from 'axios'
import { useLipSync } from 'use-lipsync';

const chair = [{ id: "https://app.migotoai.com/file/uploads/other/20251111112542_2b59d285.glb" }];

function App() {
  const [filter] = useState("Body");
  const [text, setText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioReload, setAudioReload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(new Audio());
  const [morphValues, setMorphValues] = useState({ jawOpen: 0, mouthFunnel: 0, mouthSmileLeft: 0, mouthSmileRight: 0 });
  const [spokenText, setSpokenText] = useState('');
  const [voiceId, setVoiceId] = useState("en-IN-PrabhatNeural");

  useLipSync(audioRef, isPlaying, setMorphValues, spokenText);

  const avatars = {
    persona_id: [{ name: "Trainer" }],
    glb: [
      {
        file: "https://app.migotoai.com/file/uploads/other/20261028101400_ba1af8bd.glb",
        // file: "https://app.migotoai.com/file/uploads/other/20260210073304_93c249bf.glb",
        thumbnail: "string",
        name: "hair",
      },
    ],
    animation: "https://app.migotoai.com/file/uploads/other/20261028101400_ba1af8bd.glb",
    // animation: "https://app.migotoai.com/file/uploads/other/20260210073304_93c249bf.glb",
  };

  const VOICES = [
    { label: "English (India) - Prabhat", value: "en-IN-PrabhatNeural" },
    { label: "English (India) - Neerja", value: "en-IN-NeerjaNeural" },
    { label: "English (US) - Guy", value: "en-US-GuyNeural" },
    { label: "English (US) - Jenny", value: "en-US-JennyNeural" },
    { label: "Hindi - Madhur", value: "hi-IN-MadhurNeural" },
    { label: "Hindi - Swara", value: "hi-IN-SwaraNeural" },
    { label: "Tamil - Valluvar", value: "ta-IN-ValluvarNeural" },
    { label: "Telugu - Mohan", value: "te-IN-MohanNeural" },
    { label: "Kannada - Gagan", value: "kn-IN-GaganNeural" },
    { label: "Malayalam - Midhun", value: "ml-IN-MidhunNeural" },
    { label: "Bengali - Bashkar", value: "bn-IN-BashkarNeural" },
    { label: "Marathi - Manohar", value: "mr-IN-ManoharNeural" },
    { label: "Gujarati - Dhwani", value: "gu-IN-DhwaniNeural" },
    { label: "Arabic (Saudi)", value: "ar-SA-HamedNeural" },
    { label: "French - Henri", value: "fr-FR-HenriNeural" },
    { label: "German - Conrad", value: "de-DE-ConradNeural" },
    { label: "Spanish - Alvaro", value: "es-ES-AlvaroNeural" },
    { label: "Japanese - Keita", value: "ja-JP-KeitaNeural" },
    { label: "Korean - InJoon", value: "ko-KR-InJoonNeural" },
    { label: "Chinese (Mandarin) - Yunxi", value: "zh-CN-YunxiNeural" },
    { label: "Portuguese (Brazil) - Antonio", value: "pt-BR-AntonioNeural" },
    { label: "Russian - Dmitry", value: "ru-RU-DmitryNeural" },
    { label: "Finnish - Harri", value: "fi-FI-HarriNeural" },
    { label: "Lithuanian - Leonas", value: "lt-LT-LeonasNeural" },
  ];
  

  const setupAudioPlayback = (audioUrl) => {
    if (audioRef.current.src) { 
      URL.revokeObjectURL(audioRef.current.src);
    }

    // const audioBlob = new Blob([audioData], { type: "audio/wav" });
    // const audioUrl = URL.createObjectURL(audioBlob);

    audioRef.current.src = audioUrl;
    audioRef.current.load();
    
    audioRef.current.oncanplaythrough = () => {
      setIsPlaying(true);
      audioRef.current.play().catch(err => console.error("Play error:", err));
    };

    audioRef.current.onplay = () => {
      setAudioReload(true);
    };

    audioRef.current.onended = () => {
      URL.revokeObjectURL(audioUrl);
      setAudioReload(false);
      setIsPlaying(false);
      setIsLoading(false);
      setMorphValues({ jawOpen: 0, mouthFunnel: 0, mouthSmileLeft: 0, mouthSmileRight: 0 });
    };
  };

  const handleTTS = async () => {
        const formData = new FormData();
        formData.append("message", text);
        formData.append("voice_id", "en-IN-PrabhatNeural");
        // formData.append("voice_id", voiceId);

        try {
          const response = await axios.post("https:app.migotoai.com/llma/speech/tts", formData,{
              responseType: "arraybuffer"});

          setSpokenText(text);
          const audioData = response.data;
          const audioBlob = new Blob([audioData], { type: "audio/wav" });
          const audioUrl = URL.createObjectURL(audioBlob);
          setupAudioPlayback(audioUrl);
        } catch (err) {
          console.error("TTS error:", err);
          setIsPlaying(false);
          setIsLoading(false);
          setMorphValues({ jawOpen: 0, mouthFunnel: 0, mouthSmileLeft: 0, mouthSmileRight: 0 });
        }
  };

  const handleSpeak = (e) => {
    e?.preventDefault();
    handleTTS();
  };

  return (
    <div className={styles.modelContainer}>
      <img className={styles.backgroundImage} src="/lipsync/lobby.png" alt="" />
      <div className={styles.sceneContainer}>
        <Canvas
          gl={{ preserveDrawingBuffer: true, logarithmicDepthBuffer: true }}
          camera={{ position: [0, 1, 2], fov: 45 }}
          shadows
        >
          <Lights />
          <Suspense
            fallback={
              <Html>
                <Loader
                  containerStyles={{
                    backgroundColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  innerStyles={{}}
                  barStyles={{ backgroundColor: "#0085db" }}
                  dataStyles={{ color: "#0085db" }}
                  dataInterpolation={(p) => `Loading ${p.toFixed(2)}%`}
                  initialState={(active) => active}
                />
              </Html>
            }>
            <Character
              modelConfigs={avatars}
              isPlaying={isPlaying}
              morphValues={morphValues}
            />
            <Chair chair={chair} />
          </Suspense>
          <OrbitControls enablePan={true} makeDefault />
          <CameraController filter={filter} />
        </Canvas>
      </div>
      <div className={styles.footer}>
        <div className={styles.container}>
          <form onSubmit={handleSpeak} style={{ display: 'flex', flexDirection: 'column' }}>
          <Select
              value={voiceId}
              onChange={setVoiceId}
              options={VOICES}
              style={{ width: '400px', marginBottom: '8px' }}
              showSearch
              optionFilterProp="label"
            />
            <TextArea
              placeholder="Enter Text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSpeak();
                }
              }}
              style={{ width: '400px', height: '80px', resize: 'none' }}
            />
            <Button type="primary" htmlType="submit">
              Speak
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;


import { useAnimations, useGLTF } from '@react-three/drei'
import { useEffect } from 'react';
import useMorphTargets from './useMorphTargets';


function AnimatedModel({ url, isPlaying, visible, animationUrl, morphValues }) {
  useGLTF.preload(url);
  const { scene } = useGLTF(url, true);
  
  const { animations } = useGLTF(animationUrl);
  const { actions } = useAnimations(animations, scene);
  
  useMorphTargets(scene, morphValues);

  // useEffect(() => {
  //   scene.traverse((child) => {
  //     if (child.isMesh) {
  //       console.log('Mesh name:', child.name);
  //       console.log('Has morphTargetDictionary:', child.morphTargetDictionary);
  //       console.log('Has morphTargetInfluences:', child.morphTargetInfluences);
  //     }
  //   });
  // }, [scene]);

  useEffect(() => {
    if (actions) {
      if (isPlaying) {
        actions["idle"]?.fadeOut(0.5);
        actions["talk"]?.reset().fadeIn(0.5).play();
      } else {
        actions["talk"]?.fadeOut(0.5);
        actions["idle"]?.reset().fadeIn(0.5).play();
      }
    }
  }, [isPlaying, actions]);

  useEffect(() => {
    actions["idle"]?.play();
  }, [actions]);

  return <primitive 
    name={url} object={scene} visible={visible} position={[0, -0.85, 0]} scale={0.5} />;
}

export default AnimatedModel
