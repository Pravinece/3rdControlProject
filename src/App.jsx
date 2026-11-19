import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Experience from './Pages/Screen/Experience'
import Chat from './Pages/Chat/Chat'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section className="hero" id="center">
        <div className='chatSection'>
          <Chat />
        </div>
        <div className="heroContent" >
          <Experience />
        </div>
      </section>
    </>
  )
}

export default App
