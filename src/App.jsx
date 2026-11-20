import { useRef, useState } from 'react'
import './App.css'
import Experience from './Pages/Screen/Experience'
import Chat from './Pages/Chat/Chat'

function App() {
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [morphValues, setMorphValues] = useState({
    jawOpen: 0, mouthFunnel: 0, mouthSmileLeft: 0, mouthSmileRight: 0
  });

  return (
    <>
      <section className="hero" id="center">
        <div className='chatSection'>
          <Chat
            audioRef={audioRef}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            spokenText={spokenText}
            setSpokenText={setSpokenText}
            setMorphValues={setMorphValues}
          />
        </div>
        <div className="heroContent">
          <Experience
            morphValues={morphValues}
            isPlaying={isPlaying}
          />
        </div>
      </section>
    </>
  )
}

export default App
